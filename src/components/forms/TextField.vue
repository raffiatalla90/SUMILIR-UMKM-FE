<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/forms/TextField.vue
/*
TextField — Input teks/textarea terintegrasi vee-validate

Contoh pakai:
<Form :validation-schema="schema" @submit="onSubmit">
  <TextField name="email" label="Email" type="email" placeholder="you@example.com" variant="merchant" />
  <TextField name="price" label="Harga" type="number" prefix="Rp" placeholder="0" variant="merchant" />
  <TextField name="website" label="Website" prefix="https://" placeholder="example.com" labelBold={false} />
  <TextField name="bio" label="Bio" textarea :rows="4" placeholder="Ceritakan tentang Anda" />
  <TextField name="notes" label="Catatan" variant="muted" placeholder="Opsional..." />
  <TextField name="search" placeholder="Cari..." :hideLabel="true" />
</Form>

Props:
- name: string (wajib) => nama field vee-validate
- label: string => label di atas input
- type: string (default "text") => tipe input (email, number, dll.)
- placeholder: string
- textarea: boolean => jika true, render <textarea>
- modelValue: string|number => optional v-model dari luar
- alignWithPassword: boolean (default true) => beri padding kanan agar sejajar dengan PasswordField
- rows: number (default 3) => tinggi textarea
- readonly: boolean => input hanya-baca
- variant: string (default "primary") => "primary" | "merchant" | "muted"
- required: boolean => tampilkan asterisk merah
- prefix: string => awalan di dalam input (contoh: "Rp", "https://", "@")
- suffix: string => akhiran di dalam input (contoh: "kg", "%", ".com")
- labelBold: boolean (default true) => apakah label bold atau tidak
- hideLabel: boolean (default false) => sembunyikan label (untuk accessibility tetap ada)
- customClass: string => class CSS tambahan untuk input

Events:
- update:modelValue => emit saat nilai berubah (opsional jika ingin two-way binding)
*/
import { min } from "lodash";
import { Field, ErrorMessage } from "vee-validate";
import { computed, ref } from "vue";
const inputRef = ref(null);
const handleNumberInput = (event, field) => {
  let value = event.target.value;

  if (props.type === "number") {
    let num = Number(value);

    if (props.max !== null && num > Number(props.max)) {
      num = Number(props.max);
    }

    if (props.min !== null && num < Number(props.min)) {
      num = Number(props.min);
    }

    field.onChange(num); // ✅ INI PENTING
    return;
  }

  field.onChange(value);
};

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  textarea: { type: Boolean, default: false },
  modelValue: { type: [String, Number], default: "" },
  alignWithPassword: { type: Boolean, default: true },
  rows: { type: Number, default: 3 },
  readonly: { type: Boolean, default: false },
  variant: { type: String, default: "primary" },
  required: { type: Boolean, default: false },
  prefix: { type: String, default: "" },
  suffix: { type: String, default: "" },
  labelBold: { type: Boolean, default: true },
  hideLabel: { type: Boolean, default: false },
  customClass: { type: String, default: "" },
  wrapperClass: { type: String, default: "" }, // NEW: class untuk wrapper utama
  min: { type: [String, Number], default: 0 }, // NEW: nilai minimum untuk input number
  max: { type: [String, Number], default: null }, // NEW: nilai maksimum untuk input number
});
const emit = defineEmits(["update:modelValue"]);

defineExpose({
  focus() {
    inputRef.value?.focus();
  },
  blur() {
    inputRef.value?.blur();
  },
  scrollIntoView(options = { behavior: "smooth", block: "center" }) {
    inputRef.value?.scrollIntoView(options);
  },
});
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

const labelClasses = computed(() => {
  const classes = ["block text-sm"];

  // Add margin bottom only if label is visible
  if (!props.hideLabel) {
    classes.push("mb-2");
  } else {
    classes.push("sr-only"); // Screen reader only (accessibility)
  }

  // Color based on variant
  if (props.variant === "muted") {
    classes.push("text-gray-600");
  } else {
    classes.push("text-black");
  }

  // Font weight
  if (props.labelBold) {
    classes.push("font-bold");
  } else {
    classes.push("font-medium");
  }

  return classes.join(" ");
});

const inputClasses = (invalid, isTextarea) => {
  const baseClasses = [
    "w-full py-2.5 text-sm border rounded-xl focus:outline-none transition-all",
    backgroundClass.value,
    invalid
      ? "border-danger-foreground focus:ring-2 focus:ring-danger-foreground text-black"
      : `${borderClass.value} focus:ring-2 ${focusRingClass.value}`,
  ];

  // Text color based on variant
  if (props.variant === "muted") {
    baseClasses.push("text-gray-700 placeholder:text-gray-400");
  } else {
    baseClasses.push("text-black placeholder:text-gray-400");
  }

  // Padding adjustments based on prefix/suffix
  if (!isTextarea) {
    if (props.prefix) {
      baseClasses.push("pl-10"); // Extra left padding for prefix
    } else {
      baseClasses.push("pl-4");
    }

    if (props.suffix) {
      baseClasses.push("pr-10"); // Extra right padding for suffix
    } else if (props.alignWithPassword && !props.suffix) {
      baseClasses.push("pr-10"); // Align with PasswordField
    } else {
      baseClasses.push("pr-4");
    }
  } else {
    baseClasses.push("px-4"); // Textarea always has normal padding
  }

  // Add custom classes if provided
  if (props.customClass) {
    baseClasses.push(props.customClass);
  }

  return baseClasses.filter(Boolean).join(" ");
};
</script>

<template>
  <div :class="wrapperClass">
    <!-- Terapkan wrapperClass di sini -->
    <!-- Label - Always render for accessibility, hide visually if hideLabel=true -->
    <label v-if="label || hideLabel" :for="name" :class="labelClasses">
      {{ label || name }}
      <span v-if="required && !hideLabel" class="text-danger-foreground"
        >*</span
      >
    </label>

    <Field
      :name="name"
      :modelValue="modelValue"
      @update:modelValue="(v) => emit('update:modelValue', v)"
      v-slot="{ field, meta, errors }"
    >
      <div class="relative">
        <!-- Prefix -->
        <span
          v-if="prefix && !textarea"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-10"
          :class="variant === 'muted' ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ prefix }}
        </span>

        <!-- Input/Textarea -->
        <component
          :is="textarea ? 'textarea' : 'input'"
          v-bind="field"
          ref="inputRef"
          :id="name"
          :type="textarea ? undefined : type"
          :placeholder="placeholder"
          :min="!textarea ? min : undefined"
          :max="!textarea ? max : undefined"
          :rows="textarea ? rows : undefined"
          :readonly="readonly"
          :class="inputClasses(meta.touched && errors.length, textarea)"
          :value="field.value"
          @input="(e) => handleNumberInput(e, field)"
        />

        <!-- Suffix -->
        <span
          v-if="suffix && !textarea"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none z-10"
          :class="variant === 'muted' ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ suffix }}
        </span>
      </div>
    </Field>

    <ErrorMessage :name="name" class="text-danger-foreground text-xs mt-1" />
  </div>
</template>
