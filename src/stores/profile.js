import { defineStore } from "pinia";
import profileAPI from "@/services/api/profile";

/**
 * Helper untuk membangun URL gambar profil yang lengkap.
 * @param {string|null} path - Path relatif dari API (e.g., "profile_pictures/file.jpg")
 * @returns {string} URL lengkap atau string kosong.
 */
function buildProfilePictureUrl(path) {
  if (!path) return "";
  const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(
    /\/api$/,
    "/storage"
  );
  return `${storageBaseUrl}/${path}`;
}

export const useProfileStore = defineStore("profile", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
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
        const picturePath =
          raw?.profile_picture_path ??
          raw?.profile_picture ??
          raw?.avatar ??
          null;
        // Normalize common field names so views/forms can rely on the same keys
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: buildProfilePictureUrl(picturePath),
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
        const raw = data?.data ?? data;
        const picturePath =
          raw?.profile_picture_path ??
          raw?.profile_picture ??
          raw?.avatar ??
          null;
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: buildProfilePictureUrl(picturePath),
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
