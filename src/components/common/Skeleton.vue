<template>
  <div
    class="animate-pulse bg-gray-200 rounded"
    :class="[customClass, { 'w-full': !customClass }]"
    :style="{ height: height, width: width }"
  ></div>
</template>

<script setup>
defineProps({
  height: {
    type: String,
    default: "1rem",
  },
  width: {
    type: String,
    default: "100%",
  },
  customClass: {
    type: String,
    default: "",
  },
});
</script>
