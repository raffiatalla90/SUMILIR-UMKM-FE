// stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
  sanctumApi,
  setXsrfTokenHeader,
  syncXsrfFromCookie,
  readCookie,
  ensureCsrfToken, // ✅ Import
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
  const selectedMerchantId = ref(null); // ✅ Add this

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
    return activeMerchant.value?.segmentation?.name || "UMKM";
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

  const userRoles = computed(() => {
    if (!user.value?.roles) return [];
    return user.value.roles
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean);
  });

  const isAdmin = computed(() => userRoles.value.includes("admin"));
  const isMerchant = computed(() => userRoles.value.includes("umkm-owner"));
  const isCustomer = computed(() => userRoles.value.includes("customer"));

  // ✅ Set active merchant - NO NEW CSRF REQUEST
  function setActiveMerchant(merchantId) {
    const merchant = allMerchants.value.find(
      (m) => m.id === Number(merchantId)
    );
    if (merchant) {
      selectedMerchantId.value = Number(merchantId);
      localStorage.setItem("selected_merchant_id", String(merchantId));
    } else {
    }
  }

  // ✅ Load selected merchant from localStorage
  function loadSelectedMerchant() {
    const saved = localStorage.getItem("selected_merchant_id");
    if (saved) {
      selectedMerchantId.value = Number(saved);
    }
  }

  // ✅ Clear user data
  function clearUser() {
    user.value = null;
    selectedMerchantId.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("selected_merchant_id");
    setXsrfTokenHeader(null);
  }

  async function login(credentials) {
    try {
      // ✅ Use ensureCsrfToken instead of direct call
      await ensureCsrfToken();

      await sanctumApi.post("/login", credentials);

      syncXsrfFromCookie();

      const { data } = await sanctumApi.get("/me");

      user.value = data;

      // ✅ Only store essential user data in localStorage (not full response)
      const essentialUserData = {
        id: data.id,
        name: data.name,
        email: data.email,
        roles: data.roles.map((r) => (typeof r === "string" ? r : r.name)),
        merchants:
          data.merchants?.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            segmentation: m.segmentation
              ? {
                  id: m.segmentation.id,
                  name: m.segmentation.name,
                }
              : null,
          })) || [],
      };

      localStorage.setItem("user", JSON.stringify(essentialUserData));
      loadSelectedMerchant();

      toast.success("Login berhasil! Selamat datang 👋", { timeout: 2500 });
      return data;
    } catch (error) {
      if (error.response?.status === 431) {
        toast.error("Cookie terlalu besar. Silakan clear cache browser.", {
          timeout: 4000,
        });
      } else if (error.response?.status === 401) {
        toast.error("Email atau password salah.", { timeout: 3000 });
      } else if (error.response?.status === 403) {
        const msg =
          error.response?.data?.message || "Email belum terverifikasi.";
        toast.warning(msg, { timeout: 3000 });
      } else {
        const msg =
          error.response?.data?.message || "Login gagal. Periksa koneksi Anda.";
        toast.error(msg, { timeout: 3000 });
      }

      throw error;
    }
  }

  async function logout() {
    try {
      await sanctumApi.post("/logout");
      toast.success("Berhasil logout. Sampai jumpa! 👋", { timeout: 2500 });
    } catch (error) {
      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
    } finally {
      clearUser();
    }
  }

  async function register(userData) {
    try {
      // gunakan API instance (prefix /api)
      const { data } = await api.post("/auth/register", userData);
      toast.success("Registrasi berhasil! Silakan login.", { timeout: 3000 });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
      toast.error(errorMessage, { timeout: 4000 });
      throw error;
    }
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

  return {
    user,
    isAuthenticated,
    authReady,
    userRoles,
    isAdmin,
    isMerchant,
    isCustomer,
    // ✅ Merchant computed
    activeMerchant,
    merchantName,
    merchantType,
    merchantId,
    merchantsCount,
    allMerchants,
    getMerchantById, // ✅ Export
    // Actions
    login,
    logout,
    register,
    initAuth,
    clearUser,
    setActiveMerchant,
    loadSelectedMerchant,
  };
});
