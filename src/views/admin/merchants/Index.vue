<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import MerchantTable from "@/components/common/MerchantTable.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import MobilePagination from "@/components/common/MobilePagination.vue";
import { useMerchants } from "@/composables/useMerchants";

const router = useRouter();
const toast = useToast();

const {
  merchants,
  loading,
  pagination,
  fetchMerchants,
  approveMerchant,
  rejectMerchant,
} = useMerchants();

const breadcrumbItems = [{ label: "Merchants" }];

// State
const searchQuery = ref("");
const currentPage = ref(1);
const perPage = ref(15);
const statusFilter = ref("");

// Modals
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedMerchant = ref(null);
const rejectReason = ref("");

// Load merchants
const loadMerchants = async () => {
  const params = {
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
  };

  await fetchMerchants(params);
};

// Actions
const goToDetail = (merchant) => {
  router.push({ name: "Admin - Merchant Detail", params: { id: merchant.id } });
};

const confirmApprove = (merchant) => {
  selectedMerchant.value = merchant;
  showApproveModal.value = true;
};

const confirmReject = (merchant) => {
  selectedMerchant.value = merchant;
  rejectReason.value = "";
  showRejectModal.value = true;
};

const handleApprove = async () => {
  try {
    await approveMerchant(selectedMerchant.value.id);
    showApproveModal.value = false;
    loadMerchants();
  } catch (error) {
    console.error("Approve failed:", error);
  }
};

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    toast.warning("Alasan penolakan wajib diisi");
    return;
  }

  try {
    await rejectMerchant(selectedMerchant.value.id, rejectReason.value);
    showRejectModal.value = false;
    loadMerchants();
  } catch (error) {
    console.error("Reject failed:", error);
  }
};

// Pagination
const goToPage = (page) => {
  currentPage.value = page;
  loadMerchants();
};
const nextPage = () => {
  if (currentPage.value < pagination.value.last_page) {
    currentPage.value++;
  }
};
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Table config
const tableColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Nama Merchant", sortable: true },
  { key: "owner_name", label: "Pemilik", sortable: true },
  { key: "phone", label: "Telepon", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "created_at", label: "Terdaftar", sortable: true },
  { key: "actions", label: "Aksi", sortable: false },
];

const getTableActions = (row) => {
  const actions = [
    {
      label: "Detail",
      icon: "pi pi-eye",
      onClick: goToDetail,
      variant: "info",
    },
  ];

  if (row.status === "pending") {
    actions.push(
      {
        label: "Approve",
        icon: "pi pi-check",
        onClick: confirmApprove,
        variant: "success",
      },
      {
        label: "Reject",
        icon: "pi pi-times",
        onClick: confirmReject,
        variant: "danger",
      }
    );
  }

  return actions;
};

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
  loadMerchants();
});

onMounted(() => {
  loadMerchants();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-primary">
          Merchant Management
        </h1>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-4 sm:px-6 py-4 bg-white shadow-sm mt-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          v-model="searchQuery"
          label="Cari Merchant"
          placeholder="Nama merchant atau pemilik..."
        />
        <SelectField
          v-model="statusFilter"
          label="Status"
          :options="[
            { value: '', label: 'Semua Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]"
        />
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block px-4 sm:px-6 py-4">
      <MerchantTable
        :columns="tableColumns"
        :data="merchants"
        :loading="loading"
        :get-actions="getTableActions"
      >
        <template #cell-owner_name="{ row }">
          {{ row.user?.name || "-" }}
        </template>
        <template #cell-status="{ row }">
          <StatusLabel :status="row.status" />
        </template>
        <template #cell-created_at="{ row }">
          {{ new Date(row.created_at).toLocaleDateString("id-ID") }}
        </template>
      </MerchantTable>

      <!-- Pagination -->
      <MobilePagination
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        :total="pagination.total"
        :per-page="pagination.per_page"
        @prev="prevPage"
        @next="nextPage"
        @go-to-page="goToPage"
      />
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden px-4 py-4 space-y-3">
      <div
        v-for="merchant in merchants"
        :key="merchant.id"
        class="bg-white rounded-lg shadow p-4"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-sm">{{ merchant.name }}</h3>
            <p class="text-xs text-gray-500">{{ merchant.user?.name || "-" }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ merchant.phone }}</p>
          </div>
          <StatusLabel :status="merchant.status" />
        </div>

        <div class="flex gap-2 mt-3">
          <button
            @click="goToDetail(merchant)"
            class="flex-1 text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded"
          >
            Detail
          </button>
          <button
            v-if="merchant.status === 'pending'"
            @click="confirmApprove(merchant)"
            class="flex-1 text-xs bg-green-50 text-green-600 px-3 py-2 rounded"
          >
            Approve
          </button>
          <button
            v-if="merchant.status === 'pending'"
            @click="confirmReject(merchant)"
            class="flex-1 text-xs bg-red-50 text-red-600 px-3 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <ResponsiveModal
      :show="showApproveModal"
      @close="showApproveModal = false"
      title="Konfirmasi Approve"
    >
      <p class="text-sm text-gray-600 mb-4">
        Apakah Anda yakin ingin meng-approve merchant
        <strong>{{ selectedMerchant?.name }}</strong>?
      </p>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showApproveModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleApprove" variant="success">
            Approve
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Reject Modal -->
    <ResponsiveModal
      :show="showRejectModal"
      @close="showRejectModal = false"
      title="Konfirmasi Reject"
    >
      <p class="text-sm text-gray-600 mb-4">
        Mengapa Anda menolak merchant <strong>{{ selectedMerchant?.name }}</strong>?
      </p>
      <textarea
        v-model="rejectReason"
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Tulis alasan penolakan..."
      />
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showRejectModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleReject" variant="danger">
            Reject
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>