const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getImageUrl = (imageId) => {
  if (!imageId) return "";
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  return `${baseURL}/api/images/${encodeURIComponent(imageId)}`;
};

export const getImageUrlJasa = (imageIdOrPath) => {
  if (!imageIdOrPath) return "";

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const backendBase = apiBase.replace(/\/api\/?$/, "");

  if (typeof imageIdOrPath === "string") {
    let path = imageIdOrPath.trim();

    if (path.startsWith("http")) {
      return path;
    }

    path = path.replace(/\\/g, "/");

    if (path.startsWith("/storage/")) {
      return `${backendBase}${path}`;
    }
    if (path.startsWith("storage/")) {
      return `${backendBase}/${path}`;
    }

    if (path.startsWith("/jasa/")) {
      return `${backendBase}/storage${path}`;
    }

    if (path.startsWith("jasa/")) {
      return `${backendBase}/storage/${path}`;
    }

    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)) {
      return `${backendBase}/storage/jasa/${path}`;
    }
  }

  return `${backendBase}/images/${encodeURIComponent(imageIdOrPath)}`;
};

/**
 * Get event banner URL via streaming API
 * @param {Object} event - Event object with id
 * @returns {string} Event banner URL
 */
export function getEventBannerUrl(event) {
  if (!event?.id || !event?.banner_img_path) {
    return null;
  }

  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // ✅ Cache-busting with updated_at timestamp
  const timestamp = event.updated_at
    ? new Date(event.updated_at).getTime()
    : Date.now();

  return `${apiUrl}/api/event-banners/${event.id}?t=${timestamp}`;
}

/**
 * Get merchant logo URL via streaming API
 * Konsisten dengan event banner dan user profile picture
 */
export function getMerchantLogoUrl(merchant) {
  if (!merchant?.id) {
    return '/placeholder.png';
  }

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const timestamp = merchant.updated_at
    ? new Date(merchant.updated_at).getTime()
    : Date.now();

  return `${apiUrl}/api/merchant-logo/${merchant.id}?t=${timestamp}`;
}

/**
 * Get user profile picture URL via streaming API
 * Konsisten dengan event banner dan merchant logo
 */
export function getUserProfileUrl(user) {
  if (!user?.id) {
    console.warn('getUserProfileUrl: user.id is missing', user);
    return '/placeholder.png';
  }

  if (!user?.profile_picture_path) {
    console.warn('getUserProfileUrl: user.profile_picture_path is missing', user);
    return '/placeholder.png';
  }

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // ✅ Cache-busting with updated_at timestamp
  const timestamp = user.updated_at
    ? new Date(user.updated_at).getTime()
    : Date.now();

  return `${apiUrl}/api/user-profile/${user.id}?t=${timestamp}`;
export function getMerchantBannerUrl(merchant) {
  if (!merchant?.id) return "/placeholder.png";
  return `${API_BASE_URL}/api/merchant-banner/${merchant.id}`;
}
