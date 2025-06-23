import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, value) {
  // 判断属性是否为绑定事件 on + Event name
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    // 绑定事件 onClick -> click, onMouseOver -> mouseover
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
  } else {
    // 绑定属性
    el.setAttribute(key, value);
  }
}

function insert(el, parent) {
  // 将 el 添加到 container 中
  parent.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
