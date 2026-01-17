import { ref } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export function useMerchantEvents() {
  const toast = useToast();

  const events = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchMerchantEvents = async (merchantId, params = {}) => {
    if (!merchantId) return [];

    loading.value = true;
    try {
      const response = await api.get("/api/events", {
        params: {
          merchant_id: merchantId,
          ...params,
        },
      });

      const data = response.data;
      events.value = data?.data || [];
      pagination.value = {
        current_page: data?.current_page ?? 1,
        last_page: data?.last_page ?? 1,
        per_page: data?.per_page ?? params?.per_page ?? 10,
        total: data?.total ?? 0,
        from: data?.from ?? 0,
        to: data?.to ?? 0,
      };

      return events.value;
    } catch (error) {
      const message =
        error.response?.data?.message || "Gagal memuat undangan event";
      toast.error(message);
      events.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const respondToInvitation = async ({ merchantId, eventId, status }) => {
    if (!merchantId || !eventId || !status) return;

    loading.value = true;
    try {
      await api.post(`/api/events/${eventId}`, {
        merchant_id: merchantId,
        status,
      });

      toast.success(
        status === "accepted" ? "Undangan diterima" : "Undangan ditolak"
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Gagal merespon undangan";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    events,
    loading,
    pagination,
    fetchMerchantEvents,
    respondToInvitation,
  };
}
