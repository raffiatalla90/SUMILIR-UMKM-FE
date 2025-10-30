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
    <span class="inline-flex items-center gap-2">
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
AppButton — Tombol serbaguna dengan state loading

Contoh pakai:
<template>
  <AppButton type="submit" :loading="saving" block> Simpan </AppButton>
  <AppButton variant="outline" @click="onCancel"> Batal </AppButton>
  <AppButton variant="ghost" size="sm"> Aksi Kecil </AppButton>
</template>

Props:
- type: "button" | "submit" | "reset" (default: "button")
- variant: "primary" | "outline" | "ghost" (default: "primary")
- size: "sm" | "md" | "lg" (default: "md")
- loading: boolean => tampilkan spinner dan auto disabled
- disabled: boolean => nonaktifkan tombol
- block: boolean => lebar penuh (w-full)
- customClass: string => tambahan kelas manual

Slots:
- default => label tombol (teks atau icon)
*/
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "button" },
  variant: { type: String, default: "primary" }, // primary | outline | ghost
  size: { type: String, default: "md" }, // sm | md | lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
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
