<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import TextField from "@/components/forms/TextField.vue";
import { useEvents } from "@/composables/useEvents";
import { useEventVouchers } from "@/composables/useEventVouchers";
import { useEventMerchants } from "@/composables/useEventMerchants";
import { getImageUrl } from "@/libs/getImageUrl";
import api from "@/libs/axios";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { fetchEventDetail, deleteEvent, inviteMerchants, loading } = useEvents();
const { 
  availableVouchers, 
  fetchAvailableVouchers, 
  attachVouchersToEvent, 
  detachVoucherFromEvent,
  loading: voucherLoading 
} = useEventVouchers();
const { 
  removeMerchantFromEvent, 
  restoreMerchantToEvent, 
  fetchRemovedMerchants,
  loading: merchantLoading 
} = useEventMerchants();

const event = ref(null);
const merchants = ref([]);
const selectedMerchants = ref([]);
const showInviteModal = ref(false);
const showDeleteModal = ref(false);
const loadingMerchants = ref(false);

// Multiple voucher selection
const showAddVoucherModal = ref(false);
const selectedVoucherIds = ref([]);
const searchVoucherQuery = ref("");
const filterVoucherType = ref("");
const showDeleteVoucherModal = ref(false);
const voucherToDelete = ref(null);

// Removed merchants state
const showRemoveMerchantModal = ref(false);
const merchantToRemove = ref(null);
const removalReason = ref("");
const showRemovedMerchantsModal = ref(false);
const removedMerchants = ref([]);

const breadcrumbItems = computed(() => [
  { label: "Events", to: { name: "Admin - Events" } },
  { label: event.value?.event_name || "Detail Event" },
]);

const eventBannerUrl = computed(() => {
  if (!event.value?.banner_img_path) return "/placeholder.png";
  return getImageUrl(event.value.banner_img_path);
});

const availableMerchants = computed(() => {
  const invitedIds = event.value?.merchants?.map((m) => m.id) || [];
  return merchants.value.filter((m) => !invitedIds.includes(m.id));
});

const activeMerchants = computed(() => {
  return event.value?.merchants?.filter(m => m.pivot?.status === 'accepted') || [];
});

const removedMerchantsCount = computed(() => {
  return event.value?.merchants?.filter(m => m.pivot?.status === 'removed').length || 0;
});

// Filtered vouchers
const filteredVouchers = computed(() => {
  let filtered = availableVouchers.value;

  // Search filter
  if (searchVoucherQuery.value) {
    const query = searchVoucherQuery.value.toLowerCase();
    filtered = filtered.filter(v => 
      v.voucher_code.toLowerCase().includes(query) ||
      v.voucher_description?.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filterVoucherType.value) {
    filtered = filtered.filter(v => v.voucher_type === filterVoucherType.value);
  }

  return filtered;
});

// Selected vouchers count
const selectedVouchersCount = computed(() => selectedVoucherIds.value.length);

// Check if voucher is selected
const isVoucherSelected = (voucherId) => {
  return selectedVoucherIds.value.includes(voucherId);
};

// Toggle voucher selection
const toggleVoucherSelection = (voucherId) => {
  const index = selectedVoucherIds.value.indexOf(voucherId);
  if (index > -1) {
    selectedVoucherIds.value.splice(index, 1);
  } else {
    selectedVoucherIds.value.push(voucherId);
  }
};

// Select all vouchers
const selectAllVouchers = () => {
  if (selectedVoucherIds.value.length === filteredVouchers.value.length) {
    selectedVoucherIds.value = [];
  } else {
    selectedVoucherIds.value = filteredVouchers.value.map(v => v.id);
  }
};

// Clear selection
const clearSelection = () => {
  selectedVoucherIds.value = [];
};

// Load event detail
const loadEvent = async () => {
  try {
    const data = await fetchEventDetail(route.params.id);
    event.value = data;
  } catch (error) {
    console.error("Failed to load event:", error);
    router.push({ name: "Admin - Events" });
  }
};

// Load merchants for invitation
const loadMerchants = async () => {
  loadingMerchants.value = true;
  try {
    const response = await api.get("/api/public/merchants");
    merchants.value = response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to load merchants:", error);
    toast.error("Gagal memuat data merchant");
  } finally {
    loadingMerchants.value = false;
  }
};

// Toggle merchant selection
const toggleMerchant = (merchantId) => {
  const index = selectedMerchants.value.indexOf(merchantId);
  if (index > -1) {
    selectedMerchants.value.splice(index, 1);
  } else {
    selectedMerchants.value.push(merchantId);
  }
};

// Submit invitation
const handleInvite = async () => {
  if (selectedMerchants.value.length === 0) {
    toast.warning("Pilih minimal 1 merchant");
    return;
  }

  try {
    await inviteMerchants(event.value.id, selectedMerchants.value);
    showInviteModal.value = false;
    selectedMerchants.value = [];
    await loadEvent();
  } catch (error) {
    console.error("Invite failed:", error);
  }
};

const segmentationMap = {
  1: "UMKM Toko",
  2: "UMKM Kuliner",
  3: "UMKM Jasa",
};

// Delete event
const confirmDelete = () => {
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    await deleteEvent(event.value.id);
    router.push({ name: "Admin - Events" });
  } catch (error) {
    console.error("Delete failed:", error);
  }
};

