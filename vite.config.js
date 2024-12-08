import { resolve } from "path";

export default {
  root: "src", // 設置 src 為開發環境的根目錄
  base: "/2024-hex-js-week08-mainTask/",
  build: {
    outDir: "../dist", // 設定輸出目錄相對於根目錄
    rollupOptions: {
      input: {
        main: "src/index.html",
        admin: "src/admin.html", // 可選，若有其他頁面
      },
    },
  },
};
