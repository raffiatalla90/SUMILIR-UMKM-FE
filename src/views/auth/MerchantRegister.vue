<template>
  <div
    class="min-h-screen sm:bg-gray-50 bg-primary flex items-center flex-col sm:justify-center justify-end sm:p-8"
  >
    <div
      class="sm:hidden flex flex-col flex-1/3 justify-end sm:px-0 px-4 py-2 sm:pt-0 pt-8"
    >
      <h2
        class="sm:hidden inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-muted"
      >
        Daftarkan UMKM
      </h2>
      <p
        class="sm:hidden inline text-[10px] sm:text-sm text-center sm:text-left mb-6 text-white"
      >
        Isi data diri dan informasi UMKM-mu untuk memulai perjalananmu bersama
        kami
      </p>
    </div>
    <div
      class="flex flex-col justify-center sm:flex-0 flex-2/3 p-8 sm:p-12 sm:max-w-xl w-full bg-white sm:rounded-4xl rounded-t-4xl sm:shadow-lg shadow-none"
    >
      <!-- Right Side - Form -->
      <div class="sm:flex flex-col">
        <h2
          class="hidden sm:inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-black"
        >
          Daftarkan UMKM
        </h2>
        <p
          class="hidden sm:inline text-xs sm:text-sm text-center sm:text-left mb-6 text-gray-600"
        >
          Isi data diri dan informasi UMKM-mu untuk memulai perjalananmu bersama
          kami
        </p>
        <Form
          @submit="handleRegister"
          :validation-schema="schema"
          v-slot="{ errors }"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Name Field -->
            <div class="sm:col-span-2">
              <label for="name" class="block text-sm font-bold text-black mb-2">
                Nama Usaha
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama usaha"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-muted-foreground transition-all"
                :class="errors.name ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Jenis Usaha (Radio) -->
            <div class="text-foreground sm:col-span-2">
              <span class="block text-sm font-bold text-black mb-2"
                >Jenis Usaha</span
              >
              <div class="flex flex-wrap items-center gap-3">
                <label class="cursor-pointer select-none">
                  <Field
                    type="radio"
                    name="business_type"
                    value="Toko"
                    class="sr-only peer"
                  />
                  <span
                    class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-muted-foreground text-muted-foreground transition peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 peer-focus:ring-1 peer-focus:ring-primary group"
                  >
                    <span
                      class="h-2.5 w-2.5 rounded-full bg-muted-foreground transition group-peer-checked:bg-primary"
                    ></span>
                    <span class="text-sm">Toko</span>
                  </span>
                </label>

                <label class="cursor-pointer select-none">
                  <Field
                    type="radio"
                    name="business_type"
                    value="Kuliner"
                    class="sr-only peer"
                  />
                  <span
                    class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-muted-foreground text-muted-foreground transition peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 peer-focus:ring-1 peer-focus:ring-primary group"
                  >
                    <span
                      class="h-2.5 w-2.5 rounded-full bg-muted-foreground transition group-peer-checked:bg-primary"
                    ></span>
                    <span class="text-sm">Kuliner</span>
                  </span>
                </label>

                <label class="cursor-pointer select-none">
                  <Field
                    type="radio"
                    name="business_type"
                    value="Jasa"
                    class="sr-only peer"
                  />
                  <span
                    class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-muted-foreground text-muted-foreground transition peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/5 peer-focus:ring-1 peer-focus:ring-primary group"
                  >
                    <span
                      class="h-2.5 w-2.5 rounded-full bg-muted-foreground transition group-peer-checked:bg-primary"
                    ></span>
                    <span class="text-sm">Jasa</span>
                  </span>
                </label>
              </div>
              <ErrorMessage
                name="business_type"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <!-- Description Field -->
            <div class="sm:col-span-2">
              <label
                for="description"
                class="block text-sm font-bold text-black mb-2"
              >
                Deskripsi Usaha
              </label>
              <Field
                id="description"
                name="description"
                as="textarea"
                placeholder="Masukkan deskripsi usaha"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-muted-foreground transition-all"
                :class="
                  errors.description ? 'border-red-500' : 'border-primary'
                "
              />
              <ErrorMessage
                name="description"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <!-- Alamat (Dropdown Wilayah) -->
            <div class="text-foreground">
              <label class="block text-sm font-bold text-black mb-2"
                >Provinsi</label
              >
              <div class="relative">
                <Field
                  name="province_id"
                  as="select"
                  v-model="provinceId"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-white text-black placeholder:text-muted-foreground transition-all appearance-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none"
                  :class="[
                    errors.province_id
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-primary focus:ring-2 focus:ring-primary',
                  ]"
                >
                  <option value="">Pilih Provinsi</option>
                  <option v-for="p in provinces" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </Field>
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
              <ErrorMessage
                name="province_id"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <div class="text-foreground">
              <label class="block text-sm font-bold text-black mb-2"
                >Kabupaten/Kota</label
              >
              <div class="relative">
                <Field
                  name="regency_id"
                  as="select"
                  v-model="regencyId"
                  :disabled="!provinceId"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-white text-black placeholder:text-muted-foreground transition-all appearance-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none"
                  :class="[
                    errors.regency_id
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-primary focus:ring-2 focus:ring-primary',
                  ]"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  <option v-for="r in regencies" :key="r.id" :value="r.id">
                    {{ r.name }}
                  </option>
                </Field>
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
              <ErrorMessage
                name="regency_id"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <div class="text-foreground">
              <label class="block text-sm font-bold text-black mb-2"
                >Kecamatan</label
              >
              <div class="relative">
                <Field
                  name="district_id"
                  as="select"
                  v-model="districtId"
                  :disabled="!regencyId"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-white text-black placeholder:text-muted-foreground transition-all appearance-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none"
                  :class="[
                    errors.district_id
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-primary focus:ring-2 focus:ring-primary',
                  ]"
                >
                  <option value="">Pilih Kecamatan</option>
                  <option v-for="d in districts" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </option>
                </Field>
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
              <ErrorMessage
                name="district_id"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <div class="text-foreground">
              <label class="block text-sm font-bold text-black mb-2"
                >Desa</label
              >
              <div class="relative">
                <Field
                  name="village_id"
                  as="select"
                  v-model="villageId"
                  :disabled="!districtId"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-white text-black placeholder:text-muted-foreground transition-all appearance-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed focus:outline-none"
                  :class="[
                    errors.village_id
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-primary focus:ring-2 focus:ring-primary',
                  ]"
                >
                  <option value="">Pilih Desa</option>
                  <option v-for="v in villages" :key="v.id" :value="v.id">
                    {{ v.name }}
                  </option>
                </Field>
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
              <ErrorMessage
                name="village_id"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <!-- Alamat Lengkap (opsional, detail) -->
            <div class="sm:col-span-2">
              <label
                for="address"
                class="block text-sm font-bold text-black mb-2"
              >
                Alamat Lengkap
              </label>
              <Field
                id="address"
                name="address"
                type="text"
                placeholder="Nama jalan, RT/RW, patokan, dsb (opsional)"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-muted-foreground transition-all"
                :class="errors.address ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="address" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm sm:col-span-2"
            >
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <div class="sm:col-span-2">
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full active:scale-95 bg-primary text-white font-bold text-base sm:text-lg py-2.5 text-sm px-4 mb-2 rounded-xl hover:bg-[#ff8c00] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-muted-foreground disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-lg"
              >
                {{ isLoading ? "Loading..." : "Daftar" }}
              </button>
            </div>
          </div>
        </Form>
        <!-- Debug Info (Development Only) -->
        <div
          v-if="isDev"
          class="mt-6 p-4 bg-gray-50 rounded-xl text-xs border border-gray-200"
        >
          <p class="font-semibold mb-2 text-gray-700">Debug Info:</p>
          <p class="text-gray-600"><strong>API URL:</strong> {{ apiUrl }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import { RouterLink } from "vue-router";

import Illustration from "@/assets/images/login-illustration.svg";

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref("");
const apiUrl = import.meta.env.VITE_API_BASE_URL || "Not set";
const isDev = import.meta.env.DEV;

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Nama wajib diisi"),
  business_type: yup
    .string()
    .oneOf(["Toko", "Kuliner", "Jasa"])
    .required("Jenis usaha wajib dipilih"),
  description: yup.string().nullable(),
  // Wilayah
  province_id: yup.string().required("Provinsi wajib dipilih"),
  regency_id: yup.string().required("Kabupaten/Kota wajib dipilih"),
  district_id: yup.string().required("Kecamatan wajib dipilih"),
  village_id: yup.string().required("Desa wajib dipilih"),
  // ...existing code (email/telepon/nik/password jika memang diperlukan di halaman ini)...
});

