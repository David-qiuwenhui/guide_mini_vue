import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };

    const props = ref({
      foo: "foo",
      bar: "bar",
    });

    // 1. 演示 props 的更新
    const onChangePropsDemo1 = () => {
      props.value.foo = "new-foo";
    };

    // 2. 演示 props 修改成 undefined 或 null后，移除此属性
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined;
    };

    // 3. 演示 props 中的 key 在新的 props 中没有了, 移除此属性
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo",
      };
    };

    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props,
    };
  },
  render() {
    console.log("this.count: ", this.count);

    return h("div", { id: "root", ...this.props }, [
      h("div", {}, "this.count: " + this.count),
      h("button", { onClick: this.onClick }, "click"),
      h(
        "button",
        { onClick: this.onChangePropsDemo1 },
        "changeProps - 值改变了 - 修改"
      ),
      h(
        "button",
        { onClick: this.onChangePropsDemo2 },
        "changeProps - 值变成了 undefined - 删除"
      ),
      h(
        "button",
        { onClick: this.onChangePropsDemo3 },
        "changeProps - key 在新的里面没有了 - 删除"
      ),
    ]);
  },
};
