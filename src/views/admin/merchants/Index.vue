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
      <h1 class="text-xl sm:text-2xl font-bold text-admin-primary mt-4">
        Merchant Management
      </h1>
    </div>

    <!-- Filters -->
    <div class="px-4 sm:px-6 py-4">
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="searchQuery"
            placeholder="Nama merchant atau pemilik..."
            class="w-full px-4 py-2 border rounded-lg"
          />
          <select v-model="statusFilter" class="w-full px-4 py-2 border rounded-lg">
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- ✅ Desktop Table -->
      <div class="hidden sm:block">
        <MerchantTable
          :items="merchants"
          :columns="tableColumns"
          :loading="loading"
          :current-page="currentPage"
          :total-pages="pagination.last_page"
          :pagination-info="paginationInfo"
          :show-checkbox="false"
          empty-message="Tidak ada merchant yang sesuai dengan filter"
          @row-click="goToDetail"
          @page-change="goToPage"
          @next-page="nextPage"
          @prev-page="prevPage"
        >
          <!-- Custom cells -->
        </MerchantTable>
      </div>

      <!-- ✅ Mobile Cards -->
      <div class="sm:hidden">
        <div v-if="loading" class="flex justify-center py-12">
          <i class="pi pi-spin pi-spinner text-4xl text-admin-primary"></i>
        </div>

        <div v-else-if="merchants.length === 0" class="text-center py-12">
          <i class="pi pi-building text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Tidak ada merchant</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Cards -->
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