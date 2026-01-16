<template>
  <div v-if="voucher && !loading" class="p-4 sm:p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Voucher Header Card -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Header with gradient -->
        <div 
          :class=" [
            'relative p-6 mb-4',
            voucher.voucher_status === 'active' 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50/30'
              : 'bg-gradient-to-br from-slate-50 to-gray-50/30'
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4 flex-1">
              <div 
                :class=" [
                  'p-4 rounded-2xl',
                  voucher.voucher_status === 'active' 
                    ? 'bg-green-100'
                    : 'bg-slate-100'
                ]"
              >
                <i 
                  :class=" [
                    'pi pi-ticket text-3xl',
                    voucher.voucher_status === 'active' 
                      ? 'text-green-600'
                      : 'text-slate-600'
                  ]"
                ></i>
              </div>
              
              <div class="flex-1 min-w-0">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                  {{ voucher.voucher_name }}
                </h1>
                <p class="font-mono text-xl font-semibold text-merchant-primary mb-3">
                  {{ voucher.voucher_code }}
                </p>
                <StatusLabel 
                  :status="voucher.voucher_status" 
                  variant="voucher" 
                  size="md" 
                />
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2">
              <Button
                v-if="voucher.voucher_status !== 'expired'"
                @click="openStatusModal"
                :variant="voucher.voucher_status === 'active' ? 'secondary' : 'merchant'"
                size="md"
              >
                <i :class="voucher.voucher_status === 'active' ? 'pi pi-times mr-2' : 'pi pi-check mr-2'"></i>
                {{ voucher.voucher_status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Voucher Info Grid -->
        <div class="px-6 pb-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Tipe Voucher -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2 font-medium">Tipe Voucher</p>
              <div class="flex items-center gap-2">
                <i 
                  :class=" [
                    'pi text-lg',
                    voucher.voucher_type === 'percent' ? 'pi-percentage text-blue-600' : 'pi-money-bill text-green-600'
                  ]"
                ></i>
                <p class="text-lg font-bold text-gray-900">
                  {{ voucher.voucher_type === 'percent' ? 'Persentase' : 'Nominal' }}
                </p>
              </div>
            </div>

            <!-- Nilai -->
            <div class="bg-merchant-primary/5 border border-merchant-primary/20 rounded-xl p-4">
              <p class="text-xs text-merchant-primary/70 mb-2 font-medium">Nilai Diskon</p>
              <p class="text-2xl font-bold text-merchant-primary">
                {{ voucher.voucher_type === 'percent' 
                  ? voucher.value + '%' 
                  : formatCurrency(voucher.value) 
                }}
              </p>
            </div>

            <!-- Min Pembelian -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2 font-medium">Min. Pembelian</p>
              <p class="text-lg font-bold text-gray-900">
                {{ formatCurrency(voucher.min_purchase_amount || 0) }}
              </p>
            </div>

            <!-- Max Diskon -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2 font-medium">Max. Diskon</p>
              <p class="text-lg font-bold text-gray-900">
                {{ voucher.max_discount_amount ? formatCurrency(voucher.max_discount_amount) : 'Tidak Terbatas' }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="voucher.voucher_description" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Deskripsi</h3>
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ voucher.voucher_description }}
            </p>
          </div>

          <!-- Period & Usage -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Period -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-calendar text-blue-600"></i>
                <h3 class="text-sm font-semibold text-blue-900">Periode Berlaku</h3>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">Mulai:</span>
                  <span class="font-semibold text-gray-900">{{ formatDate(voucher.voucher_start_date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">Berakhir:</span>
                  <span class="font-semibold text-gray-900">{{ formatDate(voucher.voucher_end_date) }}</span>
                </div>
              </div>
            </div>

            <!-- Usage -->
            <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-3">
                <i class="pi pi-chart-bar text-purple-600"></i>
                <h3 class="text-sm font-semibold text-purple-900">Penggunaan</h3>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">Terpakai:</span>
                  <span class="font-semibold text-gray-900">{{ voucher.usages_count || 0 }} kali</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-600">Limit:</span>
                  <span class="font-semibold text-gray-900">
                    {{ voucher.usage_limit || '∞' }} kali
                  </span>
                </div>
                <div class="mt-2 pt-2 border-t border-purple-200">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-600">Progress:</span>
                    <span class="text-xs font-semibold text-purple-700">
                      {{ voucher.usage_limit 
                        ? Math.round((voucher.usages_count / voucher.usage_limit) * 100) 
                        : 0 
                      }}%
                    </span>
                  </div>
                  <div class="mt-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-purple-600 transition-all duration-300"
                      :style="{ 
                        width: voucher.usage_limit 
                          ? `${Math.min((voucher.usages_count / voucher.usage_limit) * 100, 100)}%` 
                          : '0%' 
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Info (if voucher is linked to event) -->
      <div v-if="voucher.event" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-calendar text-merchant-primary text-xl"></i>
          <h3 class="text-lg font-semibold text-gray-900">Event Terhubung</h3>
        </div>

        <div 
          @click="router.push({ name: 'Admin - Event Detail', params: { id: voucher.event.id } })"
          class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-merchant-primary/40 hover:shadow-lg cursor-pointer"
        >
          <!-- Banner -->
          <div class="relative w-full overflow-hidden bg-gray-100 aspect-[4/1]">
            <img
              v-if="voucher.event.banner_img_path"
              :src="getEventBannerUrl(voucher.event)"
              :alt="voucher.event.event_name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <i class="pi pi-calendar text-4xl text-gray-300"></i>
            </div>

            <!-- Status badge -->
            <div class="absolute left-4 top-4">
              <StatusLabel :status="voucher.event.status" variant="event" size="xs" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <h4 class="text-lg font-semibold text-gray-900 group-hover:text-merchant-primary transition">
                {{ voucher.event.event_name }}
              </h4>
              <i class="pi pi-arrow-up-right text-sm text-gray-400 transition group-hover:text-merchant-primary"></i>
            </div>

            <p class="mt-2 text-sm text-gray-600 line-clamp-2">
              {{ voucher.event.event_description || '-' }}
            </p>

            <!-- Date -->
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
              <i class="pi pi-calendar text-merchant-primary"></i>
              <span>{{ formatDate(voucher.event.event_start_date) }}</span>
              <span>-</span>
              <span>{{ formatDate(voucher.event.event_end_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Merchant Info (if voucher is linked to merchant) -->
      <div v-if="voucher.merchant" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-building text-merchant-primary text-xl"></i>
          <h3 class="text-lg font-semibold text-gray-900">Merchant</h3>
        </div>

        <div 
          @click="router.push({ name: 'Admin - Merchant Detail', params: { id: voucher.merchant.id } })"
          class="border border-gray-200 rounded-xl p-5 hover:border-merchant-primary hover:shadow-md transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-merchant-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                v-if="voucher.merchant.logo_path"
                :src="getMerchantLogoUrl(voucher.merchant)"
                alt="Logo"
                class="w-full h-full object-cover"
                @error="(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class='text-2xl font-bold text-merchant-primary'>${voucher.merchant.name?.charAt(0).toUpperCase()}</span>`; }"
              />
              <span v-else class="text-2xl font-bold text-merchant-primary">
                {{ voucher.merchant.name?.charAt(0).toUpperCase() }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 truncate group-hover:text-merchant-primary transition">
                {{ voucher.merchant.name }}
              </h4>
              <p class="text-sm text-gray-500 truncate">@{{ voucher.merchant.slug }}</p>
              <StatusLabel :status="voucher.merchant.status" variant="merchant" size="xs" class="mt-1" />
            </div>

            <i class="pi pi-arrow-right text-gray-400 group-hover:text-merchant-primary transition"></i>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900">Timeline</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <i class="pi pi-calendar-plus text-green-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">Dibuat</p>
              <p class="font-medium text-gray-900">{{ formatDateTime(voucher.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <i class="pi pi-clock text-blue-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">Terakhir Diupdate</p>
              <p class="font-medium text-gray-900">{{ formatDateTime(voucher.updated_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Toggle Modal -->
    <ResponsiveModal
      :show="showStatusModal"
      @close="closeStatusModal"
      :title="voucher.voucher_status === 'active' ? 'Nonaktifkan Voucher' : 'Aktifkan Voucher'"
    >
      <div class="space-y-4">
        <div 
          :class=" [
            'flex items-start gap-3 p-4 border rounded-xl',
            voucher.voucher_status === 'active'
              ? 'bg-warning-background/10 border-warning-foreground/20'
              : 'bg-green-50 border-green-200'
          ]"
        >
          <i 
            :class=" [
              'text-xl shrink-0 mt-0.5',
              voucher.voucher_status === 'active' 
                ? 'pi pi-exclamation-triangle text-warning-foreground'
                : 'pi pi-check-circle text-green-600'
            ]"
          ></i>
          <div>
            <h4 
              :class=" [
                'mb-1 text-sm font-semibold',
                voucher.voucher_status === 'active'
                  ? 'text-warning-foreground'
                  : 'text-green-700'
              ]"
            >
              {{ voucher.voucher_status === 'active' ? 'Perhatian!' : 'Konfirmasi Aktivasi' }}
            </h4>
            <p 
              :class=" [
                'text-xs',
                voucher.voucher_status === 'active'
                  ? 'text-warning-foreground/80'
                  : 'text-green-600'
              ]"
            >
              {{ voucher.voucher_status === 'active' 
                ? 'Voucher tidak akan dapat digunakan oleh customer setelah dinonaktifkan.' 
                : 'Voucher akan dapat digunakan oleh customer setelah diaktifkan.'
              }}
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          Apakah Anda yakin ingin 
          <strong>{{ voucher.voucher_status === 'active' ? 'menonaktifkan' : 'mengaktifkan' }}</strong> 
          voucher <strong class="font-mono">{{ voucher.voucher_code }}</strong>?
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="closeStatusModal" variant="secondary">
            Batal
          </Button>
          <Button 
            @click="toggleStatus" 
            :variant="voucher.voucher_status === 'active' ? 'danger' : 'merchant'"
            :loading="processingAction"
          >
            <i v-if="!processingAction" :class="voucher.voucher_status === 'active' ? 'pi pi-times mr-2' : 'pi pi-check mr-2'"></i>
            {{ voucher.voucher_status === 'active' ? 'Nonaktifkan' : 'Aktifkan' }}
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Export Modal -->
    <ResponsiveModal
      :show="showExportModal"
      @close="closeExportModal"
      title="Export Detail Voucher"
      subtitle="Unduh laporan detail voucher dalam format PDF"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-blue-600 text-xl mt-0.5"></i>
            <div class="flex-1">
              <p class="text-sm text-blue-900 font-medium mb-1">Laporan akan mencakup:</p>
              <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Informasi lengkap voucher (Kode, Nama, Tipe, Nilai)</li>
                <li>Periode berlaku dan status voucher</li>
                <li>Syarat dan ketentuan penggunaan</li>
                <li>Statistik penggunaan voucher</li>
                <li>Event dan merchant yang terhubung</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          @click="exportPDF"
          variant="merchant"
          size="lg"
          custom-class="w-full justify-center"
          :loading="exportLoading"
        >
          <i class="pi pi-download mr-2"></i>
          <span>Download Laporan PDF</span>
        </Button>
      </div>
    </ResponsiveModal>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center py-12">
    <div class="text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-merchant-primary mb-4"></i>
      <p class="text-gray-600">Memuat data voucher...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import { getEventBannerUrl, getMerchantLogoUrl } from "@/libs/getImageUrl";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const registerExportModal = inject('registerExportModal', null);

// State
const voucher = ref(null);
const loading = ref(true);
const showStatusModal = ref(false);
const processingAction = ref(false);
const showExportModal = ref(false);
const exportLoading = ref(false);

useBodyScrollLock(showStatusModal);
useBodyScrollLock(showExportModal);

// Load voucher detail
const loadVoucher = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/api/admin/vouchers/${route.params.id}`);
    voucher.value = res.data.data;
    console.log('Voucher loaded:', voucher.value);
  } catch (e) {
    console.error('Failed to load voucher:', e);
    toast.error("Gagal memuat detail voucher");
    router.push({ name: "Admin - Vouchers" });
  } finally {
    loading.value = false;
  }
};

// Format helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (e) {
    return '-';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '-';
  }
};

// Status toggle
const openStatusModal = () => {
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
};

const toggleStatus = async () => {
  processingAction.value = true;
  try {
    const endpoint = voucher.value.voucher_status === 'active' 
      ? `/api/admin/vouchers/${voucher.value.id}/deactivate`
      : `/api/admin/vouchers/${voucher.value.id}/activate`;
    
    await api.patch(endpoint);
    
    toast.success(
      voucher.value.voucher_status === 'active' 
        ? 'Voucher berhasil dinonaktifkan' 
        : 'Voucher berhasil diaktifkan'
    );
    
    closeStatusModal();
    await loadVoucher();
  } catch (error) {
    console.error('Toggle status failed:', error);
    toast.error(error.response?.data?.message || 'Gagal mengubah status voucher');
  } finally {
    processingAction.value = false;
  }
};

// Export methods
const openExportModal = () => {
  showExportModal.value = true;
};

const closeExportModal = () => {
  showExportModal.value = false;
};

const exportPDF = async () => {
  exportLoading.value = true;
  try {
    const response = await api.get(`/api/admin/vouchers/${route.params.id}/export-pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `voucher-detail-${route.params.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Laporan voucher detail berhasil diunduh");
    closeExportModal();
  } catch (error) {
    console.error("Export PDF failed:", error);
    toast.error(error.response?.data?.message || "Gagal mengunduh laporan");
  } finally {
    exportLoading.value = false;
  }
};

onMounted(async () => {
  await loadVoucher();
  
  if (typeof registerExportModal === 'function') {
    registerExportModal(openExportModal);
    console.log('Voucher Detail: Export callback registered');
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>