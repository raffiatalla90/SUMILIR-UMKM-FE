import { ref } from "vue";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";

export function useEvents() {
  const events = ref([]);
  const loading = ref(false);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const toast = useToast();

  const fetchEvents = async (params = {}, isAdmin = false) => {
    loading.value = true;
    try {
      const endpoint = isAdmin ? "/admin/events" : "/events";

      const response = await api.get(endpoint, { params });

      if (response.data.data) {
        events.value = response.data.data;
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        };
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        events.value = response.data;
      } else {
        events.value = [];
      }

      return events.value;
    } catch (error) {
      const message = error.response?.data?.message || "Gagal memuat data events";
      toast.error(message);

      events.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Fetch event detail
  const fetchEventDetail = async (id) => {
    loading.value = true;
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      toast.error("Gagal memuat detail event");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Create event (Admin)
  const createEvent = async (formData) => {
    loading.value = true;
    try {
      const response = await api.post("/admin/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Event berhasil dibuat!");
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Gagal membuat event";
      toast.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Update event (Admin)
  const updateEvent = async (id, formData) => {
    loading.value = true;
    try {
      const response = await api.post(`/admin/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Event berhasil diupdate!");
      return response.data.data;
    } catch (error) {
      toast.error("Gagal mengupdate event");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Delete event (Admin)
  const deleteEvent = async (id) => {
    loading.value = true;
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success("Event berhasil dihapus!");
    } catch (error) {
      console.error("[useEvents] Delete failed:", error);
      toast.error("Gagal menghapus event");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Invite merchants to event (Admin)
  const inviteMerchants = async (eventId, merchantIds) => {
    loading.value = true;
    try {
      await api.post(`/admin/events/${eventId}/invite-merchants`, {
        merchant_ids: merchantIds,
      });
      toast.success("Merchant berhasil diundang!");
    } catch (error) {
      toast.error("Gagal mengundang merchant");
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    events,
    loading,
    pagination,
    fetchEvents,
    fetchEventDetail,
    createEvent,
    updateEvent,
    deleteEvent,
    inviteMerchants,
  };
}