// Data wilayah
const provinces = ref([]);
const regencies = ref([]);
const districts = ref([]);
const villages = ref([]);

const provinceId = ref("");
const regencyId = ref("");
const districtId = ref("");
const villageId = ref("");

const wilayahApiBase = "https://www.emsifa.com/api-wilayah-indonesia/api";

async function loadProvinces() {
  const res = await fetch(`${wilayahApiBase}/provinces.json`);
  provinces.value = await res.json();
}
async function loadRegencies(pid) {
  if (!pid) {
    regencies.value = [];
    return;
  }
  const res = await fetch(`${wilayahApiBase}/regencies/${pid}.json`);
  regencies.value = await res.json();
}
async function loadDistricts(rid) {
  if (!rid) {
    districts.value = [];
    return;
  }
  const res = await fetch(`${wilayahApiBase}/districts/${rid}.json`);
  districts.value = await res.json();
}
async function loadVillages(did) {
  if (!did) {
    villages.value = [];
    return;
  }
  const res = await fetch(`${wilayahApiBase}/villages/${did}.json`);
  villages.value = await res.json();
}

watch(provinceId, async (val) => {
  regencyId.value = "";
  districtId.value = "";
  villageId.value = "";
  regencies.value = [];
  districts.value = [];
  villages.value = [];
  await loadRegencies(val);
});
watch(regencyId, async (val) => {
  districtId.value = "";
  villageId.value = "";
  districts.value = [];
  villages.value = [];
  await loadDistricts(val);
});
watch(districtId, async (val) => {
  villageId.value = "";
  villages.value = [];
  await loadVillages(val);
});

onMounted(() => {
  loadProvinces();
});

// Password indicators
const passwordValue = ref("");
const hasMinLength = computed(() => passwordValue.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(passwordValue.value));
const hasNumber = computed(() => /\d/.test(passwordValue.value));
const hasSymbol = computed(() => /[!@#$%^&*\-_]/.test(passwordValue.value));

const handleRegister = async (values) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      // ...existing code...
      business_type: values.business_type,
      description: values.description,
      province_id: values.province_id,
      regency_id: values.regency_id,
      district_id: values.district_id,
      village_id: values.village_id,
      address: values.address || null,
    };

    const { data } = await api.post("/auth/register-merchant", payload);
    router.push("/dashboard");
  } catch (error) {
    console.error("Register merchant error:", error);
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(", ");
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        "Registrasi merchant gagal. Silakan coba lagi.";
    }
  } finally {
    isLoading.value = false;
  }
};

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
</script>
