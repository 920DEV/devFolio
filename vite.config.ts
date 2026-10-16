import { defineConfig } from "vite";
import { handleApiRequest } from "./server/api.mjs";

export default defineConfig({
  plugins: [{
    name: "resume-assistant-api",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/api/")) {
          next();
          return;
        }
        void handleApiRequest(request, response).catch(next);
      });
    },
  }],
  server: {
    host: "127.0.0.1",
  },
});
