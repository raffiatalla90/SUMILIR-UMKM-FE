<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useProfileStore } from "@/stores/profile";
import { Form, useForm } from "vee-validate";
import * as yup from "yup";
import MobileHeader from "@/components/customer/MobileHeader.vue";
import AppButton from "@/components/common/Button.vue";

import MapPicker from "@/components/forms/MapPicker.vue";
import SelectField from "@/components/forms/SelectField.vue";
import TextField from "@/components/forms/TextField.vue";
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
} from "@/services/api/location";
import { getMyAddress, upsertMyAddress } from "@/services/api/address";

const router = useRouter();
const toast = useToast();
const profileStore = useProfileStore();

const loading = ref(true);
const saving = ref(false);
const prefilling = ref(false);

const loadingProvinces = ref(false);
const loadingCities = ref(false);
const loadingDistricts = ref(false);
const loadingVillages = ref(false);

const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);

const schema = yup.object({
  province_id: yup.string().required("Pilih provinsi."),
  city_id: yup.string().required("Pilih kota/kabupaten."),
  district_id: yup.string().required("Pilih kecamatan."),
  village_id: yup.string().required("Pilih desa/kelurahan."),
  detail: yup.string().nullable(),
});

const { values, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    province_id: "",
    city_id: "",
    district_id: "",
    village_id: "",
    detail: "",
  },
});

const lat = ref(null);
const lng = ref(null);

const fullAddressPreview = computed(() => {
  const parts = [values.detail].filter(Boolean);
  return parts.join(", ");
});

