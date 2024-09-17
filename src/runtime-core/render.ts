import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch;
  patch(vnode, container);
}

function patch(vnode, container) {
  // 去处理组件
  // 判断是不是element
  // TODO: 判断vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  // 思考题：如何去区分是 element 还是 component 类型呢？
  // processElement();

  processComponent(vnode, container);
}
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
}
