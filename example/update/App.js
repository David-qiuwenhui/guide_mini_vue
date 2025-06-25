import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };

    return {
      count,
      onClick,
    };
  },
  render() {
    console.log("this.count: ", this.count);

    return h("div", { id: "root" }, [
      h("div", {}, "this.count: " + this.count),
      h("button", { onClick: this.onClick }, "click"),
    ]);
  },
};
