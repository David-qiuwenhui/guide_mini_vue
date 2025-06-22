import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    // 1. props count
    console.log({ props });

    // 3. shallow readonly
    props.count++;
    console.log("props.count: ", props.count++);
    console.log(props);
  },

  render() {
    // 2. this 获取 props 上的值
    return h("div", {}, "foo: " + this.count);
  },
};
