const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getImageUrl = (imageId) => {
  if (!imageId) return "";
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  return `${baseURL}/api/images/${encodeURIComponent(imageId)}`;
}

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
 * Konsisten dengan profile picture dan merchant logo
 */
export const getEventBannerUrl = (event) => {
  if (!event?.value) {
    event = { value: event };
  }

  const eventData = event.value || event;

  if (!eventData?.id || !eventData?.banner_img_path) {
    return '/placeholder.png';
  }

  // Use API endpoint to stream image
  return `${API_BASE_URL}/api/event-banners/${eventData.id}`;
}

/**
 * Get merchant logo URL
 */
export function getMerchantLogoUrl(merchant) {
  if (!merchant?.id) return '/placeholder.png';
  return `${API_BASE_URL}/api/merchant-profile-pictures/${merchant.id}`;
}

/**
 * Get merchant banner URL
 */
export function getMerchantBannerUrl(merchant) {
  if (!merchant?.id) return '/placeholder.png';
  return `${API_BASE_URL}/api/merchant-banner/${merchant.id}`;
}
