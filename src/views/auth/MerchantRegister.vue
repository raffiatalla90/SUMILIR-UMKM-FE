<template>
  <div
    class="min-h-screen sm:bg-gray-50 bg-primary flex items-center flex-col sm:justify-center justify-end sm:p-8"
  >
    <div
      class="sm:hidden flex flex-col flex-1/3 justify-end sm:px-0 px-4 py-2 sm:pt-0 pt-8"
    >
      <h2
        class="sm:hidden inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-white"
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
        <div class="flex gap-3 mb-2 items-center">
          <span
            class="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <!-- <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 3a6 6 0 1 0 3.917 10.566l2.258 2.258A2 2 0 0 0 20.586 17H21a1 1 0 1 0 0-2h-.586l-.707-.707.293-.293H21a1 1 0 1 0 0-2h-2a1 1 0 0 0-.707.293l-.293.293-1.758-1.758A6 6 0 0 0 12 3Zm-4 6a4 4 0 1 1 8.001.001A4 4 0 0 1 8 9Z"
              />
            </svg> -->
            <i class="pi pi-shop"></i>
          </span>
          <h2
            class="hidden sm:inline text-2xl sm:text-xl font-bold text-center sm:text-left text-black"
          >
            Daftarkan UMKM
          </h2>
        </div>

        <p
          class="hidden sm:inline text-xs sm:text-sm text-center sm:text-left mb-6 text-gray-600"
        >
          Isi data diri dan informasi UMKM-mu untuk memulai perjalananmu bersama
          kami
        </p>

        <Form @submit="handleRegister" :validation-schema="schema">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nama Usaha -->
            <TextField
              name="name"
              label="Nama Usaha"
              placeholder="Masukkan nama usaha"
              class="sm:col-span-2"
            />

            <!-- Phone Number -->
            <TextField
              name="phone"
              label="Nomor Telepon"
              placeholder="Contoh: 081234567890"
              class="sm:col-span-2"
            />

            <!-- Jenis Usaha (dari API /segmentations) -->
            <SelectField
              name="segmentation_id"
              label="Jenis Usaha"
              placeholder="Pilih Jenis Usaha"
              v-model="segmentationId"
              :loading="segmentationsLoading"
              :disabled="segmentationsLoading"
              :options="
                segmentations.map((s) => ({ value: s.id, label: s.name }))
              "
              class="sm:col-span-2"
            />

            <!-- Wilayah (nested di address.*) -->
            <SelectField
              name="address.province_id"
              label="Provinsi"
              placeholder="Pilih Provinsi"
              v-model="provinceId"
              :loading="provincesLoading"
              :options="provinces.map((p) => ({ value: p.id, label: p.name }))"
            />

            <SelectField
              name="address.city_id"
              label="Kabupaten/Kota"
              placeholder="Pilih Kabupaten/Kota"
              v-model="cityId"
              :loading="citiesLoading"
              :disabled="!provinceId"
              :options="cities.map((r) => ({ value: r.id, label: r.name }))"
            />

            <SelectField
              name="address.district_id"
              label="Kecamatan"
              placeholder="Pilih Kecamatan"
              v-model="districtId"
              :loading="districtsLoading"
              :disabled="!cityId"
              :options="districts.map((d) => ({ value: d.id, label: d.name }))"
            />

            <SelectField
              name="address.village_id"
              label="Desa"
              placeholder="Pilih Desa"
              v-model="villageId"
              :loading="villagesLoading"
              :disabled="!districtId"
              :options="villages.map((v) => ({ value: v.id, label: v.name }))"
            />

            <!-- Pemetaan Lokasi -->
            <div class="sm:col-span-2">
              <MapPicker
                v-model:lat="latitude"
                v-model:lng="longitude"
                :zoom="15"
              />
            </div>

            <!-- Koordinat (nested di address.*) -->
            <TextField
              name="address.latitude"
              label="Latitude"
              v-model="latitude"
              :readonly="true"
              placeholder="-6.200000"
            />
            <TextField
              name="address.longitude"
              label="Longitude"
              v-model="longitude"
              :readonly="true"
              placeholder="106.816666"
            />

            <!-- Detail alamat (nested di address.detail) -->
            <TextField
              name="address.detail"
              label="Alamat Lengkap"
              placeholder="Nama jalan, RT/RW, patokan, dsb (opsional)"
              class="sm:col-span-2"
            />

            <!-- Error -->
            <ErrorAlert :message="errorMessage" class="sm:col-span-2" />

            <!-- Submit -->
            <div class="sm:col-span-2">
              <AppButton
                type="submit"
                :loading="isLoading"
                variant="primary"
                size="md"
                block
                class="mb-2"
              >
                Daftarkan UMKM
              </AppButton>
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
import { Form } from "vee-validate";
import * as yup from "yup";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
} from "@/services/api/location";
import { getSegmentations } from "@/services/api/segmentation";
import { registerMerchant } from "@/services/api/merchant";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import ErrorAlert from "@/components/forms/ErrorAlert.vue";
import MapPicker from "@/components/forms/MapPicker.vue";
import { useToast } from "vue-toastification";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const toast = useToast(); // NEW

