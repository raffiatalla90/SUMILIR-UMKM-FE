<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useUsers } from "@/composables/useUsers";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import AdminTable from "@/components/common/AdminTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";

const router = useRouter();
const toast = useToast();

const { users, loading, pagination, fetchUsers } = useUsers();

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);

// Modals
const showExportModal = ref(false);

const activeFilters = ref({
  status: "",
  role: "",
});

const toggleCustomerRole = () => {
  activeFilters.value.role = activeFilters.value.role === "customer" ? "" : "customer";
  currentPage.value = 1;
  loadUsers();
};

const onStatusChange = () => {
  currentPage.value = 1;
  loadUsers();
};

// Combined modal state for body scroll lock
const isAnyModalOpen = computed(() => showExportModal.value);
useBodyScrollLock(isAnyModalOpen);

// Table config
const tableColumns = [
  { key: "photo", label: "Foto", sortable: false },
  { key: "name", label: "Username", sortable: true },
  { key: "phone", label: "Phone", sortable: false },
  { key: "nik", label: "NIK", sortable: false },
  { key: "roles", label: "Roles", sortable: false },
  { key: "merchants", label: "Merchants", sortable: false },
  { key: "status", label: "Status", sortable: true },
];

const tableActions = [
  {
    icon: "pi-eye",
    label: "Lihat Detail",
    handler: (user) => goToDetail(user),
    class: "hover:bg-muted-foreground/20 text-muted-foreground",
  },
];

// Computed pagination helpers (IDENTIK pola products)
const totalPages = computed(() => pagination.value?.last_page ?? 1);
const totalItems = computed(() => pagination.value?.total ?? 0);
const currentPageFromApi = computed(() => pagination.value?.current_page ?? currentPage.value);
const perPageFromApi = computed(() => pagination.value?.per_page ?? perPage.value);

const paginationInfo = computed(() => {
  const start =
    totalItems.value === 0 ? 0 : (currentPageFromApi.value - 1) * perPageFromApi.value + 1;
  const end = Math.min(currentPageFromApi.value * perPageFromApi.value, totalItems.value);

  return {
    start,
    end,
    total: totalItems.value,
    current_page: currentPageFromApi.value,
    per_page: perPageFromApi.value,
  };
});

// Filter options
const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "watchlist", label: "Watchlist" },
];

const roleOptions = [
  { value: "", label: "Semua Roles" },
  { value: "customer", label: "Hanya Customer" },
  { value: "umkm-owner", label: "UM" },
];

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  if (activeFilters.value.status) count++;
  if (activeFilters.value.role) count++;
  return count;
});

const loadUsers = async () => {
  try {
    await fetchUsers({
      exclude_admin: true,
      search: searchQuery.value,
      computed_status: activeFilters.value.status,
      role: activeFilters.value.role,
      page: currentPage.value,
      per_page: perPage.value,
    });
  } catch (error) {
    console.error("Failed to load users:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

/** Highlight search text */
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
};

// Modal methods
const openExportModal = () => (showExportModal.value = true);
const closeExportModal = () => (showExportModal.value = false);

const getMerchantSummary = (merchants) => {
  const list = Array.isArray(merchants) ? merchants : [];
  const first = list[0]?.name || "-";
  const extra = Math.max(0, list.length - 1);
  return { first, extra, extraNames: list.slice(1).map((m) => m?.name).filter(Boolean) };
};

// Export placeholders
const exportExcel = async () => {
  toast.info("Export Excel sedang dalam pengembangan");
  closeExportModal();
};
const exportPDF = async () => {
  toast.info("Export PDF sedang dalam pengembangan");
  closeExportModal();
};

// Actions
const goToDetail = (user) => {
  router.push({
    name: "Admin - Customer Detail",
    params: { id: user.id },
    query: { tab: "customers" },
  });
};

// Pagination 
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) goToPage(currentPage.value + 1);
};
const prevPage = () => {
  if (currentPage.value > 1) goToPage(currentPage.value - 1);
};

const emit = defineEmits(["create"]);

const goToCreate = () => {
  emit("create");
};

defineExpose({
  openExportModal,
  goToCreate,
});

// Watchers (fetch saat page berubah)
watch(currentPage, () => loadUsers());
watch(searchQuery, () => {
  currentPage.value = 1;
  loadUsers();
});

// Initial load
onMounted(() => loadUsers());
</script>

