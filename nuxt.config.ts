// https://v3.nuxtjs.org/api/configuration/nuxt.config
import "default-passive-events";
export default defineNuxtConfig({
  builder: "vite",
  vite: {
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },
  meta: {
    title: "HUT综测工具",
    meta: [
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "告别烦人的综测收集",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  // modules
  modules: [
    [
      "@pinia/nuxt",
      {
        autoImports: [
          // automatically imports `defineStore`
          "defineStore", // import { defineStore } from 'pinia'
          // automatically imports `defineStore` as `definePiniaStore`
          ["defineStore", "definePiniaStore"], // import { defineStore as definePiniaStore } from 'pinia'
        ],
      },
    ],
  ],

  css: ["@/assets/styles/main.less"],
});
