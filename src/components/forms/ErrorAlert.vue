<template>
  <div
    v-if="message"
    class="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm"
  >
    {{ message }}
  </div>
</template>

<script setup>
/*
ErrorAlert — Komponen alert error sederhana

Contoh pakai:
<ErrorAlert :message="errorMessage" />

Props:
- message: string => pesan error; komponen hanya render jika ada nilai
*/
defineProps({ message: { type: String, default: "" } });
</script>
