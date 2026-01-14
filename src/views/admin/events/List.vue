<script setup>
import { ref, computed, onMounted, watch, inject } from "vue"; 
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/libs/axios"; 
import AdminTable from "@/components/common/AdminTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import Button from "@/components/common/Button.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useEvents } from "@/composables/useEvents";
import { getEventBannerUrl } from "@/libs/getImageUrl";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
const route = useRoute();
const router = useRouter();
const toast = useToast();

const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(10);
const statusFilter = ref("");
const sortBy = ref("event_start_date");
const sortDesc = ref(true);

const showFilterModal = ref(false);
const showExportModal = ref(false);
const showDeleteModal = ref(false);
const exportLoading = ref(false);

const selectedEvent = ref(null);

const selectedEvents = ref([]); 
const selectAll = ref(false);

const activeFilters = ref({
  status: "",
});

const {
  events,
  loading,
  pagination,
  fetchEvents,
  deleteEvent,
} = useEvents();

const tableColumns = [
  { key: "banner_img_path", label: "Banner", sortable: false },
  { key: "event_name", label: "Event", sortable: true },
  { key: "event_start_date", label: "Periode", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

const paginationInfo = computed(() => ({
  start: (pagination.value?.current_page - 1) * (pagination.value?.per_page || 10) + 1,
  end: Math.min(
    (pagination.value?.current_page || 1) * (pagination.value?.per_page || 10),
    pagination.value?.total || 0
  ),
  total: pagination.value?.total || 0,
}));

const loadEvents = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    status: activeFilters.value.status || undefined,
    sort_by: sortBy.value,
    sort_desc: sortDesc.value ? 1 : 0,
  };
  await fetchEvents(params, true);
};

const goToDetail = (event) => {
  router.push({ name: "Admin - Event Detail", params: { id: event.id } });
};
const goToEdit = (event) => {
  router.push({ name: "Admin - Edit Event", params: { id: event.id } });
};
const goToCreate = () => {
  router.push({ name: "Admin - Create Event" });
};

const confirmDelete = (event) => {
  selectedEvent.value = event;
  showDeleteModal.value = true;
};

const handleSearch = () => {
  currentPage.value = 1;
  loadEvents();
};

const onStatusChange = () => {
  currentPage.value = 1;
  loadEvents();
};

function highlightText(text) {
  if (!searchQuery.value.trim() || !text) return text;
  const q = searchQuery.value.trim();
  const re = new RegExp(`(${q})`, "gi");
  return String(text).replace(
    re,
    '<span class="bg-merchant-primary/20 text-merchant-primary font-bold px-1 rounded">' +
      "$1" +
      "</span>"
  );
}

// Filter options
const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Draft" },
];

const handleDelete = async () => {
  try {
    await deleteEvent(selectedEvent.value.id);
    showDeleteModal.value = false;
    loadEvents();
  } catch (error) {
    toast.error("Gagal menghapus event");
  }
};

const toggleEventSelection = (eventId) => {
  const idx = selectedEvents.value.indexOf(eventId);
  if (idx > -1) selectedEvents.value.splice(idx, 1);
  else selectedEvents.value.push(eventId);
  selectAll.value = selectedEvents.value.length === events.value.length;
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedEvents.value = events.value.map((e) => e.id);
  } else {
    selectedEvents.value = [];
  }
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadEvents();
};
const nextPage = () => {
  if (currentPage.value < (pagination.value?.last_page || 1)) {
    currentPage.value++;
    loadEvents();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadEvents();
  }
};

watch([searchQuery, () => activeFilters.value.status], () => {
  currentPage.value = 1;
  loadEvents();
});

// Modal methods
const openExportModal = () => {
  console.log('openExportModal called in List.vue');
  showExportModal.value = true;
};

const closeExportModal = () => {
  showExportModal.value = false;
};

