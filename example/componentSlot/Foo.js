import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    const foo = h("p", {}, "foo");
    // Foo .vnode. children
    console.log("Foo.js ~ render ~ this.$slots: ", this.$slots);

    // 具名插槽
    // 1. 获取到需要渲染的元素
    // 2. 获取到元素需要渲染的位置
    const age = 18;
    return h("div", {}, [
      renderSlots(this.$slots, "header", { age }),
      foo,
      renderSlots(this.$slots, "default"),
      renderSlots(this.$slots, "footer"),
    ]);
  },
  setup() {},
};
