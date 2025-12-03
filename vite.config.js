import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL || "/api";

  return {
    plugins: [
      vue(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: true },
        manifest: {
          name: "SUMILIR",
          short_name: "SUMILIR",
          description: "UMKM App",
          theme_color: "#ff9800",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            // { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            // { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
            // {
            //   src: "/pwa-512x512-maskable.png",
            //   sizes: "512x512",
            //   type: "image/png",
            //   purpose: "any maskable",
            // },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            // cache assets statis
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin &&
                ["style", "script", "image", "font"].includes(
                  request.destination
                ),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "assets-v1" },
            },
            // cache GET API (bukan navigasi)
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
  };
});
