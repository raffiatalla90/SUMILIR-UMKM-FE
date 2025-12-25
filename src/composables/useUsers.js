import { ref } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export function useUsers() {
  const toast = useToast();
  const users = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Fetch users (with merchants)
  const fetchUsers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/admin/users", { params });

      users.value = response.data.data || [];
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      };
    } catch (error) {
      console.error("[useUsers] Fetch failed:", error);
      toast.error(error.response?.data?.message || "Gagal memuat data users");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Fetch user detail
  const fetchUserDetail = async (userId) => {
    loading.value = true;
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("[useUsers] Fetch detail failed:", error);
      toast.error("Gagal memuat detail user");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Approve merchant (nested in users)
  const approveMerchant = async (merchantId) => {
    loading.value = true;
    try {
      await api.patch(`/admin/merchants/${merchantId}/approve`);
      toast.success("Merchant berhasil di-approve");
    } catch (error) {
      console.error("[useUsers] Approve failed:", error);
      toast.error(error.response?.data?.message || "Gagal approve merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Reject merchant
  const rejectMerchant = async (merchantId, reason) => {
    loading.value = true;
    try {
      await api.patch(`/admin/users/merchants/${merchantId}/reject`, {
        rejection_reason: reason,
      });
      toast.success("Merchant berhasil ditolak");
    } catch (error) {
      console.error("[useUsers] Reject failed:", error);
      toast.error(error.response?.data?.message || "Gagal reject merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // ========== NEW METHODS FOR USER MANAGEMENT ==========

  // Warn user
  const warnUser = async (userId, reason) => {
    loading.value = true;
    try {
      await api.post(`/admin/users/${userId}/warn`, { reason });
      toast.success("Warning sent successfully");
    } catch (error) {
      console.error("[useUsers] Warn failed:", error);
      toast.error(error.response?.data?.message || "Failed to send warning");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Suspend user
  const suspendUser = async (userId, reason) => {
    loading.value = true;
    try {
      await api.post(`/admin/users/${userId}/suspend`, { reason });
      toast.success("User suspended successfully");
    } catch (error) {
      console.error("[useUsers] Suspend failed:", error);
      toast.error(error.response?.data?.message || "Failed to suspend user");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Unsuspend user
  const unsuspendUser = async (userId) => {
    loading.value = true;
    try {
      await api.post(`/admin/users/${userId}/unsuspend`);
      toast.success("User unsuspended successfully");
    } catch (error) {
      console.error("[useUsers] Unsuspend failed:", error);
      toast.error(error.response?.data?.message || "Failed to unsuspend user");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Change user status
  const changeStatus = async (userId, status, reason = null) => {
    loading.value = true;
    try {
      await api.patch(`/admin/users/${userId}/status`, { status, reason });
      toast.success("User status changed successfully");
    } catch (error) {
      console.error("[useUsers] Change status failed:", error);
      toast.error(error.response?.data?.message || "Failed to change status");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Notify user
  const notifyUser = async (userId, type, message) => {
    loading.value = true;
    try {
      await api.post(`/admin/users/${userId}/notify`, { type, message });
      toast.success("Notification sent successfully");
    } catch (error) {
      console.error("[useUsers] Notify failed:", error);
      toast.error(error.response?.data?.message || "Failed to send notification");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Bulk update user status
  const bulkUpdateStatus = async (userIds, status, reason = null) => {
    loading.value = true;
    try {
      await api.post("/admin/users/bulk-status", {
        user_ids: userIds,
        status,
        reason,
      });
      toast.success(`${userIds.length} users updated successfully`);
    } catch (error) {
      console.error("[useUsers] Bulk update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update users");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    fetchUserDetail,
    approveMerchant,
    rejectMerchant,
    // New methods
    warnUser,
    suspendUser,
    unsuspendUser,
    changeStatus,
    notifyUser,
    bulkUpdateStatus,
  };
}