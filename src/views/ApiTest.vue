<script setup>
import { ref, onMounted } from "vue";
import api from "@/libs/axios";
import { getPublicProducts } from "@/services/api/product";
const data = ref(null);

onMounted(async () => {
  try {
    const response = await api.get("/api/public/products", {
      params: {
        segments: ["UMKM Toko"],
      },
    });
    // const response = await getPublicProducts({
    //   segment: ["UMKM Kuliner"],
    //   limit: 12,
    // });
    // const response = await api.get("/api/public/products/terang-bulan-premium");
    data.value = response.data;
    console.log("API Response:", response.data);
  } catch (error) {
    data.value = error?.response?.data || error.message;
    console.error("API Error:", error);
  }
});
</script>
<template>
  <p>ini test api</p>
  <pre>{{ data }}</pre>
</template>
