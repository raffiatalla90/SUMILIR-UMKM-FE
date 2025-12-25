// src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();

  const user = ref(null);
  const authReady = ref(false);
  const selectedMerchantId = ref(null);

  // =========================
  // COMPUTED
  // =========================
  const isAuthenticated = computed(() => !!user.value);
  function requireLoginToast() {
    toast.info("Silakan login terlebih dahulu untuk melanjutkan", {
      timeout: 2500,
    });
  }

  const userRoles = computed(
    () =>
      user.value?.roles?.map((r) => (typeof r === "string" ? r : r.name)) || []
  );

  const isAdmin = computed(() => userRoles.value.includes("admin"));
  const isMerchant = computed(() => userRoles.value.includes("umkm-owner"));
  const isCustomer = computed(() => userRoles.value.includes("customer"));

  const allMerchants = computed(() => user.value?.merchants || []);

  const activeMerchant = computed(() => {
    if (!allMerchants.value.length) return null;

    if (selectedMerchantId.value) {
      const found = allMerchants.value.find(
        (m) => m.id === selectedMerchantId.value
      );
      if (found) return found;
    }

    return (
      allMerchants.value.find((m) => m.status === "approved") ||
      allMerchants.value[0]
    );
  });

  const merchantId = computed(() => activeMerchant.value?.id || null);
  const merchantName = computed(
    () => activeMerchant.value?.name || user.value?.name || "User"
  );

  // =========================
  // HELPERS
  // =========================
  function persistUser(data) {
    const minimal = {
      id: data.id,
      name: data.name,
      email: data.email,
      roles: data.roles,
      merchants: data.merchants || [],
    };

    user.value = minimal;
    localStorage.setItem("user", JSON.stringify(minimal));
  }

  function clearUser() {
    user.value = null;
    selectedMerchantId.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("selected_merchant_id");
  }

  function loadSelectedMerchant() {
    const saved = localStorage.getItem("selected_merchant_id");
    if (saved) selectedMerchantId.value = Number(saved);
  }

  function setActiveMerchant(id) {
    selectedMerchantId.value = Number(id);
    localStorage.setItem("selected_merchant_id", String(id));
  }
  function getMerchantById(id) {
    return allMerchants.value.find((m) => Number(m.id) === Number(id)) || null;
  }

  // =========================
  // ACTIONS
  // =========================
  async function login(credentials) {
    try {
      try {
        await api.get("/sanctum/csrf-cookie");
      } catch {
        console.warn("Gagal mendapatkan CSRF cookie");
      }

      // 🔐 Login
      await api.post("/login", credentials);

      // 👤 Ambil user
      const { data } = await api.get("/api/me");

      persistUser(data);
      loadSelectedMerchant();

      toast.success("Login berhasil!", { timeout: 2500 });
      return data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        toast.error("Email atau password salah");
      } else if (status === 403) {
        toast.warning(error.response?.data?.message || "Akses ditolak");
      } else {
        toast.error("Login gagal");
      }

      throw error;
    }
  }

  async function logout() {
    try {
      await api.post("/logout");
      toast.success("Berhasil logout!", { timeout: 2000 });
    } catch {
      toast.warning("Logout gagal, sesi dibersihkan");
    } finally {
      clearUser();
    }
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    toast.success("Registrasi berhasil, silakan login");
    return data;
  }

  async function initAuth() {
    authReady.value = false;

    // Load dari localStorage dulu (optimistic)
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        user.value = JSON.parse(saved);
        loadSelectedMerchant();
      } catch {
        clearUser();
      }
    }

    // Validasi ke server
    try {
      const { data } = await api.get("/api/me");
      persistUser(data);
    } catch {
      clearUser();
    } finally {
      authReady.value = true;
    }
  }

  // =========================
  // EXPORT
  // =========================
  return {
    // state
    user,
    authReady,
    isAuthenticated,

    // roles
    userRoles,
    isAdmin,
    isMerchant,
    isCustomer,

    // merchant
    allMerchants,
    activeMerchant,
    merchantId,
    merchantName,
    setActiveMerchant,
    getMerchantById,

    // actions
    requireLoginToast,
    login,
    logout,
    register,
    initAuth,
    clearUser,
  };
});
