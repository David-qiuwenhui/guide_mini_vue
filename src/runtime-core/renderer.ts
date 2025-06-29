import { effect } from "../reactivity/effect";
import { EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
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
    patch(null, vnode, container, null);
  }

  /**
   *
   * @param n1 更新前的 vnode
   * @param n2 更新后的 vnode
   * @param container 容器
   * @param parentComponent 父组件实例
   */
  function patch(n1, n2, container, parentComponent) {
    // 基于 vnode 的类型进行不同类型的组件处理
    const { type, shapeFlag } = n2;
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        // 处理 Fragment 类型
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        // 处理 Text 类型
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element 类型
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理 component 类型
          processComponent(n1, n2, container, parentComponent);
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
  function processFragment(n1, n2: any, container: any, parentComponent) {
    // Fragment 只渲染 children
    mountChildren(n2.children, container, parentComponent);
  }

  // 处理 Element 类型
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      // 初始化元素节点
      mountElement(n2, container, parentComponent);
    } else {
      // 更新元素节点
      patchElement(n1, n2, parentComponent);
    }
  }

  function patchElement(n1, n2, parentComponent) {
    console.log("n1", n1);
    console.log("n2", n2);

    const oldProp = n1.props || EMPTY_OBJ;
    const newProp = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent);
    patchProp(el, oldProp, newProp);
  }

  function patchChildren(n1, n2, container, parentComponent) {
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
        mountChildren(c2, container, parentComponent);
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
  function mountElement(vnode: any, container: any, parentComponent) {
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
      mountChildren(vnode.children, el, parentComponent);
    }

    // 将 el 添加到 container 中
    hostInsert(el, container);
  }

  // 遍历 vnode 的 children 做 patch 操作
  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  // 处理 component 类型
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent);
  }

  // 组件初始化
  function mountComponent(initialVNode: any, container, parentComponent) {
    // 1. 创建 component instance 对象
    const instance = createComponentInstance(initialVNode, parentComponent);
    // 2. setup component
    setupComponent(instance);
    // 3. setup render effect
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance);
        // element -> mount
        initialVNode.el = subTree.el;
        // 标记组件已挂载
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(preSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
