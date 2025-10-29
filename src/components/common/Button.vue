<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : 'false'"
    class="inline-flex items-center justify-center transition-all font-semibold rounded-xl focus:outline-none cursor-pointer focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed"
    :class="[
      sizeClasses[size],
      variantClasses[variant],
      block ? 'w-full' : '',
      loading ? 'pointer-events-none' : '',
      customClass,
    ]"
  >
    <svg
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "button" },
  variant: { type: String, default: "primary" }, // primary | outline | ghost
  size: { type: String, default: "md" }, // sm | md | lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false }, // full width
  // opsional: untuk tambahan kelas custom
  customClass: { type: String, default: "" },
});

const isDisabled = computed(() => props.disabled || props.loading);

const sizeClasses = {
  sm: "text-sm py-2 px-3",
  md: "text-base py-2.5 px-4",
  lg: "text-lg py-3 px-5",
};

const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-[#ff8c00] disabled:bg-gray-400 shadow-sm hover:shadow-lg active:scale-95",
  outline:
    "border border-primary text-primary hover:bg-primary/10 disabled:opacity-60",
  ghost: "text-primary hover:bg-primary/10 disabled:opacity-60",
};
</script>