function normalizeId(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

const goBack = () => {
  router.back();
};

async function loadProvinces() {
  loadingProvinces.value = true;
  try {
    const data = await getProvinces();
    provinces.value = Array.isArray(data) ? data : data?.data ?? [];
  } finally {
    loadingProvinces.value = false;
  }
}

async function loadCities(provinceId) {
  if (!provinceId) {
    cities.value = [];
    return;
  }
  loadingCities.value = true;
  try {
    const data = await getCities(provinceId);
    cities.value = Array.isArray(data) ? data : data?.data ?? [];
  } finally {
    loadingCities.value = false;
  }
}

async function loadDistricts(cityId) {
  if (!cityId) {
    districts.value = [];
    return;
  }
  loadingDistricts.value = true;
  try {
    const data = await getDistricts(cityId);
    districts.value = Array.isArray(data) ? data : data?.data ?? [];
  } finally {
    loadingDistricts.value = false;
  }
}

async function loadVillages(districtId) {
  if (!districtId) {
    villages.value = [];
    return;
  }
  loadingVillages.value = true;
  try {
    const data = await getVillages(districtId);
    villages.value = Array.isArray(data) ? data : data?.data ?? [];
  } finally {
    loadingVillages.value = false;
  }
}

watch(
  () => values.province_id,
  async (provinceId, prev) => {
    if (prefilling.value) return;
    if (provinceId === prev) return;
    setFieldValue("city_id", "");
    setFieldValue("district_id", "");
    setFieldValue("village_id", "");
    districts.value = [];
    villages.value = [];
    await loadCities(provinceId);
  }
);

watch(
  () => values.city_id,
  async (cityId, prev) => {
    if (prefilling.value) return;
    if (cityId === prev) return;
    setFieldValue("district_id", "");
    setFieldValue("village_id", "");
    villages.value = [];
    await loadDistricts(cityId);
  }
);

watch(
  () => values.district_id,
  async (districtId, prev) => {
    if (prefilling.value) return;
    if (districtId === prev) return;
    setFieldValue("village_id", "");
    await loadVillages(districtId);
  }
);

async function prefillFromApi() {
  const res = await getMyAddress();
  const address = res?.data ?? null;
  if (!address) return;

  prefilling.value = true;
  try {
    const provinceId = normalizeId(address.province_id);
    setFieldValue("province_id", provinceId);
    await loadCities(provinceId);

    const cityId = normalizeId(address.city_id);
    setFieldValue("city_id", cityId);
    await loadDistricts(cityId);

    const districtId = normalizeId(address.district_id);
    setFieldValue("district_id", districtId);
    await loadVillages(districtId);

    setFieldValue("village_id", normalizeId(address.village_id));
    setFieldValue("detail", address.detail ?? "");

    lat.value = address.latitude ?? null;
    lng.value = address.longitude ?? null;
  } finally {
    prefilling.value = false;
  }
}

async function handleSave(formValues) {
  saving.value = true;
  try {
    await upsertMyAddress({
      province_id: Number(formValues.province_id),
      city_id: Number(formValues.city_id),
      district_id: Number(formValues.district_id),
      village_id: Number(formValues.village_id),
      detail: formValues.detail || null,
      latitude: lat.value === "" ? null : lat.value,
      longitude: lng.value === "" ? null : lng.value,
    });
    await profileStore.fetchProfile();
    toast.success("Alamat berhasil disimpan");
    router.push("/profile");
  } catch (error) {
    console.error("Error saving address:", error);
    const message =
      error?.response?.data?.message ||
      "Gagal menyimpan alamat. Silakan coba lagi.";
    toast.error(message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await loadProvinces();
    await prefillFromApi();
  } catch (error) {
    console.error("Error loading address page:", error);
  } finally {
    loading.value = false;
  }
});

const provinceOptions = computed(() =>
  (provinces.value ?? []).map((p) => ({ value: String(p.id), label: p.name }))
);
const cityOptions = computed(() =>
  (cities.value ?? []).map((c) => ({ value: String(c.id), label: c.name }))
);
const districtOptions = computed(() =>
  (districts.value ?? []).map((d) => ({ value: String(d.id), label: d.name }))
);
const villageOptions = computed(() =>
  (villages.value ?? []).map((v) => ({ value: String(v.id), label: v.name }))
);
</script>

<template>
  <div class="">
    <MobileHeader title="Alamat Utama" @back="goBack" />

    <div class="px-4 py-4 mx-auto max-w-7xl">
      <div class="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <div v-if="loading" class="space-y-6 animate-pulse">
          <!-- Select Fields Skeleton -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="w-24 h-4 bg-gray-200 rounded" />
              <div class="w-full bg-gray-200 h-11 rounded-xl" />
            </div>
            <div class="space-y-2">
              <div class="w-32 h-4 bg-gray-200 rounded" />
              <div class="w-full bg-gray-200 h-11 rounded-xl" />
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-28" />
              <div class="w-full bg-gray-200 h-11 rounded-xl" />
            </div>
            <div class="space-y-2">
              <div class="w-32 h-4 bg-gray-200 rounded" />
              <div class="w-full bg-gray-200 h-11 rounded-xl" />
            </div>
          </div>

          <!-- Detail Address Skeleton -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-28" />
            <div class="w-full bg-gray-200 rounded-xl h-[92px]" />
          </div>

          <!-- Map Skeleton -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-28" />
            <div class="w-full bg-gray-200 rounded-xl h-80" />
          </div>

          <!-- Buttons Skeleton -->
          <div class="flex gap-4">
            <div class="flex-1 hidden h-12 bg-gray-200 sm:block rounded-xl" />
            <div class="flex-1 h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>

        <Form v-else @submit="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              name="province_id"
              label="Provinsi"
              :required="true"
              :options="provinceOptions"
              :loading="loadingProvinces"
              placeholder="Pilih provinsi"
              :modelValue="values.province_id"
              @update:modelValue="(v) => setFieldValue('province_id', v)"
            />

            <SelectField
              name="city_id"
              label="Kota/Kabupaten"
              :required="true"
              :options="cityOptions"
              :loading="loadingCities"
              :disabled="!values.province_id"
              placeholder="Pilih kota/kabupaten"
              :modelValue="values.city_id"
              @update:modelValue="(v) => setFieldValue('city_id', v)"
            />

            <SelectField
              name="district_id"
              label="Kecamatan"
              :required="true"
              :options="districtOptions"
              :loading="loadingDistricts"
              :disabled="!values.city_id"
              placeholder="Pilih kecamatan"
              :modelValue="values.district_id"
              @update:modelValue="(v) => setFieldValue('district_id', v)"
            />

            <SelectField
              name="village_id"
              label="Desa/Kelurahan"
              :required="true"
              :options="villageOptions"
              :loading="loadingVillages"
              :disabled="!values.district_id"
              placeholder="Pilih desa/kelurahan"
              :modelValue="values.village_id"
              @update:modelValue="(v) => setFieldValue('village_id', v)"
            />
          </div>

          <TextField
            name="detail"
            label="Detail Alamat"
            textarea
            :rows="3"
            placeholder="Contoh: Jl. Mawar No. 12, RT 01/RW 02"
            :modelValue="values.detail"
            @update:modelValue="(v) => setFieldValue('detail', v)"
          />

          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700">
              Lokasi di Peta
            </label>
            <MapPicker
              v-model:lat="lat"
              v-model:lng="lng"
              height="320px"
              variant="user"
            />
          </div>

          <div class="flex gap-4">
            <div class="hidden w-full sm:inline">
              <AppButton
                type="button"
                variant="muted-outline"
                class="w-full"
                @click="router.back()"
              >
                Batal
              </AppButton>
            </div>

            <AppButton
              type="submit"
              variant="primary"
              class="w-full"
              :loading="saving"
              :disabled="saving"
            >
              {{ saving ? "Menyimpan..." : "Simpan" }}
            </AppButton>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
