<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import StatusLabel from "@/components/common/StatusLabel.vue";
import api from "@/libs/axios";
import ApexCharts from "apexcharts";

const route = useRoute();
const toast = useToast();

const merchant = ref(null);
const ordersChartEl = ref(null);
const ordersChart = ref(null);
const productChartEl = ref(null);
let productChart = ref(null);

function getSegmentationColor(segmentationName) {
  switch ((segmentationName || "").toLowerCase()) {
    case "umkm toko":
      return { bg: "rgba(68,164,180,0.1)", text: "#44a4b4" };
    case "umkm kuliner":
      return { bg: "rgba(244,196,108,0.1)", text: "#f4c46c" };
    case "umkm jasa":
      return { bg: "rgba(255,94,94,0.1)", text: "#ff5e5e" };
    default:
      return { bg: "#f3f4f6", text: "#6b7280" };
  }
}

const loadMerchant = async () => {
  try {
    const res = await api.get(`/api/admin/merchants/${route.params.id}`);
    merchant.value = res.data.data;
  } catch (e) {
    toast.error("Gagal memuat detail merchant");
  }
};

const loadStatistics = async () => {
  try {
    const res = await api.get(`/api/admin/merchants/${route.params.id}/statistics`);
    await renderOrdersChart(res.data.orders);
    renderProductChart(res.data.product_orders);
  } catch (e) {
    toast.error("Gagal memuat statistik merchant");
  }
};

// --- CHART LOGIC SAMA DENGAN Statistic.vue ---
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

async function renderOrdersChart(orders) {
  await waitForElementSize(ordersChartEl.value);

  // Bangun 7 hari terakhir (oldest -> newest)
  const today = new Date();
  let labels = [];
  let ordersMap = {};
  if (Array.isArray(orders)) {
    orders.forEach((o) => {
      ordersMap[o.date] = Number(o.total || 0);
    });
  }
  let ordersData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    labels.push(iso);
    ordersData.push(ordersMap[iso] ?? 0);
  }
  const ordersMax = computeMax(ordersData) * 1.15;

  if (ordersChartEl.value) {
    ordersChartEl.value.innerHTML = "";
  }

  const options = {
    chart: {
      type: "area",
      height: 240,
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
    stroke: { curve: "smooth", width: [3] },
    fill: {
      type: "gradient",
      gradient: { enabled: true, opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      hover: { size: 7, sizeOffset: 3 },
    },
    colors: ["#44a4b4"],
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: [{ formatter: (val) => `${Math.round(val)} pesanan` }],
      x: {
        formatter: function (val) {
          const d = new Date(val);
          if (!isNaN(d)) {
            return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${d.getFullYear()}`;
          }
          // fallback jika gagal parse
          return val;
        },
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#f1f5f9",
    },
    legend: {
      show: false,
    },
    xaxis: {
      type: "category",
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "12px", fontWeight: 500, colors: "#64748b" },
        formatter: function (val) {
          // val = "2025-12-24" → tampilkan "24/12"
          const d = new Date(val);
          if (!isNaN(d)) {
            return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`;
          }
          // fallback jika gagal parse
          return val?.slice(8, 10) + "/" + val?.slice(5, 7);
        },
      },
    },
    yaxis: [
      {
        seriesName: "Pesanan",
        min: 0,
        title: { text: "Pesanan", style: { fontSize: "14px", fontWeight: 600, color: "#64748b" } },
        max: ordersMax,
        labels: {
          formatter: (v) => Math.round(v),
          style: { fontSize: "12px", colors: "#64748b" },
        },
      },
    ],
    series: [
      { name: "Pesanan", type: "area", data: ordersData },
    ],
    noData: {
      text: "Tidak ada data pesanan/pendapatan",
      align: "center",
      verticalAlign: "middle",
      style: { color: "#64748b", fontSize: "16px" },
    },
  };

  if (ordersChart.value) {
    await ordersChart.value.updateOptions(
      {
        xaxis: options.xaxis,
        yaxis: options.yaxis,
        series: options.series,
      },
      false,
      true
    );
    await ordersChart.value.updateSeries(options.series, true);
  } else {
    ordersChart.value = new ApexCharts(ordersChartEl.value, options);
    await ordersChart.value.render();
  }
}

