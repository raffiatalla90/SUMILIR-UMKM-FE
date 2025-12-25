import { ref } from 'vue';
import api from '@/libs/axios';
import { useToast } from 'vue-toastification';

export function useVouchers() {
  const toast = useToast();
  const loading = ref(false);
  const vouchers = ref([]);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  /**
   * Fetch all vouchers (admin only)
   */
  const fetchVouchers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get('/api/admin/vouchers', { params });
      
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

      console.log('[useVouchers] Fetched:', vouchers.value.length, 'vouchers');
      return vouchers.value;
    } catch (error) {
      console.error('[useVouchers] Fetch failed:', error);
      const message = error.response?.data?.message || 'Gagal memuat data voucher';
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
      console.log('[useVouchers] Voucher detail:', voucher);
      return voucher;
    } catch (error) {
      console.error('[useVouchers] Fetch detail failed:', error);
      const message = error.response?.data?.message || 'Gagal memuat detail voucher';
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
      toast.success('Voucher berhasil dihapus');
      console.log('[useVouchers] Deleted voucher:', id);
    } catch (error) {
      console.error('[useVouchers] Delete failed:', error);
      const message = error.response?.data?.message || 'Gagal menghapus voucher';
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    vouchers,
    loading,
    pagination,
    fetchVouchers,
    fetchVoucherDetail,
    deleteVoucher,
  };
}