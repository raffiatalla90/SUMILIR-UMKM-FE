import { defineStore } from "pinia";
import profileAPI from "@/services/api/profile";

/**
 * Helper untuk membangun URL gambar profil yang lengkap.
 * @param {string|null} path - Path relatif dari API (e.g., "profile_pictures/file.jpg")
 * @returns {string} URL lengkap atau string kosong.
 */
function buildProfilePictureUrl(path) {
  if (!path) return "";
  // If backend already returns a full URL (e.g. signed route), use it as-is.
  if (typeof path === "string" && /^https?:\/\//i.test(path)) return path;
  const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
    /\/api$/,
    "/storage"
  );
  return `${storageBaseUrl}/${path}`;
}

function buildProfilePictureUrlFromUser(user) {
  if (!user) return "";

  // 1) Prefer backend-provided computed URL (signed route)
  if (user.profile_picture) return buildProfilePictureUrl(user.profile_picture);

  // 2) If we have an id, use the new API streaming endpoint (matches product image access pattern)
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (user.id && apiBase) {
    // Use dash route; backend also provides underscore alias.
    return `${apiBase}/profile-pictures/${user.id}`;
  }

  // 3) Fallback: raw storage path
  const picturePath = user.profile_picture_path ?? user.avatar ?? null;
  return buildProfilePictureUrl(picturePath);
}

export const useProfileStore = defineStore("profile", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  persist: {
    key: "profile",
    paths: ["user"],
  },
  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const data = await profileAPI.getProfile();
        // API responses are inconsistent across environments: some backends return
        // { data: { ...user } } while others return the user object directly.
        // Accept both shapes so the store always ends up with the user object.
        const raw = data?.data ?? data;
        // Normalize common field names so views/forms can rely on the same keys
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: buildProfilePictureUrlFromUser(raw),
        };
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to fetch profile";
      } finally {
        this.loading = false;
      }
    },
    async updateProfile(payload) {
      this.loading = true;
      this.error = null;
      try {
        const data = await profileAPI.updateProfile(payload);
        // Support either { data: {...} } or direct user object
        const raw = data?.user ?? data?.data ?? data;
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: buildProfilePictureUrlFromUser(raw),
        };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to update profile";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async changePassword(payload) {
      this.loading = true;
      this.error = null;
      try {
        await profileAPI.changePassword(payload);
      } catch (error) {
        this.error =
          error.response?.data?.message || "Failed to change password";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