const isLoading = ref(false);
const errorMessage = ref("");
const apiUrl = import.meta.env.VITE_API_BASE_URL || "Not set";
const isDev = import.meta.env.DEV;

const latitude = ref(null);
const longitude = ref(null);

// Segmentation (Select dari API)
const segmentations = ref([]);
const segmentationId = ref("");

// Validation Schema (pakai objek address)
const schema = yup.object({
  name: yup.string().required("Nama wajib diisi"),
  phone: yup
    .string()
    .matches(/^[0-9+\-()\s]{8,20}$/, "Nomor telepon tidak valid")
    .required("Nomor telepon wajib diisi"),
  segmentation_id: yup
    .number()
    .typeError("Jenis usaha wajib dipilih")
    .required("Jenis usaha wajib dipilih"),
  description: yup.string().nullable(),
  address: yup.object({
    province_id: yup
      .number()
      .typeError("Provinsi wajib dipilih")
      .required("Provinsi wajib dipilih"),
    city_id: yup
      .number()
      .typeError("Kabupaten/Kota wajib dipilih")
      .required("Kabupaten/Kota wajib dipilih"),
    district_id: yup
      .number()
      .typeError("Kecamatan wajib dipilih")
      .required("Kecamatan wajib dipilih"),
    village_id: yup
      .number()
      .typeError("Desa wajib dipilih")
      .required("Desa wajib dipilih"),
    detail: yup.string().nullable(),
    latitude: yup
      .number()
      .typeError("Latitude tidak valid")
      .min(-90)
      .max(90)
      .required("Latitude wajib diisi"),
    longitude: yup
      .number()
      .typeError("Longitude tidak valid")
      .min(-180)
      .max(180)
      .required("Longitude wajib diisi"),
  }),
});

// Data wilayah
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);

const provinceId = ref("");
const cityId = ref("");
const districtId = ref("");
const villageId = ref("");

// Loading flags untuk setiap dropdown
const segmentationsLoading = ref(false);
const provincesLoading = ref(false);
const citiesLoading = ref(false);
const districtsLoading = ref(false);
const villagesLoading = ref(false);

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

async function loadSegmentations() {
  segmentationsLoading.value = true;
  try {
    segmentations.value = await getSegmentations();
  } catch (e) {
    console.error("Gagal memuat segmentations:", e);
    segmentations.value = [];
  } finally {
    segmentationsLoading.value = false;
  }
}

watch(provinceId, async (val) => {
  cityId.value = "";
  districtId.value = "";
  villageId.value = "";
  cities.value = [];
  districts.value = [];
  villages.value = [];
  await loadCities(val);
});
watch(cityId, async (val) => {
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
  loadSegmentations();
});

// Submit pakai service
const handleRegister = async (values) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      name: values.name,
      phone: values.phone, // NEW
      description: values.description,
      segmentation_id: Number(values.segmentation_id),
      address: {
        province_id: Number(values.address.province_id),
        city_id: Number(values.address.city_id),
        district_id: Number(values.address.district_id),
        village_id: Number(values.address.village_id),
        detail: values.address.detail || null,
        latitude: Number(values.address.latitude),
        longitude: Number(values.address.longitude),
      },
    };
    await registerMerchant(payload);

    toast.success("Pendaftaran UMKM dikirim. Menunggu persetujuan admin.", {
      timeout: 3000,
    }); // NEW
    router.push("/dashboard");
  } catch (error) {
    console.error("Register merchant error:", error);
    if (error.response?.data?.errors) {
      errorMessage.value = Object.values(error.response.data.errors)
        .flat()
        .join(", ");
    } else {
      errorMessage.value =
        error.response?.data?.message ||
        "Registrasi merchant gagal. Silakan coba lagi.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
