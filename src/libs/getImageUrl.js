export const getImageUrl = (imageId) => {
  if (!imageId) return "";
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  // gunakan encodeURIComponent untuk safety, meskipun id biasanya angka
  return `${baseURL}/api/images/${encodeURIComponent(imageId)}`;
};