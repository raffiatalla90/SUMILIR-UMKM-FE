<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";

const toast = useToast();
const consultations = ref([]);
const loading = ref(false);

const fetchConsultations = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/api/consultations");
    consultations.value = data?.data || data || [];
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    toast.error("Gagal memuat data konsultasi");
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-blue-100 text-blue-700",
    closed: "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
};

fetchConsultations();
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Konsultasi</h1>
      <p class="text-gray-500 mt-1">Kelola konsultasi dengan pelanggan</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
    </div>

    <div v-else-if="consultations.length === 0" class="text-center py-12 bg-white rounded-xl">
      <i class="pi pi-comments text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500">Belum ada konsultasi</p>
    </div>

    <div v-else class="space-y-4">
      <router-link
        v-for="consultation in consultations"
        :key="consultation.id"
        :to="`/merchant-center/${consultation.merchant_slug}/consultations/${consultation.id}`"
        class="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-gray-800">{{ consultation.title }}</p>
            <p class="text-sm text-gray-500">{{ consultation.customer_name }}</p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-xs font-medium', getStatusColor(consultation.status)]">
            {{ consultation.status }}
          </span>
        </div>
        <p class="mt-2 text-sm text-gray-600 line-clamp-2">{{ consultation.last_message }}</p>
        <p class="mt-2 text-xs text-gray-400">{{ consultation.created_at }}</p>
      </router-link>
    </div>
  </div>
</template>