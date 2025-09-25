import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/radar": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/radar/, "")
      }
    }
  }
});