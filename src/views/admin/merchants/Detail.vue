<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useMerchants } from "@/composables/useMerchants";
import { getImageUrl } from "@/libs/getImageUrl";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const {
  fetchMerchantDetail,
  approveMerchant,
  rejectMerchant,
  loading,
} = useMerchants();

const merchant = ref(null);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref("");

const breadcrumbItems = computed(() => [
  { label: "Merchants", to: { name: "Admin - Merchants" } },
  { label: merchant.value?.name || "Detail Merchant" },
]);

const merchantLogoUrl = computed(() => {
  if (!merchant.value?.logo_path) return "/placeholder.png";
  return getImageUrl(merchant.value.logo_path);
});

// Load merchant detail
const loadMerchant = async () => {
  try {
    const data = await fetchMerchantDetail(route.params.id);
    merchant.value = data;
  } catch (error) {
    console.error("Failed to load merchant:", error);
    router.push({ name: "Admin - Merchants" });
  }
};

// Approval actions
const confirmApprove = () => {
  showApproveModal.value = true;
};

const confirmReject = () => {
  rejectReason.value = "";
  showRejectModal.value = true;
};

const handleApprove = async () => {
  try {
    await approveMerchant(merchant.value.id);
    showApproveModal.value = false;
    await loadMerchant(); // Refresh data
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
    await rejectMerchant(merchant.value.id, rejectReason.value);
    showRejectModal.value = false;
    await loadMerchant(); // Refresh data
  } catch (error) {
    console.error("Reject failed:", error);
  }
};

const goBack = () => router.push({ name: "Admin - Merchants" });

onMounted(() => {
  loadMerchant();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-primary">
          Detail Merchant
        </h1>
        <div class="flex gap-2">
          <Button @click="goBack" variant="secondary">
            <i class="pi pi-arrow-left mr-2"></i>
            Kembali
          </Button>
          <Button
            v-if="merchant?.status === 'pending'"
            @click="confirmApprove"
            variant="success"
          >
            <i class="pi pi-check mr-2"></i>
            Approve
          </Button>
          <Button
            v-if="merchant?.status === 'pending'"
            @click="confirmReject"
            variant="danger"
          >
            <i class="pi pi-times mr-2"></i>
            Reject
          </Button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 py-6" v-if="merchant">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Merchant Profile -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-col sm:flex-row gap-6">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <img
                :src="merchantLogoUrl"
                alt="Merchant logo"
                class="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
              />
            </div>

            <!-- Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-1">
                    {{ merchant.name }}
                  </h2>
                  <p class="text-gray-600">{{ merchant.slug }}</p>
                </div>
                <StatusLabel :status="merchant.status" />
              </div>

              <p class="text-gray-700 mb-4">
                {{ merchant.description || "Tidak ada deskripsi" }}
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-center gap-2">
                  <i class="pi pi-phone text-primary"></i>
                  <span>{{ merchant.phone || "-" }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-primary"></i>
                  <span>{{ merchant.user?.name || "-" }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-envelope text-primary"></i>
                  <span>{{ merchant.user?.email || "-" }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-tag text-primary"></i>
                  <span>{{ merchant.segmentation?.name || "-" }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Informasi Alamat</h3>
          <div class="space-y-3">
            <div v-if="merchant.address">
              <p class="text-sm text-gray-500">Alamat Lengkap</p>
              <p class="font-medium">{{ merchant.address.detail_address }}</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-if="merchant.address?.village">
                <p class="text-sm text-gray-500">Kelurahan/Desa</p>
                <p class="font-medium">{{ merchant.address.village.name }}</p>
              </div>
              <div v-if="merchant.address?.village?.district">
                <p class="text-sm text-gray-500">Kecamatan</p>
                <p class="font-medium">{{ merchant.address.village.district.name }}</p>
              </div>
              <div v-if="merchant.address?.village?.district?.regency">
                <p class="text-sm text-gray-500">Kabupaten/Kota</p>
                <p class="font-medium">
                  {{ merchant.address.village.district.regency.name }}
                </p>
              </div>
              <div v-if="merchant.address?.village?.district?.regency?.province">
                <p class="text-sm text-gray-500">Provinsi</p>
                <p class="font-medium">
                  {{ merchant.address.village.district.regency.province.name }}
                </p>
              </div>
            </div>
            <div
              v-if="merchant.address?.latitude && merchant.address?.longitude"
              class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <p class="text-sm text-gray-500">Latitude</p>
                <p class="font-medium">{{ merchant.address.latitude }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Longitude</p>
                <p class="font-medium">{{ merchant.address.longitude }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Info -->
        <div
          v-if="merchant.status !== 'pending'"
          class="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 class="text-lg font-semibold mb-4">Informasi Verifikasi</h3>
          <div class="space-y-3">
            <div v-if="merchant.reviewed_by_user">
              <p class="text-sm text-gray-500">Direview oleh</p>
              <p class="font-medium">{{ merchant.reviewed_by_user.name }}</p>
            </div>
            <div v-if="merchant.reviewed_at">
              <p class="text-sm text-gray-500">Tanggal Review</p>
              <p class="font-medium">
                {{ new Date(merchant.reviewed_at).toLocaleString("id-ID") }}
              </p>
            </div>
            <div v-if="merchant.rejection_reason">
              <p class="text-sm text-gray-500">Alasan Penolakan</p>
              <div
                class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                {{ merchant.rejection_reason }}
              </div>
            </div>
          </div>
        </div>

        <!-- Products Summary -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Ringkasan Produk</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-3xl font-bold text-blue-600">
                {{ merchant.products_count || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">Total Produk</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-3xl font-bold text-green-600">
                {{ merchant.active_products_count || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">Produk Aktif</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-3xl font-bold text-yellow-600">
                {{ merchant.vouchers_count || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">Voucher</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-3xl font-bold text-purple-600">
                {{ merchant.events_count || 0 }}
              </p>
              <p class="text-sm text-gray-600 mt-1">Event</p>
            </div>
          </div>
        </div>

        <!-- Registration Info -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Informasi Pendaftaran</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Tanggal Daftar</p>
              <p class="font-medium">
                {{ new Date(merchant.created_at).toLocaleString("id-ID") }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Terakhir Diupdate</p>
              <p class="font-medium">
                {{ new Date(merchant.updated_at).toLocaleString("id-ID") }}
              </p>
            </div>
            <div v-if="merchant.paguyuban">
              <p class="text-sm text-gray-500">Paguyuban</p>
              <p class="font-medium">{{ merchant.paguyuban.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
        <p class="text-gray-600">Memuat data merchant...</p>
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
        <strong>{{ merchant?.name }}</strong>?
      </p>
      <p class="text-xs text-gray-500">
        Merchant akan dapat mengakses dashboard dan mengelola produk mereka.
      </p>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showApproveModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleApprove" variant="success" :disabled="loading">
            <i class="pi pi-check mr-2"></i>
            {{ loading ? "Memproses..." : "Approve" }}
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
        Mengapa Anda menolak merchant <strong>{{ merchant?.name }}</strong>?
      </p>
      <textarea
        v-model="rejectReason"
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Tulis alasan penolakan (wajib diisi)..."
      />
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showRejectModal = false" variant="secondary">
            Batal
          </Button>
          <Button
            @click="handleReject"
            variant="danger"
            :disabled="loading || !rejectReason.trim()"
          >
            <i class="pi pi-times mr-2"></i>
            {{ loading ? "Memproses..." : "Reject" }}
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>