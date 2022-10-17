import * as ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { ID_INJECTION_KEY } from "element-plus";
import "element-plus/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
  // https://segmentfault.com/q/1010000041923351/a-1020000041927206
  nuxtApp.vueApp.provide(ID_INJECTION_KEY, {
    prefix: Math.floor(Math.random() * 10000),
    current: 0,
  });
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    // 加上Icon前缀 以区别原有组件
    component.name = "Icon" + component.name;
    nuxtApp.vueApp.component("Icon" + key, component);
  }
  nuxtApp.vueApp.use(ElementPlus);
});
