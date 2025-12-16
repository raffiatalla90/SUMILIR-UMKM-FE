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
          name: "Sumilir",
          short_name: "Sumilir",
          description: "UMKM App",
          theme_color: "#ff9800",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/", // ✅ Root
          scope: "/", // ✅ Root
          icons: [
            {
              src: "/icon192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon512.png",
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
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
    },
  };
});
