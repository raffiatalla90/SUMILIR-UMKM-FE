import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./style.css";

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
