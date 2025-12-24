<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
});

// Format helpers
const formatCurrency = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "-";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  return timeString.substring(0, 5);
};

const getReportableTypeLabel = (type) => {
  const labels = {
    product: "Produk",
    service: "Layanan",
    merchant: "Merchant",
    post: "Postingan",
    post_comment: "Komentar",
  };
  return labels[type] || type;
};

const getReportableTypeColor = (type) => {
  const colors = {
    product: "bg-blue-50 text-blue-600",
    service: "bg-purple-50 text-purple-600",
    merchant: "bg-green-50 text-green-600",
    post: "bg-yellow-50 text-yellow-600",
    post_comment: "bg-pink-50 text-pink-600",
  };
  return colors[type] || "bg-gray-50 text-gray-600";
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Menunggu",
    in_review: "Ditinjau",
    resolved: "Selesai",
    dismissed: "Ditolak",
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    in_review: "bg-blue-50 text-blue-700 border-blue-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    dismissed: "bg-red-50 text-red-700 border-red-200",
  };
  return colors[status] || "bg-gray-50 text-gray-600 border-gray-200";
};

// ✅ Helper untuk highlight row
const getReportRowClass = (status) => {
  if (status === "pending" || status === "in_review") {
    return "bg-primary/5 hover:bg-primary/10";
  }
  return "hover:bg-gray-50";
};

// ✅ Helper untuk indicator dot
const needsAttention = (status) => {
  return status === "pending" || status === "in_review";
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    <!-- ========== Recent Orders ========== -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Pesanan Terbaru</h3>
        </div>

        <button
          @click="router.push({ name: 'Admin - Orders' })"
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap font-medium  hover:text-primary/80 transition"
        >
          Lihat detail
          <i class="pi pi-arrow-right text-xs"></i>
        </button>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table v-if="stats.recent_orders?.length" class="min-w-full">
          <thead>
            <tr class="border-t border-gray-100">
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Pelanggan</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Layanan</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Tanggal & Waktu</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Total</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in stats.recent_orders"
              :key="order.id"
              class="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              @click="router.push({ name: 'Admin - Order Detail', params: { id: order.id } })"
            >
              <td class="py-3 whitespace-nowrap">
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ order.nama }}</p>
                  <span class="text-gray-500 text-xs">{{ order.tel }}</span>
                </div>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="text-gray-500 text-sm">{{ order.jasa?.title || "-" }}</p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <div>
                  <p class="text-gray-800 text-sm">{{ formatDate(order.tanggal) }}</p>
                  <span class="text-gray-500 text-xs">{{ formatTime(order.waktu) }}</span>
                </div>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="font-semibold text-green-600 text-sm">{{ formatCurrency(order.total) }}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-center py-12">
          <i class="pi pi-shopping-cart text-5xl text-gray-300 mb-3"></i>
          <p class="text-gray-500 text-sm">Belum ada pesanan</p>
        </div>
      </div>
    </div>

    <!-- ========== Recent Reports ========== -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Laporan Terbaru</h3>
        </div>

        <button
          @click="router.push({ name: 'Admin - Reports' })"
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap font-medium  hover:text-primary/80 transition"
        >
          Lihat detail
          <i class="pi pi-arrow-right text-xs"></i>
        </button>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table v-if="stats.recent_reports?.length" class="min-w-full">
          <thead>
            <tr class="border-t border-gray-100">
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Pelapor</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Tipe</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Alasan</p>
              </th>
              <th class="py-3 text-left">
                <p class="font-medium text-gray-500 text-xs">Status</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="report in stats.recent_reports"
              :key="report.id"
              :class="[
                'border-t border-gray-100 cursor-pointer transition relative',
                getReportRowClass(report.status)
              ]"
              @click="router.push({ name: 'Admin - Report Detail', params: { id: report.id } })"
            >
              <!-- ✅ Indicator Dot -->
              <td class="py-3 whitespace-nowrap relative">
                <div class="flex items-center gap-2">
                  <!-- Dot indicator untuk status pending/in_review -->
                  <span
                    v-if="needsAttention(report.status)"
                    class="shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse"
                  ></span>
                  <div>
                    <p class="font-medium text-gray-800 text-sm">
                      {{ report.reporter?.name || "Anonim" }}
                    </p>
                    <span class="text-gray-500 text-xs">{{ formatDate(report.created_at) }}</span>
                  </div>
                </div>
              </td>

              <td class="py-3 whitespace-nowrap">
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium border',
                    getReportableTypeColor(report.reportable_type),
                  ]"
                >
                  {{ getReportableTypeLabel(report.reportable_type) }}
                </span>
              </td>

              <td class="py-3 max-w-xs">
                <p class="text-gray-500 text-sm truncate">
                  {{ report.reason?.reason_title || "-" }}
                </p>
              </td>

              <td class="py-3 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border',
                    getStatusColor(report.status),
                  ]"
                >
                  <!-- Icon for pending/in_review -->
                  <i
                    v-if="needsAttention(report.status)"
                    class="pi pi-exclamation-circle text-xs"
                  ></i>
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="text-center py-12">
          <i class="pi pi-flag text-5xl text-gray-300 mb-3"></i>
          <p class="text-gray-500 text-sm">Belum ada laporan</p>
        </div>
      </div>
    </div>
  </div>
</template>