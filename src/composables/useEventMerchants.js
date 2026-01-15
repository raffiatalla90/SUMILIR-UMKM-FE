import { ref } from "vue";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";

export function useEventMerchants() {
  const loading = ref(false);
  const toast = useToast();

  const removeMerchantFromEvent = async (eventId, merchantId, reason) => {
    loading.value = true;
    try {
      await api.delete(`/api/admin/events/${eventId}/merchants/${merchantId}`, {
        data: { removal_reason: reason },
      });
      toast.success("Merchant berhasil dikeluarkan dari event");
    } catch (error) {
      console.error("[useEventMerchants] Remove failed:", error);
      toast.error("Gagal mengeluarkan merchant dari event");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const restoreMerchantToEvent = async (eventId, merchantId) => {
    loading.value = true;
    try {
      await api.post(`/api/admin/events/${eventId}/merchants/${merchantId}/restore`);
      toast.success("Merchant berhasil dikembalikan ke event");
    } catch (error) {
      console.error("[useEventMerchants] Restore failed:", error);
      toast.error("Gagal mengembalikan merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchRemovedMerchants = async (eventId) => {
    loading.value = true;
    try {
      const response = await api.get(`/api/admin/events/${eventId}/merchants/removed`);
      return response.data.data || [];
    } catch (error) {
      console.error("[useEventMerchants] Fetch removed failed:", error);
      toast.error("Gagal memuat riwayat merchant yang dikeluarkan");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    removeMerchantFromEvent,
    restoreMerchantToEvent,
    fetchRemovedMerchants,
  };
}