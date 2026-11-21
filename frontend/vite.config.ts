import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { galeriPhotosPlugin } from "./galeriPlugin.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss(), galeriPhotosPlugin()],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target:
            env.VITE_BACKEND_PROXY_TARGET,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    preview: {
      port: 3000,
    },
  };
});
