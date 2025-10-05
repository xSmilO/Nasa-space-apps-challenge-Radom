import { defineConfig } from "vite";

export default defineConfig({
    server: {
        proxy: {
            "/server": {
                target: "https://nasa-space-apps-challenge-radom-backend-kzfkas-projects.vercel.app/",
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
