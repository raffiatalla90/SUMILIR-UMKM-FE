// stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, {
  sanctumApi,
  setXsrfTokenHeader,
  syncXsrfFromCookie,
  ensureCsrfToken,
} from "@/libs/axios";
import { useToast } from "vue-toastification";
import { useProfileStore } from "@/stores/profile";

export const useAuthStore = defineStore("auth", () => {
  const toast = useToast();
  
  // State
  const user = ref(null);
  const authReady = ref(false);
  const selectedMerchantId = ref(null);

  // =========================
  // COMPUTED - User & Roles
  // =========================
  const isAuthenticated = computed(() => !!user.value);

  const userRoles = computed(() => {
    if (!user.value?.roles) return [];
    return user.value.roles
      .map((r) => (typeof r === "string" ? r : r.name))
      .filter(Boolean);
  });

  const isAdmin = computed(() => userRoles.value.includes("admin"));
  const isMerchant = computed(() => userRoles.value.includes("umkm-owner"));
  const isCustomer = computed(() => userRoles.value.includes("customer"));

  // =========================
  // COMPUTED - Merchants
  // =========================
  const allMerchants = computed(() => user.value?.merchants || []);

  const activeMerchant = computed(() => {
    if (!allMerchants.value.length) return null;

    // Priority: selected > approved > first
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
  
  const merchantName = computed(() => 
    activeMerchant.value?.name || user.value?.name || "Merchant"
  );

  const merchantType = computed(() => 
    activeMerchant.value?.segmentation?.name || "UMKM"
  );

  const merchantsCount = computed(() => allMerchants.value.length);

  // =========================
  // HELPERS
  // =========================
  function getMerchantById(id) {
    return allMerchants.value.find((m) => m.id === Number(id)) || null;
  }

  function persistUser(data) {
    const minimal = {
      id: data.id,
      name: data.name,
      email: data.email,
      roles: data.roles.map((r) => (typeof r === "string" ? r : r.name)),
      merchants: data.merchants?.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        segmentation: m.segmentation ? {
          id: m.segmentation.id,
          name: m.segmentation.name,
        } : null,
      })) || [],
    };

    user.value = data;
    localStorage.setItem("user", JSON.stringify(minimal));
    console.log("✅ User persisted:", minimal);
  }

  function clearUser() {
    user.value = null;
    selectedMerchantId.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("selected_merchant_id");
    setXsrfTokenHeader(null);
    
    // Reset profile store
    const profileStore = useProfileStore();
    profileStore.$reset();
    
    console.log("✅ User data cleared");
  }

  function loadSelectedMerchant() {
    const saved = localStorage.getItem("selected_merchant_id");
    if (saved) {
      selectedMerchantId.value = Number(saved);
      console.log("✅ Loaded selected merchant ID:", saved);
    }
  }

  function setActiveMerchant(merchantId) {
    const merchant = getMerchantById(merchantId);
    
    if (merchant) {
      selectedMerchantId.value = Number(merchantId);
      localStorage.setItem("selected_merchant_id", String(merchantId));
      console.log(`✅ Active merchant set to: ${merchant.name} (ID: ${merchantId})`);
    } else {
      console.warn("⚠️ Merchant not found:", merchantId);
    }
  }

  function requireLoginToast() {
    toast.info("Silakan login terlebih dahulu untuk melanjutkan", {
      timeout: 2500,
    });
  }

  // =========================
  // ACTIONS
  // =========================
  async function login(credentials) {
    try {
      console.log("🔍 Logging in...");

      // Ensure CSRF token
      await ensureCsrfToken();
      console.log("✅ CSRF token obtained");

      // Login request
      await sanctumApi.post("/login", credentials);
      console.log("✅ Login successful");

      // Sync CSRF from cookie
      syncXsrfFromCookie();

      // Fetch user data
      const { data } = await sanctumApi.get("/me");
      console.log("✅ User data fetched");

      // Persist user
      persistUser(data);
      loadSelectedMerchant();

      toast.success(`Selamat datang, ${data.name || "User"}! 👋`, {
        timeout: 2500,
      });

      return data;
    } catch (error) {
      console.error("❌ Login error:", error);

      const status = error.response?.status;

      if (status === 431) {
        toast.error("Cookie terlalu besar. Silakan clear cache browser.", {
          timeout: 4000,
        });
      } else if (status === 401) {
        toast.error("Email atau password salah", { timeout: 3000 });
      } else if (status === 403) {
        const msg = error.response?.data?.message || "Email belum terverifikasi";
        toast.warning(msg, { timeout: 3000 });
      } else {
        const msg = error.response?.data?.message || "Login gagal. Periksa koneksi Anda";
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
      console.error("❌ Logout error:", error);
      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
    } finally {
      clearUser();
    }
  }

  async function register(payload) {
    try {
      console.log("🔍 Registering user...");
      
      const { data } = await api.post("/auth/register", payload);
      console.log("✅ Registration successful");
      
      toast.success("Registrasi berhasil! Silakan login", { timeout: 3000 });
      return data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      const msg = error.response?.data?.message || "Registrasi gagal. Silakan coba lagi";
      toast.error(msg, { timeout: 4000 });
      throw error;
    }
  }

  async function initAuth() {
    console.log("🔍 Initializing auth...");
    authReady.value = false;

    // Load from localStorage (optimistic)
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        user.value = JSON.parse(saved);
        loadSelectedMerchant();
        console.log("✅ User loaded from localStorage");
      } catch (e) {
        console.error("❌ Failed to parse saved user:", e);
        clearUser();
      }
    }

    // Validate with server
    try {
      await ensureCsrfToken();
      
      const { data } = await sanctumApi.get("/me");
      persistUser(data);
      console.log("✅ Session verified");
    } catch (error) {
      console.warn("⚠️ Session not valid, clearing user");
      clearUser();
    } finally {
      authReady.value = true;
    }
  }

  // =========================
  // EXPORT
  // =========================
  return {
    // State
    user,
    authReady,
    isAuthenticated,

    // Roles
    userRoles,
    isAdmin,
    isMerchant,
    isCustomer,

    // Merchants
    allMerchants,
    activeMerchant,
    merchantId,
    merchantName,
    merchantType,
    merchantsCount,
    getMerchantById,
    setActiveMerchant,

    // Actions
    requireLoginToast,
    login,
    logout,
    register,
    initAuth,
    clearUser,
  };
});