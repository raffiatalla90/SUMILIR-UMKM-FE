import api from "@/libs/axios";

export async function getProvinces(params = {}) {
  const { data } = await api.get("/locations/provinces", { params });
  return data;
}

export async function getCities(provinceId, params = {}) {
  const { data } = await api.get(`/locations/cities/${provinceId}`, { params });
  return data;
}

export async function getDistricts(cityId, params = {}) {
  const { data } = await api.get(`/locations/districts/${cityId}`, { params });
  return data;
}

export async function getVillages(districtId, params = {}) {
  const { data } = await api.get(`/locations/villages/${districtId}`, {
    params,
  });
  return data;
}
