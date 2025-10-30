import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./style.css";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // bisa tampilkan toast/confirm untuk reload
    updateSW(true);
  },
  onOfflineReady() {
    console.log("App siap offline");
  },
});
const app = createApp(App);
const pinia = createPinia();

app.use(Toast);
app.use(pinia);
app.use(router);

// Init auth state
import { useAuthStore } from "./stores/auth";
const authStore = useAuthStore();
authStore.initAuth();

app.mount("#app");
