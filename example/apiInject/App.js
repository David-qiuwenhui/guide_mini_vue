import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js";

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooValue");
    provide("bar", "barValue");
    // provide("baz", "bazValue");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider Component"), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooValueTwo");
    const foo = inject("foo");
    return {
      foo,
    };
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo Component: ${this.foo}`),
      h(Consumer),
    ]);
  },
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    // If the key is not provided, it will return the default value
    const baz = inject("baz", "defaultBazValue");
    // If the key is not provided, it will return the default function
    const qux = inject("qux", (params) => "defaultQuxValue");

    return {
      foo,
      bar,
      baz,
      qux,
    };
  },
  render() {
    return h(
      "div",
      {},
      `Consumer Component: ${this.foo} ~ ${this.bar} ~ ${this.baz} ~ ${this.qux}`
    );
  },
};

export const App = {
  name: "App",
  setup() {
    return {};
  },
  render() {
    return h("div", {}, [h("p", {}, "App Component"), h(Provider)]);
  },
};
