<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";
import Overview from "./statistics/Overview.vue";
import Statistic from "./statistics/Statistic.vue";
import Distribution from "./statistics/Distribution.vue";
import RecentList from "./statistics/RecentList.vue";

const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const stats = ref(null);
const chartLoading = ref(false);
const chartData = ref(null);

// Load data
const loadStatistics = async () => {
  loading.value = true;
  try {
    const response = await api.get("/admin/dashboard/statistics", {
      params: { period: "last_30_days" }, // Default untuk initial load
    });

    if (!response || !response.data) {
      throw new Error("Empty response from server");
    }

    stats.value = response.data?.data ?? response.data;
  } catch (error) {

    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("adminToken");
      router.push({ name: "Admin - Login" });
      return;
    }

    toast.error("Gagal memuat statistik dashboard");
  } finally {
    loading.value = false;
  }
};

const loadOrdersRevenue = async (params) => {
  chartLoading.value = true;
  try {
    const response = await api.get("/admin/dashboard/orders-revenue", { params });

    if (!response || !response.data) {
      throw new Error("Empty orders/revenue response");
    }

    chartData.value = response.data?.data ?? response.data;
  } catch (error) {
    toast.error("Gagal memuat data orders/revenue");
  } finally {
    chartLoading.value = false;
  }
};

// Event handlers
const handleStatisticFilterChange = (params) => {
  loadOrdersRevenue(params);
};

// Initial load
onMounted(async () => {
  await loadStatistics();
  await loadOrdersRevenue({
    period: "monthly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
        <p class="text-gray-600">Memuat dashboard...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="stats">
      <!-- Header -->
      <div class="mb-4 sm:mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard Summary</h1>
      </div>

      <!-- Section 1: Overview Cards -->
      <div class="mb-4 sm:mb-6">
        <Overview :initial-stats="stats" />
      </div>

      <!-- Section 2: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Statistic
          :chart-data="chartData"
          :loading="chartLoading"
          @filter-change="handleStatisticFilterChange"
        />
        <Distribution :stats="stats" />
      </div>

      <!-- Section 3: Recent Lists -->
      <RecentList :stats="stats" />
    </div>

    <!-- Error State -->
    <div v-else class="flex items-center justify-center h-screen">
      <div class="text-center px-4">
        <i class="pi pi-exclamation-circle text-4xl sm:text-5xl text-red-500 mb-4"></i>
        <p class="text-lg sm:text-xl text-gray-700 mb-2">Gagal memuat dashboard</p>
        <button
          @click="loadStatistics"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm sm:text-base"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
</template>