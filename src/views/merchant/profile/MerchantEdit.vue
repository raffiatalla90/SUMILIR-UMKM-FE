<template>
  <div class="min-h-screen pb-20 bg-gray-50 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-6 text-white sm:hidden bg-merchant-primary rounded-b-2xl"
    >
      <button
        @click="router.push(`/merchant-center/${merchantId}/profile`)"
        class="absolute flex items-center justify-center w-10 h-10 transition rounded-full left-4 hover:bg-white/10"
      >
        <i class="text-xl pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Edit Informasi Toko</h1>
    </div>

    <!-- Desktop Header with Breadcrumb -->
    <div class="hidden py-6 sm:block bg-gray-50">
      <div class="px-4 mx-auto sm:px-6 lg:px-8">
        <div
          class="flex flex-wrap items-center justify-between gap-y-2 gap-x-4"
        >
          <div>
            <!-- Breadcrumb Component -->
            <Breadcrumb :items="breadcrumbItems" :merchantId="merchantId" />
            <p class="mt-1 text-xs text-muted-foreground lg:text-sm">
              Perbarui informasi toko Anda.
            </p>
          </div>

          <!-- Desktop Save Button -->
          <div class="flex items-center gap-3">
            <button
              @click="handleSave"
              class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile Only -->
    <div class="h-[88px] sm:h-0"></div>
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-4">
        <svg
          class="w-10 h-10 animate-spin text-merchant-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p class="text-sm font-medium text-gray-600">Memuat data UMKM...</p>
      </div>
    </div>
    <!-- Container Responsive -->
    <div class="px-0 mx-auto sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <!-- Mobile: Card with Cover & Logo -->
      <div
        class="mx-4 mb-4 overflow-hidden bg-white shadow-sm sm:hidden rounded-2xl"
      >
        <!-- Cover Image -->
        <div class="relative h-40">
          <img
            :src="form.coverImage"
            alt="Cover"
            class="object-cover w-full h-full"
          />
          <button
            @click="handleUploadCover"
            class="absolute flex items-center justify-center w-10 h-10 text-white transition-opacity rounded-full shadow-lg top-3 right-3 bg-merchant-primary hover:opacity-90"
          >
            <i class="text-base pi pi-camera"></i>
          </button>
        </div>

        <!-- Logo - Overlapping -->
        <div class="relative px-4 pb-4 pt-14">
          <div class="absolute -top-12 left-4">
            <div class="relative">
              <img
                :src="form.logo"
                alt="Logo"
                class="object-cover w-24 h-24 border-4 border-white rounded-full shadow-lg"
              />
              <button
                @click="handleUploadLogo"
                class="absolute bottom-0 right-0 flex items-center justify-center w-8 h-8 text-white transition-opacity rounded-full shadow-lg bg-merchant-primary hover:opacity-90"
              >
                <i class="text-xs pi pi-camera"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Cover & Logo -->
      <div
        class="relative hidden mb-4 overflow-visible bg-white shadow-sm sm:block rounded-xl"
      >
        <div class="overflow-hidden rounded-xl">
          <img
            :src="form.coverImage"
            alt="Cover"
            class="object-cover w-full h-64 lg:h-80"
          />
        </div>
        <button
          @click="handleUploadCover"
          class="absolute p-3 text-white transition-opacity rounded-full shadow-lg top-6 right-6 bg-merchant-primary hover:opacity-90"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <div class="absolute -bottom-12 left-8">
          <div class="relative">
            <img
              :src="form.logo"
              alt="Logo"
              class="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
            />
            <button
              @click="handleUploadLogo"
              class="absolute bottom-0 right-0 p-2 text-white transition-opacity rounded-full shadow-lg bg-merchant-primary hover:opacity-90"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="sm:pt-16">
        <!-- Mobile: Single Card -->
        <div
          class="p-4 mx-4 space-y-5 bg-white shadow-sm sm:hidden rounded-2xl"
        >
          <h2 class="text-lg font-bold text-merchant-primary">
            Informasi Toko
          </h2>

          <!-- Nama Toko -->
          <div>
            <label
              class="block mb-2 text-sm font-semibold text-merchant-primary"
            >
              Nama Toko
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full p-3 text-sm text-gray-700 transition-shadow bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
              placeholder="Masukkan nama toko"
            />
          </div>

          <!-- Kontak -->
          <div>
            <label
              class="block mb-2 text-sm font-semibold text-merchant-primary"
            >
              Kontak
            </label>
            <input
              v-model="form.contact"
              type="tel"
              class="w-full p-3 text-sm text-gray-700 transition-shadow bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
              placeholder="Masukkan nomor kontak"
            />
          </div>

          <!-- Tentang -->
          <div>
            <label
              class="block mb-2 text-sm font-semibold text-merchant-primary"
            >
              Tentang
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full p-3 text-sm text-gray-700 transition-shadow bg-gray-100 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
              placeholder="Ceritakan tentang toko Anda..."
            ></textarea>
          </div>

          <!-- Lokasi (Langsung di halaman, bukan modal) -->
          <div>
            <label
              class="block mb-2 text-sm font-semibold text-merchant-primary"
              >Lokasi</label
            >
            <!-- Instruksi -->
            <div class="p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <p class="text-sm text-blue-800">
                <span class="font-semibold">Cara menggunakan:</span> Klik pada
                peta untuk menandai lokasi toko Anda, atau gunakan tombol
                "Gunakan lokasi saya" untuk deteksi otomatis.
              </p>
            </div>
            <!-- Map Picker -->
            <div class="mb-4">
              <MapPicker
                v-model:lat="latitude"
                v-model:lng="longitude"
                :zoom="15"
                height="192px"
                variant="merchant"
              />
            </div>
            <!-- Koordinat Display -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 rounded-lg bg-gray-50">
                <p class="mb-1 text-xs text-gray-600">Latitude</p>
                <p class="text-sm font-semibold text-gray-800">
                  {{ latitude ?? "-" }}
                </p>
              </div>
              <div class="p-3 rounded-lg bg-gray-50">
                <p class="mb-1 text-xs text-gray-600">Longitude</p>
                <p class="text-sm font-semibold text-gray-800">
                  {{ longitude ?? "-" }}
                </p>
              </div>
            </div>
            <!-- Wilayah Selection -->
            <div class="pt-4 mb-4 border-t">
              <h4 class="mb-3 text-sm font-semibold text-gray-700">
                Informasi Wilayah (Opsional)
              </h4>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectField
                  name="form.province_id"
                  label="Provinsi"
                  v-model="form.province_id"
                  :loading="provincesLoading"
                  :options="
                    provinces.map((p) => ({ value: p.id, label: p.name }))
                  "
                  variant="merchant"
                />
                <SelectField
                  name="form.city_id"
                  label="Kabupaten/Kota"
                  v-model="form.city_id"
                  :loading="citiesLoading"
                  :disabled="!form.province_id"
                  :options="cities.map((c) => ({ value: c.id, label: c.name }))"
                  variant="merchant"
                />
                <SelectField
                  name="form.district_id"
                  label="Kecamatan"
                  v-model="form.district_id"
                  :loading="districtsLoading"
                  :disabled="!form.city_id"
                  :options="
                    districts.map((d) => ({ value: d.id, label: d.name }))
                  "
                  variant="merchant"
                />
                <SelectField
                  name="form.village_id"
                  label="Desa/Kelurahan"
                  v-model="form.village_id"
                  :loading="villagesLoading"
                  :disabled="!form.district_id"
                  :options="
                    villages.map((v) => ({ value: v.id, label: v.name }))
                  "
                  variant="merchant"
                />
              </div>
              <!-- Detail alamat -->
              <div class="mt-3">
                <TextField
                  name="form.address"
                  v-model="form.address"
                  label="Alamat Lengkap"
                  placeholder="Contoh: Jl. Sudirman No. 123, RT 02/RW 05"
                  variant="merchant"
                />
              </div>
            </div>
          </div>

          <!-- Jam Operasional -->
          <div>
            <h3 class="mb-3 text-base font-bold text-merchant-primary">
              Jam Operasional
            </h3>
            <div class="space-y-2.5">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div class="flex items-center flex-1 gap-3">
                  <span
                    class="px-3 py-1.5 bg-merchant-primary text-white rounded-full text-xs font-semibold min-w-[85px] text-center"
                  >
                    {{ day.name }}
                  </span>

                  <div class="flex-1">
                    <span
                      v-if="day.isOpen"
                      class="text-sm font-medium text-gray-700"
                    >
                      {{ day.hours }}
                    </span>
                    <span v-else class="text-sm font-medium text-red-500">
                      Tutup
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    v-if="day.isOpen"
                    @click="handleEditHours(index)"
                    class="text-xs font-semibold text-merchant-primary hover:underline"
                  >
                    Edit
                  </button>

                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      v-model="day.isOpen"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-merchant-primary"
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Original Layout -->
        <div
          class="hidden p-6 mb-4 space-y-8 bg-white shadow-sm sm:block rounded-xl"
        >
          <h2 class="text-2xl font-bold text-merchant-primary">
            Informasi Toko
          </h2>

          <!-- Grid Layout for Desktop -->
          <div
            class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-6"
          >
            <!-- Nama Toko -->
            <div>
              <label
                class="block mb-2 text-base font-medium text-merchant-primary"
              >
                Nama Toko
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full p-4 text-base text-gray-700 transition-shadow bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                placeholder="Masukkan nama toko"
              />
            </div>

            <!-- Kontak -->
            <div>
              <label
                class="block mb-2 text-base font-medium text-merchant-primary"
              >
                Kontak
              </label>
              <input
                v-model="form.contact"
                type="tel"
                class="w-full p-4 text-base text-gray-700 transition-shadow bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                placeholder="Masukkan nomor kontak"
              />
            </div>

            <!-- Tentang - Full Width -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-base font-medium text-merchant-primary"
              >
                Tentang
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full p-4 text-base text-gray-700 transition-shadow bg-gray-100 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                placeholder="Ceritakan tentang toko Anda..."
              ></textarea>
            </div>

            <!-- Lokasi - Full Width -->
            <div class="md:col-span-2">
              <label
                class="block mb-2 text-base font-medium text-merchant-primary"
              >
                Lokasi
              </label>

              <!-- Map Picker (Langsung di halaman, bukan modal) -->
              <div class="mb-4">
                <MapPicker
                  v-model:lat="latitude"
                  v-model:lng="longitude"
                  :zoom="15"
                  height="320px"
                  variant="merchant"
                />
              </div>

              <!-- Wilayah Selection -->
              <div class="pt-4 mb-4">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SelectField
                    name="form.province_id"
                    label="Provinsi"
                    v-model="form.province_id"
                    :loading="provincesLoading"
                    :options="
                      provinces.map((p) => ({ value: p.id, label: p.name }))
                    "
                    variant="merchant"
                    required
                  />

                  <SelectField
                    name="form.city_id"
                    label="Kabupaten/Kota"
                    v-model="form.city_id"
                    :loading="citiesLoading"
                    :disabled="!form.province_id"
                    :options="
                      cities.map((c) => ({ value: c.id, label: c.name }))
                    "
                    variant="merchant"
                    required
                  />

                  <SelectField
                    name="form.district_id"
                    label="Kecamatan"
                    v-model="form.district_id"
                    :loading="districtsLoading"
                    :disabled="!form.city_id"
                    :options="
                      districts.map((d) => ({ value: d.id, label: d.name }))
                    "
                    variant="merchant"
                    required
                  />

                  <SelectField
                    name="form.village_id"
                    label="Desa/Kelurahan"
                    v-model="form.village_id"
                    :loading="villagesLoading"
                    :disabled="!form.district_id"
                    :options="
                      villages.map((v) => ({ value: v.id, label: v.name }))
                    "
                    variant="merchant"
                    required
                  />
                </div>

                <div class="mt-3">
                  <TextField
                    name="form.address"
                    v-model="form.address"
                    label="Alamat Lengkap (Opsional)"
                    placeholder="Contoh: Jl. Sudirman No. 123, RT 02/RW 05"
                    variant="merchant"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Jam Operasional -->
          <div class="pt-4">
            <h3 class="mb-4 text-xl font-bold text-merchant-primary">
              Jam Operasional
            </h3>
            <div class="space-y-4">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center bg-gray-50 rounded-xl"
              >
                <span
                  class="px-4 py-2 bg-merchant-primary text-white rounded-full text-sm font-medium min-w-[120px] text-center flex-shrink-0"
                >
                  {{ day.name }}
                </span>

                <span class="flex-grow text-base font-medium text-gray-700">
                  {{ day.hours }}
                </span>

                <button
                  v-if="day.isOpen"
                  @click="handleEditHours(index)"
                  class="flex-shrink-0 text-base font-medium text-merchant-primary hover:underline"
                >
                  Edit
                </button>
                <span
                  v-else
                  class="flex-shrink-0 text-base font-medium text-red-500"
                >
                  Tutup
                </span>

                <label
                  class="relative inline-flex items-center flex-shrink-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    v-model="day.isOpen"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-merchant-primary"
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Save Button -->
        <div class="justify-end hidden mt-6 sm:flex">
          <button
            @click="handleSave"
            class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Simpan
          </button>
        </div>

        <!-- Mobile Action Button - Fixed at Bottom -->
        <div
          class="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-gray-200 sm:hidden"
        >
          <button
            @click="handleSave"
            class="w-full py-3 text-sm font-semibold text-center text-white transition-opacity bg-merchant-primary rounded-xl hover:opacity-90"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- modal jam -->
    <div
      v-if="showHoursModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div class="w-full max-w-sm p-4 bg-white rounded-xl">
        <h3 class="mb-4 font-bold">Atur Jam Operasional</h3>

        <div class="flex gap-3">
          <input
            type="time"
            v-model="tempOpen"
            class="w-full p-2 border rounded"
          />
          <input
            type="time"
            v-model="tempClose"
            class="w-full p-2 border rounded"
          />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="showHoursModal = false">Batal</button>
          <button
            @click="saveHours"
            class="px-4 py-2 text-white rounded bg-merchant-primary"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <input
      ref="coverInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onCoverSelected"
    />

    <input
      ref="logoInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onLogoSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import { onMounted, watch } from "vue";
