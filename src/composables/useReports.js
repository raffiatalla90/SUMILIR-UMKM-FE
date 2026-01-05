import { ref } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export function useReports() {
  const reports = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const toast = useToast();

  // Fetch reports (Admin)
  const fetchReports = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get("/api/admin/reports", { params });

      if (response.data.data) {
        reports.value = response.data.data;
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        };
      }
    } catch (error) {
      console.error("[useReports] Fetch failed:", error);
      toast.error("Gagal memuat data laporan");
    } finally {
      loading.value = false;
    }
  };

  // Fetch report detail
  const fetchReportDetail = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/api/admin/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("[useReports] Detail fetch failed:", error);
      toast.error("Gagal memuat detail laporan");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Review report (Admin)
  const reviewReport = async (id, data) => {
    loading.value = true;
    try {
      await api.patch(`/api/admin/reports/${id}/review`, data);
      toast.success("Laporan berhasil direview!");
    } catch (error) {
      console.error("[useReports] Review failed:", error);
      toast.error("Gagal mereview laporan");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    reports,
    loading,
    pagination,
    fetchReports,
    fetchReportDetail,
    reviewReport,
  };
}