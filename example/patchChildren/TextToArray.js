import { h, ref } from "../../lib/guide-mini-vue.esm.js";

/**
 * text to text
 */
const prevChildren = "Prev Children";
const nextChildren = [
  h("div", {}, "Next Children A"),
  h("div", {}, "Next Children B"),
];

export default {
  name: "TextToText",
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
