import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // 调用patch
  patch(vnode, container);
}

function patch(vnode, container) {
  // 基于 vnode 的类型进行不同类型的组件处理
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 处理 element 类型
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理 component 类型
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const { type, props, children, shapeFlag } = vnode;
  // element
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

  // children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }

  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

// 处理 component 类型
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

// 组件初始化
function mountComponent(initialVNode: any, container) {
  // 1. 创建 component instance 对象
  const instance = createComponentInstance(initialVNode);
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
  patch(subTree, container);
  // element -> mount
  initialVNode.el = subTree.el;
}
