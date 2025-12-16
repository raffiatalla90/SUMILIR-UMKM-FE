import { createApp, nextTick } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./style.css";
import { useAuthStore } from "@/stores/auth";
import ProductCard from "@/components/Card/ProductCard.vue";
import EventCard from "@/components/Card/EventCard.vue";
import PromoCard from "@/components/Card/PromoCard.vue";

// Minimal waktu splash (ms)
const MIN_SPLASH_MS = Number(import.meta.env.VITE_SPLASH_MIN_MS || 1000);

function hideSplash() {
  const el = document.getElementById("splash");
  if (!el) return;
  el.classList.add("splash-hidden");
  setTimeout(() => el.remove(), 300);
}

const app = createApp(App);
const pinia = createPinia();

app.use(Toast);
app.use(pinia);
app.use(router);

app.component("ProductCard", ProductCard);
app.component("EventCard", EventCard);
app.component("PromoCard", PromoCard);

app.mount("#app");

// Wait for router to be ready before hiding splash
router.isReady().then(() => {
  const isDesktop = window.matchMedia("(min-width: 640px)").matches;

  if (isDesktop) {
    hideSplash();
  } else {
    const minTimePromise = new Promise((r) => setTimeout(r, MIN_SPLASH_MS));
    minTimePromise.finally(() => nextTick().then(hideSplash));
  }
}).catch((err) => {
  console.error("[App] Router failed to initialize:", err);
  hideSplash();
});
