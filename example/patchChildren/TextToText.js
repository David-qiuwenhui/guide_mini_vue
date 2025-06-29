import { h, ref } from "../../lib/guide-mini-vue.esm.js";

/**
 * text to array
 */
const prevChildren = "Prev Children";
const nextChildren = "Next Children";

export default {
  name: "TextToArray",
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
