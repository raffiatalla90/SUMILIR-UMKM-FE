import { ref } from "vue";
import api from "@/libs/axios";
import * as voucherApi from "@/services/api/voucher";
import { useToast } from "vue-toastification";

export function useVouchers() {
  const isDev = import.meta.env.DEV;
  const toast = useToast();
  const loading = ref(false);
  const loadingDetail = ref(false);
  const vouchers = ref([]);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  /**
   * Fetch all vouchers (admin only)
   */
  const fetchVouchers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/api/admin/vouchers", { params });

      const data = response.data;

      // Handle different response structures
      if (data.data) {
        vouchers.value = data.data;
        if (data.meta) {
          pagination.value = data.meta;
        } else if (data.pagination) {
          pagination.value = data.pagination;
        }
      } else if (Array.isArray(data)) {
        vouchers.value = data;
      } else {
        vouchers.value = [];
      }

      console.log("[useVouchers] Fetched:", vouchers.value.length, "vouchers");
      return vouchers.value;
    } catch (error) {
      console.error("[useVouchers] Fetch failed:", error);
      const message =
        error.response?.data?.message || "Gagal memuat data voucher";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch single voucher detail
   */
  const fetchVoucherDetail = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/api/admin/vouchers/${id}`);
      const voucher = response.data.data || response.data;
      console.log("[useVouchers] Voucher detail:", voucher);
      return voucher;
    } catch (error) {
      console.error("[useVouchers] Fetch detail failed:", error);
      const message =
        error.response?.data?.message || "Gagal memuat detail voucher";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete voucher (admin only)
   */
  const deleteVoucher = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/api/admin/vouchers/${id}`);
      toast.success("Voucher berhasil dihapus");
      console.log("[useVouchers] Deleted voucher:", id);
    } catch (error) {
      console.error("[useVouchers] Delete failed:", error);
      const message =
        error.response?.data?.message || "Gagal menghapus voucher";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /* =====================================================
   * Merchant VOUCHERS
   * ===================================================== */

  const fetchMerchantVouchers = async (id, params = {}) => {
    if (!id) {
      toast.error("Merchant ID diperlukan untuk memuat voucher");
      throw new Error("Merchant ID is required to fetch vouchers");
    }

    loading.value = true;
    try {
      const res = await voucherApi.getMerchantVouchers(id, params);
      vouchers.value = res.data || [];
      pagination.value = res.meta || pagination.value;
      if (isDev) {
        console.log(
          "[useVouchers] Fetched merchant vouchers:",
          vouchers.value.length
        );
      }
      return vouchers.value;
    } catch (error) {
      if (isDev) {
        console.error("[useVouchers] Fetch merchant vouchers failed:", error);
      }
      const message =
        error.response?.data?.message || "Gagal memuat voucher merchant";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchMerchantVoucherDetail = async (merchantId, voucherId) => {
    if (!merchantId || !voucherId) {
      toast.error("ID Merchant dan Voucher diperlukan untuk memuat detail");
      throw new Error("Merchant ID and Voucher ID are required");
    }
    if (loadingDetail.value) return;
    loadingDetail.value = true;
    try {
      const voucher = await voucherApi.getMerchantVoucherDetail(
        merchantId,
        voucherId
      );
      if (isDev) {
        console.log("[useVouchers] Fetched merchant voucher detail:", voucher);
      }
      return voucher;
    } catch (error) {
      if (isDev) {
        console.error(
          "[useVouchers] Fetch merchant voucher detail failed:",
          error
        );
      }
      const message =
        error.response?.data?.message || "Gagal memuat detail voucher";
      toast.error(message);
      throw error;
    } finally {
      loadingDetail.value = false;
    }
  };

  const createMerchantVoucher = async (merchantId, payload) => {
    try {
      const voucher = await voucherApi.createMerchantVoucher(
        merchantId,
        payload
      );
      toast.success("Voucher berhasil dibuat");
      if (isDev) {
        console.log("[useVouchers] Created merchant voucher:", voucher);
      }
      return voucher;
    } catch (error) {
      if (isDev) {
        console.error("[useVouchers] Create merchant voucher failed:", error);
      }
      const message = error.response?.data?.message || "Gagal membuat voucher";
      toast.error(message);
      throw error;
    }
  };

  const editMerchantVoucher = async (merchantId, voucherId, payload) => {
    try {
      const voucher = await voucherApi.editMerchantVoucher(
        merchantId,
        voucherId,
        payload
      );
      toast.success("Voucher berhasil diperbarui");
      if (isDev) {
        console.log("[useVouchers] Edited merchant voucher:", voucher);
      }
      return voucher;
    } catch (error) {
      if (isDev) {
        console.error("[useVouchers] Edit merchant voucher failed:", error);
      }
      const message =
        error.response?.data?.message || "Gagal memperbarui voucher";
      toast.error(message);
      throw error;
    }
  };

  const editMerchantVoucherStatus = async (merchantId, voucherId, status) => {
    loading.value = true;
    try {
      const voucher = await voucherApi.editStatus(
        merchantId,
        voucherId,
        status
      );
      toast.success("Status voucher berhasil diperbarui");
      if (isDev) {
        console.log(
          "[useVouchers] Edited merchant voucher status:",
          voucherId,
          status
        );
      }
      return voucher;
    } catch (error) {
      if (isDev) {
        console.error(
          "[useVouchers] Edit merchant voucher status failed:",
          error
        );
      }
      const message =
        error.response?.data?.message || "Gagal memperbarui status voucher";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteMerchantVoucher = async (merchantId, voucherId) => {
    try {
      await voucherApi.deleteMerchantVoucher(merchantId, voucherId);
      toast.success("Voucher berhasil dihapus");
      if (isDev) {
        console.log(
          "[useVouchers] Deleted merchant voucher:",
          merchantId,
          voucherId
        );
      }
    } catch (error) {
      if (isDev) {
        console.error("[useVouchers] Delete merchant voucher failed:", error);
      }
      const message =
        error.response?.data?.message || "Gagal menghapus voucher";
      toast.error(message);
      throw error;
    }
  };

  const bulkDeleteMerchantVoucher = async (merchantId, voucherIds = []) => {
    loading.value = true;
    try {
      await voucherApi.bulkDeleteMerchantVoucher(merchantId, voucherIds);
      if (isDev) {
        console.log(
          "[useVouchers] Bulk deleted merchant vouchers:",
          merchantId,
          voucherIds
        );
      }
    } catch (error) {
      if (isDev) {
        console.error(
          "[useVouchers] Bulk delete merchant vouchers failed:",
          error
        );
      }
      const message =
        error.response?.data?.message ||
        "Gagal menghapus voucher secara massal";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const editBulkStatus = async (merchantId, voucherIds = [], status) => {
    loading.value = true;
    try {
      await voucherApi.editBulkStatus(merchantId, voucherIds, status);
      if (isDev) {
        console.log(
          "[useVouchers] Bulk edited merchant voucher statuses:",
          merchantId,
          voucherIds,
          status
        );
      }
    } catch (error) {
      if (isDev) {
        console.error(
          "[useVouchers] Bulk edit merchant voucher statuses failed:",
          error
        );
      }
      const message =
        error.response?.data?.message ||
        "Gagal memperbarui status voucher secara massal";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /* =====================================================
   * Customer VOUCHERS
   * ===================================================== */
  const fetchVouchersByMerchant = async (merchantId) => {
    loading.value = true;
    try {
      const res = await voucherApi.getVouchersByMerchant(merchantId);
      vouchers.value = res.data || [];
      if (isDev) {
        console.log(
          "[useVouchers] Fetched customer vouchers by merchant:",
          vouchers.value.length
        );
      }
      return vouchers.value;
    } catch (error) {
      if (isDev) {
        console.error(
          "[useVouchers] Fetch customer vouchers by merchant failed:",
          error
        );
      }
      const message =
        error.response?.data?.message ||
        "Gagal memuat voucher UMKM untuk pelanggan";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const activateVoucher = async (id) => {
    try {
      loading.value = true;
      const response = await api.post(`/api/admin/vouchers/${id}/activate`);
      toast.success(response.data.message || "Voucher berhasil diaktifkan");
      return response.data;
    } catch (error) {
      console.error("Failed to activate voucher:", error);
      toast.error(error.response?.data?.message || "Gagal mengaktifkan voucher");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deactivateVoucher = async (id) => {
    try {
      loading.value = true;
      const response = await api.post(`/api/admin/vouchers/${id}/deactivate`);
      toast.success(response.data.message || "Voucher berhasil dinonaktifkan");
      return response.data;
    } catch (error) {
      console.error("Failed to deactivate voucher:", error);
      toast.error(error.response?.data?.message || "Gagal menonaktifkan voucher");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    vouchers,
    loading,
    loadingDetail,
    pagination,
    fetchVouchers,
    fetchVoucherDetail,
    deleteVoucher,
    fetchMerchantVouchers,
    fetchMerchantVoucherDetail,
    createMerchantVoucher,
    editMerchantVoucher,
    deleteMerchantVoucher,
    editMerchantVoucherStatus,
    bulkDeleteMerchantVoucher,
    editBulkStatus,
    fetchVouchersByMerchant,
    activateVoucher,
    deactivateVoucher,
  };
}
