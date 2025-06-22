import { render } from "./render";
import { createVNode } from "./vnode";
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // component -> vnode 所有的逻辑操作 都会基于 vnode 做处理
      // 1. 基于rootComponent创建一个 vnode
      const vnode = createVNode(rootComponent);
      // 2. 进行render
      render(vnode, rootContainer);
    },
  };
}