const goToEdit = () => {
  router.push({
    name: "Admin - Edit Event",
    params: { id: event.value.id },
  });
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

const goBack = () => router.push({ name: "Admin - Events" });

// Open modal and reset
const openAddVoucherModal = async () => {
  try {
    selectedVoucherIds.value = [];
    searchVoucherQuery.value = "";
    filterVoucherType.value = "";
    await fetchAvailableVouchers();
    showAddVoucherModal.value = true;
  } catch (error) {
    console.error("Failed to load vouchers:", error);
  }
};

// Handle add multiple vouchers
const handleAddVouchers = async () => {
  if (selectedVoucherIds.value.length === 0) {
    toast.warning("Pilih minimal 1 voucher");
    return;
  }

  try {
    await attachVouchersToEvent(event.value.id, selectedVoucherIds.value);
    showAddVoucherModal.value = false;
    selectedVoucherIds.value = [];
    await loadEvent();
  } catch (error) {
    console.error("Add vouchers failed:", error);
  }
};

// Confirm delete voucher
const confirmDeleteVoucher = (voucher) => {
  voucherToDelete.value = voucher;
  showDeleteVoucherModal.value = true;
};

// Delete voucher from event
const handleDeleteVoucher = async () => {
  if (!voucherToDelete.value) return;

  try {
    await detachVoucherFromEvent(event.value.id, voucherToDelete.value.id);
    showDeleteVoucherModal.value = false;
    voucherToDelete.value = null;
    await loadEvent();
  } catch (error) {
    console.error("Delete voucher failed:", error);
  }
};

// Confirm remove merchant
const confirmRemoveMerchant = (merchant) => {
  merchantToRemove.value = merchant;
  removalReason.value = "";
  showRemoveMerchantModal.value = true;
};

// Handle remove merchant
const handleRemoveMerchant = async () => {
  if (!removalReason.value.trim()) {
    toast.warning("Alasan penghapusan wajib diisi");
    return;
  }

  try {
    await removeMerchantFromEvent(
      event.value.id,
      merchantToRemove.value.id,
      removalReason.value
    );
    showRemoveMerchantModal.value = false;
    merchantToRemove.value = null;
    removalReason.value = "";
    await loadEvent();
  } catch (error) {
    console.error("Remove merchant failed:", error);
  }
};

// View removed merchants
const viewRemovedMerchants = async () => {
  try {
    removedMerchants.value = await fetchRemovedMerchants(event.value.id);
    showRemovedMerchantsModal.value = true;
  } catch (error) {
    console.error("Fetch removed merchants failed:", error);
  }
};

// Restore merchant
const handleRestoreMerchant = async (merchantId) => {
  try {
    await restoreMerchantToEvent(event.value.id, merchantId);
    await viewRemovedMerchants(); // Refresh list
    await loadEvent(); // Refresh main data
  } catch (error) {
    console.error("Restore merchant failed:", error);
  }
};

const searchMerchantQuery = ref("");
const filterSegmentation = ref("");

const filteredAvailableMerchants = computed(() => {
  let filtered = availableMerchants.value;

  // Search filter
  if (searchMerchantQuery.value) {
    const query = searchMerchantQuery.value.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.slug.toLowerCase().includes(query)
    );
  }

  // Segmentation filter
  if (filterSegmentation.value) {
    filtered = filtered.filter(m => m.segmentation_id === parseInt(filterSegmentation.value));
  }

  return filtered;
});