import merchantProfile from "@/services/api/merchantProfile";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
} from "@/services/api/location";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import ErrorAlert from "@/components/forms/ErrorAlert.vue";
import MapPicker from "@/components/forms/MapPicker.vue";
import { useToast } from "vue-toastification";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const merchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : 1;
});

const breadcrumbItems = computed(() => [
  {
    label: "Profil UMKM",
    path: `/merchant-center/${merchantId.value}/profile`,
  },
  {
    label: "Edit Profil UMKM",
  },
]);

const form = ref({
  name: "Sembako Sari Alam",
  contact: "08xxxxxxxx",
  description:
    "Toko Sembako Rojolele menyediakan beragam kebutuhan pokok harian — beras, gula, minyak, dan produk lokal lainnya.",
  address: "Jl. Pasar Rojolele No. 123",
  logo: "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=SEMBAKO",
  coverImage:
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop",
  city_id: null,
  district_id: null,
  province_id: null,
  village_id: null,
  operationalHours: [
    { name: "Monday", hours: "[06:00 - 18:00]", isOpen: true },
    { name: "Tuesday", hours: "[06:00 - 18:00]", isOpen: false },
    { name: "Wednesday", hours: "[06:00 - 18:00]", isOpen: true },
    { name: "Thursday", hours: "[06:00 - 18:00]", isOpen: true },
    { name: "Friday", hours: "[06:00 - 18:00]", isOpen: true },
    { name: "Saturday", hours: "[06:00 - 18:00]", isOpen: true },
    { name: "Sunday", hours: "[06:00 - 18:00]", isOpen: true },
  ],
});