// ✅ Export PDF method
const exportPDF = async () => {
  console.log('exportPDF called'); // ✅ ADD debug log
  exportLoading.value = true;
  try {
    const response = await api.get("/api/admin/events/export-pdf", {
      responseType: "blob",
      params: {
        status: activeFilters.value.status,
        search: searchQuery.value,
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `events-report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Laporan events berhasil diunduh");
    closeExportModal();
  } catch (error) {
    console.error("Export PDF failed:", error);
    toast.error(error.response?.data?.message || "Gagal mengunduh laporan");
  } finally {
    exportLoading.value = false;
  }
};

// ✅ Inject the register function from parent
const registerExportModal = inject('registerExportModal', null);

// ✅ Expose openExportModal to parent via register callback
onMounted(() => {
  loadEvents();
  
  // Register the export modal function with parent
  if (registerExportModal && typeof registerExportModal === 'function') {
    console.log('Registering export modal callback for events list');
    registerExportModal(openExportModal);
  } else {
    console.warn('registerExportModal not provided by parent');
  }
});

</script>

<template>
  <div class="p-4 sm:p-6">
    <!-- Filters -->
    <div class="space-y-2 sm:space-y-4 mb-4 bg-white">
      <div class="sm:flex sm:items-center sm:gap-4 pb-1">
        <div class="flex-1 mb-2 sm:mb-0">
          <TextField
            name="search"
            variant="merchant"
            v-model="searchQuery"
            placeholder="Cari event"
            icon="pi pi-search"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- Dropdown status -->
        <SelectField
          placeholder="Status"
          name="filter-status"
          v-model="activeFilters.status"
          :options="statusOptions"
          variant="merchant"
          class="ml-2 w-[100px]"
          @change="onStatusChange"
        />
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block">
      <AdminTable
        :items="events"
        :columns="tableColumns"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="pagination?.last_page || 1"
        :pagination-info="paginationInfo"
        :show-checkbox="true"
        :selected-items="selectedEvents"
        :select-all="selectAll"
        @update:selected-items="selectedEvents = $event"
        @update:select-all="selectAll = $event; toggleSelectAll()"
        empty-message="Belum ada event. Klik tombol 'Tambah Event' untuk memulai."
        @row-click="goToDetail"
        @page-change="goToPage"
        @next-page="nextPage"
        @prev-page="prevPage"
      >
        <!-- Banner column -->
        <template #cell-banner_img_path="{ item }">
          <div class="w-16 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="item.banner_img_path"
              :src="getEventBannerUrl(item)"
              :alt="item.event_name"
              class="w-full h-full object-cover"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <i v-else class="pi pi-image text-gray-300 text-xl"></i>
          </div>
        </template>

        <!-- Event Name column -->
        <template #cell-event_name="{ item }">
          <div class="min-w-0">
            <p class="font-semibold text-gray-900 truncate" v-html="highlightText(item.event_name)"></p>
            <p class="text-xs text-muted-foreground truncate" v-html="highlightText(item.event_description)"></p>
          </div>
        </template>

        <!-- Periode column -->
        <template #cell-event_start_date="{ item }">
          <div class="text-sm">
            <p class="font-medium">
              {{ new Date(item.event_start_date).toLocaleDateString('id-ID') }}
            </p>
            <p class="text-xs text-muted-foreground">
              s/d {{ new Date(item.event_end_date).toLocaleDateString('id-ID') }}
            </p>
          </div>
        </template>

        <!-- Status column -->
        <template #cell-status="{ item }">
          <StatusLabel v-if="item && item.status" :status="item.status" variant="event" />
          <span v-else>-</span>
        </template>

        <!-- Actions column -->
        <template #cell-actions="{ item }">
          <div class="flex items-center gap-2">
            <Button @click.stop="goToDetail(item)" variant="admin-outline" size="sm">
              <i class="pi pi-eye"></i>
            </Button>
            <Button @click.stop="goToEdit(item)" variant="admin-outline" size="sm">
              <i class="pi pi-pencil"></i>
            </Button>
            <Button @click.stop="confirmDelete(item)" variant="danger-outline" size="sm">
              <i class="pi pi-trash"></i>
            </Button>
          </div>
        </template>
      </AdminTable>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-admin-primary"></i>
      </div>

      <!-- Empty State for Mobile -->
      <div v-else-if="events.length === 0" class="text-center py-12">
        <i class="pi pi-calendar text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 mb-4">Belum ada event</p>
        <Button @click="goToCreate" variant="admin">
          <i class="pi pi-plus mr-2"></i>
          Tambah Event
        </Button>
      </div>

      <!-- Cards List -->
      <div v-else class="space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <div class="flex gap-3">
            <img
              v-if="event.banner_img_path"
              :src="getEventBannerUrl(event)"
              class="w-20 h-20 object-cover rounded-lg shrink-0"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 line-clamp-2 mb-1">
                {{ event.event_name }}
              </h3>
              <p class="text-xs text-muted-foreground line-clamp-2 mb-2">
                {{ event.event_description }}
              </p>
              <div class="flex items-center justify-between">
                <StatusLabel v-if="event && event.status" :status="event.status" variant="event" size="xs" />
                <span v-else>-</span>
                <span class="text-xs text-muted-foreground">
                  {{ new Date(event.event_start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <Button @click.stop="goToEdit(event)" variant="admin-outline" size="sm" class="flex-1">
              <i class="pi pi-pencil mr-1"></i>
              Edit
            </Button>
            <Button @click.stop="confirmDelete(event)" variant="danger-outline" size="sm">
              <i class="pi pi-trash"></i>
            </Button>
          </div>
        </div>

        <!-- Mobile Pagination -->
        <MobilePagination
          :current-page="currentPage"
          :total-pages="pagination?.last_page || 1"
          @prev="prevPage"
          @next="nextPage"
          @go-to="goToPage"
        />
      </div>
    </div>

    <!-- Delete Modal -->
    <ResponsiveModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      title="Konfirmasi Hapus Event"
    >
      <div class="text-center py-4">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-lg font-semibold mb-2">Yakin ingin menghapus event ini?</p>
        <p class="text-gray-500 mb-2">
          Event <strong>{{ selectedEvent?.event_name }}</strong> akan dihapus dari sistem.
        </p>
        <p class="text-xs text-muted-foreground">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showDeleteModal = false" variant="secondary">Batal</Button>
          <Button @click="handleDelete" variant="danger">
            <i class="pi pi-trash mr-2"></i> Hapus
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- ✅ Export Modal -->
    <ResponsiveModal
      :show="showExportModal"
      @close="closeExportModal"
      title="Export Laporan Events"
      subtitle="Unduh laporan data events dalam format PDF"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-600 text-xl mt-0.5"></i>
            <div class="flex-1">
              <p class="text-sm text-blue-900 font-medium mb-1">Laporan akan mencakup:</p>
              <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Data lengkap events (Nama, Tanggal, Status)</li>
                <li>Jumlah merchants dan vouchers yang terlibat</li>
                <li>Deskripsi event dan pembuat event</li>
                <li>Filter yang diterapkan (Status, Pencarian)</li>
                <li>Informasi waktu download dan admin yang mendownload</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          @click="exportPDF"
          variant="merchant"
          size="lg"
          custom-class="w-full justify-center"
          :loading="exportLoading"
        >
          <i class="pi pi-download mr-2"></i>
          <span>Download Laporan PDF</span>
        </Button>
      </div>
    </ResponsiveModal>
  </div>
</template>