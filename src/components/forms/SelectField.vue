<script setup>
/*
SelectField — Select terintegrasi vee-validate dengan state loading

Contoh pakai:
<Form :validation-schema="schema">
  <SelectField
    name="province_id"
    label="Provinsi"
    :options="provinces"          // [{ value: 11, label: 'ACEH' }, ...]
    :loading="loadingProvinces"
    placeholder="Pilih Provinsi"
  />
</Form>

Props:
- name: string (wajib) => nama field vee-validate
- label: string => label di atas select
- options: Array<{ value:any, label:string }>
- disabled: boolean
- modelValue: string|number => dukung v-model luar
- loading: boolean => menampilkan skeleton dan spinner
- placeholder: string (default "Pilih")
- emptyText: string (default "Tidak ada data")
- skeleton: boolean (default true) => tampilkan skeleton saat loading

Events:
- update:modelValue => emit saat nilai berubah
*/
import { Field, ErrorMessage } from "vee-validate";

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  modelValue: { type: [String, Number], default: "" },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "Pilih" },
  emptyText: { type: String, default: "Tidak ada data" },
  skeleton: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue"]);

const selectClasses = (invalid) =>
  [
    "w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-white text-black transition-all",
    "placeholder:text-muted-foreground appearance-none",
    invalid
      ? "border-red-500 focus:ring-2 focus:ring-red-500"
      : "border-primary focus:ring-2 focus:ring-primary",
    "cursor-pointer disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none",
  ].join(" ");
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

    <!-- Skeleton saat loading -->
    <div
      v-if="skeleton && loading"
      class="h-10 w-full rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
    ></div>

    <!-- Select -->
    <div v-else class="relative" :aria-busy="loading ? 'true' : 'false'">
      <Field
        :name="name"
        :modelValue="modelValue"
        @update:modelValue="(v) => emit('update:modelValue', v)"
        v-slot="{ field, meta, errors }"
      >
        <select
          :id="name"
          :name="field.name"
          :value="field.value"
          @change="field.onChange"
          @blur="field.onBlur"
          :disabled="disabled || loading"
          :class="selectClasses(meta.touched && errors.length)"
        >
          <option value="">{{ placeholder }}</option>
          <option v-if="loading" value="" disabled>Memuat...</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
          <option v-if="!loading && options.length === 0" value="" disabled>
            {{ emptyText }}
          </option>
        </select>
      </Field>

      <!-- Spinner indikator loading -->
      <svg
        v-if="loading"
        class="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
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

      <!-- Chevron -->
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Sembunyikan error saat skeleton -->
    <ErrorMessage
      v-if="!(skeleton || loading)"
      :name="name"
      class="text-red-500 text-xs mt-1"
    />
  </div>
</template>
