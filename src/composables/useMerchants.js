import { ref } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export function useMerchants() {
  const merchants = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const toast = useToast();

  // Fetch merchants (public or admin)
  const fetchMerchants = async (params = {}, isAdmin = true) => {
    loading.value = true;
    try {
      const endpoint = isAdmin ? "/admin/merchants" : "/public/merchants";
      const response = await api.get(endpoint, { params });

      if (response.data.data) {
        merchants.value = response.data.data;
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        };
      } else {
        merchants.value = Array.isArray(response.data) ? response.data : [];
      }
    } catch (error) {
      console.error("[useMerchants] Fetch failed:", error);
      toast.error("Gagal memuat data merchant");
      merchants.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Fetch merchant detail
  const fetchMerchantDetail = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/admin/merchants/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("[useMerchants] Detail fetch failed:", error);
      toast.error("Gagal memuat detail merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Approve merchant (Admin)
  const approveMerchant = async (id) => {
    loading.value = true;
    try {
      await api.patch(`/admin/merchants/${id}/approve`);
      toast.success("Merchant berhasil di-approve!");
    } catch (error) {
      console.error("[useMerchants] Approve failed:", error);
      const message =
        error.response?.data?.message || "Gagal approve merchant";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Reject merchant (Admin)
  const rejectMerchant = async (id, reason) => {
    loading.value = true;
    try {
      await api.patch(`/admin/merchants/${id}/reject`, {
        rejection_reason: reason,
      });
      toast.success("Merchant berhasil ditolak!");
    } catch (error) {
      console.error("[useMerchants] Reject failed:", error);
      const message =
        error.response?.data?.message || "Gagal reject merchant";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    merchants,
    loading,
    pagination,
    fetchMerchants,
    fetchMerchantDetail,
    approveMerchant,
    rejectMerchant,
  };
}