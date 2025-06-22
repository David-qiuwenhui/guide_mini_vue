import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    return {};
  },

  render() {
    console.log("Foo.js ~ this.$slots ~", this.$slots);
    const foo = h("p", {}, "foo");

    return h("div", {}, [foo, renderSlots(this.$slots)]);
  },
};
