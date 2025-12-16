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

<<<<<<< HEAD
  const userRoles = computed(
    () =>
      user.value?.roles?.map((r) => (typeof r === "string" ? r : r.name)) || []
  );
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)

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
<<<<<<< HEAD
=======
    
    // ✅ Remove token from axios headers
    delete api.defaults.headers.common["Authorization"];
    setXsrfTokenHeader(null);
    
    console.log("[Auth] ✅ User data cleared");
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
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

<<<<<<< HEAD
      // 🔐 Login
      await api.post("/login", credentials);

      // 👤 Ambil user
      const { data } = await api.get("/api/me");

      persistUser(data);
      loadSelectedMerchant();

      toast.success("Login berhasil 👋", { timeout: 2500 });
      return data;
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
    } catch (error) {
      const status = error.response?.status;

<<<<<<< HEAD
      if (status === 401) {
        toast.error("Email atau password salah");
      } else if (status === 403) {
        toast.warning(error.response?.data?.message || "Akses ditolak");
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
      } else {
        toast.error("Login gagal");
      }

      throw error;
    }
  }

  async function logout() {
    try {
<<<<<<< HEAD
      await api.post("/logout");
      toast.success("Berhasil logout 👋", { timeout: 2000 });
    } catch {
      toast.warning("Logout gagal, sesi dibersihkan");
=======
      await sanctumApi.post("/api/auth/logout");
      toast.success("Berhasil logout. Sampai jumpa! 👋", { timeout: 2500 });
    } catch (error) {
      console.error("Logout error:", error);
      toast.warning("Logout gagal, tapi sesi Anda akan dihapus", {
        timeout: 3000,
      });
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
    } finally {
      clearUser();
    }
  }

  async function register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
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
<<<<<<< HEAD
      const { data } = await api.get("/api/me");
      persistUser(data);
    } catch {
=======
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
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
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
<<<<<<< HEAD
    activeMerchant,
    merchantId,
    merchantName,
    setActiveMerchant,
    getMerchantById,

    // actions
    requireLoginToast,
=======
    getMerchantById, // ✅ Export
    // Actions
    initializeFromStorage, // ✅ Export init function
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
    login,
    logout,
    register,
    initAuth,
    clearUser,
  };
});
