<script setup>
/*
TextField — Input teks/textarea terintegrasi vee-validate

Contoh pakai:
<Form :validation-schema="schema" @submit="onSubmit">
  <TextField name="email" label="Email" type="email" placeholder="you@example.com" />
  <TextField name="bio" label="Bio" textarea :rows="4" placeholder="Ceritakan tentang Anda" />
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

Events:
- update:modelValue => emit saat nilai berubah (opsional jika ingin two-way binding)
*/
import { Field, ErrorMessage } from "vee-validate";

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  textarea: { type: Boolean, default: false },
  modelValue: { type: [String, Number], default: "" },
  alignWithPassword: { type: Boolean, default: true },
  rows: { type: Number, default: 3 },
  readonly: { type: Boolean, default: false }, // NEW
});
const emit = defineEmits(["update:modelValue"]);

const inputClasses = (invalid, isTextarea) =>
  [
    "w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-all",
    "text-black placeholder:text-gray-400",
    invalid
      ? "border-red-500 focus:ring-2 focus:ring-red-500"
      : "border-primary focus:ring-2 focus:ring-primary",
    !isTextarea && props.alignWithPassword ? "pr-10" : "",
  ]
    .filter(Boolean)
    .join(" ");
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="name"
      class="block text-sm font-bold text-black mb-2"
    >
      {{ label }}
    </label>

    <Field
      :name="name"
      :modelValue="modelValue"
      @update:modelValue="(v) => emit('update:modelValue', v)"
      v-slot="{ field, meta, errors }"
    >
      <component
        :is="textarea ? 'textarea' : 'input'"
        v-bind="field"
        :id="name"
        :type="textarea ? undefined : type"
        :placeholder="placeholder"
        :rows="textarea ? rows : undefined"
        :readonly="readonly"
        :class="inputClasses(meta.touched && errors.length, textarea)"
      />
    </Field>

    <ErrorMessage :name="name" class="text-red-500 text-xs mt-1" />
  </div>
</template>
