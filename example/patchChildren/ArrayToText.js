import { h, ref } from "../../lib/guide-mini-vue.esm.js";

/**
 * array to text
 */
const prevChildren = [
  h("p", {}, "Prev Children A"),
  h("p", {}, "Prev Children B"),
];
const nextChildren = "Next Children";

export default {
  name: "ArrayToText",
  setup() {
    const isChanged = ref(false);
    window.isChanged = isChanged;

    return {
      isChanged,
    };
  },
  render() {
    const self = this;

    return self.isChanged === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
