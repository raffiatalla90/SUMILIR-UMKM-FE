import api from "@/libs/axios";

export async function getSegmentations() {
  const data = await api.get("/api/segmentations");
  return data;
}
