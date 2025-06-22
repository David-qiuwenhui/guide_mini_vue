import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    // emit
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        // emit: on + EventName
        // 1. onAdd
        onAdd(a, b) {
          console.log("App accept emit onAdd", { a, b });
        },
        // 2. onAddFoo add-foo -> addFoo
        onAddFoo(a, b) {
          console.log("App accept emit onAddFoo", { a, b });
        },
      }),
    ]);
  },

  setup() {
    return {};
  },
};
