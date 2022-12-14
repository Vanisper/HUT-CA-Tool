// https://v3.nuxtjs.org/api/configuration/nuxt.config
import path from "path";

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
  css: ["@/assets/styles/main.css"],
  runtimeConfig: {
    env: process.env.NODE_ENV,
    public: {
      publicPath:
        process.env.NODE_ENV == "development"
          ? path.resolve(__dirname, "public")
          : path.resolve(__dirname, ".output/public"),
      apiBase: "api",
      apiVersion: "v1",
      apiUrl: "/api/v1",
    },
    app: {},
  },
});
