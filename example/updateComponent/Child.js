import { h } from "../../lib/guide-mini-vue.esm.js";

export default {
  name: "Child",
  setup(props) {},
  render(proxy) {
    return h("div", {}, [
      h("p", {}, "Child component - msg: " + this.$props.msg),
    ]);
  },
};
