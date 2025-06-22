import { createApp } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
console.log(App, createApp);

const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);
