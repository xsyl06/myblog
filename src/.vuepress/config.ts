import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/myblog/",
  lang: "zh-CN",
  title: "Xsyl06的博客",
  description: "一个后端程序员的学习心得",
  markdown: {
    headers: {
      level:[1,2,3,4,5,6] 
    }
  },
  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
