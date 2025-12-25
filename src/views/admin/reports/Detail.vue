<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useReports } from "@/composables/useReports";
import { getImageUrl } from "@/libs/getImageUrl";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { fetchReportDetail, reviewReport, loading } = useReports();

const report = ref(null);
const showResolveModal = ref(false);
const showDismissModal = ref(false);
const adminNote = ref("");

const breadcrumbItems = computed(() => [
  { label: "Reports", to: { name: "Admin - Reports" } },
  { label: `Report #${route.params.id}` },
]);

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

// Load report detail
const loadReport = async () => {
  try {
    const data = await fetchReportDetail(route.params.id);
    report.value = data;
  } catch (error) {
    console.error("Failed to load report:", error);
    router.push({ name: "Admin - Reports" });
  }
};

// Review actions
const confirmResolve = () => {
  adminNote.value = "";
  showResolveModal.value = true;
};

const confirmDismiss = () => {
  adminNote.value = "";
  showDismissModal.value = true;
};

const handleResolve = async () => {
  try {
    await reviewReport(report.value.id, {
      status: "resolved",
      admin_note: adminNote.value || "Laporan telah ditindaklanjuti",
    });
    showResolveModal.value = false;
    await loadReport(); // Refresh data
  } catch (error) {
    console.error("Resolve failed:", error);
  }
};

const handleDismiss = async () => {
  if (!adminNote.value.trim()) {
    toast.warning("Catatan admin wajib diisi untuk dismiss");
    return;
  }

  try {
    await reviewReport(report.value.id, {
      status: "dismissed",
      admin_note: adminNote.value,
    });
    showDismissModal.value = false;
    await loadReport(); // Refresh data
  } catch (error) {
    console.error("Dismiss failed:", error);
  }
};

const handleInReview = async () => {
  try {
    await reviewReport(report.value.id, {
      status: "in_review",
    });
    await loadReport(); // Refresh data
  } catch (error) {
    console.error("In review failed:", error);
  }
};

const goBack = () => router.push({ name: "Admin - Reports" });

