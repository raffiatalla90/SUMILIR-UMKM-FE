<script setup>
import { computed } from "vue";

const props = defineProps({
  rating: {
    type: Number,
    default: 0,
  },
  count: {
    type: Number,
    default: 0,
  },
  showCount: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: "sm", // sm | md | lg
  },
});

const displayRating = computed(() => {
  return Number(props.rating || 0).toFixed(1);
});

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-2.5 py-1",
};
</script>

<template>
  <div
    :class="[
      'inline-flex items-center gap-1 bg-amber-50 rounded-full border border-amber-200 font-medium',
      sizeClasses[size],
    ]"
  >
    <i class="pi pi-star-fill text-amber-500 text-[10px] sm:text-xs"></i>
    <span class="text-amber-700">{{ displayRating }}</span>
    <span v-if="showCount && count > 0" class="text-amber-600">
      ({{ count }})
    </span>
  </div>
</template>