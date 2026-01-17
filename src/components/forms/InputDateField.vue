<script setup>
/*
InputDateField — Input tanggal dengan desain konsisten form lain, ada icon kalender di kanan

Props:
- label: string => label di atas input
- modelValue: string => tanggal dalam format 'YYYY-MM-DD'
- variant: string (default "primary") => "primary" | "merchant" | "muted"
- labelBold: boolean (default true)
- hideLabel: boolean (default false)
- customClass: string => class CSS tambahan untuk input
- name: string => name atribut input
- required: boolean
- disabled: boolean
- error: string => pesan error (opsional)
*/

import { computed, ref } from "vue";

const props = defineProps({
  label: { type: String, default: "" },
  modelValue: { type: String, default: "" },
  variant: { type: String, default: "primary" },
  labelBold: { type: Boolean, default: true },
  hideLabel: { type: Boolean, default: false },
  customClass: { type: String, default: "" },
  name: { type: String, default: "" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const inputRef = ref();

const inputId = computed(() => props.name || `date-${Math.random().toString(36).slice(2, 9)}`);

const focusRingClass = computed(() => {
  if (props.variant === "merchant") {
    return "focus:ring-merchant-primary";
  } else if (props.variant === "muted") {
    return "focus:ring-gray-300";
  }
  return "focus:ring-primary";
});

const borderClass = computed(() => {
  if (props.variant === "merchant") {
    return "border-merchant-primary";
  } else if (props.variant === "muted") {
    return "border-gray-300";
  }
  return "border-primary";
});

const backgroundClass = computed(() => {
  if (props.variant === "muted") {
    return "bg-gray-50";
  }
  return "bg-white";
});

const iconColorClass = computed(() => {
  if (props.variant === "merchant") return "text-merchant-primary";
  if (props.variant === "muted") return "text-gray-400";
  return "text-primary";
});

const labelClasses = computed(() => {
  const classes = ["block text-sm"];
  if (!props.hideLabel) {
    classes.push("mb-2");
  } else {
    classes.push("sr-only");
  }
  if (props.variant === "muted") {
    classes.push("text-gray-600");
  } else {
    classes.push("text-black");
  }
  if (props.labelBold) {
    classes.push("font-bold");
  } else {
    classes.push("font-medium");
  }
  return classes.join(" ");
});

const inputClasses = () => {
  const baseClasses = [
    "w-full py-2.5 text-sm border rounded-xl focus:outline-none transition-all",
    backgroundClass.value,
    `${borderClass.value} focus:ring-2 ${focusRingClass.value}`,
    "text-black placeholder:text-gray-400",
    "pl-4 pr-10", // padding kanan untuk icon
  ];
  if (props.error) baseClasses.push("border-red-500 focus:ring-red-500");
  if (props.customClass) baseClasses.push(props.customClass);
  return baseClasses.filter(Boolean).join(" ");
};

function openDatePicker() {
  if (inputRef.value && !props.disabled) inputRef.value.showPicker?.();
}

function onInput(e) {
  emit('update:modelValue', e.target.value);
}
</script>

<template>
  <div>
    <label v-if="label || hideLabel" :for="inputId" :class="labelClasses">
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
    <input
    ref="inputRef"
    type="date"
    :id="inputId"
    :name="name"
    :value="modelValue"
    :required="required"
    :disabled="disabled"
    :class="inputClasses()"
    @input="onInput"
    :style="{ backgroundColor: '#fff' }"
    />
      <!-- Calendar Icon Button -->
      <button
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 bg-transparent"
        @click="openDatePicker"
        :disabled="disabled"
      >
        <svg
          :class="['w-5 h-5', iconColorClass]"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" />
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>