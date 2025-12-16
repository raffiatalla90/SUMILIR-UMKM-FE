<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useEvents } from "@/composables/useEvents";
import { getImageUrl } from "@/libs/getImageUrl";

const router = useRouter();
const toast = useToast();

const { events, loading, pagination, fetchEvents, deleteEvent } = useEvents();

const breadcrumbItems = [{ label: "Events" }];

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(10);
const statusFilter = ref("");
const activeOnlyFilter = ref(false);

// Modals
const showDeleteModal = ref(false);
const selectedEvent = ref(null);

// Load events
const loadEvents = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    active_only: activeOnlyFilter.value || undefined,
  };

  await fetchEvents(params, true);
};

// Actions
const goToCreate = () => router.push({ name: "Admin - Create Event" });
const goToDetail = (event) =>
  router.push({ name: "Admin - Event Detail", params: { id: event.id } });
const goToEdit = (event) =>
  router.push({ name: "Admin - Edit Event", params: { id: event.id } });

const confirmDelete = (event) => {
  selectedEvent.value = event;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    await deleteEvent(selectedEvent.value.id);
    showDeleteModal.value = false;
    loadEvents();
  } catch (error) {
    console.error("Delete failed:", error);
  }
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadEvents();
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
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

// Table config
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "event_name", label: "Event", sortable: true },
  { key: "event_start_date", label: "Periode", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

// Computed pagination info for MerchantTable
const paginationInfo = computed(() => ({
  start: (pagination.value.current_page - 1) * pagination.value.per_page + 1,
  end: Math.min(
    pagination.value.current_page * pagination.value.per_page,
    pagination.value.total
  ),
  total: pagination.value.total,
}));

// Table actions handlers
const handleRowClick = (event) => {
  goToDetail(event);
};

watch([searchQuery, statusFilter, activeOnlyFilter], () => {
  currentPage.value = 1;
  loadEvents();
});

onMounted(() => {
  loadEvents();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-admin-primary">
            Kelola Events
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Buat dan kelola event promo untuk merchant
          </p>
        </div>
        <Button @click="goToCreate" variant="admin" class="w-full sm:w-auto">
          <i class="pi pi-plus mr-2"></i>
          Buat Event Baru
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 py-6">
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari event..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          />

          <select
            v-model="statusFilter"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <div class="flex items-center gap-2">
            <input
              id="active-only"
              v-model="activeOnlyFilter"
              type="checkbox"
              class="w-4 h-4 text-admin-primary rounded"
            />
            <label for="active-only" class="text-sm text-gray-700">
              Hanya Event Aktif
            </label>
          </div>
        </div>
      </div>

      <!-- ✅ Desktop Table - MerchantTable handles empty state -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="events"
          :columns="tableColumns"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="pagination.last_page"
          :pagination-info="paginationInfo"
          :show-checkbox="false"
          empty-message="Belum ada event. Klik tombol 'Buat Event Baru' untuk memulai."
          @row-click="handleRowClick"
          @page-change="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
        >
          <!-- Custom cell slots -->
          <template #cell-event_name="{ item }">
            <div class="flex items-center gap-3">
              <img
                v-if="item.banner_img_path"
                :src="getImageUrl(item.banner_img_path)"
                class="w-16 h-10 object-cover rounded"
              />
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 truncate">
                  {{ item.event_name }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ item.event_description }}
                </p>
              </div>
            </div>
          </template>

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

          <template #cell-status="{ item }">
            <StatusLabel :status="item.status" variant="event" />
          </template>

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
        </MerchantTable>
      </div>

      <!-- ✅ Mobile Cards - Handle empty state manually -->
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
            Buat Event Pertama
          </Button>
        </div>

        <!-- Cards List -->
        <div v-else class="space-y-4">
          <div
            v-for="event in events"
            :key="event.id"
            @click="goToDetail(event)"
            class="bg-white rounded-lg shadow p-4 active:bg-gray-50 transition"
          >
            <div class="flex gap-3">
              <img
                v-if="event.banner_img_path"
                :src="getImageUrl(event.banner_img_path)"
                class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 line-clamp-2 mb-1">
                  {{ event.event_name }}
                </h3>
                <p class="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {{ event.event_description }}
                </p>
                <div class="flex items-center justify-between">
                  <StatusLabel :status="event.status" variant="event" size="xs" />
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
            :total-pages="pagination.last_page"
            @prev="prevPage"
            @next="nextPage"
            @go-to="goToPage"
          />
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <ResponsiveModal v-model:show="showDeleteModal" title="Hapus Event">
      <p class="text-sm text-gray-600 mb-4">
        Apakah Anda yakin ingin menghapus event
        <strong>{{ selectedEvent?.event_name }}</strong>?
      </p>

      <template #footer>
        <div class="flex gap-3">
          <Button @click="showDeleteModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleDelete" variant="danger">
            Hapus
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>