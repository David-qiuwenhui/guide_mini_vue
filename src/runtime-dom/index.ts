import { createRenderer } from "../runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, prevValue, nextValue) {
  // 判断属性是否为绑定事件 on + Event name
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    // 绑定事件 onClick -> click, onMouseOver -> mouseover
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  } else {
    if (nextValue === null || nextValue === undefined) {
      // 如果 nextValue 为 null 或 undefined，移除属性
      el.removeAttribute(key);
    } else {
      // 绑定属性
      el.setAttribute(key, nextValue);
    }
  }
}

// 将元素插入到父元素中
function insert(el, parent) {
  // 将 el 添加到 container 中
  parent.append(el);
}

// 移除元素
function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

// 设置元素文本内容
function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core";
