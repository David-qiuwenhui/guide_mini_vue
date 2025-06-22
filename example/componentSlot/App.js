import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "slot App");
    const foo = h(Foo, {}, h("div", {}, "slot Foo"));
    // const foo = h(Foo, {}, [
    //   h("div", {}, "slot Foo"),
    //   h("div", {}, "slot Foo2"),
    // ]);

    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
