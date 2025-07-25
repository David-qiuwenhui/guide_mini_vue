import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("Foo emit Add and AddFoo");
      emit("add", 1, 2);
      emit("add-foo", 3, 4);
    };

    return {
      emitAdd,
    };
  },

  render() {
    const btn = h("button", { onClick: this.emitAdd }, "emitAdd");
    const foo = h("p", {}, "foo");

    return h("div", {}, [foo, btn]);
  },
};
