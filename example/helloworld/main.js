import { createApp } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
console.log(App, createApp);

const rootContainer = document.querySelector("#app");
console.log(123);

createApp(App).mount(rootContainer);
