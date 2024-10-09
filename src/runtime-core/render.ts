import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch;
  patch(vnode, container);
}

function patch(vnode, container) {
  // 去处理组件
  // TODO: 判断vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  // 思考题：如何去区分是 element 还是 component 类型呢？
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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

  // props
  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
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

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
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
