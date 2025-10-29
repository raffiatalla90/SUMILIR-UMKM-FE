import api from "@/libs/axios";

export async function getSegmentations(params = {}) {
  const { data } = await api.get("/segmentations", { params });
  return data;
}
