<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["toggle-sidebar"]);

const activeTab = ref("semua");
const serviceType = ref("all"); // 'all', 'product', 'service'
const searchQuery = ref("");

// Sample orders data dengan type dan fulfillment status
const orders = ref([
  {
    id: "ORD-001",
    customer: "Tengku Kaisar",
    items: "Pentol Juara x2, Pempek Kapal Selam x1",
    total: "Rp 57.000",
    status: "completed",
    date: "18 Feb 2026",
    paymentStatus: "Lunas",
    type: "product",
    fulfillmentStatus: "ready",
  },
  {
    id: "ORD-002",
    customer: "Budi Santoso",
    items: "Beras WangiKu x5 kg",
    total: "Rp 350.000",
    status: "processing",
    date: "18 Feb 2026",
    paymentStatus: "Lunas",
    type: "product",
    fulfillmentStatus: "preparing",
  },
  {
    id: "ORD-003",
    customer: "Citra Dewi",
    items: "Jasa Pembuatan Website - E-commerce",
    total: "Rp 5.000.000",
    status: "pending",
    date: "17 Feb 2026",
    paymentStatus: "Menunggu",
    type: "service",
    fulfillmentStatus: "pending",
  },
  {
    id: "ORD-004",
    customer: "Doni Haryanto",
    items: "Pentol Juara x1",
    total: "Rp 11.000",
    status: "cancelled",
    date: "16 Feb 2026",
    paymentStatus: "Dibatalkan",
    type: "product",
    fulfillmentStatus: "pending",
  },
  {
    id: "ORD-005",
    customer: "Eka Putri",
    items: "Jasa Desain Grafis - Paket Premium",
    total: "Rp 2.500.000",
    status: "completed",
    date: "15 Feb 2026",
    paymentStatus: "Lunas",
    type: "service",
    fulfillmentStatus: "completed",
  },
]);

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesTab =
      activeTab.value === "semua" || order.status === activeTab.value;
    const matchesType =
      serviceType.value === "all" || order.type === serviceType.value;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.items.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });
});

const getStatusBadge = (status) => {
  const statusMap = {
    pending: { label: "Menunggu", color: "bg-amber-50 text-amber-700" },
    processing: { label: "Diproses", color: "bg-blue-50 text-blue-700" },
    completed: { label: "Selesai", color: "bg-emerald-50 text-emerald-700" },
    cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700" },
  };
  return statusMap[status];
};

const getFulfillmentBadge = (fulfillmentStatus, type) => {
  let statusMap = {};
  
  if (type === "product") {
    statusMap = {
      pending: { label: "Menunggu Pengambilan", color: "bg-amber-50 text-amber-700", icon: "pi-clock" },
      preparing: { label: "Disiapkan", color: "bg-blue-50 text-blue-700", icon: "pi-hourglass" },
      ready: { label: "Siap Diambil", color: "bg-emerald-50 text-emerald-700", icon: "pi-check" },
      completed: { label: "Diambil", color: "bg-gray-50 text-gray-700", icon: "pi-check-circle" },
    };
  } else {
    statusMap = {
      pending: { label: "Menunggu Dikerjakan", color: "bg-amber-50 text-amber-700", icon: "pi-clock" },
      preparing: { label: "Sedang Dikerjakan", color: "bg-blue-50 text-blue-700", icon: "pi-spinner" },
      ready: { label: "Selesai Dikerjakan", color: "bg-emerald-50 text-emerald-700", icon: "pi-check" },
      completed: { label: "Sudah Diserahkan", color: "bg-gray-50 text-gray-700", icon: "pi-check-circle" },
    };
  }
  
  return statusMap[fulfillmentStatus] || statusMap.pending;
};

const getNextFulfillmentStatus = (currentStatus) => {
  const flow = ["pending", "preparing", "ready", "completed"];
  const currentIndex = flow.indexOf(currentStatus);
  return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : currentStatus;
};

const updateFulfillmentStatus = (orderId) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order && order.paymentStatus === "Lunas") {
    order.fulfillmentStatus = getNextFulfillmentStatus(order.fulfillmentStatus);
  }
};

