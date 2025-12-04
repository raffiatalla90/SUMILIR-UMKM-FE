import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL || "/api";

  return {
    // ✅ Vue di root, tidak perlu /build/
    base: "/",

    plugins: [
      vue(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: mode === "development" },
        manifest: {
          name: "SUMILIR",
          short_name: "SUMILIR",
          description: "UMKM App",
          theme_color: "#ff9800",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/", // ✅ Root
          scope: "/", // ✅ Root
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: "/index.html", // ✅ Root
          navigateFallbackDenylist: [/^\/api\//], // ✅ Exclude /api/
          runtimeCaching: [
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin &&
                ["style", "script", "image", "font"].includes(
                  request.destination
                ),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "assets-cache-v1" },
            },
            {
              urlPattern: new RegExp(
                `^${apiBase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}/.*`
              ),
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "api-cache-v1",
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 200, maxAgeSeconds: 3600 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      minify: "terser",
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-vue": ["vue", "vue-router", "pinia"],
          },
        },
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/sanctum": {
          target: env.VITE_BASE_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
