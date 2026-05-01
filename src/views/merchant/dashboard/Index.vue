<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref, computed, nextTick } from "vue";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import api from "@/libs/axios";
import Chart from "chart.js/auto";
import { useAuthStore } from "@/stores/auth";

const isDev = import.meta.env.DEV;
const route = useRoute();
const emit = defineEmits(["toggle-sidebar"]);
const loading = ref(true);
const authStore = useAuthStore();

// ======================
// STATE
// ======================
const currentMerchantSlug = computed(() => {
  return route.params && route.params.merchantSlug
    ? String(route.params.merchantSlug)
    : null;
});

const currentMerchantName = computed(() => {
  const merchant = authStore.getMerchantBySlug(currentMerchantSlug.value);
  return merchant?.name || "UMKM";
});

const currentMerchantSegmentation = computed(() => {
  const merchant = authStore.getMerchantBySlug(currentMerchantSlug.value);
  return merchant?.segmentation ?? null;
});

const isJasaMerchant = computed(() => {
  const segId = Number(currentMerchantSegmentation.value?.id);
  const segName = String(currentMerchantSegmentation.value?.name ?? "");
  return segId === 3 || segName.toLowerCase().includes("jasa");
});

const catalogLabel = computed(() => (isJasaMerchant.value ? "Jasa" : "Produk"));

const breadcrumbItems = computed(() => [
  {
    label: "Dashboard",
  },
]);
const dashboardStats = ref([]);
const statusChart = ref(null);
const categoryChart = ref(null);
const STATUS_COLORS = [
  "#22c55e", // green-500 → Published (aktif)
  "#f59e0b", // amber-500 → Draft
  "#f87171", // red-400 → Archived
];
const CATEGORY_COLORS = [
  "#3b82f6", // blue-500
  "#06b6d4", // cyan-500
  "#a855f7", // violet-500
  "#64748b", // slate-500 → Lainnya
];

// ======================
// CHART REFS
// ======================
const statusChartRef = ref(null);
const categoryChartRef = ref(null);

// ======================
// CARD GROUPING
// ======================
const primaryStats = computed(() => dashboardStats.value.slice(0, 4));
const secondaryStats = computed(() => dashboardStats.value.slice(4));

// ======================
// INIT EMPTY CHARTS
// ======================
const createStatusChart = (labels, data) => {
  statusChart.value?.destroy();

  statusChart.value = new Chart(statusChartRef.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: STATUS_COLORS,
        },
      ],
    },
    options: {
      animation: {
        duration: 700,
        easing: "easeOutQuart",
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
    },
  });
};

const createCategoryChart = (labels, data) => {
  categoryChart.value?.destroy();

  const colors = labels.map(
    (_, i) => CATEGORY_COLORS[i] || CATEGORY_COLORS[CATEGORY_COLORS.length - 1],
  );

  categoryChart.value = new Chart(categoryChartRef.value, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors, // ✅ INI KUNCI
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: "easeOutCubic",
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            padding: 16,
          },
        },
      },
    },
  });
};

