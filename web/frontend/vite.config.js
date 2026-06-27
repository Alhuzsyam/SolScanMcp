import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Dev server proxies /api → Express proxy (:8787) so the browser talks to one
// origin and the Solscan key stays server-side.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
