import { createVNode, Fragment } from "../vnode";

// 在子组件中渲染插槽内容
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    // function
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