const isLoading = ref(true);
const latitude = ref(null);
const longitude = ref(null);
const coverInput = ref(null);
const logoInput = ref(null);

const showHoursModal = ref(false);
const editingDayIndex = ref(null);

const tempOpen = ref("06:00");
const tempClose = ref("18:00");

const provincesLoading = ref(false);
const citiesLoading = ref(false);
const districtsLoading = ref(false);
const villagesLoading = ref(false);

const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);

watch(
  () => form.value.province_id,
  async (pid) => {
    form.value.city_id = null;
    form.value.district_id = null;
    form.value.village_id = null;

    cities.value = [];
    districts.value = [];
    villages.value = [];

    if (pid) {
      await loadCities(pid);
    }
  }
);

watch(
  () => form.value.city_id,
  async (cid) => {
    form.value.district_id = null;
    form.value.village_id = null;

    districts.value = [];
    villages.value = [];

    if (cid) {
      await loadDistricts(cid);
    }
  }
);

watch(
  () => form.value.district_id,
  async (did) => {
    form.value.village_id = null;
    villages.value = [];

    if (did) {
      await loadVillages(did);
    }
  }
);

// Ambil data wilayah dari service
async function loadProvinces() {
  provincesLoading.value = true;
  try {
    provinces.value = await getProvinces();
  } catch (e) {
    console.error("Gagal memuat provinsi:", e);
    provinces.value = [];
  } finally {
    provincesLoading.value = false;
  }
}