const canUpdateFulfillment = (order) => {
  return order.paymentStatus === "Lunas" && order.fulfillmentStatus !== "completed";
};

const tabCounts = computed(() => ({
  semua: orders.value.filter(
    (o) => serviceType.value === "all" || o.type === serviceType.value
  ).length,
  pending: orders.value.filter(
    (o) =>
      o.status === "pending" &&
      (serviceType.value === "all" || o.type === serviceType.value)
  ).length,
  processing: orders.value.filter(
    (o) =>
      o.status === "processing" &&
      (serviceType.value === "all" || o.type === serviceType.value)
  ).length,
  completed: orders.value.filter(
    (o) =>
      o.status === "completed" &&
      (serviceType.value === "all" || o.type === serviceType.value)
  ).length,
  cancelled: orders.value.filter(
    (o) =>
      o.status === "cancelled" &&
      (serviceType.value === "all" || o.type === serviceType.value)
  ).length,
}));
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-6">
    <!-- Header -->
    <div
      class="sticky top-0 z-20 bg-white border-b border-gray-200 sm:static"
    >
      <div class="flex items-center justify-between px-4 py-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            @click="emit('toggle-sidebar')"
            class="p-2 rounded-lg hover:bg-gray-100 transition sm:hidden"
          >
            <i class="pi pi-bars text-gray-700"></i>
          </button>
          <div>
            <h1 class="text-lg sm:text-2xl font-semibold text-gray-900">
              Pesanan
            </h1>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 ml-6">
          <span class="text-sm font-medium text-gray-700">Filter Tipe:</span>
          <div class="flex gap-2">
            <button
              v-for="type in [
                { value: 'all', label: 'Semua' },
                { value: 'product', label: 'Produk' },
                { value: 'service', label: 'Jasa' },
              ]"
              :key="type.value"
              @click="serviceType = type.value"
              :class="[
                'px-3 py-1 text-xs font-medium rounded-lg transition',
                serviceType === type.value
                  ? 'bg-merchant-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 overflow-x-auto border-b border-gray-200 mb-4">
        <button
          v-for="tab in ['semua', 'pending', 'processing', 'completed', 'cancelled']"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition',
            activeTab === tab
              ? 'border-merchant-primary text-merchant-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900',
          ]"
        >
          {{ tab === 'semua' ? 'Semua' : getStatusBadge(tab)?.label }}
          <span class="ml-2 text-xs opacity-75">({{ tabCounts[tab] }})</span>
        </button>
      </div>
    </div>

    <!-- Search Bar & Filters -->
    <div class="px-4 py-4 sm:px-6 space-y-4 border-b border-gray-200">
      <div class="relative max-w-md">
        <i
          class="absolute left-3 top-3 pi pi-search text-gray-400 text-sm"
        ></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pesanan..."
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-merchant-primary"
        />
      </div>
    </div>

    <!-- Orders List -->
    <div class="px-4 sm:px-6 space-y-3">
      <div
        v-if="filteredOrders.length === 0"
        class="text-center py-12 bg-white rounded-lg border border-gray-200"
      >
        <i class="pi pi-inbox text-5xl text-gray-300 mb-3 block"></i>
        <p class="text-gray-500 font-medium">Tidak ada pesanan</p>
      </div>

      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
      >
        <!-- Order Header -->
        <div class="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900 mb-1">{{ order.id }}</p>
            <p class="text-sm text-gray-600">{{ order.customer }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">{{ order.total }}</p>
            <p class="text-xs text-gray-500">{{ order.date }}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="mb-3">
          <p class="text-sm text-gray-700">{{ order.items }}</p>
        </div>



        <!-- Actions -->
        <div class="flex items-center justify-between gap-2">
          <button
            v-if="canUpdateFulfillment(order)"
            @click="updateFulfillmentStatus(order.id)"
            class="px-3 py-2 text-xs font-medium text-white rounded-lg bg-merchant-primary hover:bg-merchant-primary/90 transition"
          >
            {{ order.type === 'product' ? 'Lanjutkan Proses' : 'Update Status' }}
          </button>
          <div v-else class="text-xs text-gray-500 font-medium">✓ Pesanan Selesai</div>
          <button
            class="px-3 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