const selectedMerchantsCount = computed(() => selectedMerchants.value.length);

const isMerchantSelected = (merchantId) => {
  return selectedMerchants.value.includes(merchantId);
};


const selectAllMerchants = () => {
  if (selectedMerchants.value.length === filteredAvailableMerchants.value.length) {
    selectedMerchants.value = [];
  } else {
    selectedMerchants.value = filteredAvailableMerchants.value.map(m => m.id);
  }
};

const clearMerchantSelection = () => {
  selectedMerchants.value = [];
};

const openInviteModal = () => {
  selectedMerchants.value = [];
  searchMerchantQuery.value = "";
  filterSegmentation.value = "";
  showInviteModal.value = true;
};

onMounted(async () => {
  await loadEvent();
  await loadMerchants();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Content -->
    <div class="px-4 sm:px-6 py-6" v-if="event">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Banner & Basic Info -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            :src="eventBannerUrl"
            alt="Event banner"
            class="w-full h-64 object-cover"
          />
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ event.event_name }}
                </h2>
                <p class="text-gray-600">{{ event.event_description }}</p>
              </div>
              <StatusLabel :status="event.status" variant="event"/>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div class="flex items-center gap-3">
                <i class="pi pi-calendar text-merchant-primary"></i>
                <div>
                  <p class="text-sm text-gray-500">Tanggal Mulai</p>
                  <p class="font-medium">{{ formatDate(event.event_start_date) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <i class="pi pi-calendar-times text-merchant-primary"></i>
                <div>
                  <p class="text-sm text-gray-500">Tanggal Selesai</p>
                  <p class="font-medium">{{ formatDate(event.event_end_date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vouchers Section -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Voucher Event
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ event.vouchers?.length || 0 }} voucher terdaftar
              </p>
            </div>
            <Button 
              @click="openAddVoucherModal" 
              variant="merchant"
              size="sm"
            >
              <i class="pi pi-plus mr-2"></i>
              Tambah Voucher
            </Button>
          </div>

          <div v-if="event.vouchers && event.vouchers.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="voucher in event.vouchers"
                :key="voucher.id"
                class="border border-gray-200 rounded-xl p-5 hover:border-merchant-primary hover:shadow-md transition-all group"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="p-2 bg-merchant-primary/10 rounded-lg">
                        <i class="pi pi-ticket text-merchant-primary text-lg"></i>
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900">{{ voucher.voucher_code }}</h4>
                        <StatusLabel :status="voucher.voucher_status" variant="voucher" size="xs" />
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    @click="confirmDeleteVoucher(voucher)"
                    variant="danger-outline"
                    size="sm"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i class="pi pi-trash"></i>
                  </Button>
                </div>
                
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">
                  {{ voucher.voucher_description || 'Tidak ada deskripsi' }}
                </p>
                
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Tipe</p>
                    <p class="text-sm font-medium text-gray-900">
                      {{ voucher.voucher_type === 'percent' ? 'Persentase' : 'Nominal' }}
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Nilai</p>
                    <p class="text-sm font-medium text-merchant-primary">
                      {{ voucher.voucher_type === 'percent' ? voucher.value + '%' : formatCurrency(voucher.value) }}
                    </p>
                  </div>
                </div>

                <div class="pt-3 border-t border-gray-100">
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <i class="pi pi-shopping-cart"></i>
                      Min: {{ formatCurrency(voucher.min_purchase_amount || 0) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-users"></i>
                      {{ voucher.merchants_voucher_count || 0 }} Merchant
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <i class="pi pi-calendar"></i>
                    <span>{{ formatDate(voucher.voucher_start_date) }}</span>
                    <span>-</span>
                    <span>{{ formatDate(voucher.voucher_end_date) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-ticket text-3xl text-gray-400"></i>
            </div>
            <p class="text-gray-600 font-medium mb-2">Belum ada voucher</p>
            <p class="text-sm text-gray-500 mb-4">
              Tambahkan voucher untuk event ini
            </p>
            <Button 
              @click="openAddVoucherModal" 
              variant="merchant"
              size="sm"
            >
              <i class="pi pi-plus mr-2"></i>
              Tambah Voucher
            </Button>
          </div>
        </div>
        
        <!-- Participating Merchants Section -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                Merchant Terdaftar
              </h3>
              <div class="flex items-center gap-4 mt-1">
                <p class="text-sm text-gray-500">
                  {{ activeMerchants.length }} merchant aktif
                </p>
                <button
                  v-if="removedMerchantsCount > 0"
                  @click="viewRemovedMerchants"
                  class="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <i class="pi pi-history text-xs"></i>
                  {{ removedMerchantsCount }} dikeluarkan
                </button>
              </div>
            </div>
            <!-- openInviteModal -->
            <Button @click="openInviteModal" variant="merchant" size="sm">
              <i class="pi pi-plus mr-2"></i>
              Undang Merchant
            </Button>
          </div>

          <!-- Active Merchants Grid -->
          <div v-if="activeMerchants.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="merchant in activeMerchants"
                :key="merchant.id"
                class="border border-gray-200 rounded-xl p-5 hover:border-merchant-primary hover:shadow-md transition-all group"
              >
                <!-- Header with Logo, Status, and Delete Button -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3 flex-1">
                    <div class="relative">
                      <img
                        :src="merchant.logo_url || merchant.logo_path || '/placeholder.png'"
                        alt="Merchant logo"
                        class="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h4 class="font-semibold text-gray-900 truncate mb-1" :title="merchant.name">
                        {{ merchant.name }}
                      </h4>
                      <p class="text-xs text-gray-500 truncate" :title="merchant.slug">
                        @{{ merchant.slug }}
                      </p>
                      <StatusLabel :status="merchant.pivot.status" variant="merchant" size="xs" class="mt-1" />
                    </div>
                  </div>
                  
                  <!-- Delete Button (like voucher) -->
                  <Button
                    @click="confirmRemoveMerchant(merchant)"
                    variant="danger-outline"
                    size="sm"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i class="pi pi-trash"></i>
                  </Button>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Segmentasi</p>
                    <div class="flex items-center gap-1">
                      <i class="pi pi-tag text-xs text-merchant-primary"></i>
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ segmentationMap[merchant.segmentation_id] || 'N/A' }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs text-gray-500 mb-1">Paguyuban</p>
                    <div class="flex items-center gap-1">
                      <i class="pi pi-users text-xs text-merchant-primary"></i>
                      <p class="text-sm font-medium text-gray-900 truncate" :title="merchant.paguyuban?.name">
                        {{ merchant.paguyuban?.name || 'Tidak ada' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Contact Info -->
                <div v-if="merchant.phone" class="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <i class="pi pi-phone"></i>
                  <span>{{ merchant.phone }}</span>
                </div>

                <!-- Stats Bar -->
                <div class="pt-3 border-t border-gray-100 mb-3">
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <i class="pi pi-box"></i>
                      {{ merchant.products_count || merchant.products?.length || 0 }} Produk
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-ticket"></i>
                      {{ merchant.vouchers_count || 0 }} Voucher
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-star-fill text-yellow-500"></i>
                      {{ merchant.rating || '4.5' }}
                    </span>
                  </div>
                </div>

                <!-- Detail Button (full width, always visible) -->
                <Button
                  @click="router.push({ name: 'Admin - Merchant Detail', params: { id: merchant.id } })"
                  variant="merchant-outline"
                  size="sm"
                  block
                >
                  <i class="pi pi-eye mr-2"></i>
                  Lihat Detail Merchant
                </Button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-users text-3xl text-gray-400"></i>
            </div>
            <p class="text-gray-600 font-medium mb-2">Belum ada merchant terdaftar</p>
            <p class="text-sm text-gray-500 mb-4">
              Undang merchant untuk berpartisipasi di event ini
            </p>
            <Button 
              @click="showInviteModal = true" 
              variant="merchant"
              size="sm"
            >
              <i class="pi pi-plus mr-2"></i>
              Undang Merchant
            </Button>
          </div>
        </div>


      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-merchant-primary mb-4"></i>
        <p class="text-gray-600">Memuat data event...</p>
      </div>
    </div>

    <!-- Invite Modal -->
    <ResponsiveModal
      variant="merchant"
      :show="showInviteModal"
      @close="showInviteModal = false"
      title="Undang Merchant ke Event"
      size="xl"
    >
      <div class="space-y-4">
        <!-- Info Banner -->
        <div class="bg-merchant-primary/5 border border-merchant-primary/20 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-merchant-primary text-lg mt-0.5"></i>
            <div class="flex-1">
              <p class="text-sm font-medium text-merchant-primary mb-1">
                Pilih satu atau lebih merchant
              </p>
              <p class="text-xs text-gray-600">
                Merchant yang dipilih akan menerima undangan untuk berpartisipasi di event ini.
              </p>
            </div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <TextField
              v-model="searchMerchantQuery"
              placeholder="Cari nama atau slug merchant..."
              :icon="'pi-search'"
            />
          </div>
          <select
            v-model="filterSegmentation"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merchant-primary focus:border-merchant-primary"
          >
            <option value="">Semua Segmentasi</option>
            <option value="1">UMKM Toko</option>
            <option value="2">UMKM Kuliner</option>
            <option value="3">UMKM Jasa</option>
          </select>
        </div>

        <!-- Selection Actions -->
        <div v-if="filteredAvailableMerchants.length > 0" class="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="selectedMerchantsCount === filteredAvailableMerchants.length && filteredAvailableMerchants.length > 0"
                @change="selectAllMerchants"
                class="w-4 h-4 rounded border-gray-300 text-merchant-primary focus:ring-merchant-primary"
              />
              <span class="text-sm font-medium text-gray-700">
                Pilih Semua
              </span>
            </label>
            
            <div v-if="selectedMerchantsCount > 0" class="text-sm text-merchant-primary font-medium">
              {{ selectedMerchantsCount }} merchant dipilih
            </div>
          </div>

          <button
            v-if="selectedMerchantsCount > 0"
            @click="clearMerchantSelection"
            class="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Hapus Pilihan
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingMerchants" class="text-center py-12">
          <i class="pi pi-spin pi-spinner text-3xl text-merchant-primary mb-3"></i>
          <p class="text-sm text-gray-600">Memuat merchant...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAvailableMerchants.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-users text-3xl text-gray-400"></i>
          </div>
          <p class="text-gray-600 font-medium mb-2">
            {{ searchMerchantQuery || filterSegmentation ? 'Tidak ada merchant yang sesuai' : 'Semua merchant sudah diundang' }}
          </p>
          <p class="text-sm text-gray-500">
            {{ searchMerchantQuery || filterSegmentation ? 'Coba ubah filter pencarian' : 'Tidak ada merchant lain yang tersedia' }}
          </p>
        </div>

        <!-- Merchant List -->
        <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-2">
          <label
            v-for="merchant in filteredAvailableMerchants"
            :key="merchant.id"
            class="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
            :class="[
              isMerchantSelected(merchant.id)
                ? 'border-merchant-primary bg-merchant-primary/5'
                : 'border-gray-200 hover:border-merchant-primary/50'
            ]"
          >
            <input
              type="checkbox"
              :checked="isMerchantSelected(merchant.id)"
              @change="toggleMerchant(merchant.id)"
              class="mt-1 w-5 h-5 rounded border-gray-300 text-merchant-primary focus:ring-merchant-primary"
            />
            
            <div class="flex-1 min-w-0">
              <!-- Header -->
              <div class="flex items-start gap-3 mb-3">
                <img
                  :src="merchant.logo_url || merchant.logo_path || '/placeholder.png'"
                  alt="Logo"
                  class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 truncate" :title="merchant.name">
                    {{ merchant.name }}
                  </h4>
                  <p class="text-sm text-gray-500 truncate" :title="merchant.slug">
                    @{{ merchant.slug }}
                  </p>
                  <StatusLabel 
                    :status="segmentationMap[merchant.segmentation_id]?.toLowerCase().replace(/\s/g, '_')" 
                    :label="segmentationMap[merchant.segmentation_id]"
                    variant="segmentation"
                    size="xs"
                    class="mt-1"
                  />
                </div>
              </div>

              <!-- Info Grid -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Paguyuban</p>
                  <p class="text-sm font-medium text-gray-900 truncate" :title="merchant.paguyuban?.name">
                    {{ merchant.paguyuban?.name || 'Tidak ada' }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Produk</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ merchant.products_count || 0 }} Produk
                  </p>
                </div>
              </div>

              <!-- Contact -->
              <div v-if="merchant.phone" class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <i class="pi pi-phone"></i>
                <span>{{ merchant.phone }}</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-gray-600">
            <span v-if="selectedMerchantsCount > 0">
              {{ selectedMerchantsCount }} merchant akan diundang
            </span>
            <span v-else class="text-gray-400">
              Pilih minimal 1 merchant
            </span>
          </div>
          <div class="flex gap-3">
            <Button 
              @click="showInviteModal = false" 
              variant="secondary"
            >
              Batal
            </Button>
            <Button
              @click="handleInvite"
              variant="merchant"
              :disabled="selectedMerchantsCount === 0 || loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
              <i v-else class="pi pi-send mr-2"></i>
              Undang {{ selectedMerchantsCount > 0 ? `(${selectedMerchantsCount})` : '' }}
            </Button>
          </div>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Delete Confirmation -->
    <ResponsiveModal
      :show="showDeleteModal"
      @close="showDeleteModal = false"
      title="Konfirmasi Hapus"
    >
      <p class="text-sm text-gray-600 mb-4">
        Apakah Anda yakin ingin menghapus event
        <strong>{{ event?.event_name }}</strong>? Tindakan ini tidak dapat dibatalkan.
      </p>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="showDeleteModal = false" variant="secondary">
            Batal
          </Button>
          <Button @click="handleDelete" variant="danger"> Hapus </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Add Voucher Modal with Multiple Selection -->
    <ResponsiveModal
      variant="merchant"
      :show="showAddVoucherModal"
      @close="showAddVoucherModal = false"
      title="Tambah Voucher ke Event"
      size="xl"
    >
      <div class="space-y-4">
        <!-- Info Banner -->
        <div class="bg-merchant-primary/5 border border-merchant-primary/20 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <i class="pi pi-info-circle text-merchant-primary text-lg mt-0.5"></i>
            <div class="flex-1">
              <p class="text-sm font-medium text-merchant-primary mb-1">
                Pilih satu atau lebih voucher
              </p>
              <p class="text-xs text-gray-600">
                Voucher akan otomatis terhubung dengan semua merchant yang berpartisipasi di event ini.
              </p>
            </div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <TextField
              v-model="searchVoucherQuery"
              placeholder="Cari kode atau deskripsi voucher..."
              :icon="'pi-search'"
            />
          </div>
          <select
            v-model="filterVoucherType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merchant-primary focus:border-merchant-primary"
          >
            <option value="">Semua Tipe</option>
            <option value="percent">Persentase</option>
            <option value="fixed">Nominal</option>
          </select>
        </div>

        <!-- Selection Actions -->
        <div v-if="filteredVouchers.length > 0" class="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="selectedVouchersCount === filteredVouchers.length && filteredVouchers.length > 0"
                @change="selectAllVouchers"
                class="w-4 h-4 rounded border-gray-300 text-merchant-primary focus:ring-merchant-primary"
              />
              <span class="text-sm font-medium text-gray-700">
                Pilih Semua
              </span>
            </label>
            
            <div v-if="selectedVouchersCount > 0" class="text-sm text-merchant-primary font-medium">
              {{ selectedVouchersCount }} voucher dipilih
            </div>
          </div>

          <button
            v-if="selectedVouchersCount > 0"
            @click="clearSelection"
            class="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Hapus Pilihan
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="voucherLoading" class="text-center py-12">
          <i class="pi pi-spin pi-spinner text-3xl text-merchant-primary mb-3"></i>
          <p class="text-sm text-gray-600">Memuat voucher...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredVouchers.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-ticket text-3xl text-gray-400"></i>
          </div>
          <p class="text-gray-600 font-medium mb-2">
            {{ searchVoucherQuery || filterVoucherType ? 'Tidak ada voucher yang sesuai' : 'Tidak ada voucher tersedia' }}
          </p>
          <p class="text-sm text-gray-500">
            {{ searchVoucherQuery || filterVoucherType ? 'Coba ubah filter pencarian' : 'Semua voucher sudah terhubung dengan event lain' }}
          </p>
        </div>

        <!-- Voucher List -->
        <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-2">
          <label
            v-for="voucher in filteredVouchers"
            :key="voucher.id"
            class="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
            :class="[
              isVoucherSelected(voucher.id)
                ? 'border-merchant-primary bg-merchant-primary/5'
                : 'border-gray-200 hover:border-merchant-primary/50'
            ]"
          >
            <input
              type="checkbox"
              :checked="isVoucherSelected(voucher.id)"
              @change="toggleVoucherSelection(voucher.id)"
              class="mt-1 w-5 h-5 rounded border-gray-300 text-merchant-primary focus:ring-merchant-primary"
            />
            
            <div class="flex-1 min-w-0">
              <!-- Header -->
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-merchant-primary/10 rounded-lg">
                    <i class="pi pi-ticket text-merchant-primary"></i>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">{{ voucher.voucher_code }}</h4>
                    <StatusLabel :status="voucher.voucher_status" variant="voucher" size="xs" />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                {{ voucher.voucher_description || 'Tidak ada deskripsi' }}
              </p>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Tipe</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ voucher.voucher_type === 'percent' ? 'Persentase' : 'Nominal' }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Nilai</p>
                  <p class="text-sm font-medium text-merchant-primary">
                    {{ voucher.voucher_type === 'percent' ? voucher.value + '%' : formatCurrency(voucher.value) }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Min. Pembelian</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(voucher.min_purchase_amount || 0) }}
                  </p>
                </div>
                <div class="bg-gray-50 rounded-lg p-2">
                  <p class="text-xs text-gray-500">Digunakan</p>
                  <p class="text-sm font-medium text-gray-900">
                    {{ voucher.usages_count || 0 }}x
                  </p>
                </div>
              </div>

              <!-- Period -->
              <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(voucher.voucher_start_date) }}</span>
                <span>-</span>
                <span>{{ formatDate(voucher.voucher_end_date) }}</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-gray-600">
            <span v-if="selectedVouchersCount > 0">
              {{ selectedVouchersCount }} voucher akan ditambahkan
            </span>
            <span v-else class="text-gray-400">
              Pilih minimal 1 voucher
            </span>
          </div>
          <div class="flex gap-3">
            <Button 
              @click="showAddVoucherModal = false" 
              variant="secondary"
            >
              Batal
            </Button>
            <Button
              @click="handleAddVouchers"
              variant="merchant"
              :disabled="selectedVouchersCount === 0 || voucherLoading"
            >
              <i v-if="voucherLoading" class="pi pi-spin pi-spinner mr-2"></i>
              <i v-else class="pi pi-plus mr-2"></i>
              Tambah {{ selectedVouchersCount > 0 ? `(${selectedVouchersCount})` : '' }}
            </Button>
          </div>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Delete Voucher Confirmation -->
    <ResponsiveModal
      :show="showDeleteVoucherModal"
      @close="showDeleteVoucherModal = false"
      title="Hapus Voucher dari Event"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-warning-background/10 border border-warning-foreground/20 rounded-xl">
          <i class="pi pi-exclamation-triangle text-warning-foreground text-xl shrink-0 mt-0.5"></i>
          <div>
            <h4 class="mb-1 text-sm font-semibold text-warning-foreground">Perhatian!</h4>
            <p class="text-xs text-warning-foreground/80">
              Voucher akan dilepas dari event dan semua merchant yang terhubung.
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          Apakah Anda yakin ingin melepas voucher 
          <strong>{{ voucherToDelete?.voucher_code }}</strong> dari event ini?
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button 
            @click="showDeleteVoucherModal = false" 
            variant="secondary"
          >
            Batal
          </Button>
          <Button 
            @click="handleDeleteVoucher" 
            variant="danger"
            :disabled="voucherLoading"
          >
            <i v-if="voucherLoading" class="pi pi-spin pi-spinner mr-2"></i>
            Hapus Voucher
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Remove Merchant Confirmation -->
    <ResponsiveModal
      :show="showRemoveMerchantModal"
      @close="showRemoveMerchantModal = false"
      title="Keluarkan Merchant dari Event"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3 p-4 bg-warning-background/10 border border-warning-foreground/20 rounded-xl">
          <i class="pi pi-exclamation-triangle text-warning-foreground text-xl shrink-0 mt-0.5"></i>
          <div>
            <h4 class="mb-1 text-sm font-semibold text-warning-foreground">Perhatian!</h4>
            <p class="text-xs text-warning-foreground/80">
              Merchant akan dikeluarkan dari event dan tidak bisa menggunakan voucher event.
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          Anda akan mengeluarkan merchant 
          <strong>{{ merchantToRemove?.name }}</strong> dari event ini.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Alasan Penghapusan <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="removalReason"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merchant-primary focus:border-merchant-primary"
            placeholder="Jelaskan alasan merchant dikeluarkan dari event..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button 
            @click="showRemoveMerchantModal = false" 
            variant="secondary"
          >
            Batal
          </Button>
          <Button 
            @click="handleRemoveMerchant" 
            variant="danger"
            :disabled="!removalReason.trim() || merchantLoading"
          >
            <i v-if="merchantLoading" class="pi pi-spin pi-spinner mr-2"></i>
            Keluarkan Merchant
          </Button>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Removed Merchants History Modal -->
    <ResponsiveModal
      :show="showRemovedMerchantsModal"
      @close="showRemovedMerchantsModal = false"
      title="Riwayat Merchant yang Dikeluarkan"
      size="lg"
    >
      <div v-if="removedMerchants.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
        <div
          v-for="merchant in removedMerchants"
          :key="merchant.id"
          class="border border-orange-200 rounded-xl p-4 bg-orange-50/50"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3 flex-1">
              <img
                :src="merchant.logo_url || '/placeholder.png'"
                alt="Logo"
                class="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
              />
              <div>
                <h4 class="font-semibold text-gray-900">{{ merchant.name }}</h4>
                <p class="text-sm text-gray-500">@{{ merchant.slug }}</p>
              </div>
            </div>
            
            <Button
              @click="handleRestoreMerchant(merchant.id)"
              variant="success-outline"
              size="sm"
            >
              <i class="pi pi-refresh mr-1"></i>
              Kembalikan
            </Button>
          </div>

          <div class="bg-white rounded-lg p-3 space-y-2">
            <div class="flex items-start gap-2">
              <i class="pi pi-info-circle text-orange-600 text-sm mt-0.5"></i>
              <div class="flex-1">
                <p class="text-xs text-gray-500">Alasan Dikeluarkan:</p>
                <p class="text-sm text-gray-700">{{ merchant.removal_info.reason }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
              <span class="flex items-center gap-1">
                <i class="pi pi-calendar"></i>
                {{ formatDate(merchant.removal_info.removed_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">Tidak ada riwayat merchant yang dikeluarkan</p>
      </div>

      <template #footer>
        <Button 
          @click="showRemovedMerchantsModal = false" 
          variant="secondary"
          block
        >
          Tutup
        </Button>
      </template>
    </ResponsiveModal>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>