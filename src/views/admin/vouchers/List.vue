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
            placeholder="Cari kode/deskripsi voucher"
            icon="pi pi-search"
            @keyup.enter="handleSearch"
          />
        </div>
        <!-- Dropdown status -->
        <SelectField
          name="filter-status"
          v-model="filterStatus"
          :options="statusOptions"
          variant="merchant"
          class="ml-2 w-[140px]"
          @change="onStatusChange"
        />
        <!-- Dropdown tipe -->
        <SelectField
          name="filter-type"
          v-model="filterType"
          :options="typeOptions"
          variant="merchant"
          class="ml-2 w-[140px]"
          @change="onTypeChange"
        />
        <!-- Dropdown sort -->
        <SelectField
          name="sort-by"
          v-model="sortBy"
          :options="sortOptions"
          variant="merchant"
          class="ml-2 w-[170px]"
          @change="onSortChange"
        />
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block">
      <AdminTable
        :items="vouchers"
        :columns="tableColumns"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="pagination.last_page"
        :pagination-info="pagination"
        :show-checkbox="false"
        empty-message="Belum ada voucher"
        @page-change="(p) => (currentPage.value = p)"
      >
        <template #cell-voucher_code="{ item }">
          <span class="font-mono font-semibold text-admin-primary">{{ item.voucher_code }}</span>
        </template>
        <template #cell-voucher_description="{ item }">
          <span class="text-xs text-muted-foreground truncate max-w-xs">{{ item.voucher_description }}</span>
        </template>
        <template #cell-event_name="{ item }">
          <span>{{ getEventName(item) }}</span>
        </template>
        <template #cell-voucher_type="{ item }">
          <span>{{ formatVoucherType(item.voucher_type) }}</span>
        </template>
        <template #cell-value="{ item }">
          <span class="font-semibold">{{ formatVoucherValue(item) }}</span>
        </template>
        <template #cell-usage="{ item }">
          <span>{{ getUsage(item) }}</span>
        </template>
        <template #cell-voucher_status="{ item }">
          <StatusLabel :status="item.voucher_status" variant="voucher" />
        </template>
        <template #cell-voucher_start_date="{ item }">
          <span>{{ formatDate(item.voucher_start_date) }}</span>
        </template>
        <template #cell-voucher_end_date="{ item }">
          <span>{{ formatDate(item.voucher_end_date) }}</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="flex gap-2">
            <Button @click.stop="goToDetail(item)" variant="admin-outline" size="sm">
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
      </AdminTable>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-admin-primary"></i>
      </div>

      <!-- Empty State for Mobile -->
      <div v-else-if="vouchers.length === 0" class="text-center py-12">
        <i class="pi pi-ticket text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 mb-4">Belum ada voucher</p>
      </div>

      <!-- Cards List -->
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
                {{ getEventName(voucher) }}
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
              <span class="text-sm">{{ getUsage(voucher) }}</span>
            </div>
            <div class="text-xs text-muted-foreground">
              <i class="pi pi-calendar mr-1"></i>
              {{ formatDate(voucher.voucher_start_date) }} - {{ formatDate(voucher.voucher_end_date) }}
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
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useVouchers } from "@/composables/useVouchers";
import Button from "@/components/common/Button.vue";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import AdminTable from "@/components/common/AdminTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";

const router = useRouter();
const { vouchers, loading, pagination, fetchVouchers, deleteVoucher } = useVouchers();

const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);

const filterStatus = ref("");
const filterType = ref("");
const sortBy = ref(""); // "name_asc", "name_desc", "start_newest", "start_oldest", "end_newest", "end_oldest"

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];
const typeOptions = [
  { value: "", label: "Semua Tipe" },
  { value: "percent", label: "Persentase" },
  { value: "fixed", label: "Nominal" },
];
const sortOptions = [
  { value: "", label: "Default" },
  { value: "name_asc", label: "Nama A-Z" },
  { value: "name_desc", label: "Nama Z-A" },
  { value: "start_newest", label: "Tgl Mulai Terbaru" },
  { value: "start_oldest", label: "Tgl Mulai Terlama" },
  { value: "end_newest", label: "Tgl Berakhir Terbaru" },
  { value: "end_oldest", label: "Tgl Berakhir Terlama" },
];

const tableColumns = [
  { key: "voucher_code", label: "Kode", sortable: true },
  { key: "voucher_description", label: "Deskripsi", sortable: false },
  { key: "event_name", label: "Event", sortable: false },
  { key: "voucher_type", label: "Tipe", sortable: false },
  { key: "value", label: "Nilai", sortable: true },
  { key: "usage", label: "Penggunaan", sortable: false },
  { key: "voucher_status", label: "Status", sortable: true },
  { key: "voucher_start_date", label: "Tgl Mulai", sortable: true },
  { key: "voucher_end_date", label: "Tgl Berakhir", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

const loadVouchers = async () => {
  await fetchVouchers({
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    voucher_status: filterStatus.value || undefined,
    voucher_type: filterType.value || undefined,
    sort_by: sortBy.value || undefined,
  });
};

const handleSearch = () => {
  currentPage.value = 1;
  loadVouchers();
};
const onStatusChange = () => {
  currentPage.value = 1;
  loadVouchers();
};
const onTypeChange = () => {
  currentPage.value = 1;
  loadVouchers();
};
const onSortChange = () => {
  currentPage.value = 1;
  loadVouchers();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadVouchers();
  }
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    currentPage.value++;
    loadVouchers();
  }
};
const goToPage = (page) => {
  currentPage.value = page;
  loadVouchers();
};

// Format helpers
const formatVoucherType = (type) => (type === "percent" ? "Persentase" : "Nominal");
const formatVoucherValue = (item) =>
  item.voucher_type === "percent"
    ? `${item.value}%`
    : `Rp${Number(item.value).toLocaleString("id-ID")}`;
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("id-ID") : "-";
const getEventName = (item) => item.event?.event_name || "-";
const getUsage = (item) =>
  `${item.usages_count || 0} / ${item.usage_limit || "∞"}`;

const goToDetail = (item) => router.push({ name: "Admin - Voucher Detail", params: { id: item.id } });
const confirmDelete = async (item) => {
  if (confirm("Hapus voucher ini?")) {
    await deleteVoucher(item.id);
    loadVouchers();
  }
};

watch([searchQuery, filterStatus, filterType, sortBy, currentPage], loadVouchers, { immediate: true });
</script>''