<template>
  <div class="p-4 sm:p-6">
    <!-- Search & Toolbar (pakai style yang sama seperti products) -->
    <div class="space-y-2 sm:space-y-4 mb-4  bg-white">
      <div class="sm:flex sm:items-center sm:gap-4 pb-1">
        <div class="flex-1 mb-2 sm:mb-0">
          <TextField
            name="search"
            variant="merchant"
            v-model="searchQuery"
            placeholder="Cari user"
            icon="pi-search"
            @keyup.enter="handleSearch"
          />
        </div>

        <!-- toggle "Hanya Customer" -->
        <Button
          :variant="activeFilters.role === 'customer' ? 'merchant' : 'muted-outline'"
          size="md"
          class="ml-2"
          @click="toggleCustomerRole"
        >
          <i class="pi pi-user"></i>
          <span class="ml-1">Hanya Customer</span>
        </Button>

        <!-- Dropdown status -->
        <SelectField
          name="filter-status"
          v-model="activeFilters.status"
          :options="statusOptions"
          variant="merchant"
          class="ml-2 w-[140px]"
          @change="onStatusChange"
        />
      </div>
    </div>

    <!-- Desktop Table  -->
    <div class="hidden sm:block">
      <AdminTable
        :items="users"
        :columns="tableColumns"
        :actions="tableActions"
        :loading="loading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :pagination-info="paginationInfo"
        :show-checkbox="false"
        empty-message="Tidak ada user yang ditemukan"
        @row-click="goToDetail"
        @page-change="goToPage"
        @next-page="nextPage"
        @prev-page="prevPage"
      >
        <template #cell-photo="{ item }">
          <div
            class="w-10 h-10 rounded-full bg-merchant-primary/10 flex items-center justify-center overflow-hidden"
          >
            <span class="text-merchant-primary font-semibold text-sm">
              {{ item.name?.charAt(0)?.toUpperCase() || "U" }}
            </span>
          </div>
        </template>

        <!-- Username + email (email tidak jadi kolom sendiri) -->
        <template #cell-name="{ item }">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-black truncate" v-html="highlightText(item.name || '-')"></p>
            <p class="text-xs text-muted-foreground truncate" v-html="highlightText(item.email || '-')"></p>
          </div>
        </template>

        <!-- NIK -->
        <template #cell-nik="{ item }">
          <span class="text-sm text-black" v-html="highlightText(item.nik || '-')"></span>
        </template>

        <!-- roles -->
        <template #cell-roles="{ item }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="roleName in item.roles || []"
              :key="roleName"
              class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {{ roleName }}
            </span>
            <span
              v-if="!item.roles || item.roles.length === 0"
              class="text-xs text-muted-foreground"
            >
              -
            </span>
          </div>
        </template>
 
        <!-- merchants -->
        <template #cell-merchants="{ item }">
          <div class="min-w-0">
            <div v-if="item.merchants && item.merchants.length" class="flex items-center gap-1 min-w-0">
              <span
                class="inline-flex items-center px-2.5 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-xs font-medium truncate max-w-[180px]"
                :title="getMerchantSummary(item.merchants).first"
              >
                <i class="pi pi-building text-xs mr-1.5"></i>
                {{ getMerchantSummary(item.merchants).first }}
              </span>

              <span
                v-if="getMerchantSummary(item.merchants).extra > 0"
                class="text-xs text-muted-foreground font-medium"
                :title="getMerchantSummary(item.merchants).extraNames.join(', ')"
              >
                +{{ getMerchantSummary(item.merchants).extra }}
              </span>
            </div>

            <span v-else class="text-xs text-muted-foreground">-</span>
          </div>
        </template>

        <template #cell-status="{ item }">
          <StatusLabel :status="item.computed_status || item.status" size="sm" />
        </template>

        <template #cell-actions="{ item }">
          <Button @click.stop="goToDetail(item)" variant="muted-outline" size="sm">
            <i class="pi pi-eye"></i>
          </Button>
        </template>
      </AdminTable>
    </div>

    <!-- Mobile List + MobilePagination (IDENTIK products: MobilePagination) -->
    <div class="sm:hidden">
      <div v-if="loading" class="flex justify-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-merchant-primary"></i>
      </div>

      <div v-else-if="!users || users.length === 0" class="text-center py-12">
        <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Tidak ada user</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="u in users"
          :key="u.id"
          @click="goToDetail(u)"
          class="bg-white rounded-lg shadow-sm p-4 active:bg-gray-50 transition"
        >
          <div class="flex items-start gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-merchant-primary/10 flex items-center justify-center shrink-0">
              <span class="text-merchant-primary font-semibold">
                {{ u.name?.charAt(0)?.toUpperCase() || "U" }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate" v-html="highlightText(u.name)"></p>
              <p class="text-sm text-gray-600 truncate" v-html="highlightText(u.email)"></p>
              <p class="text-xs text-gray-500 truncate" v-html="highlightText(u.phone || '-')"></p>
            </div>

            <StatusLabel :status="u.computed_status || u.status" size="sm" />
          </div>

          <div class="flex items-center justify-between text-xs border-t pt-2">
            <span class="text-gray-600">
              <i class="pi pi-building mr-1"></i>
              {{ u.merchants_count || 0 }} Merchant
            </span>
            <span class="text-gray-600">
              <i class="pi pi-id-card mr-1"></i>
              {{ (u.roles && u.roles[0] && u.roles[0].name) || "-" }}
            </span>
          </div>
        </div>
      </div>

      <MobilePagination
        v-if="users && users.length > 0"
        class="mt-4"
        :current-page="currentPage"
        :total-pages="totalPages"
        @prev="prevPage"
        @next="nextPage"
        @go-to="goToPage"
      />
    </div>

    <!-- Export Modal (dipanggil dari parent header) -->
    <ResponsiveModal
      :show="showExportModal"
      @close="closeExportModal"
      title="Export Data"
      subtitle="Pilih format export"
    >
      <div class="space-y-3">
        <Button @click="exportExcel" variant="merchant" size="lg" customClass="w-full justify-start">
          <i class="pi pi-file-excel mr-3 text-xl"></i>
          <div class="text-left">
            <p class="font-semibold">Export ke Excel</p>
            <p class="text-xs opacity-80">Download .xlsx</p>
          </div>
        </Button>

        <Button @click="exportPDF" variant="merchant" size="lg" customClass="w-full justify-start">
          <i class="pi pi-file-pdf mr-3 text-xl"></i>
          <div class="text-left">
            <p class="font-semibold">Export ke PDF</p>
            <p class="text-xs opacity-80">Download .pdf</p>
          </div>
        </Button>
      </div>
    </ResponsiveModal>

    <!-- Add Merchant Button -->
    <Button
      v-if="effectiveTab === 'merchants' && !isDetailRoute"
      @click="() => router.push({ name: 'Admin - Merchant Create' })"
      variant="merchant"
      size="sm"
      customClass="!hidden sm:!inline"
    >
      <i class="pi pi-plus"></i>
      <span class="hidden sm:inline ml-2">Tambah Merchant</span>
    </Button>
  </div>
</template>