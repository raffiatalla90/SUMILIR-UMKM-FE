<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import Chart from "chart.js/auto";

const router = useRouter();
const emit = defineEmits(["toggle-sidebar"]);

// ======================
// CHART REFS
// ======================
const statusChartRef = ref(null);
const categoryChartRef = ref(null);
const activityChartRef = ref(null);

// ======================
// DUMMY DATA
// ======================
const productStatusData = {
  labels: ["Dipublish", "Draft", "Diarsipkan"],
  datasets: [
    {
      data: [24, 8, 3],
      backgroundColor: ["#22c55e", "#facc15", "#f32013"],
    },
  ],
};

const productCategoryData = {
  labels: ["Makanan", "Minuman", "Snack", "Lainnya"],
  datasets: [
    {
      data: [12, 7, 9, 5],
      backgroundColor: ["#3b82f6", "#06b6d4", "#a855f7", "#f97316"],
    },
  ],
};

const activityData = {
  labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  datasets: [
    {
      label: "Update Produk",
      data: [1, 3, 2, 4, 2, 1, 3],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

const dashboardStats = [
  {
    title: "Total Produk",
    value: 32,
    icon: "pi pi-box",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Produk Dipublish",
    value: 24,
    icon: "pi pi-check-circle",
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Produk Draft",
    value: 8,
    icon: "pi pi-file-edit",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Produk Diarsipkan",
    value: 8,
    icon: "pi pi-folder-open",
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Stok Menipis",
    value: 5,
    icon: "pi pi-exclamation-triangle",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Stok Habis",
    value: 5,
    icon: "pi pi-exclamation-triangle",
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Kategori Produk",
    value: 6,
    icon: "pi pi-tags",
    color: "bg-purple-100 text-purple-600",
  },
];

// ======================
// CARD GROUPING
// ======================
const primaryStats = computed(() => dashboardStats.slice(0, 4));
const secondaryStats = computed(() => dashboardStats.slice(4));

// ======================
// INIT CHARTS
// ======================
onMounted(() => {
  new Chart(statusChartRef.value, {
    type: "doughnut",
    data: productStatusData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
    },
  });

  new Chart(categoryChartRef.value, {
    type: "pie",
    data: productCategoryData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // new Chart(activityChartRef.value, {
  //   type: "line",
  //   data: activityData,
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //   },
  // });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER -->
    <div
      class="fixed sm:static top-0 left-0 right-0 bg-white z-20 px-4 sm:px-6 py-5 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full flex items-center justify-center sm:hidden hover:bg-gray-100"
        >
          <i class="pi pi-bars"></i>
        </button>
        <div>
          <h1 class="text-lg sm:text-2xl font-semibold text-merchant-primary">
            Dashboard
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Ringkasan kondisi katalog toko
          </p>
        </div>
      </div>
    </div>

    <!-- spacer -->
    <div class="h-24 sm:h-0"></div>

    <!-- ======================
         PRIMARY STATS
    ====================== -->
    <div class="px-4 sm:px-6 mt-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, i) in primaryStats"
          :key="i"
          class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
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
    <div class="px-4 sm:px-6 mt-4">
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <div
          v-for="(stat, i) in secondaryStats"
          :key="i"
          class="min-w-[160px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
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
    <div class="px-4 sm:px-6 mt-8 space-y-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl p-4 shadow-sm">
          <h3 class="text-sm font-semibold mb-3">Status Produk</h3>
          <div class="relative h-[220px]">
            <canvas ref="statusChartRef"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm">
          <h3 class="text-sm font-semibold mb-3">Produk per Kategori</h3>
          <div class="relative h-[220px]">
            <canvas ref="categoryChartRef"></canvas>
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
