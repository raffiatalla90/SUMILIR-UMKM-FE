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
      user.value?.roles?.map((r) => (typeof r === "string" ? r : r.name)) || [],
  );

  const isAdmin = computed(() => userRoles.value.includes("admin"));
  const isMerchant = computed(() => userRoles.value.includes("umkm-owner"));
  const isCustomer = computed(() => userRoles.value.includes("customer"));

  const allMerchants = computed(() => user.value?.merchants || []);

  const activeMerchant = computed(() => {
    if (!allMerchants.value.length) return null;

    if (selectedMerchantId.value) {
      const found = allMerchants.value.find(
        (m) => m.id === selectedMerchantId.value,
      );
      if (found) return found;
    }

    return (
      allMerchants.value.find((m) => m.status === "approved") ||
      allMerchants.value[0]
    );
  });

  const merchantId = computed(() => activeMerchant.value?.id || null);
  const merchantSlug = computed(() => activeMerchant.value?.slug || null);
  const merchantName = computed(
    () => activeMerchant.value?.name || user.value?.name || "User",
  );

  // =========================
  // HELPERS
  // =========================
  function addQueryParam(url, key, value) {
    if (!url) return url;
    const k = encodeURIComponent(String(key));
    const v = encodeURIComponent(String(value));

    const re = new RegExp(`([?&])${k}=[^&]*`);
    if (re.test(url)) return url.replace(re, `$1${k}=${v}`);

    return url.includes("?") ? `${url}&${k}=${v}` : `${url}?${k}=${v}`;
  }

  function getPersistedProfilePicture(userId) {
    try {
      const raw = localStorage.getItem("profile");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const profileUser = parsed?.user;
      if (!profileUser || Number(profileUser?.id) !== Number(userId))
        return null;
      const url = profileUser?.profile_picture;
      if (typeof url !== "string") return null;
      const trimmed = url.trim();
      return trimmed ? trimmed : null;
    } catch {
      return null;
    }
  }

  function withProfilePictureCacheBuster(url, data) {
    if (!url) return url;
    const isStreaming = String(url).includes("/profile-pictures/");
    if (!isStreaming) return url;

    // Prefer deterministic versioning (so it only changes when user changes)
    const version = data?.updated_at || data?.id || Date.now();
    return addQueryParam(url, "v", version);
  }

  function persistUser(data) {
    const persistedProfilePicture = getPersistedProfilePicture(data?.id);
    const serverProfilePicture =
      typeof data?.profile_picture === "string"
        ? withProfilePictureCacheBuster(data.profile_picture, data)
        : null;

    const minimal = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      profile_picture: persistedProfilePicture || serverProfilePicture || null,
      roles: data.roles,
      merchants: data.merchants || [],
    };

    user.value = minimal;
    localStorage.setItem("user", JSON.stringify(minimal));
  }

  function updateLocalUser(partial) {
    if (!partial || typeof partial !== "object") return;

    const current =
      user.value && typeof user.value === "object" ? user.value : {};
    const next = { ...current, ...partial };
    user.value = next;
    localStorage.setItem("user", JSON.stringify(next));
  }

  function clearUser() {
    user.value = null;
    selectedMerchantId.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("selected_merchant_id");
    // Also clear any persisted profile store so old user data doesn't leak after logout
    localStorage.removeItem("profile");
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

  function getMerchantBySlug(slug) {
    if (!slug) return null;
    const slugString = String(slug);
    return (
      allMerchants.value.find((m) => String(m.slug) === slugString) || null
    );
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

  async function logout(options = {}) {
    const { silent = false, skipRequest = false } =
      options && typeof options === "object" ? options : {};

    try {
      if (!skipRequest) {
        await api.post("/logout");
      }
      if (!silent) {
        toast.success("Berhasil logout!", { timeout: 2000 });
      }
    } catch {
      if (!silent) {
        toast.warning("Logout gagal, sesi dibersihkan");
      }
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

    // helpers
    updateLocalUser,

    // merchant
    allMerchants,
    activeMerchant,
    merchantId,
    merchantSlug,
    merchantName,
    setActiveMerchant,
    getMerchantById,
    getMerchantBySlug,

    // actions
    requireLoginToast,
    login,
    logout,
    register,
    initAuth,
    clearUser,
  };
});
