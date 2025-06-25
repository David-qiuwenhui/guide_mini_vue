import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;

  function render(vnode, container) {
    // 调用patch
    patch(null, vnode, container, null);
  }

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
    mountChildren(n2, container, parentComponent);
  }

  // 处理 Element 类型
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      // 初始化元素节点
      mountElement(n2, container, parentComponent);
    } else {
      // 更新元素节点
      patchElement(n1, n2);
    }
  }

  function patchElement(n1, n2) {
    console.log("n1", n1);
    console.log("n2", n2);
  }

  // 挂载 Element 元素
  function mountElement(vnode: any, container: any, parentComponent) {
    const { props, children, shapeFlag } = vnode;
    // 创建真实 DOM 元素
    const el = (vnode.el = hostCreateElement(vnode.type));

    // props 属性绑定处理
    for (const key in props) {
      const value = props[key];
      hostPatchProp(el, key, value);
    }

    // 处理 children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    // 将 el 添加到 container 中
    hostInsert(el, container);
  }

  // 遍历 vnode 的 children 做 patch 操作
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
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
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const preSubTree = instance.subTree;
        instance.subTree = subTree;

        patch(preSubTree, subTree, container, instance);
        // element -> mount
        initialVNode.el = subTree.el;
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
