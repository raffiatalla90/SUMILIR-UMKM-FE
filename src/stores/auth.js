// stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
  sanctumApi,
  setXsrfTokenHeader,
  syncXsrfFromCookie,
  readCookie,
} from "@/libs/axios";
import { useToast } from "vue-toastification";

/**
 * getCookie helper tetap tersedia di store jika diperlukan.
 * Namun kita memakai readCookie yang diexport dari libs/axios untuk konsistensi.
 */
function getCookie(name) {
  return readCookie(name);
}

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();
  const user = ref(null);

  const isAuthenticated = computed(() => !!user.value);

  async function login(credentials) {
    try {
      console.log("🔍 Logging in with credentials:", credentials);

      // 1) pastikan CSRF cookie tersedia (route default Sanctum)
      await sanctumApi.get("/sanctum/csrf-cookie");
      console.log("✅ CSRF cookie obtained");

      // 2) sinkronisasi header XSRF dari cookie ke axios instances
      //    (baca cookie di browser dan set header di both instances)
      syncXsrfFromCookie();

      // 3) lakukan login (sanctum endpoint biasanya di /login)
      await sanctumApi.post("/login", credentials);
      console.log("✅ Login successful");

      // 4) setelah login, cookie session & XSRF-TOKEN biasanya diset oleh server.
      //    sinkronkan lagi untuk memastikan header terbaru.
      syncXsrfFromCookie();

      // 5) ambil data user
      const { data } = await sanctumApi.get("/me");
      console.log("✅ User data fetched:", data);

      user.value = data;
      localStorage.setItem("user", JSON.stringify(data));
      console.log("✅ User state updated:", user.value);

      toast.success("Login berhasil! Selamat datang 👋", { timeout: 2500 });
      return data;
    } catch (error) {
      console.error("❌ Login error:", error);
      const msg =
        error.response?.data?.message || "Login gagal. Periksa email/password.";
      toast.error(msg, { timeout: 3000 });
      throw error;
    }
  }

  async function logout() {
    try {
      await sanctumApi.post("/logout");
      toast.success("Berhasil logout. Sampai jumpa! 👋", { timeout: 2500 });
    } catch (error) {
      console.error("Logout error:", error);
      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
    } finally {
      user.value = null;
      localStorage.removeItem("user");
      // clear xsrf headers after logout
      setXsrfTokenHeader(null);
    }
  }

  async function register(userData) {
    try {
      console.log("🔍 Registering user:", userData);
      // gunakan API instance (prefix /api)
      const { data } = await api.post("/auth/register", userData);
      console.log("✅ Registration successful:", data);
      toast.success("Registrasi berhasil! Silakan login.", { timeout: 3000 });
      return data;
    } catch (error) {
      console.error("❌ Register failed:", error);
      const errorMessage =
        error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
      toast.error(errorMessage, { timeout: 4000 });
      throw error;
    }
  }

  async function initAuth() {
    console.log("🔍 Initializing auth...");
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        user.value = JSON.parse(saved);
        console.log("✅ User loaded from localStorage:", user.value);
      } catch (e) {
        console.error("❌ Failed to parse saved user:", e);
        localStorage.removeItem("user");
      }
    }

    try {
      // Pastikan CSRF cookie ada (jadi request /me akan memakai cookie session)
      await sanctumApi.get("/sanctum/csrf-cookie");
      // sinkronkan header dari cookie (jika ada)
      syncXsrfFromCookie();

      const { data } = await sanctumApi.get("/me");
      user.value = data;
      localStorage.setItem("user", JSON.stringify(data));
      console.log("✅ Session verified:", user.value);
    } catch (e) {
      console.warn("⚠️ Session not valid, clearing user");
      user.value = null;
      localStorage.removeItem("user");
      // clear headers if session invalid
      setXsrfTokenHeader(null);
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    initAuth,
  };
});
