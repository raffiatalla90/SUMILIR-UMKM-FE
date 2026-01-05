<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useEvents } from "@/composables/useEvents";
import { getImageUrl } from "@/libs/getImageUrl";
import api from "@/libs/axios";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { fetchEventDetail, deleteEvent, inviteMerchants, loading } = useEvents();

const event = ref(null);
const merchants = ref([]);
const selectedMerchants = ref([]);
const showInviteModal = ref(false);
const showDeleteModal = ref(false);
const loadingMerchants = ref(false);

const breadcrumbItems = computed(() => [
  { label: "Events", to: { name: "Admin - Events" } },
  { label: event.value?.event_name || "Detail Event" },
]);

const eventBannerUrl = computed(() => {
  if (!event.value?.banner_img_path) return "/placeholder.png";
  return getImageUrl(event.value.banner_img_path);
});

const availableMerchants = computed(() => {
  const invitedIds =
    event.value?.merchants?.map((m) => m.id) || [];
  return merchants.value.filter((m) => !invitedIds.includes(m.id));
});

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
    await loadEvent(); // Refresh event data
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

// Navigation
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

const goBack = () => router.push({ name: "Admin - Events" });

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
              <StatusLabel :status="event.status" />
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

        <!-- Participating Merchants -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Merchant Terdaftar ({{ event.merchants?.length || 0 }})
            </h3>
            <Button @click="showInviteModal = true" variant="merchant">
              <i class="pi pi-plus mr-2"></i>
              Undang Merchant
            </Button>
          </div>

          <div v-if="event.merchants && event.merchants.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="merchant in event.merchants"
                :key="merchant.id"
                class="border border-merchant-primary rounded-lg p-4 hover:shadow-md transition"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="merchant.logo_path || '/placeholder.png'"
                    alt="Merchant logo"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium">
                      {{ merchant.name?.slice(0, 15) }}<span v-if="merchant.name && merchant.name.length > 15">…</span>
                    </h4>
                    <StatusLabel
                      :status="segmentationMap[merchant.segmentation_id]?.toLowerCase().replace(/\s/g, '_')"
                      :label="segmentationMap[merchant.segmentation_id]"
                      variant="segmentation"
                      size="xs"
                    />
                  </div>
                  <StatusLabel :status="merchant.pivot.status" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Belum ada merchant yang terdaftar
          </div>
        </div>

        <!-- Vouchers -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold mb-4">
            Voucher Event ({{ event.vouchers?.length || 0 }})
          </h3>

          <div v-if="event.vouchers && event.vouchers.length > 0">
            <div class="space-y-3">
              <div
                v-for="voucher in event.vouchers"
                :key="voucher.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-lg">{{ voucher.voucher_code }}</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ voucher.voucher_description }}
                    </p>
                    <div class="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>Tipe: {{ voucher.voucher_type }}</span>
                      <span>Value: {{ voucher.value }}</span>
                      <span
                        >Min. Pembelian: Rp
                        {{ Number(voucher.min_purchase_amount).toLocaleString() }}</span
                      >
                    </div>
                  </div>
                  <StatusLabel :status="voucher.voucher_status" />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Belum ada voucher untuk event ini
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
      title="Undang Merchant"
      size="lg"
    >
      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-4">
          Pilih merchant yang ingin diundang ke event ini
        </p>

        <div v-if="loadingMerchants" class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-2xl text-merchant-primary"></i>
        </div>

        <div v-else-if="availableMerchants.length === 0" class="text-center py-8">
          <p class="text-gray-500">Semua merchant sudah diundang</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <label
            v-for="merchant in availableMerchants"
            :key="merchant.id"
            class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="merchant.id"
              @change="toggleMerchant(merchant.id)"
              :checked="selectedMerchants.includes(merchant.id)"
              class="rounded"
            />
            <img
              :src="merchant.logo_path || '/placeholder.png'"
              alt="Logo"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div class="flex-1">
              <p class="font-medium">{{ merchant.name }}</p>
              <p class="text-sm text-gray-500">{{ merchant.slug }}</p>
            </div>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <Button @click="showInviteModal = false" variant="secondary">
            Batal
          </Button>
          <Button
            @click="handleInvite"
            variant="primary"
            :disabled="selectedMerchants.length === 0"
          >
            Undang ({{ selectedMerchants.length }})
          </Button>
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
  </div>
</template>