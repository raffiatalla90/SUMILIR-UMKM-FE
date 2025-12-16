<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import ApexCharts from "apexcharts";

const props = defineProps({
  chartData: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["filter-change"]);

// State
const selectedPeriod = ref("monthly");
const selectedYear = ref(new Date().getFullYear());
const selectedQuarter = ref(1);
const selectedMonth = ref(new Date().getMonth() + 1);

const ordersChartEl = ref(null);
const ordersRevenueChartInstance = ref(null);

// Options
const periodOptions = [
  { value: "monthly", label: "Bulanan" },
  { value: "quarterly", label: "Kuartalan" },
  { value: "yearly", label: "Tahunan" },
];

const availableYears = computed(() => {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
});

const availableMonths = computed(() => [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
]);

// Helpers
const formatCurrency = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

const computeMax = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return 10;
  const max = Math.max(...arr, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
};

const waitForElementSize = async (el, maxFrames = 20) => {
  if (!el) return;
  const raf = () => new Promise((resolve) => requestAnimationFrame(resolve));
  let frames = 0;
  while (el.offsetWidth === 0 && frames < maxFrames) {
    await raf();
    frames++;
  }
  await nextTick();
};

// Chart rendering
const applyOrdersChart = async (labels, ordersData, revenueData) => {
  const ordersMax = computeMax(ordersData) * 1.15;
  const revenueMax = computeMax(revenueData) * 1.15;

  const yaxis = [
    {
      seriesName: "Pesanan",
      title: { text: "Pesanan", style: { fontSize: "14px", fontWeight: 600, color: "#64748b" } },
      max: ordersMax,
      labels: {
        formatter: (v) => Math.round(v),
        style: { fontSize: "12px", colors: "#64748b" },
      },
    },
    {
      seriesName: "Pendapatan (Rp)",
      opposite: true,
      title: { text: "Pendapatan (Rp)", style: { fontSize: "14px", fontWeight: 600, color: "#64748b" } },
      max: revenueMax,
      labels: {
        formatter: (v) => formatCurrency(v),
        style: { fontSize: "12px", colors: "#64748b" },
      },
    },
  ];

  const baseOptions = {
    chart: {
      type: "area",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 1200,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 800 },
      },
    },
    stroke: { curve: "smooth", width: [3, 3] },
    fill: {
      type: "gradient",
      gradient: { enabled: true, opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      hover: { size: 7, sizeOffset: 3 },
    },
    colors: ["#44a4b4", "#194a7a"],
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val) => `${Math.round(val)} pesanan` },
        { formatter: (val) => formatCurrency(val) },
      ],
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#f1f5f9",
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontWeight: 500,
    },
  };

  if (ordersRevenueChartInstance.value) {
    await ordersRevenueChartInstance.value.updateOptions(
      {
        xaxis: {
          type: "category",
          categories: labels,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { fontSize: "12px", fontWeight: 500, colors: "#64748b" } },
        },
        yaxis,
      },
      false,
      true
    );
    await ordersRevenueChartInstance.value.updateSeries(
      [
        { name: "Pesanan", type: "area", data: ordersData },
        { name: "Pendapatan (Rp)", type: "area", data: revenueData },
      ],
      true
    );
  } else {
    const options = {
      ...baseOptions,
      series: [
        { name: "Pesanan", type: "area", data: ordersData },
        { name: "Pendapatan (Rp)", type: "area", data: revenueData },
      ],
      xaxis: {
        type: "category",
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "12px", fontWeight: 500, colors: "#64748b" } },
      },
      yaxis,
    };
    ordersRevenueChartInstance.value = new ApexCharts(ordersChartEl.value, options);
    await ordersRevenueChartInstance.value.render();
  }
};

