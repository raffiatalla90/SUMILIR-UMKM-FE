import { ref } from "vue";
import api from "@/libs/axios";

export function useJasa() {
  const jasas = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  let lastRequestParams = null;
  let pendingRequest = null;

  const fetchJasas = async ({
    merchantId,
    searchQuery = "",
    status = "",
    category = "",
    minPrice = null,
    maxPrice = null,
    minStock = null,
    maxStock = null,
    sortBy = "newest",
    perPage = 15,
    page = 1,
  } = {}) => {
    // merchantId is optional for owner endpoint; keep compatibility
    const requestSignature = JSON.stringify({
      merchantId,
      searchQuery,
      status,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy,
      perPage,
      page,
    });

    if (loading.value && lastRequestParams === requestSignature) {
      return pendingRequest;
    }

    if (lastRequestParams === requestSignature && !loading.value) {
      return { data: jasas.value, meta: pagination.value };
    }

    lastRequestParams = requestSignature;
    loading.value = true;

    const params = {
      merchantId: merchantId || undefined,
      q: searchQuery || undefined,
      status: status || undefined,
      category_id: category || undefined,
      min_price: minPrice ?? undefined,
      max_price: maxPrice ?? undefined,
      min_stock: minStock ?? undefined,
      max_stock: maxStock ?? undefined,
      sort_by: sortBy || "newest",
      per_page: perPage,
      page,
    };

    Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

    try {
      // Owner listing endpoint
      pendingRequest = api.get("/jasas/owner", { params });
      const { data } = await pendingRequest;

      jasas.value = data.data || [];

      if (data.meta) {
        pagination.value = {
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          per_page: data.meta.per_page,
          total: data.meta.total,
        };
      }

      return data;
    } catch (err) {
      lastRequestParams = null;
      throw err;
    } finally {
      loading.value = false;
      pendingRequest = null;
    }
  };

  const fetchJasaDetail = async (id) => {
    try {
      const { data } = await api.get(`/jasas/${id}`);
      const payload = data.data ?? data;
      if (payload.addon_groups) payload.addonGroups = payload.addon_groups;
      if (!Array.isArray(payload.images)) payload.images = payload.images ? [payload.images] : [];
      return payload;
    } catch (err) {
      throw err;
    }
  };

  const deleteJasa = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/jasas/${id}`);
      jasas.value = jasas.value.filter((j) => j.id !== id);
      pagination.value.total = Math.max(0, (pagination.value.total || 0) - 1);
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateJasaStatus = async (id, status) => {
    loading.value = true;
    try {
      const { data } = await api.put(`/jasas/${id}`, { status });
      const idx = jasas.value.findIndex((j) => j.id === id);
      if (idx !== -1) jasas.value[idx].status = status;
      return data;
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteJasas = async (ids = []) => {
    loading.value = true;
    try {
      for (const id of ids) {
        await api.delete(`/jasas/${id}`);
      }
      jasas.value = jasas.value.filter((j) => !ids.includes(j.id));
      pagination.value.total = Math.max(0, (pagination.value.total || 0) - ids.length);
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkUpdateStatus = async (ids = [], status) => {
    loading.value = true;
    try {
      for (const id of ids) {
        await api.put(`/jasas/${id}`, { status });
      }
      jasas.value.forEach((j) => {
        if (ids.includes(j.id)) j.status = status;
      });
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    jasas,
    loading,
    pagination,
    fetchJasas,
    fetchJasaDetail,
    deleteJasa,
    updateJasaStatus,
    bulkDeleteJasas,
    bulkUpdateStatus,
  };
}
