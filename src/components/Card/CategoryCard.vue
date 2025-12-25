<template>
  <router-link
    :to="to"
    class="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:border-secondary/30 hover:bg-secondary/20 transition"
  >
    <div
      class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-primary group-hover:scale-105 transition"
    >
      <img :src="icon" :alt="label" class="w-7 h-7 sm:w-8 sm:h-8" />
    </div>
    <span
      class="text-xs sm:text-sm text-gray-700 group-hover:text-secondary/70"
    >
      {{ label }}
    </span>
  </router-link>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  icon: { type: String, required: true },
  to: { type: [String, Object], required: true },
});
</script>
