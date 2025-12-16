<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : 'false'"
    :class="[
      'inline-flex items-center justify-center rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ',
      block ? 'w-full' : 'w-auto',
      sizeClasses[size],
      variantClasses[variant],
      customClass,
      isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
    ]"
  >
    <span class="inline-flex justify-center items-center gap-2">
      <svg
        v-if="loading"
        class="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
      <slot />
    </span>
  </button>
</template>

<script setup>
/*
AppButton 
Slots:
- default => label tombol (teks atau icon)
*/
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "button" },
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "admin",
        "admin-outline", 
        "merchant-primary",
        "merchant-secondary",
        "muted-outline",
        "danger-outline",
      ].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg"].includes(value),
  },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  customClass: { type: String, default: "" },
});

const isDisabled = computed(() => props.disabled || props.loading);

const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return sizes[props.size];
});

const variantClasses = computed(() => {
  const variants = {
    // Orange Primary (default)
    primary:
      "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50",

    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    success: "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300",
    info: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
    admin: 
      "bg-admin-primary text-white hover:bg-admin-primary/90 disabled:bg-admin-primary/50 border border-admin-primary",
    "admin-outline": 
      "border-2 border-admin-primary text-admin-primary hover:bg-admin-primary/10 disabled:opacity-50 bg-white",
    "admin-secondary":
      "bg-admin-secondary text-white hover:bg-admin-secondary/90 disabled:bg-admin-secondary/50",
    merchant: 
      "bg-merchant-primary text-white hover:bg-merchant-primary/90 disabled:bg-merchant-primary/50",
    "merchant-outline":
      "border-2 border-merchant-primary text-merchant-primary hover:bg-merchant-primary/10 disabled:opacity-50 bg-white",
    "muted-outline": 
      "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 bg-white",
    "danger-outline":
      "border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 bg-white",
    "success-outline":
      "border-2 border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50 bg-white",
    "info-outline":
      "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 bg-white",
  };
  return variants[props.variant] || variants.primary;
});
</script>
