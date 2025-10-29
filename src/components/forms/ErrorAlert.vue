<template>
  <div
    v-if="message"
    class="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineProps({ message: { type: String, default: "" } });
</script>
