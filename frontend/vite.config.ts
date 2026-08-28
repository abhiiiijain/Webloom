import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const apiProxy = {
  "/api": {
    target: "http://localhost:4062",
    changeOrigin: true,
  },
};

export default defineConfig({
  appType: "spa",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4061,
    strictPort: true,
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
  },
  build: {
    sourcemap: false,
    target: "es2020",
  },
});
