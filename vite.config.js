import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Gunakan path relatif agar tidak mixed content saat HTTPS
  const apiBase = env.VITE_API_BASE_URL || "/api";

  return {
    plugins: [
      vue(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: { enabled: true },
        manifest: {
          name: "SIMSLIFE",
          short_name: "SIMSLIFE",
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
          runtimeCaching: [
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin &&
                ["style", "script", "image", "font"].includes(
                  request.destination
                ),
              handler: "StaleWhileRevalidate",
              options: { cacheName: "assets-v1" },
            },
            // Cache GET API di origin yang sama (via /api proxy Nginx)
            {
              urlPattern: new RegExp(
                `^${apiBase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}/.*`
              ),
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "api-cache-v1",
                networkTimeoutSeconds: 5,
                cacheableResponse: { statuses: [0, 200] },
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 },
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
