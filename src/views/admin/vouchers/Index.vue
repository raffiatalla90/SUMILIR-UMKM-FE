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
import { useVouchers } from "@/composables/useVouchers";

const router = useRouter();
const toast = useToast();

const { vouchers, loading, pagination, fetchVouchers, deleteVoucher } = useVouchers();

const breadcrumbItems = [{ label: "Vouchers" }];

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);
const statusFilter = ref("");
const typeFilter = ref("");
const merchantFilter = ref("");

// Modals
const showDeleteModal = ref(false);
const selectedVoucher = ref(null);

// Load vouchers
const loadVouchers = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    voucher_status: statusFilter.value || undefined,
    voucher_type: typeFilter.value || undefined,
    merchant_id: merchantFilter.value || undefined,
  };

  await fetchVouchers(params);
};

// Actions
const goToDetail = (voucher) => {
  // Show detail modal or navigate to detail page
  toast.info("Detail voucher: " + voucher.voucher_code);
};

const confirmDelete = (voucher) => {
  selectedVoucher.value = voucher;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    await deleteVoucher(selectedVoucher.value.id);
    showDeleteModal.value = false;
    loadVouchers();
  } catch (error) {
    console.error("Delete failed:", error);
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
  { key: "merchant_name", label: "Merchant", sortable: true },
  { key: "voucher_type", label: "Tipe", sortable: false },
  { key: "value", label: "Nilai", sortable: true },
  { key: "usage", label: "Penggunaan", sortable: true },
  { key: "voucher_status", label: "Status", sortable: true },
  { key: "valid_until", label: "Berlaku s/d", sortable: true },
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

// Format helpers
const formatVoucherType = (type) => {
  return type === 'percent' ? 'Persentase' : 'Nominal';
};

const formatVoucherValue = (voucher) => {
  if (voucher.voucher_type === 'percent') {
    return `${voucher.value}%`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(voucher.value);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const handleRowClick = (voucher) => {
  goToDetail(voucher);
};

watch([searchQuery, statusFilter, typeFilter, merchantFilter], () => {
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
      <div class="mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-admin-primary">
          Kelola Vouchers
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Monitor dan kelola voucher dari merchant dan event
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-4 sm:px-6 py-4">
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kode voucher atau deskripsi..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary"
          />

          <select v-model="statusFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Semua Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select v-model="typeFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Semua Tipe</option>
            <option value="percent">Persentase</option>
            <option value="fixed">Nominal</option>
          </select>
        </div>
      </div>

      <!-- ✅ Desktop Table - No external empty state -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="vouchers"
          :columns="tableColumns"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="pagination.last_page"
          :pagination-info="paginationInfo"
          :show-checkbox="false"
          empty-message="Belum ada voucher yang dibuat oleh merchant atau event"
          @row-click="handleRowClick"
          @page-change="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
        >
          <!-- Custom cells -->
          <template #cell-voucher_code="{ item }">
            <div class="font-mono font-semibold text-admin-primary">
              {{ item.voucher_code }}
            </div>
            <p v-if="item.voucher_description" class="text-xs text-muted-foreground truncate max-w-xs">
              {{ item.voucher_description }}
            </p>
          </template>

          <template #cell-merchant_name="{ item }">
            <div class="flex items-center gap-3">
              <img
                v-if="item.merchant?.logo_path"
                :src="item.merchant.logo_path"
                class="w-8 h-8 rounded-full object-cover"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center" v-else>
                <i class="pi pi-building text-gray-400 text-xs"></i>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ item.merchant?.name || 'Event Voucher' }}
                </p>
                <p v-if="item.event" class="text-xs text-muted-foreground">
                  Event: {{ item.event.event_name }}
                </p>
              </div>
            </div>
          </template>

          <template #cell-voucher_type="{ item }">
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="
                item.voucher_type === 'percent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              "
            >
              {{ formatVoucherType(item.voucher_type) }}
            </span>
          </template>

          <template #cell-value="{ item }">
            <div class="font-semibold">
              {{ formatVoucherValue(item) }}
            </div>
            <p v-if="item.max_discount_amount && item.voucher_type === 'percent'" class="text-xs text-muted-foreground">
              Max: {{ formatVoucherValue({ ...item, voucher_type: 'fixed', value: item.max_discount_amount }) }}
            </p>
          </template>

          <template #cell-usage="{ item }">
            <div class="text-sm">
              <p class="font-medium">
                {{ item.usages_count || 0 }} / {{ item.usage_limit || '∞' }}
              </p>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  class="bg-admin-primary h-1.5 rounded-full"
                  :style="{
                    width: item.usage_limit
                      ? `${Math.min(((item.usages_count || 0) / item.usage_limit) * 100, 100)}%`
                      : '0%',
                  }"
                ></div>
              </div>
            </div>
          </template>

          <template #cell-voucher_status="{ item }">
            <StatusLabel :status="item.voucher_status" variant="voucher" />
          </template>

          <template #cell-valid_until="{ item }">
            <div class="text-sm">
              <p class="font-medium">{{ formatDate(item.voucher_end_date) }}</p>
              <p class="text-xs text-muted-foreground">
                Mulai: {{ formatDate(item.voucher_start_date) }}
              </p>
            </div>
          </template>

          <template #cell-actions="{ item }">
            <div class="flex items-center gap-2">
              <Button
                @click.stop="goToDetail(item)"
                variant="admin-outline"
                size="sm"
              >
                <i class="pi pi-eye"></i>
              </Button>
              <Button
                @click.stop="confirmDelete(item)"
                variant="danger-outline"
                size="sm"
                v-if="item.usages_count === 0"
              >
                <i class="pi pi-trash"></i>
              </Button>
            </div>
          </template>
        </MerchantTable>
      </div>

      <!-- ✅ Mobile Cards - Handle empty separately -->
      <div class="sm:hidden">
        <div v-if="loading" class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-admin-primary"></i>
        </div>

        <div v-else-if="vouchers.length === 0" class="text-center py-12">
          <i class="pi pi-ticket text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Belum ada voucher</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="voucher in vouchers"
            :key="voucher.id"
            @click="goToDetail(voucher)"
            class="bg-white rounded-lg shadow p-4 active:bg-gray-50 transition"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <p class="font-mono font-semibold text-admin-primary truncate">
                  {{ voucher.voucher_code }}
                </p>
                <p class="text-xs text-muted-foreground line-clamp-1">
                  {{ voucher.merchant?.name || 'Event Voucher' }}
                </p>
              </div>
              <StatusLabel :status="voucher.voucher_status" variant="voucher" size="xs" />
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600">Nilai:</span>
                <span class="font-semibold text-sm">{{ formatVoucherValue(voucher) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600">Penggunaan:</span>
                <span class="text-sm">{{ voucher.usages_count || 0 }} / {{ voucher.usage_limit || '∞' }}</span>
              </div>
              <div class="text-xs text-muted-foreground">
                <i class="pi pi-calendar mr-1"></i>
                s/d {{ formatDate(voucher.voucher_end_date) }}
              </div>
            </div>

            <div class="flex gap-2 mt-3 pt-3 border-t">
              <Button
                @click.stop="goToDetail(voucher)"
                variant="admin"
                size="sm"
                class="flex-1"
              >
                <i class="pi pi-eye mr-2"></i>
                Detail
              </Button>
              <Button
                v-if="voucher.usages_count === 0"
                @click.stop="confirmDelete(voucher)"
                variant="danger-outline"
                size="sm"
              >
                <i class="pi pi-trash"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ResponsiveModal
      v-model:show="showDeleteModal"
      title="Hapus Voucher"
      @close="showDeleteModal = false"
    >
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-4">
          Apakah Anda yakin ingin menghapus voucher 
          <strong class="font-mono">{{ selectedVoucher?.voucher_code }}</strong>?
        </p>
        <p class="text-xs text-red-600">
          ⚠️ Voucher yang sudah digunakan tidak dapat dihapus
        </p>
        <div class="flex gap-3 justify-end mt-6">
          <Button
            @click="showDeleteModal = false"
            variant="muted-outline"
          >
            Batal
          </Button>
          <Button
            @click="handleDelete"
            variant="danger"
            :loading="loading"
          >
            Ya, Hapus
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  </div>
</template>