<script setup>
import { ref, onMounted } from "vue";
import api from "@/libs/axios";

const data = ref(null);

onMounted(async () => {
  try {
    const response = await api.get("/api/cart");
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