onMounted(() => {
  loadReport();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-primary">
          Detail Laporan
        </h1>
        <div class="flex gap-2">
          <Button @click="goBack" variant="secondary">
            <i class="pi pi-arrow-left mr-2"></i>
            Kembali
          </Button>
          <Button
            v-if="report?.status === 'pending'"
            @click="handleInReview"
            variant="warning"
            :disabled="loading"
          >
            <i class="pi pi-clock mr-2"></i>
            In Review
          </Button>
          <Button
            v-if="['pending', 'in_review'].includes(report?.status)"
            @click="confirmResolve"
            variant="success"
          >
            <i class="pi pi-check mr-2"></i>
            Resolve
          </Button>
          <Button
            v-if="['pending', 'in_review'].includes(report?.status)"
            @click="confirmDismiss"
            variant="danger"
          >
            <i class="pi pi-times mr-2"></i>
            Dismiss
          </Button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 sm:px-6 py-6" v-if="report">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Report Info -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">
                Laporan #{{ report.id }}
              </h2>
              <div class="flex items-center gap-3 text-sm text-gray-600">
                <span>
                  <i class="pi pi-user mr-1"></i>
                  {{ report.reporter?.name || "-" }}
                </span>
                <span>
                  <i class="pi pi-calendar mr-1"></i>
                  {{ new Date(report.created_at).toLocaleString("id-ID") }}
                </span>
              </div>
            </div>
            <StatusLabel :status="report.status" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <p class="text-sm text-gray-500 mb-1">Tipe Konten</p>
              <p class="font-medium">
                {{ getContentTypeLabel(report.reportable_type) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Alasan Laporan</p>
              <p class="font-medium">{{ report.report_reason?.reason || "-" }}</p>
            </div>
          </div>

          <div v-if="report.comment" class="mt-4">
            <p class="text-sm text-gray-500 mb-1">Komentar Pelapor</p>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-700">{{ report.comment }}</p>
            </div>
          </div>
        </div>

        <!-- Reported Content -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Konten yang Dilaporkan</h3>

          <!-- Product -->
          <div v-if="report.reportable_type === 'App\\Models\\Product' && report.reportable">
            <div class="flex gap-4">
              <img
                :src="getImageUrl(report.reportable.images?.[0]?.img_path)"
                alt="Product"
                class="w-24 h-24 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-lg">{{ report.reportable.product_name }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ report.reportable.product_description }}
                </p>
                <p class="text-primary font-bold mt-2">
                  Rp {{ Number(report.reportable.price).toLocaleString() }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Merchant: {{ report.reportable.merchant?.name || "-" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Post -->
          <div v-else-if="report.reportable_type === 'App\\Models\\Post' && report.reportable">
            <div class="border rounded-lg p-4">
              <div class="flex items-center gap-3 mb-3">
                <img
                  :src="report.reportable.user?.profile_picture || '/placeholder.png'"
                  alt="User"
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <p class="font-semibold">{{ report.reportable.user?.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(report.reportable.created_at).toLocaleString("id-ID") }}
                  </p>
                </div>
              </div>
              <p class="text-gray-700">{{ report.reportable.content }}</p>
              <div v-if="report.reportable.images?.length" class="grid grid-cols-3 gap-2 mt-3">
                <img
                  v-for="(img, idx) in report.reportable.images"
                  :key="idx"
                  :src="getImageUrl(img.img_path)"
                  alt="Post image"
                  class="w-full h-24 object-cover rounded"
                />
              </div>
            </div>
          </div>

          <!-- Comment -->
          <div v-else-if="report.reportable_type === 'App\\Models\\Comment' && report.reportable">
            <div class="border rounded-lg p-4">
              <div class="flex items-center gap-3 mb-2">
                <img
                  :src="report.reportable.user?.profile_picture || '/placeholder.png'"
                  alt="User"
                  class="w-8 h-8 rounded-full"
                />
                <div>
                  <p class="font-semibold text-sm">{{ report.reportable.user?.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(report.reportable.created_at).toLocaleString("id-ID") }}
                  </p>
                </div>
              </div>
              <p class="text-gray-700">{{ report.reportable.content }}</p>
            </div>
          </div>

          <!-- Merchant -->
          <div v-else-if="report.reportable_type === 'App\\Models\\Merchant' && report.reportable">
            <div class="flex gap-4">
              <img
                :src="getImageUrl(report.reportable.logo_path)"
                alt="Merchant logo"
                class="w-24 h-24 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-lg">{{ report.reportable.name }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ report.reportable.description }}</p>
                <p class="text-xs text-gray-500 mt-2">
                  Owner: {{ report.reportable.user?.name || "-" }}
                </p>
              </div>
            </div>
          </div>

          <!-- Service -->
          <div v-else-if="report.reportable_type === 'App\\Models\\Service' && report.reportable">
            <div class="flex gap-4">
              <img
                :src="getImageUrl(report.reportable.images?.[0]?.img_path)"
                alt="Service"
                class="w-24 h-24 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-lg">{{ report.reportable.service_name }}</h4>
                <p class="text-sm text-gray-600 mt-1">
                  {{ report.reportable.service_description }}
                </p>
                <p class="text-primary font-bold mt-2">
                  Rp {{ Number(report.reportable.price).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <!-- Fallback -->
          <div v-else class="text-center py-8 text-gray-500">
            <i class="pi pi-exclamation-triangle text-4xl mb-2"></i>
            <p>Konten tidak ditemukan atau telah dihapus</p>
          </div>
        </div>

        <!-- Review History -->
        <div v-if="report.reviewed_by_user || report.admin_note" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">Riwayat Review</h3>
          <div class="space-y-3">
            <div v-if="report.reviewed_by_user">
              <p class="text-sm text-gray-500">Direview oleh</p>
              <p class="font-medium">{{ report.reviewed_by_user.name }}</p>
            </div>
            <div v-if="report.reviewed_at">
              <p class="text-sm text-gray-500">Tanggal Review</p>
              <p class="font-medium">
                {{ new Date(report.reviewed_at).toLocaleString("id-ID") }}
              </p>
            </div>
            <div v-if="report.admin_note">
              <p class="text-sm text-gray-500">Catatan Admin</p>
              <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                {{ report.admin_note }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
        <p class="text-gray-600">Memuat data laporan...</p>
      </div>
    </div>

    <!-- Resolve Modal -->
    <ResponsiveModal
      :show="showResolveModal"
      @close="showResolveModal = false"
      title="Resolve Laporan"
    >
      <p class="text-sm text-gray-600 mb-4">
        Apakah Anda yakin ingin menandai laporan ini sebagai <strong>Resolved</strong>?
      </p>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Catatan Admin (Opsional)
        </label>
        <textarea
          v-model="adminNote"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Tulis catatan tentang tindakan yang diambil..."
        />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showResolveModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleResolve" variant="success" :disabled="loading">
            <i class="pi pi-check mr-2"></i>
            {{ loading ? "Memproses..." : "Resolve" }}
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Dismiss Modal -->
    <ResponsiveModal
      :show="showDismissModal"
      @close="showDismissModal = false"
      title="Dismiss Laporan"
    >
      <p class="text-sm text-gray-600 mb-4">
        Mengapa Anda menolak laporan ini? Catatan wajib diisi.
      </p>
      <textarea
        v-model="adminNote"
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        placeholder="Jelaskan alasan dismiss (wajib diisi)..."
      />
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showDismissModal = false" variant="secondary">
            Batal
          </Button>
          <Button
            @click="handleDismiss"
            variant="danger"
            :disabled="loading || !adminNote.trim()"
          >
            <i class="pi pi-times mr-2"></i>
            {{ loading ? "Memproses..." : "Dismiss" }}
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>