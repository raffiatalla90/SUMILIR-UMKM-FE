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
  />
</Form>

Props:
- name: string (wajib) => nama field vee-validate
- label: string => label grup
- options: Array<{ value:any, label:string }> (wajib)
*/
import { Field, ErrorMessage } from "vee-validate";

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  options: { type: Array, required: true }, // [{ value, label }]
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
          class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-muted-foreground text-muted-foreground transition peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 peer-focus:ring-1 peer-focus:ring-primary group"
        >
          <span
            class="h-2.5 w-2.5 rounded-full bg-muted-foreground transition group-peer-checked:bg-primary"
          ></span>
          <span class="text-sm">{{ opt.label }}</span>
        </span>
      </label>
    </div>
    <ErrorMessage :name="name" class="text-red-500 text-xs mt-1" />
  </div>
</template>