const renderOrdersRevenueChart = async () => {
  if (!ordersChartEl.value) return;

  await waitForElementSize(ordersChartEl.value);

  const statsArr = props.chartData?.statistics;

  if (!Array.isArray(statsArr) || statsArr.length === 0) {
    if (ordersRevenueChartInstance.value) {
      await ordersRevenueChartInstance.value.destroy();
      ordersRevenueChartInstance.value = null;
    }

    if (ordersChartEl.value) {
      ordersChartEl.value.innerHTML = `
        <div class="py-10 text-center text-gray-500">
          📭 Tidak ada data pesanan/pendapatan
        </div>
      `;
    }
    return;
  }

  if (ordersChartEl.value) {
    ordersChartEl.value.innerHTML = "";
  }

  const labels = statsArr.map((d) => d.label);
  const ordersData = statsArr.map((d) => Number(d.orders || 0));
  const revenueData = statsArr.map((d) => Number(d.revenue || 0));

  await applyOrdersChart(labels, ordersData, revenueData);
};

// Watchers
watch([selectedPeriod, selectedYear, selectedQuarter, selectedMonth], () => {
  const params = {
    period: selectedPeriod.value,
    year: selectedYear.value,
  };

  if (selectedPeriod.value === "quarterly") {
    params.quarter = selectedQuarter.value;
  } else if (selectedPeriod.value === "monthly") {
    params.month = selectedMonth.value;
  }

  emit("filter-change", params);
});

watch(
  () => props.chartData,
  async (val) => {
    if (val) {
      await nextTick();
      await renderOrdersRevenueChart();
    }
  }
);

// Lifecycle
onMounted(async () => {
  await nextTick();
  if (props.chartData) {
    await renderOrdersRevenueChart();
  }
});

onUnmounted(async () => {
  if (ordersRevenueChartInstance.value) {
    try {
      await ordersRevenueChartInstance.value.destroy();
    } catch (e) {
      // ignore
    }
    ordersRevenueChartInstance.value = null;
  }
});
</script>

<template>
  <div class="lg:col-span-2 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:px-5 sm:pb-5 sm:pt-5 md:px-6 md:pt-6">
    <!-- Header -->
    <div class="flex flex-col gap-3 mb-4 sm:gap-5 sm:mb-6 md:flex-row md:items-center md:justify-between">
      <div class="w-full">
        <h3 class="text-base sm:text-lg font-semibold text-gray-800">
          Statistik Pesanan & Pendapatan
        </h3>
        <p class="mt-1 text-gray-500 text-xs sm:text-sm">
          Analisis pesanan dan pendapatan UMKM berdasarkan periode
        </p>
      </div>

      <!-- See Details Button -->
      <a
        href="#"
        class="inline-flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap font-medium  hover:text-primary/80 transition"
      >
        Lihat detail
        <i class="pi pi-arrow-right text-xs"></i>
      </a>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-2 sm:flex-row mb-4">
      <!-- Period Toggle -->
      <div class="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          @click="selectedPeriod = option.value"
          :class="[
            selectedPeriod === option.value
              ? 'shadow-sm text-primary bg-primary/10'
              : 'text-gray-500',
            'px-2 py-1.5 sm:px-3 sm:py-2 font-medium rounded-md text-xs sm:text-sm hover:text-primary hover:shadow-sm transition-all',
          ]"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Year Select -->
      <select
        v-model="selectedYear"
        class="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition"
      >
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>

      <!-- Quarter Select -->
      <select
        v-if="selectedPeriod === 'quarterly'"
        v-model="selectedQuarter"
        class="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition"
      >
        <option :value="1">Kuartal 1</option>
        <option :value="2">Kuartal 2</option>
        <option :value="3">Kuartal 3</option>
        <option :value="4">Kuartal 4</option>
      </select>

      <!-- Month Select -->
      <select
        v-if="selectedPeriod === 'monthly'"
        v-model="selectedMonth"
        class="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition"
      >
        <option v-for="month in availableMonths" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
    </div>

    <!-- Chart -->
    <div class="relative">
      <div ref="ordersChartEl" class="w-full h-[300px] sm:h-[350px]"></div>
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
        <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
      </div>
    </div>
  </div>
</template>