async function loadCities(pid) {
  citiesLoading.value = true;
  if (!pid) {
    cities.value = [];
    citiesLoading.value = false;
    return;
  }
  try {
    cities.value = await getCities(pid);
  } catch (e) {
    console.error("Gagal memuat kota/kabupaten:", e);
    cities.value = [];
  } finally {
    citiesLoading.value = false;
  }
}

async function loadDistricts(cid) {
  districtsLoading.value = true;
  if (!cid) {
    districts.value = [];
    districtsLoading.value = false;
    return;
  }
  try {
    districts.value = await getDistricts(cid);
  } catch (e) {
    console.error("Gagal memuat kecamatan:", e);
    districts.value = [];
  } finally {
    districtsLoading.value = false;
  }
}

async function loadVillages(did) {
  villagesLoading.value = true;
  if (!did) {
    villages.value = [];
    villagesLoading.value = false;
    return;
  }
  try {
    villages.value = await getVillages(did);
  } catch (e) {
    console.error("Gagal memuat kelurahan/desa:", e);
    villages.value = [];
  } finally {
    villagesLoading.value = false;
  }
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

onMounted(async () => {
  isLoading.value = true;
  await loadProvinces();

  // Kalau edit data lama (prefill)

  try {
    const res = await merchantProfile.getMerchantProfile(merchantId.value);
    const data = res?.data ?? res;

    latitude.value = data?.primary_address?.latitude ?? null;
    longitude.value = data?.primary_address?.longitude ?? null;

    form.value.name = data?.name ?? "";
    form.value.contact = data?.phone ?? "";
    form.value.description = data?.description ?? "";
    form.value.address = data?.primary_address?.detail ?? "";
    form.value.province_id = data?.primary_address?.province_id ?? null;

    if (form.value.province_id) {
      await loadCities(form.value.province_id);
    }

    form.value.city_id = data?.primary_address?.city_id ?? null;
    if (form.value.city_id) {
      await loadDistricts(form.value.city_id);
    }

    form.value.district_id = data?.primary_address?.district_id ?? null;
    if (form.value.district_id) {
      await loadVillages(form.value.district_id);
    }
    form.value.village_id = data?.primary_address?.village_id ?? null;

    form.value.logo = data?.logo_url
      ? data.logo_url
      : form.value.logo;

    form.value.coverImage = data?.banner_url
      ? data.banner_url
      : form.value.coverImage;

    const hours = data?.operational_hours ?? {};

    form.value.operationalHours = DAYS.map((day) => {
      const item = hours[day.key];

      if (!item || item.is_open === false) {
        return {
          key: day.key,
          name: day.label,
          isOpen: false,
          open: null,
          close: null,
          hours: "Tutup",
        };
      }

      return {
        key: day.key,
        name: day.label,
        isOpen: true,
        open: item.open,
        close: item.close,
        hours: `[${item.open} - ${item.close}]`,
      };
    });
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
});

const onCoverSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  form.value.coverFile = file;
  form.value.coverImage = URL.createObjectURL(file);

  console.log("Cover file:", file);
};

const onLogoSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  form.value.logoFile = file;
  form.value.logo = URL.createObjectURL(file);

  console.log("Logo file:", file);
};