const fetchDashboard = async () => {
  try {
    loading.value = true;

    if (!currentMerchantSlug.value) {
      throw new Error("merchantSlug tidak ditemukan di route params");
    }
    const response = await api.get(
      `/api/merchant/${currentMerchantSlug.value}/dashboard`,
    );

    const data = response?.data?.data ?? response?.data ?? {};
    const statsData = data.stats ?? {};
    const voucherStats = data.voucher_stats ?? {};

    const label = catalogLabel.value;
    const catalogIcon = isJasaMerchant.value ? "pi pi-briefcase" : "pi pi-box";

    const stats = [
      {
        title: `Total ${label}`,
        value: statsData.total ?? 0,
        icon: catalogIcon,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: `${label} Dipublish`,
        value: statsData.published ?? 0,
        icon: "pi pi-check-circle",
        color: "bg-green-100 text-green-600",
      },
      {
        title: `${label} Draft`,
        value: statsData.draft ?? 0,
        icon: "pi pi-file-edit",
        color: "bg-yellow-100 text-yellow-600",
      },
      {
        title: `${label} Diarsipkan`,
        value: statsData.archived ?? 0,
        icon: "pi pi-folder-open",
        color: "bg-red-100 text-red-600",
      },
    ];

    // Untuk UMKM Jasa, info stok tidak relevan
    if (!isJasaMerchant.value) {
      stats.push(
        {
          title: "Stok Menipis",
          value: statsData.low_stock ?? 0,
          icon: "pi pi-exclamation-triangle",
          color: "bg-yellow-100 text-yellow-600",
        },
        {
          title: "Stok Habis",
          value: statsData.out_of_stock ?? 0,
          icon: "pi pi-exclamation-triangle",
          color: "bg-red-100 text-red-600",
        },
      );
    }

    // ======================
    // VOUCHER STATS
    // ======================
    stats.push(
      {
        title: "Total Voucher",
        value: voucherStats.total ?? 0,
        icon: "pi pi-tag",
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Voucher Aktif",
        value: voucherStats.active ?? 0,
        icon: "pi pi-check-circle",
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Voucher Tidak Aktif",
        value: voucherStats.inactive ?? 0,
        icon: "pi pi-times-circle",
        color: "bg-red-100 text-red-600",
      },
      {
        title: "Voucher Kadaluarsa",
        value: voucherStats.expired ?? 0,
        icon: "pi pi-clock",
        color: "bg-yellow-100 text-yellow-600",
      },
      {
        title: "Voucher Terpakai",
        value: voucherStats.used ?? 0,
        icon: "pi pi-chart-line",
        color: "bg-purple-100 text-purple-600",
      },
    );

    dashboardStats.value = stats;

    // ⬇️ PENTING
    loading.value = false;
    await nextTick(); // tunggu canvas benar-benar muncul

    // ======================
    // CREATE CHARTS (AMAN)
    // ======================
    if (
      data.charts?.status &&
      statusChartRef.value instanceof HTMLCanvasElement
    ) {
      createStatusChart(data.charts.status.labels, data.charts.status.data);
    }

    if (
      data.charts?.category &&
      categoryChartRef.value instanceof HTMLCanvasElement
    ) {
      createCategoryChart(
        data.charts.category.labels,
        data.charts.category.datasets[0].data,
      );
    }
  } catch (err) {
    if (isDev) {
      console.error("Dashboard fetch error:", err);
    }
    loading.value = false;
  }
};

// ======================
// LIFECYCLE
// ======================
onMounted(fetchDashboard);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER -->
    <div
      class="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-6 bg-white sm:static sm:px-6"
    >
      <div class="flex items-center gap-3">
        <button
          @click="emit('toggle-sidebar')"
          class="flex items-center justify-center w-10 h-10 rounded-full sm:hidden hover:bg-gray-100"
        >
          <i class="pi pi-bars"></i>
        </button>
        <div>
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantSlug"
          />
          <p class="mt-1 text-xs sm:text-sm text-muted-foreground">
            Ringkasan kondisi katalog {{ currentMerchantName }}
          </p>
        </div>
      </div>
    </div>

    <!-- spacer -->
    <div class="h-24 sm:h-0"></div>
    <!-- ✅ FIXED: Loading State -->
    <div
      v-if="loading"
      class="flex justify-center items-center min-h-[80dvh] w-full rounded-lg mx-0"
    >
      <div
        class="w-10 h-10 border-4 rounded-full border-muted-foreground border-t-merchant-primary animate-spin"
      ></div>
    </div>

    <div v-else>
      <!-- ======================
         PRIMARY STATS
    ====================== -->
      <div class="px-4 mt-2 sm:px-6 sm:mt-6">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            v-for="(stat, i) in primaryStats"
            :key="i"
            class="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
          >
            <div
              class="flex items-center justify-center w-10 h-10 mb-2 rounded-xl"
              :class="stat.color"
            >
              <i :class="stat.icon"></i>
            </div>
            <p class="text-xs text-muted-foreground">{{ stat.title }}</p>
            <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- ======================
         SECONDARY STATS (SCROLL)
    ====================== -->
      <div class="px-4 mt-4 sm:px-6">
        <div class="flex gap-3 pb-2 overflow-x-auto scrollbar-hide">
          <div
            v-for="(stat, i) in secondaryStats"
            :key="i"
            class="p-4 bg-white border border-gray-100 shadow-sm min-w-40 rounded-2xl"
          >
            <div
              class="flex items-center justify-center mb-2 w-9 h-9 rounded-xl"
              :class="stat.color"
            >
              <i :class="stat.icon"></i>
            </div>
            <p class="text-xs text-muted-foreground">{{ stat.title }}</p>
            <p class="text-lg font-semibold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>

      <!-- ======================
         CHARTS
    ====================== -->
      <div class="px-4 mt-8 mb-4 space-y-4 sm:px-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="p-4 bg-white shadow-sm rounded-2xl">
            <h3 class="mb-3 text-sm font-semibold">
              Status {{ catalogLabel }}
            </h3>
            <div class="relative h-[220px]">
              <canvas ref="statusChartRef"></canvas>
            </div>
          </div>

          <div class="p-4 bg-white shadow-sm rounded-2xl">
            <h3 class="mb-3 text-sm font-semibold">
              {{ catalogLabel }} per Kategori
            </h3>
            <div class="relative h-[220px]">
              <canvas ref="categoryChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
