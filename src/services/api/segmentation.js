import api from "@/libs/axios";

export async function getSegmentations() {
  const res = await api.get("/api/segmentations");
  const payload = res?.data;

  // API bisa mengembalikan array langsung atau dibungkus (mis. { data: [...] })
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}
