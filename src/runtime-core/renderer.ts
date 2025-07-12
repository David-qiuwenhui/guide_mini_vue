import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { getSequence } from "./helpers/getSequence";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode, container) {
    // 调用patch
    patch(null, vnode, container, null, null);
  }

  /**
   *
   * @param n1 更新前的 vnode
   * @param n2 更新后的 vnode
   * @param container 容器
   * @param parentComponent 父组件实例
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    // 基于 vnode 的类型进行不同类型的组件处理
    const { type, shapeFlag } = n2;
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        // 处理 Fragment 类型
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        // 处理 Text 类型
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element 类型
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 component 类型
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  // 处理 Text 类型
  function processText(n1, n2, container) {
    const { children } = n2;
    // 创建文本节点
    const textNode = (n2.el = document.createTextNode(children));
    // 将文本节点添加到容器中
    container.append(textNode);
  }

  // 处理 Fragment 类型
  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    // Fragment 只渲染 children
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  // 处理 Element 类型
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      // 初始化元素节点
      mountElement(n2, container, parentComponent, anchor);
    } else {
      // 更新元素节点
      patchElement(n1, n2, parentComponent, anchor);
    }
  }

  function patchElement(n1, n2, parentComponent, anchor) {
    const oldProp = n1.props || EMPTY_OBJ;
    const newProp = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProp(el, oldProp, newProp);
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    // children 类型
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;

    // 更新的 children 实际内容
    const c1 = n1.children;
    const c2 = n2.children;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新节点是文本子节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 如果旧节点是数组子节点，则需要清空旧的子节点
        unmountChildren(n1.children);
      }
      // 2. 设置新的文本内容
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 如果旧节点是文本子节点
        // 1. 清空旧的文本内容
        hostSetElementText(container, "");
        // 2. 挂载新的 children
        // TODO: container 和 parentComponent 的区别
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    // 对比的左边指针
    let i = 0;
    // 对比的右边指针
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // l2 是新的 children 的长度
    let l2 = c2.length;

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧指针移动
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        // 如果是同一个节点，则进行 patch
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 右侧指针移动
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        // 如果是同一个节点，则进行 patch
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        // 新的节点比旧的节点多，创建新的节点
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        // 循环挂载多个节点
        while (i <= e2) {
          // 挂载新的节点
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 新的节点已经全部处理完
      while (i <= e1) {
        // 卸载旧的节点
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      let s1 = i; // 左侧指针
      let s2 = i; // 右侧指针

      const toBePatched = e2 - s2 + 1; // 需要被处理的节点数量
      let patched = 0; // 已经处理的节点数量
      let keyToNewIndexMap = new Map(); // 用于存储新的节点的

      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }
      let moved = false;
      let maxNewIndexSoFar = 0;

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        if (patched >= toBePatched) {
          // 如果已经处理的节点数量大于等于需要处理的节点数量，则直接删除老的节点
          hostRemove(c1[i].el);
          continue;
        }

        const preChild = c1[i];
        let newIndex;
        if (preChild.key !== null) {
          newIndex = keyToNewIndexMap.get(preChild.key);
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSameVNodeType(preChild, c2[j])) {
              newIndex = j;

              break;
            }
          }
        }

        if (newIndex === undefined) {
          // 如果没有找到新的节点，则卸载旧的节点
          hostRemove(preChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            // 如果新的节点的索引大于等于最大的索引，则不需要移动
            maxNewIndexSoFar = newIndex;
          } else {
            // 如果新的节点的索引小于最大的索引，则需要移动
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1; // +1 是为了避免 0 的情况
          patch(preChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      console.log(
        "🚀 ~ createRenderer ~ increasingNewIndexSequence:",
        increasingNewIndexSequence
      );
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2; // 新的节点的索引
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log("移动位置");
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  // 卸载 children
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      // remove children
      hostRemove(el);
    }
  }

  function patchProp(el, oldProps, newProps) {
    // base case: 如果 oldProps 和 newProps 相同，则不需要处理
    if (oldProps === newProps) {
      return;
    }

    // 1. 处理属性的更新变化
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];

      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }

    // 2. 如果 oldProps 中的属性在 newProps 中不存在，则需要移除该属性
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          const prevProp = oldProps[key];
          hostPatchProp(el, key, prevProp, null);
        }
      }
    }
  }

  // 挂载 Element 元素
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const { props, children, shapeFlag } = vnode;
    // 创建真实 DOM 元素
    const el = (vnode.el = hostCreateElement(vnode.type));

    // props 属性绑定处理
    for (const key in props) {
      const value = props[key];
      hostPatchProp(el, key, null, value);
    }

    // 处理 children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    // 将 el 添加到 container 中
    hostInsert(el, container, anchor);
  }

  // 遍历 vnode 的 children 做 patch 操作
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  // 处理 component 类型
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor);
  }

  // 组件初始化
  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    // 1. 创建 component instance 对象
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 2. setup component
    setupComponent(instance);
    // 3. setup render effect
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor);
        // element -> mount
        initialVNode.el = subTree.el;
        // 标记组件已挂载
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(preSubTree, subTree, container, instance, anchor);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
