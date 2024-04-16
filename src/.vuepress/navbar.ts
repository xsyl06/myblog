import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "java",
    icon: "skill-icons:java-dark",
    prefix: "/statudy/",
    children: [
      {
        text: "JVM",
        link:"JVM/"
      },
      {
        text: "Mysql",
        link:"Mysql/"
      },
    ],
  }
]);
