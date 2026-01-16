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

function addQueryParam(url, key, value) {
  if (!url) return url;
  const k = encodeURIComponent(String(key));
  const v = encodeURIComponent(String(value));

  // Replace existing key if present
  const re = new RegExp(`([?&])${k}=[^&]*`);
  if (re.test(url)) return url.replace(re, `$1${k}=${v}`);

  return url.includes("?") ? `${url}&${k}=${v}` : `${url}?${k}=${v}`;
}

function withProfilePictureCacheBuster(url, user) {
  if (!url) return url;
  // Streaming endpoint URL does not change when the underlying file changes, and it's cached aggressively.
  const isStreaming = String(url).includes("/profile-pictures/");
  if (!isStreaming) return url;

  // Use a deterministic version so the URL only changes when profile changes.
  const version =
    user?.profile_picture_path || user?.updated_at || user?.id || Date.now();
  return addQueryParam(url, "v", version);
}

function buildProfilePictureUrlFromUser(user) {
  if (!user) return "";

  // If backend explicitly returns null/empty, treat it as "no photo" so UI can show DefaultPP.
  // (We only use the streaming endpoint when the field is missing/undefined, not explicitly null.)
  if (user.profile_picture === null) return "";
  if (typeof user.profile_picture === "string" && !user.profile_picture.trim())
    return "";

  // 1) Prefer backend-provided computed URL (signed route)
  if (user.profile_picture)
    return withProfilePictureCacheBuster(
      buildProfilePictureUrl(user.profile_picture),
      user
    );

  // 2) Fallback: raw storage path (some APIs return path fields instead)
  const picturePath = user.profile_picture_path ?? user.avatar ?? null;
  if (picturePath) return buildProfilePictureUrl(picturePath);

  // 3) If the API doesn't include any field at all (undefined), try the streaming endpoint.
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (user.profile_picture === undefined && user.id && apiBase) {
    // Use dash route; backend also provides underscore alias.
    return withProfilePictureCacheBuster(
      `${apiBase}/profile-pictures/${user.id}`,
      user
    );
  }

  return "";
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
        let normalizedProfilePicture = buildProfilePictureUrlFromUser(raw);
        // If the result is falsy (null, empty, etc), set to empty string so ProfileView.vue fallback works
        if (!normalizedProfilePicture || normalizedProfilePicture === "null") {
          normalizedProfilePicture = "";
        }
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: normalizedProfilePicture,
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
        let normalizedProfilePicture = buildProfilePictureUrlFromUser(raw);
        if (!normalizedProfilePicture || normalizedProfilePicture === "null") {
          normalizedProfilePicture = "";
        }
        this.user = {
          ...raw,
          full_address: raw?.full_address ?? raw?.address ?? "",
          profile_picture: normalizedProfilePicture,
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
