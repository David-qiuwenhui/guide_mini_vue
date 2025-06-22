import { h, createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h("p", {}, "header: foo slot content" + age),
          createTextVNode("title text"),
        ],
        footer: () => h("p", {}, "footer: foo slot content 2"),
        default: () => [
          h("p", {}, "default: foo slot content 1"),
          h("p", {}, "default: foo slot content 2"),
        ],
      }
    );

    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
