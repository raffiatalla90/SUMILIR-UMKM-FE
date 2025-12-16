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

  // ✅ Initialize user from localStorage on app startup (synchronous, non-blocking)
  function initializeFromStorage() {
    console.log("[Auth] Starting initialization from localStorage...");
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");
    
    console.log("[Auth] localStorage.getItem('user'):", stored ? "exists" : "empty");
    console.log("[Auth] localStorage.getItem('auth_token'):", token ? "exists" : "empty");
    
    if (stored) {
      try {
        user.value = JSON.parse(stored);
        
        // ✅ Restore token to axios headers
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        
        console.log("[Auth] ✅ User restored from localStorage:", {
          email: user.value?.email,
          id: user.value?.id,
          isAuthenticated: !!user.value,
          tokenSet: !!token
        });
      } catch (e) {
        console.error("[Auth] ❌ Failed to restore user from localStorage:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        user.value = null;
      }
    } else {
      console.log("[Auth] No user data in localStorage");
      user.value = null;
    }
  }

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
      console.log(
        "✅ Active merchant set to:",
        merchant.name,
        "(ID:",
        merchantId,
        ")"
      );
    } else {
      console.warn("⚠️ Merchant not found:", merchantId);
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

      // ✅ Store user data
      user.value = data.user;
      const essentialUserData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        roles: data.user.roles,
        merchants: data.user.merchants || [],
      };
      localStorage.setItem("user", JSON.stringify(essentialUserData));
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
        const msg =
          error.response?.data?.message || "Login gagal. Periksa koneksi Anda.";
        toast.error(msg, { timeout: 3000 });
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
        loadSelectedMerchant();
        console.log("✅ User loaded from localStorage:", user.value);
      } catch (e) {
        console.error("❌ Failed to parse saved user:", e);
        localStorage.removeItem("user");
      }
    }

    try {
      // ✅ Use ensureCsrfToken
      await ensureCsrfToken();

      const { data } = await sanctumApi.get("/me");
      user.value = data;

      // ✅ Store only essential data
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
            segmentation_id: m.segmentation?.id || null,
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
      console.log("✅ Session verified:", user.value);
    } catch (e) {
      console.warn("⚠️ Session not valid, clearing user");
      clearUser();
    }
  }

  return {
    user,
    isAuthenticated,
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
    initializeFromStorage, // ✅ Export init function
    login,
    logout,
    register,
    initAuth,
    clearUser,
    setActiveMerchant,
    loadSelectedMerchant,
  };
});
