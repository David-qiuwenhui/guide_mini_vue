import { ref, h } from "../../lib/guide-mini-vue.esm.js";
import Child from "./Child.js";

export const App = {
  name: "App",
  setup() {
    const msg = ref("old message");
    const count = ref(1);
    window.msg = msg;

    const changeChildProps = () => {
      console.log(
        "🚀 ~ changeChildProps ~ changeChildProps:",
        changeChildProps
      );
      msg.value = "new message";
    };
    const changeCount = () => {
      console.log("🚀 ~ changeCount ~ changeCount:", changeCount);
      count.value++;
    };

    return {
      msg,
      count,
      changeChildProps,
      changeCount,
    };
  },
  render() {
    return h("div", {}, [
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change message"
      ),
      h(Child, { msg: this.msg }),
      h(
        "button",
        {
          onClick: this.changeCount,
        },
        "increment"
      ),
      h("p", {}, "count: " + this.count),
    ]);
  },
};
