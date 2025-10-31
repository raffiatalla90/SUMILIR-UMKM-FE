import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./style.css";
import { registerSW } from "virtual:pwa-register";
import { useAuthStore } from "@/stores/auth"; // import ini ditambahkan

const updateSW = registerSW({ immediate: true });

// Minimal waktu splash (ms)
const MIN_SPLASH_MS = Number(import.meta.env.VITE_SPLASH_MIN_MS || 1000);

function hideSplash() {
  const el = document.getElementById("splash");
  if (!el) return;
  el.classList.add("splash-hidden");
  setTimeout(() => el.remove(), 300); // sesuai CSS transition 0.3s
}

const app = createApp(App);
const pinia = createPinia();

app.use(Toast);
app.use(pinia);
app.use(router);

// Init auth state (non-blocking)
try {
  const authStore = useAuthStore();
  authStore.initAuth?.();
} catch (e) {
  console.warn("Auth init skipped:", e);
}

// Mount ASAP
app.mount("#app");

// Tampilkan splash hanya di mobile (< 640px)
const isDesktop = window.matchMedia("(min-width: 640px)").matches;

if (isDesktop) {
  // Desktop: jangan tunggu, sembunyikan segera
  hideSplash();
} else {
  // Mobile: minimal 1 detik + tunggu router siap
  const readyPromise =
    typeof router.isReady === "function" ? router.isReady() : Promise.resolve();
  const minTimePromise = new Promise((r) => setTimeout(r, MIN_SPLASH_MS));
  Promise.all([readyPromise.catch(() => {}), minTimePromise]).finally(() =>
    nextTick().then(hideSplash)
  );
}
