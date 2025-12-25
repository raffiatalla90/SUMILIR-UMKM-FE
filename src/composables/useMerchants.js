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

  // Fetch merchants (admin view)
  const fetchMerchants = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/api/admin/merchants", { params });

      if (response.data.data) {
        merchants.value = response.data.data;
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        };
      }

      return merchants.value;
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
      const response = await api.get(`/api/admin/merchants/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("[useMerchants] Detail fetch failed:", error);
      toast.error("Gagal memuat detail merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Approve merchant
  const approveMerchant = async (id) => {
    loading.value = true;
    try {
      await api.patch(`/api/admin/merchants/${id}/approve`);
      toast.success("Merchant berhasil di-approve!");
    } catch (error) {
      console.error("[useMerchants] Approve failed:", error);
      toast.error(error.response?.data?.message || "Gagal approve merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Reject merchant
  const rejectMerchant = async (id, reason) => {
    loading.value = true;
    try {
      await api.patch(`/api/admin/merchants/${id}/reject`, {
        rejection_reason: reason,
      });
      toast.success("Merchant berhasil ditolak!");
    } catch (error) {
      console.error("[useMerchants] Reject failed:", error);
      toast.error(error.response?.data?.message || "Gagal reject merchant");
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