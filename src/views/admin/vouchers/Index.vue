<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { getImageUrl } from "@/libs/getImageUrl";
import api from "@/libs/axios";

const router = useRouter();
const toast = useToast();

const breadcrumbItems = [{ label: "All Vouchers" }];

// State
const vouchers = ref([]);
const loading = ref(false);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
});

const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);
const statusFilter = ref("");
const typeFilter = ref("");

// Load vouchers
const loadVouchers = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      search: searchQuery.value || undefined,
      voucher_status: statusFilter.value || undefined,
      voucher_type: typeFilter.value || undefined,
    };

    const response = await api.get("/admin/vouchers", { params });

    if (response.data.data) {
      vouchers.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      };
    } else {
      vouchers.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (error) {
    console.error("Failed to load vouchers:", error);
    toast.error("Gagal memuat data voucher");
    vouchers.value = [];
  } finally {
    loading.value = false;
  }
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadVouchers();
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    currentPage.value++;
    loadVouchers();
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadVouchers();
  }
};

// Table config
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "voucher_code", label: "Kode Voucher", sortable: true },
  { key: "voucher_type", label: "Tipe", sortable: true },
  { key: "value", label: "Nilai", sortable: false },
  { key: "merchant", label: "Merchant", sortable: false },
  { key: "event", label: "Event", sortable: false },
  { key: "valid_period", label: "Periode", sortable: false },
  { key: "voucher_status", label: "Status", sortable: true },
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

const getVoucherValue = (voucher) => {
  if (voucher.voucher_type === "percent") {
    return `${voucher.value}%`;
  }
  return `Rp ${Number(voucher.value).toLocaleString("id-ID")}`;
};

const getVoucherTypeLabel = (type) => {
  const types = {
    percent: "Persentase",
    fixed: "Nominal Tetap",
    free_shipping: "Gratis Ongkir",
  };
  return types[type] || type;
};

const handleRowClick = (voucher) => {
  // Optional: Navigate to voucher detail if exists
  console.log("Voucher clicked:", voucher);
};

watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1;
  loadVouchers();
});

onMounted(() => {
  loadVouchers();
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
            Semua Voucher
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            Kelola voucher dari semua merchant dan event
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
              Cari Voucher
            </label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Kode voucher..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipe Voucher
            </label>
            <select
              v-model="typeFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="percent">Persentase</option>
              <option value="fixed">Nominal Tetap</option>
              <option value="free_shipping">Gratis Ongkir</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="vouchers"
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
          <template #cell-voucher_code="{ item }">
            <div class="flex items-center gap-2">
              <span class="font-mono font-semibold text-admin-primary">
                {{ item.voucher_code }}
              </span>
              <button
                @click.stop="navigator.clipboard.writeText(item.voucher_code)"
                class="p-1 hover:bg-gray-100 rounded transition"
                title="Copy kode"
              >
                <i class="pi pi-copy text-xs text-gray-400"></i>
              </button>
            </div>
          </template>

          <template #cell-voucher_type="{ item }">
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {{ getVoucherTypeLabel(item.voucher_type) }}
            </span>
          </template>

          <template #cell-value="{ item }">
            <div class="text-sm">
              <p class="font-bold text-admin-primary">
                {{ getVoucherValue(item) }}
              </p>
              <p v-if="item.max_discount_amount" class="text-xs text-muted-foreground">
                Maks: Rp {{ Number(item.max_discount_amount).toLocaleString("id-ID") }}
              </p>
            </div>
          </template>

          <template #cell-merchant="{ item }">
            <div v-if="item.merchant" class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-building text-gray-400 text-xs"></i>
              </div>
              <div class="min-w-0">
                <p class="font-medium text-sm text-gray-900 truncate">
                  {{ item.merchant.name }}
                </p>
              </div>
            </div>
            <span v-else class="text-sm text-gray-400">-</span>
          </template>

          <template #cell-event="{ item }">
            <div v-if="item.event" class="max-w-xs">
              <p class="font-medium text-sm text-gray-900 truncate">
                {{ item.event.event_name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ new Date(item.event.event_start_date).toLocaleDateString("id-ID") }}
              </p>
            </div>
            <span v-else class="text-sm text-gray-400">-</span>
          </template>

          <template #cell-valid_period="{ item }">
            <div class="text-xs">
              <p class="font-medium text-gray-900">
                {{ new Date(item.voucher_start_date).toLocaleDateString("id-ID") }}
              </p>
              <p class="text-muted-foreground">
                s/d {{ new Date(item.voucher_end_date).toLocaleDateString("id-ID") }}
              </p>
            </div>
          </template>

          <template #cell-voucher_status="{ item }">
            <StatusLabel :status="item.voucher_status" variant="general" />
          </template>
        </MerchantTable>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-4">
        <div
          v-for="voucher in vouchers"
          :key="voucher.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-mono font-semibold text-sm text-admin-primary">
                  {{ voucher.voucher_code }}
                </span>
                <button
                  @click.stop="navigator.clipboard.writeText(voucher.voucher_code)"
                  class="p-1 hover:bg-gray-100 rounded transition"
                >
                  <i class="pi pi-copy text-xs text-gray-400"></i>
                </button>
              </div>
              <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {{ getVoucherTypeLabel(voucher.voucher_type) }}
              </span>
            </div>
            <StatusLabel :status="voucher.voucher_status" variant="general" size="xs" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">Nilai</span>
              <span class="font-bold text-admin-primary">
                {{ getVoucherValue(voucher) }}
              </span>
            </div>

            <div v-if="voucher.merchant" class="flex items-center gap-2">
              <i class="pi pi-building text-xs text-muted-foreground"></i>
              <span class="text-xs text-gray-900 truncate">
                {{ voucher.merchant.name }}
              </span>
            </div>

            <div v-if="voucher.event" class="flex items-center gap-2">
              <i class="pi pi-calendar text-xs text-muted-foreground"></i>
              <span class="text-xs text-gray-900 truncate">
                {{ voucher.event.event_name }}
              </span>
            </div>

            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <i class="pi pi-clock"></i>
              <span>
                {{ new Date(voucher.voucher_start_date).toLocaleDateString("id-ID") }} -
                {{ new Date(voucher.voucher_end_date).toLocaleDateString("id-ID") }}
              </span>
            </div>
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
        v-if="!loading && vouchers.length === 0"
        class="text-center py-12"
      >
        <i class="pi pi-tag text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 mb-2 text-lg font-medium">Tidak ada voucher</p>
        <p class="text-sm text-muted-foreground">
          Belum ada voucher yang tersedia
        </p>
      </div>
    </div>
  </div>
</template>