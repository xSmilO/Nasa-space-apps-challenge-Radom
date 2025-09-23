import { defineConfig } from "vite";

export default defineConfig({
    server: {
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === "/earth_view") {
                    res.writeHead(302, { Location: '/earth_view.html' })
                    res.end();
                    return
                }
                next();
            })
        }
    }
})
