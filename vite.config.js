import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    server: {
        proxy: {
            "/server": {
                target: process.env.SERVER_URL,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/server/, ""),
                secure: true,
            },
        },
        cors: {
            origin: "*", // Allows any origin
            methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        },
    },
});
