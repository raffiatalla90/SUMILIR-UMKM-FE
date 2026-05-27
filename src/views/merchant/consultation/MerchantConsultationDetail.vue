<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const consultation = ref(null);
const messages = ref([]);
const newMessage = ref("");
const loading = ref(true);

const fetchConsultation = async () => {
  loading.value = true;
  try {
    const { data } = await api.get(`/api/consultations/${route.params.id}`);
    consultation.value = data?.data || data;
    messages.value = consultation.value?.messages || [];
  } catch (error) {
    console.error("Failed to fetch consultation:", error);
    toast.error("Gagal memuat detail konsultasi");
  } finally {
    loading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await api.post(`/api/consultations/${route.params.id}/messages`, {
      message: newMessage.value,
    });
    newMessage.value = "";
    fetchConsultation();
    toast.success("Pesan terkirim");
  } catch (error) {
    toast.error("Gagal mengirim pesan");
  }
};

onMounted(fetchConsultation);
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b bg-white">
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-lg">
          <i class="pi pi-arrow-left"></i>
        </button>
        <div>
          <h2 class="font-semibold">{{ consultation?.title || "Konsultasi" }}</h2>
          <p class="text-sm text-gray-500">{{ consultation?.customer_name }}</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['max-w-[80%] rounded-xl p-3', msg.is_merchant ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-100']"
      >
        <p>{{ msg.content }}</p>
        <p :class="['text-xs mt-1', msg.is_merchant ? 'text-blue-100' : 'text-gray-400']">
          {{ msg.created_at }}
        </p>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t bg-white">
      <div class="flex gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Ketik pesan..."
          class="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="sendMessage"
          class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
        >
          <i class="pi pi-send"></i>
        </button>
      </div>
    </div>
  </div>
</template>