const handleUploadCover = () => {
  coverInput.value.click();
};

const handleUploadLogo = () => {
  logoInput.value.click();
};

const handleEditHours = (index) => {
  const day = form.value.operationalHours[index];

  editingDayIndex.value = index;
  tempOpen.value = day.open || "06:00";
  tempClose.value = day.close || "18:00";

  showHoursModal.value = true;
  console.log("Edit hours for day:", index);
};

const saveHours = () => {
  const day = form.value.operationalHours[editingDayIndex.value];

  day.open = tempOpen.value;
  day.close = tempClose.value;
  day.hours = `[${tempOpen.value} - ${tempClose.value}]`;
  day.isOpen = true;

  showHoursModal.value = false;
};

const buildOperationalHoursPayload = () => {
  const result = {};

  form.value.operationalHours.forEach((day) => {
    result[day.key] = day.isOpen
      ? {
          is_open: true,
          open: day.open,
          close: day.close,
        }
      : {
          is_open: false,
        };
  });

  return result;
};

const handleSave = async () => {
  console.log("Saving changes...", form.value);

  try {
    isLoading.value = true;

    const fd = new FormData();

    // Basic info
    fd.append("name", form.value.name || "");
    fd.append("phone", form.value.contact || "");
    fd.append("description", form.value.description || "");

    // Address - only append if value exists (don't send empty strings for integers)
    if (form.value.province_id) {
      fd.append("province_id", form.value.province_id);
    }
    if (form.value.city_id) {
      fd.append("city_id", form.value.city_id);
    }
    if (form.value.district_id) {
      fd.append("district_id", form.value.district_id);
    }
    if (form.value.village_id) {
      fd.append("village_id", form.value.village_id);
    }
    fd.append("address_detail", form.value.address || "");

    // Coordinates - only append if value exists
    if (latitude.value != null && latitude.value !== "") {
      fd.append("latitude", latitude.value);
    }
    if (longitude.value != null && longitude.value !== "") {
      fd.append("longitude", longitude.value);
    }

    // Operational hours
    fd.append(
      "operational_hours",
      JSON.stringify(buildOperationalHoursPayload())
    );

    // Images (optional)
    if (form.value.logoFile) {
      fd.append("logo", form.value.logoFile);
    }

    if (form.value.coverFile) {
      fd.append("cover", form.value.coverFile);
    }

    await merchantProfile.updateMerchantProfile(merchantId.value, fd);

    toast.success("Profil UMKM berhasil diperbarui");
    // router.push(`/merchants/${merchantId.value}/profile`);
  } catch (error) {
    console.error("Error response:", error.response?.data);
    console.error("Validation errors:", error.response?.data?.errors);

    // Show specific validation errors if available
    const validationErrors = error.response?.data?.errors;
    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
    } else {
      toast.error(error.response?.data?.message || "Gagal menyimpan perubahan");
    }
  } finally {
    isLoading.value = false;
  }
  router.push(`/merchant-center/${merchantId.value}/profile`);
};
</script>

<style scoped>
@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f3f4f6;
  }

  ::-webkit-scrollbar-thumb {
    background: #0891b2;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #047280;
  }
}

.fixed.z-40 {
  z-index: 40;
}
</style>
