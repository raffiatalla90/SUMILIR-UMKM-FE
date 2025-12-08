<template>
  <div
    v-if="message"
    :class="[
      'mb-2 p-3 bg-red-100 border text-red-700 rounded-xl text-sm',
      borderColorClass,
    ]"
  >
    {{ message }}
  </div>
</template>

<script setup>
/*
ErrorAlert — Komponen alert error sederhana

Contoh pakai:
<ErrorAlert :message="errorMessage" variant="merchant" />

Props:
- message: string => pesan error; komponen hanya render jika ada nilai
- variant: string (default "primary") => "primary" | "merchant"
*/
import { computed } from "vue";

const props = defineProps({
  message: { type: String, default: "" },
  variant: { type: String, default: "primary" }, // NEW: primary | merchant
});

const borderColorClass = computed(() => {
  return props.variant === "merchant"
    ? "border-merchant-primary/50"
    : "border-red-400";
});
</script>
