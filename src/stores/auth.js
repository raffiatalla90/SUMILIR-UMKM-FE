import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";
import { useProfileStore } from "@/stores/profile";

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));
  const profileStore = useProfileStore();

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials) {
    try {
      const { data } = await api.post("/auth/login", credentials);

      // Simpan token dan user
      token.value = data.token || data.data?.token;
      user.value = data.user || data.data?.user;

      localStorage.setItem("token", token.value);
      localStorage.setItem("user", JSON.stringify(user.value));

      // Toast success
      toast.success(`Selamat datang, ${user.value?.name || "User"}! 👋`, {
        timeout: 3000,
      });

      return data;
    } catch (error) {
      console.error("Login failed:", error);

      // Toast error
      const errorMessage =
        error.response?.data?.message || "Login gagal. Silakan coba lagi.";
      toast.error(errorMessage, {
        timeout: 4000,
      });

      throw error;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");

      toast.success("Berhasil logout. Sampai jumpa! 👋", {
        timeout: 2500,
      });
    } catch (error) {
      console.error("Logout error:", error);

      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      profileStore.$reset();
    }
  }

  async function register(userData) {
    try {
      const { data } = await api.post("/auth/register", userData);

      toast.success("Registrasi berhasil! Silakan login.", {
        timeout: 3000,
      });

      return data;
    } catch (error) {
      console.error("Register failed:", error);

      const errorMessage =
        error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
      toast.error(errorMessage, {
        timeout: 4000,
      });

      throw error;
    }
  }

  // Load user dari localStorage saat init
  function initAuth() {
    const savedUser = localStorage.getItem("user");
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser);
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    initAuth,
  };
});
