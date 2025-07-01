import { h } from "../../lib/guide-mini-vue.esm.js";
import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";
import ArrayToArray from "./ArrayToArray.js";

export const App = {
  name: "App",
  setup() {
    return {};
  },
  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // 1. Array to Text
      // h(ArrayToText),
      // 2. Text to Text
      // h(TextToText),
      // 3. Text to Array
      // h(TextToArray),
      // 4. Array to Array
      h(ArrayToArray),
    ]);
  },
};
