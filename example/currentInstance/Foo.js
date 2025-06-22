import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    const foo = h("p", {}, "foo");
    return h("div", {}, foo);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("Foo.js ~ setup ~ instance: ", instance);

    return {};
  },
};
