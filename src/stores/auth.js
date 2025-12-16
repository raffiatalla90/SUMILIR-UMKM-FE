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
  const authReady = ref(false);

  // ✅ Active merchant based on selectedMerchantId
  const activeMerchant = computed(() => {
    const merchants = user.value?.merchants || [];

    // Prioritas: selected merchant > first approved > first
    if (selectedMerchantId.value) {
      const selected = merchants.find((m) => m.id === selectedMerchantId.value);
      if (selected) return selected;
    }

    return (
      merchants.find((m) => m.status === "approved") || merchants[0] || null
    );
  });

  // ✅ Get merchant by specific ID
  const getMerchantById = (id) => {
    const merchants = user.value?.merchants || [];
    return merchants.find((m) => m.id === Number(id)) || null;
  };

  const merchantName = computed(() => {
    return activeMerchant.value?.name || user.value?.name || "Merchant";
  });

  const merchantType = computed(() => {
    const m = activeMerchant.value;
    if (m?.segmentation?.name) {
      return m.segmentation.name === "Segmentation 3" ? "UMKM Jasa" : m.segmentation.name;
    }
    switch (m?.segmentation_id) {
      case 3:
        return "UMKM Jasa";
      case 2:
        return "UMKM Produk";
      case 1:
        return "UMKM";
      default:
        return "UMKM";
    }
  });

  const merchantId = computed(() => {
    return activeMerchant.value?.id || null;
  });

  const merchantsCount = computed(() => {
    return user.value?.merchants?.length || 0;
  });

  const allMerchants = computed(() => {
    return user.value?.merchants || [];
  });

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
    console.log("[Auth] 🗑️ Clearing user data.");
    user.value = null;
    selectedMerchantId.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("selected_merchant_id");
    
    // ✅ Remove token from axios headers
    delete api.defaults.headers.common["Authorization"];
    setXsrfTokenHeader(null);
    
    console.log("[Auth] ✅ User data cleared");
  }

  // =========================
  // ACTIONS
  // =========================
  async function login(credentials) {
    try {
      console.log("🔍 Logging in with credentials:", credentials);

      // ✅ Get CSRF token first
      await ensureCsrfToken();
      console.log("✅ CSRF cookie obtained");

      // ✅ Post to /api/auth/login (returns token + user data)
      const { data } = await api.post("/auth/login", credentials);
      console.log("✅ Login successful, token:", data.token?.substring(0, 20) + "...");

      // ✅ Store token in localStorage for API requests
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        // Set token in axios headers for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }

      // ✅ Prefer the server-provided user (should include merchants+segmentation)
      user.value = data.user;
      localStorage.setItem("user", JSON.stringify(user.value));

      // ✅ Immediately refresh with /auth/me to ensure relationships loaded
      try {
        const me = await sanctumApi.get("/me");
        user.value = me.data;
        localStorage.setItem("user", JSON.stringify(user.value));
      } catch (e) {
        console.warn("⚠️ Failed to refresh /me after login, using login payload.");
      }

      loadSelectedMerchant();

      toast.success("Login berhasil! Selamat datang 👋", { timeout: 2500 });
      return data.user;
    } catch (error) {
      console.error("❌ Login error:", error);

      if (error.response?.status === 431) {
        toast.error("Cookie terlalu besar. Silakan clear cache browser.", {
          timeout: 4000,
        });
      } else if (error.response?.status === 401 || error.response?.status === 422) {
        toast.error("Email atau password salah.", { timeout: 3000 });
      } else if (error.response?.status === 403) {
        const msg =
          error.response?.data?.message || "Email belum terverifikasi.";
        toast.warning(msg, { timeout: 3000 });
      } else {
        toast.error("Login gagal");
      }

      throw error;
    }
  }

  async function logout() {
    try {
      await sanctumApi.post("/api/auth/logout");
      toast.success("Berhasil logout. Sampai jumpa! 👋", { timeout: 2500 });
    } catch (error) {
      console.error("Logout error:", error);
      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
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

    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        user.value = JSON.parse(saved);
        loadSelectedMerchant();
      } catch {
        clearUser();
      } catch {
        clearUser();
      }
    }

    try {
      await ensureCsrfToken();
      const { data } = await sanctumApi.get("/me");

      user.value = data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          roles: data.roles.map((r) => (typeof r === "string" ? r : r.name)),
          merchants: data.merchants || [],
        })
      );
    } catch {
      clearUser();
    } finally {
      authReady.value = true; // 🔥 PENTING
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
    authReady,
    userRoles,
    isAdmin,
    isMerchant,
    isCustomer,

    // merchant
    allMerchants,
    activeMerchant,
    merchantId,
    merchantName,
    merchantType,
    merchantId,
    merchantsCount,
    allMerchants,
    getMerchantById, // ✅ Export
    // Actions
    initializeFromStorage, // ✅ Export init function
    login,
    logout,
    register,
    initAuth,
    clearUser,
  };
});
