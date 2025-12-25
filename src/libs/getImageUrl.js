export const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  return `${baseURL}/storage/${path.replace(/^public\//, "")}`;
};