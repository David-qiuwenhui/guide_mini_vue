import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  // 调用patch
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  // 基于 vnode 的类型进行不同类型的组件处理
  const { type, shapeFlag } = vnode;
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      // 处理 Fragment 类型
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      // 处理 Text 类型
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element 类型
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理 component 类型
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

// 处理 Text 类型
function processText(vnode, container) {
  const { children } = vnode;
  // 创建文本节点
  const textNode = (vnode.el = document.createTextNode(children));
  // 将文本节点添加到容器中
  container.append(textNode);
}

// 处理 Fragment 类型
function processFragment(vnode: any, container: any, parentComponent) {
  // Fragment 只渲染 children
  mountChildren(vnode, container, parentComponent);
}

// 处理 Element 类型
function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
}

// 挂载 Element 元素
function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, children, shapeFlag } = vnode;
  // 创建真实 DOM 元素
  const el = (vnode.el = document.createElement(type));

  // props 属性绑定处理
  for (const key in props) {
    const value = props[key];
    // 判断属性是否为绑定事件 on + Event name
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      // 绑定事件 onClick -> click, onMouseOver -> mouseover
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      // 绑定属性
      el.setAttribute(key, value);
    }
  }

  // 处理 children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }

  // 将 el 添加到 container 中
  container.append(el);
}

// 遍历 vnode 的 children 做 patch 操作
function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

// 处理 component 类型
function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
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
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container, instance);
  // element -> mount
  initialVNode.el = subTree.el;
}
