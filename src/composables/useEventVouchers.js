import { ref } from "vue";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";

export function useEventVouchers() {
  const loading = ref(false);
  const availableVouchers = ref([]);
  const toast = useToast();

  /**
   * Fetch available vouchers (not attached to any event)
   */
  const fetchAvailableVouchers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/api/admin/events/vouchers/available", {
        params,
      });
      
      availableVouchers.value = response.data.data || [];
      
      console.log('[useEventVouchers] Fetched available vouchers:', {
        count: availableVouchers.value.length,
      });
      
      return availableVouchers.value;
    } catch (error) {
      console.error("[useEventVouchers] Fetch available vouchers failed:", error);
      const message = error.response?.data?.message || "Gagal memuat daftar voucher";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Attach multiple vouchers to event
   */
  const attachVouchersToEvent = async (eventId, voucherIds) => {
    loading.value = true;
    try {
      const response = await api.post(`/api/admin/events/${eventId}/vouchers/attach`, {
        voucher_ids: voucherIds, 
      });
      
      const attachedCount = response.data.attached_count || 0;
      const errors = response.data.errors || [];
      
      if (attachedCount > 0) {
        toast.success(response.data.message);
      }
      
      if (errors.length > 0) {
        errors.forEach(error => toast.warning(error));
      }
      
      return response.data;
    } catch (error) {
      console.error("[useEventVouchers] Attach vouchers failed:", error);
      const message = error.response?.data?.message || "Gagal menambahkan voucher ke event";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Detach voucher from event
   */
  const detachVoucherFromEvent = async (eventId, voucherId) => {
    loading.value = true;
    try {
      await api.delete(`/api/admin/events/${eventId}/vouchers/${voucherId}`);
      toast.success("Voucher berhasil dilepas dari event");
    } catch (error) {
      console.error("[useEventVouchers] Detach voucher failed:", error);
      toast.error("Gagal melepas voucher dari event");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    availableVouchers,
    fetchAvailableVouchers,
    attachVouchersToEvent,
    detachVoucherFromEvent,
  };
}