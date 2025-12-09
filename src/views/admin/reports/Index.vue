<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useReports } from "@/composables/useReports";

const router = useRouter();
const toast = useToast();

const { reports, loading, pagination, fetchReports } = useReports();

const breadcrumbItems = [{ label: "Content Reports" }];

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);
const statusFilter = ref("");
const typeFilter = ref("");

// Load reports
const loadReports = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
    reportable_type: typeFilter.value || undefined,
  };

  await fetchReports(params);
};

// Actions
const goToDetail = (report) => {
  router.push({ name: "Admin - Report Detail", params: { id: report.id } });
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadReports();
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    currentPage.value++;
    loadReports();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadReports();
  }
};

// Table config
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "reporter_name", label: "Pelapor", sortable: true },
  { key: "reportable_type", label: "Tipe Konten", sortable: true },
  { key: "reason", label: "Alasan", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "created_at", label: "Tanggal Lapor", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

// Computed pagination info
const paginationInfo = computed(() => ({
  start: (pagination.value.current_page - 1) * pagination.value.per_page + 1,
  end: Math.min(
    pagination.value.current_page * pagination.value.per_page,
    pagination.value.total
  ),
  total: pagination.value.total,
}));

const getContentTypeLabel = (type) => {
  const types = {
    "App\\Models\\Product": "Produk",
    "App\\Models\\Service": "Jasa",
    "App\\Models\\Merchant": "Merchant",
    "App\\Models\\Post": "Post",
    "App\\Models\\Comment": "Komentar",
  };
  return types[type] || type;
};

const handleRowClick = (report) => {
  goToDetail(report);
};

watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1;
  loadReports();
});

onMounted(() => {
  loadReports();
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
            Kelola Laporan Konten
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Review dan tindak lanjuti laporan konten dari pengguna
          </p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 py-6">
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Search Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cari Laporan
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nama pelapor atau komentar..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipe Konten
            </label>
            <select
              v-model="typeFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="App\Models\Product">Produk</option>
              <option value="App\Models\Service">Jasa</option>
              <option value="App\Models\Merchant">Merchant</option>
              <option value="App\Models\Post">Post</option>
              <option value="App\Models\Comment">Komentar</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="reports"
          :columns="tableColumns"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="pagination.last_page"
          :pagination-info="paginationInfo"
          :show-checkbox="false"
          @row-click="handleRowClick"
          @page-change="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
        >
          <template #cell-reporter_name="{ item }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <i class="pi pi-user text-gray-400 text-xs"></i>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ item.reporter?.name || "-" }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ item.reporter?.email }}
                </p>
              </div>
            </div>
          </template>

          <template #cell-reportable_type="{ item }">
            <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
              {{ getContentTypeLabel(item.reportable_type) }}
            </span>
          </template>

          <template #cell-reason="{ item }">
            <div class="max-w-xs">
              <p class="text-sm text-gray-900 line-clamp-2">
                {{ item.report_reason?.reason || "-" }}
              </p>
              <p v-if="item.report_comment" class="text-xs text-muted-foreground mt-1 line-clamp-1">
                {{ item.report_comment }}
              </p>
            </div>
          </template>

          <template #cell-status="{ item }">
            <StatusLabel :status="item.status" variant="report" />
          </template>

          <template #cell-created_at="{ item }">
            <div class="text-sm">
              <p class="font-medium text-gray-900">
                {{ new Date(item.created_at).toLocaleDateString("id-ID") }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ new Date(item.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) }}
              </p>
            </div>
          </template>

          <template #cell-actions="{ item }">
            <Button
              @click.stop="goToDetail(item)"
              variant="admin"
              size="sm"
            >
              <i class="pi pi-eye mr-2"></i>
              Review
            </Button>
          </template>
        </MerchantTable>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-4">
        <div
          v-for="report in reports"
          :key="report.id"
          @click="goToDetail(report)"
          class="bg-white rounded-lg shadow p-4 active:bg-gray-50 transition"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-user text-gray-400"></i>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-sm text-gray-900 truncate">
                  {{ report.reporter?.name || "-" }}
                </p>
                <p class="text-xs text-muted-foreground truncate">
                  {{ getContentTypeLabel(report.reportable_type) }}
                </p>
              </div>
            </div>
            <StatusLabel :status="report.status" variant="report" size="xs" />
          </div>

          <div class="space-y-2">
            <div class="text-xs text-gray-600">
              <span class="font-medium">Alasan:</span>
              {{ report.report_reason?.reason || "-" }}
            </div>
            <div v-if="report.report_comment" class="text-xs text-muted-foreground line-clamp-2">
              {{ report.report_comment }}
            </div>
            <div class="text-xs text-muted-foreground">
              <i class="pi pi-clock mr-1"></i>
              {{ new Date(report.created_at).toLocaleDateString("id-ID") }}
            </div>
          </div>

          <div class="mt-3 pt-3 border-t">
            <Button
              @click.stop="goToDetail(report)"
              variant="admin"
              size="sm"
              class="w-full"
            >
              <i class="pi pi-eye mr-2"></i>
              Review Detail
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

      <!-- Empty State -->
      <div
        v-if="!loading && reports.length === 0"
        class="text-center py-12"
      >
        <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 mb-2 text-lg font-medium">Tidak ada laporan</p>
        <p class="text-sm text-muted-foreground">
          Belum ada laporan konten yang masuk
        </p>
      </div>
    </div>
  </div>
</template>