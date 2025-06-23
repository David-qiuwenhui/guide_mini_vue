import { createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";

// 定义一个 PIXI 应用
const game = new PIXI.Application();
await game.init({
  width: 800,
  height: 600,
});
// 将canvas添加到document中
document.body.append(game.canvas);

// 创建一个自定义渲染器
const renderer = createRenderer({
  // 创建自定义元素
  createElement(type) {
    if (type === "rect") {
      const rect = new PIXI.Graphics();
      rect.fill(0x66ccff);
      rect.rect(0, 0, 100, 100);
      rect.fill();

      return rect;
    }
  },
  patchProp(el, key, value) {
    el[key] = value;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});

// 将自定义渲染器的渲染内容挂载到 PIXI 应用上
renderer.createApp(App).mount(game.stage);

// const rootContainer = document.querySelector("#app");
// createApp(App).mount(rootContainer);

console.log(PIXI);
