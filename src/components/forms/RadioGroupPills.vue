<script setup>
/*
RadioGroupPills — Kumpulan radio bergaya "pil"

Contoh pakai:
<Form :validation-schema="schema">
  <RadioGroupPills
    name="gender"
    label="Jenis Kelamin"
    :options="[
      { value: 'male', label: 'Laki-laki' },
      { value: 'female', label: 'Perempuan' },
    ]"
    variant="merchant"
  />
</Form>

Props:
- name: string (wajib) => nama field vee-validate
- label: string => label grup
- options: Array<{ value:any, label:string }> (wajib)
- variant: string (default "primary") => "primary" | "merchant"
*/
import { Field, ErrorMessage } from "vee-validate";
import { computed } from "vue";

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  options: { type: Array, required: true }, // [{ value, label }]
  variant: { type: String, default: "primary" }, // NEW: primary | merchant
});

const borderColorClass = computed(() => {
  return props.variant === "merchant"
    ? "peer-checked:border-merchant-primary"
    : "peer-checked:border-primary";
});

const textColorClass = computed(() => {
  return props.variant === "merchant"
    ? "peer-checked:text-merchant-primary"
    : "peer-checked:text-primary";
});

const bgColorClass = computed(() => {
  return props.variant === "merchant"
    ? "peer-checked:bg-merchant-primary/5"
    : "peer-checked:bg-primary/5";
});

const dotColorClass = computed(() => {
  return props.variant === "merchant"
    ? "group-peer-checked:bg-merchant-primary"
    : "group-peer-checked:bg-primary";
});

const ringColorClass = computed(() => {
  return props.variant === "merchant"
    ? "peer-focus:ring-merchant-primary"
    : "peer-focus:ring-primary";
});
</script>

<template>
  <div class="text-foreground">
    <span v-if="label" class="block text-sm font-bold text-black mb-2">{{
      label
    }}</span>
    <div class="flex flex-wrap items-center gap-3">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="cursor-pointer select-none"
      >
        <Field
          type="radio"
          :name="name"
          :value="opt.value"
          class="sr-only peer"
        />
        <span
          :class="[
            'inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-muted-foreground text-muted-foreground transition',
            borderColorClass,
            textColorClass,
            bgColorClass,
            ringColorClass,
            'peer-focus:ring-1 group',
          ]"
        >
          <span
            :class="[
              'h-2.5 w-2.5 rounded-full bg-muted-foreground transition',
              dotColorClass,
            ]"
          ></span>
          <span class="text-sm">{{ opt.label }}</span>
        </span>
      </label>
    </div>
    <ErrorMessage :name="name" class="text-red-500 text-xs mt-1" />
  </div>
</template>
