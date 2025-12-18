export const getImageUrl = (imageIdOrPath) => {
  if (!imageIdOrPath) return "";

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  // Remove trailing /api if present (e.g. http://localhost:8000/api)
  const backendBase = apiBase.replace(/\/api\/?$/, "");

  if (typeof imageIdOrPath === "string") {
    // Full URL already
    if (imageIdOrPath.startsWith("http")) {
      return imageIdOrPath;
    }

    // Storage path from Laravel (e.g. /storage/jasas/xxx.jpg)
    if (imageIdOrPath.startsWith("/storage")) {
      return `${backendBase}${imageIdOrPath}`;
    }
  }

  // Otherwise treat as ID and construct the URL under backend host
  return `${backendBase}/images/${encodeURIComponent(imageIdOrPath)}`;
};