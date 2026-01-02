export const getImageUrl = (imageId) => {
  if (!imageId) return "";
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  // gunakan encodeURIComponent untuk safety, meskipun id biasanya angka
  return `${baseURL}/api/images/${encodeURIComponent(imageId)}`;
}

export const getImageUrlJasa = (imageIdOrPath) => {
  if (!imageIdOrPath) return "";

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  // Remove trailing /api if present (e.g. http://localhost:8000/api)
  const backendBase = apiBase.replace(/\/api\/?$/, "");

  if (typeof imageIdOrPath === "string") {
    let path = imageIdOrPath.trim();

    // Full URL already
    if (path.startsWith("http")) {
      return path;
    }

    // Normalisasi backslash ke slash
    path = path.replace(/\\/g, "/");

    // Jika sudah bentuk /storage/...
    if (path.startsWith("/storage/")) {
      return `${backendBase}${path}`;
    }
    if (path.startsWith("storage/")) {
      return `${backendBase}/${path}`;
    }

    // Jika path mulai dengan /jasa/... → arahkan ke /storage/jasa/...
    if (path.startsWith("/jasa/")) {
      return `${backendBase}/storage${path}`;
    }

    // Jika path mulai dengan jasa/... → arahkan ke /storage/jasa/...
    if (path.startsWith("jasa/")) {
      return `${backendBase}/storage/${path}`;
    }

    // Jika hanya nama file (mengandung ekstensi gambar), simpan di /storage/jasa/
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path)) {
      return `${backendBase}/storage/jasa/${path}`;
    }
  }

  // Fallback: anggap sebagai ID ke route /images/{id}
  return `${backendBase}/images/${encodeURIComponent(imageIdOrPath)}`;
};