function renderProductChart(productOrders) {
  if (productChart.value) {
    productChart.value.destroy();
    productChart.value = null;
  }
  let categories = [];
  let seriesData = [];
  let fullCategories = [];
  if (!Array.isArray(productOrders) || productOrders.length === 0) {
    categories = ["-"];
    seriesData = [0];
    fullCategories = ["-"];
  } else {
    fullCategories = productOrders.map((p) => p.category);
    categories = fullCategories.map((cat) =>
      cat.length > 3 ? cat.slice(0, 3) + ".." : cat
    );
    seriesData = productOrders.map((p) => p.total);
  }

  productChart.value = new ApexCharts(productChartEl.value, {
    chart: { type: "bar", height: 195, toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "12px", fontWeight: 500, colors: "#64748b" },
        // Tooltip full category name
        formatter: function (val, idx) {
          return val;
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: {
        enabled: true,
        formatter: function (val, opts) {
          return fullCategories[opts.dataPointIndex] || val;
        }
      }
    },
    yaxis: {
      min: 0,
      title: { text: "Total Order", style: { fontSize: "14px", fontWeight: 600, color: "#64748b" } },
      labels: { style: { fontSize: "12px", colors: "#64748b" } },
    },
    series: [{ name: "Order", data: seriesData }],
    plotOptions: { bar: { borderRadius: 5, columnWidth: "39%" } },
    colors: ["#44a4b4"],
    dataLabels: { enabled: false },
    grid: { yaxis: { lines: { show: true } }, borderColor: "#f1f5f9" },
    tooltip: {
      y: { formatter: (val) => `${val} order` },
      x: {
        formatter: function (val, opts) {
          return fullCategories[opts.dataPointIndex] || val;
        }
      }
    },
    noData: {
      text: "Tidak ada data kategori",
      align: "center",
      verticalAlign: "middle",
      style: { color: "#64748b", fontSize: "16px" },
    },
  });
  productChart.value.render();
}

onMounted(async () => {
  await loadMerchant();
  await nextTick();
  await loadStatistics();
});
</script>

<template>
  <div v-if="merchant" class="p-4 sm:p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Merchant Profile -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Avatar/Logo -->
          <div class="shrink-0">
            <div
              v-if="merchant.logo_url"
              class="w-32 h-32 rounded-full bg-admin-primary/10 flex items-center justify-center border-2 border-gray-200 overflow-hidden"
            >
              <img :src="merchant.logo_url" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-32 h-32 rounded-full bg-admin-primary/10 flex items-center justify-center border-2 border-gray-200"
            >
              <span class="text-5xl font-bold text-admin-primary">
                {{ merchant.name?.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ merchant.name }}</h2>
                <p class="text-gray-600">{{ merchant.slug }}</p>
              </div>
              <StatusLabel :status="merchant.status" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-admin-primary"></i>
                <span>Owner: {{ merchant.user?.name || "-" }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-phone text-admin-primary"></i>
                <span>{{ merchant.phone || "-" }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-map-marker text-admin-primary"></i>
                <span>{{ merchant.primary_address?.full_address || "-" }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-tag text-admin-primary"></i>
                <span>
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                    :style="{
                      backgroundColor: getSegmentationColor(merchant.segmentation?.name).bg,
                      color: getSegmentationColor(merchant.segmentation?.name).text
                    }"
                  >
                    {{ merchant.segmentation?.name || '-' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Line Chart: Total Transaksi -->
          <div class="border border-gray-200 rounded-xl p-4 mb-5 flex flex-col">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-gray-800">Total Transaksi 30 Hari Terakhir</p>
              </div>
            </div>
            <div ref="ordersChartEl" class="w-full h-60"></div>
          </div>
          <!-- Bar Chart: Produk Terorder per Kategori -->
          <div class="border border-gray-200 rounded-xl p-4 mb-5 flex flex-col">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-sm font-semibold text-gray-800">Produk Terorder per Kategori (30 Hari)</h3>
                <p class="mt-1 text-gray-500 text-xs">
                  Total order per kategori produk merchant
                </p>
              </div>
            </div>
            <div ref="productChartEl" class="w-full h-60"></div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold mb-4">Timeline</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Merchant Registered</p>
            <p class="font-medium">{{ new Date(merchant.created_at).toLocaleString("id-ID") }}</p>
          </div>
          <div v-if="merchant.response_at">
            <p class="text-sm text-gray-500">Reviewed</p>
            <p class="font-medium">{{ new Date(merchant.response_at).toLocaleString("id-ID") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>