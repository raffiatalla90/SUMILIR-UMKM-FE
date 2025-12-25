import api from "@/libs/axios";

export async function getCategories(params = {}) {
  const { data } = await api.get("/api/categories", { params });
  return data;
}
