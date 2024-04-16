import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "JAVA",
      icon: "skill-icons:java-dark",
      prefix: "statudy/",
      children: "structure",
    }
  ],
});
