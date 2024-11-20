import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  // 必须要写 render
  name: "App",
  render() {
    window.self = this;
    // setupState
    // this.$el -> get root component
    return h(
      "div",
      {
        id: "root",
        class: "red",
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("onMousedown");
        },
      },
      [h("div", {}, "hi, " + this.msg), h(Foo, { count: 1 })]
      // "hi " + this.msg
    );

    // return h("div", { id: "root", class: ["red", "hard"] }, [
    //   h("p", { class: "blue" }, "child1"),
    //   h("p", { class: "blue" }, "child2"),
    // ]);
    // return h("div", { class: "red" }, "hi " + "mini-vue");
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    };
  },
};
