<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import api from "@/libs/axios";
import { getImageUrl } from "@/libs/getImageUrl.js";

// Format currency helper
const formatCurrency = (value) => {
  if (!value) return "";
  const num = Number(value);
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const parseCurrency = (value) => {
  if (!value) return 0;
  return Number(String(value).replace(/\D/g, ""));
};

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();

const currentMerchantSlug = computed(() => {
  return route.params.merchantSlug
    ? String(route.params.merchantSlug)
    : authStore.merchantSlug || null;
});

const currentMerchantId = computed(() => {
  const merchant = currentMerchantSlug.value
    ? authStore.getMerchantBySlug(currentMerchantSlug.value)
    : authStore.activeMerchant;

  return merchant?.id ?? null;
});

const currentJasaId = computed(() => {
  return route.params.id ? Number(route.params.id) : null;
});

const breadcrumbItems = computed(() => [
  {
    label: "Jasa",
    path: `/merchant-center/${currentMerchantSlug.value}/jasas`,
  },
  { label: "Edit Jasa" },
]);

// State
const loading = ref(false);
const loadingData = ref(true);
const jasaCategories = ref([]);
const jasaSubcategories = ref([]);
const formKey = ref(0);

// Image management
const existingImages = ref([]);
const imagesToRemove = ref([]);
const newImageFiles = ref([]);

// Helper for previewing new image files
const getNewImagePreviewUrl = (file) => {
  if (!file) return "";
  return URL.createObjectURL(file);
};

// Form data
const formData = ref({
  title: "",
  description: "",
  jasa_category_id: null,
  jasa_subcategory_id: null,
  fixed_price: 0,
  base_price: 0,
  service_type: "at_location",
  location_address: "",
  service_area: "",
  special_notes: "",
  payment_methods: "cod",
  status: "draft",
  operating_days: "1,2,3,4,5,6,7",
  operating_times: "",
});

// Hari layanan options
const dayOptions = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

// Waktu layanan options
const timeOptions = [
  // Pagi
  { value: "06.00", label: "06.00", period: "morning" },
  { value: "06.30", label: "06.30", period: "morning" },
  { value: "07.00", label: "07.00", period: "morning" },
  { value: "07.30", label: "07.30", period: "morning" },
  { value: "08.00", label: "08.00", period: "morning" },
  { value: "08.30", label: "08.30", period: "morning" },
  { value: "09.00", label: "09.00", period: "morning" },
  { value: "09.30", label: "09.30", period: "morning" },
  { value: "10.00", label: "10.00", period: "morning" },
  { value: "10.30", label: "10.30", period: "morning" },
  { value: "11.00", label: "11.00", period: "morning" },
  { value: "11.30", label: "11.30", period: "morning" },
  // Siang
  { value: "12.00", label: "12.00", period: "afternoon" },
  { value: "12.30", label: "12.30", period: "afternoon" },
  { value: "13.00", label: "13.00", period: "afternoon" },
  { value: "13.30", label: "13.30", period: "afternoon" },
  { value: "14.00", label: "14.00", period: "afternoon" },
  { value: "14.30", label: "14.30", period: "afternoon" },
  { value: "15.00", label: "15.00", period: "afternoon" },
  { value: "15.30", label: "15.30", period: "afternoon" },
  { value: "16.00", label: "16.00", period: "afternoon" },
  { value: "16.30", label: "16.30", period: "afternoon" },
  { value: "17.00", label: "17.00", period: "afternoon" },
  // Malam
  { value: "17.30", label: "17.30", period: "evening" },
  { value: "18.00", label: "18.00", period: "evening" },
  { value: "18.30", label: "18.30", period: "evening" },
  { value: "19.00", label: "19.00", period: "evening" },
  { value: "19.30", label: "19.30", period: "evening" },
  { value: "20.00", label: "20.00", period: "evening" },
  { value: "20.30", label: "20.30", period: "evening" },
  { value: "21.00", label: "21.00", period: "evening" },
];

const morningTimes = timeOptions.filter((t) => t.period === "morning");
const afternoonTimes = timeOptions.filter((t) => t.period === "afternoon");
const eveningTimes = timeOptions.filter((t) => t.period === "evening");

// Computed untuk selected days
const selectedDays = computed(() => {
  if (!formData.value.operating_days) return [];
  return formData.value.operating_days
    .split(",")
    .map((d) => parseInt(d.trim()))
    .filter((d) => !isNaN(d));
});

// Computed untuk selected times
const selectedTimes = computed(() => {
  if (!formData.value.operating_times) return [];
  return formData.value.operating_times
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
});

// Toggle day selection
const toggleDay = (dayValue) => {
  const current = selectedDays.value;
  const index = current.indexOf(dayValue);
  if (index > -1) {
    if (current.length > 1) {
      current.splice(index, 1);
    }
  } else {
    current.push(dayValue);
  }
  current.sort((a, b) => a - b);
  formData.value.operating_days = current.join(",");
};

// Toggle time selection
const toggleTime = (timeValue) => {
  const current = [...selectedTimes.value];
  const index = current.indexOf(timeValue);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(timeValue);
  }
  current.sort((a, b) => a.localeCompare(b));
  formData.value.operating_times = current.join(",");
};

// Select all times in a period
const selectAllPeriod = (period) => {
  const periodTimes = timeOptions
    .filter((t) => t.period === period)
    .map((t) => t.value);
  const current = [...selectedTimes.value];
  const allSelected = periodTimes.every((t) => current.includes(t));

  if (allSelected) {
    formData.value.operating_times = current
      .filter((t) => !periodTimes.includes(t))
      .join(",");
  } else {
    const newTimes = [...new Set([...current, ...periodTimes])];
    newTimes.sort((a, b) => a.localeCompare(b));
    formData.value.operating_times = newTimes.join(",");
  }
};

// Check if all times in period are selected
const isAllPeriodSelected = (period) => {
  const periodTimes = timeOptions
    .filter((t) => t.period === period)
    .map((t) => t.value);
  return periodTimes.every((t) => selectedTimes.value.includes(t));
};

// Validation schema
const validationSchema = yup.object({
  title: yup.string().required("Nama layanan wajib diisi"),
  description: yup.string().nullable(),
  jasa_category_id: yup.number().required("Kategori layanan wajib dipilih"),
  jasa_subcategory_id: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === null ? null : value;
    })
    .nullable(),
  fixed_price: yup.number().min(0).required("Harga tetap wajib diisi"),
  base_price: yup.number().min(0).required("Harga mulai dari wajib diisi"),
  service_type: yup.string().required("Tipe layanan wajib dipilih"),
  location_address: yup.string().nullable(),
  service_area: yup.string().nullable(),
  special_notes: yup.string().nullable(),
  payment_methods: yup.string().nullable(),
  status: yup.string(),
});

const loadCategories = async () => {
  try {
    const { data } = await api.get("/api/public/categories/level-1");
    // Backend mengembalikan { success, message, data: [...] }
    jasaCategories.value = data.data ?? data;
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const loadSubcategories = async (categoryId) => {
  if (!categoryId) {
    jasaSubcategories.value = [];
    return;
  }
  try {
    console.log("Loading subcategories for category:", categoryId);
    const { data } = await api.get(
      `/api/public/categories/${categoryId}/sub-categories`
    );
    console.log("Subcategories loaded:", data);
    jasaSubcategories.value = data.data ?? data;
  } catch (error) {
    console.error("Error loading subcategories:", error);
    jasaSubcategories.value = [];
  }
};

const handleCategoryChange = async (value) => {
  console.log("Category changed to:", value);
  formData.value.jasa_category_id = value;
  formData.value.jasa_subcategory_id = null;
  await loadSubcategories(value);
};

// Handle new image file selection
const handleNewImageChange = (e) => {
  const files = e.target.files;
  if (files && files.length) {
    newImageFiles.value = Array.from(files);
    console.log(
      "New images selected:",
      newImageFiles.value.length,
      newImageFiles.value.map((f) => f.name)
    );
  }
};

const loadJasa = async () => {
  if (!currentJasaId.value) {
    toast.error("Jasa ID tidak ditemukan");
    return;
  }

  loadingData.value = true;
  try {
    const { data } = await api.get(`/api/jasa/${currentJasaId.value}`);

    // Handle both wrapped and direct responses
    const jasaData = data.data || data;

    console.log("[Editjasa] Raw API response:", data);
    console.log("[Editjasa] Extracted jasaData:", jasaData);
    console.log("[Editjasa] Title value:", jasaData.title);

    // Store existing images (relasi baru)
    existingImages.value = jasaData.images || [];

    // Fallback: jika belum ada relasi images tapi ada field legacy `image`, jadikan sebagai satu gambar awal
    if (
      (!existingImages.value || existingImages.value.length === 0) &&
      jasaData.image
    ) {
      existingImages.value = [
        {
          id: null,
          path: jasaData.image,
          is_cover: true,
        },
      ];
    }
    imagesToRemove.value = [];
    newImageFiles.value = [];

    // Initialize form with loaded data
    formData.value = {
      title: jasaData.title || "",
      description: jasaData.description || "",
      jasa_category_id: jasaData.jasa_category_id || null,
      jasa_subcategory_id: jasaData.jasa_subcategory_id || null,
      fixed_price: parseInt(jasaData.fixed_price) || 0,
      base_price: parseInt(jasaData.base_price) || 0,
      service_type: jasaData.service_type || "at_location",
      location_address: jasaData.location_address || "",
      service_area: jasaData.service_area || "",
      special_notes: jasaData.special_notes || "",
      payment_methods: jasaData.payment_methods || "cod",
      status: jasaData.status || "draft",
      operating_days: jasaData.operating_days || "1,2,3,4,5,6,7",
      operating_times: jasaData.operating_times || "",
    };

    // Load subcategories if category is selected
    if (formData.value.jasa_category_id) {
      await loadSubcategories(formData.value.jasa_category_id);
    }

    // Force form re-render
    formKey.value += 1;
  } catch (error) {
    console.error("Error loading jasa:", error);
    toast.error("Gagal memuat data jasa");
  } finally {
    loadingData.value = false;
  }
};

const submitForm = async (values) => {
  if (!currentJasaId.value) {
    toast.error("Jasa ID tidak ditemukan");
    return;
  }

  // Check authentication
  if (!authStore.isAuthenticated) {
    toast.error("Anda belum login. Silakan login terlebih dahulu.");
    router.push("/login");
    return;
  }

  loading.value = true;
  try {
    // Build FormData for multipart submission
    const fd = new FormData();

    // Laravel doesn't parse multipart PUT requests correctly, use POST with _method
    fd.append("_method", "PUT");

    // Add all form fields
    Object.entries(values).forEach(([key, value]) => {
      if (key === "title" || key === "location_address") {
        // Use formData values for fields with v-model
        fd.append(key, formData.value[key] ?? "");
      } else {
        fd.append(key, value ?? "");
      }
    });

    // Explicitly add fields that use v-model on formData
    fd.set("status", formData.value.status);
    fd.set("service_type", formData.value.service_type);
    fd.set("operating_days", formData.value.operating_days);
    fd.set("operating_times", formData.value.operating_times || "");

    // Ensure integer prices
    fd.set("fixed_price", parseInt(values.fixed_price) || 0);
    fd.set("base_price", parseInt(values.base_price) || 0);

    // Add new images if any
    if (newImageFiles.value && newImageFiles.value.length) {
      newImageFiles.value.forEach((file) => fd.append("images[]", file));
    }

    // Add images to remove (if backend supports it)
    if (imagesToRemove.value.length) {
      fd.append("remove_images", JSON.stringify(imagesToRemove.value));
    }

    console.log("Submitting jasa with FormData", {
      status: formData.value.status,
      new_images_count: newImageFiles.value.length,
      images_to_remove: imagesToRemove.value.length,
    });

    // Use POST with _method spoofing for multipart compatibility
    // Biarkan axios yang set header multipart/form-data + boundary secara otomatis
    const { data } = await api.post(`/api/jasa/${currentJasaId.value}`, fd);

    toast.success("Jasa berhasil diperbarui!");

    // Force reload the list page
    router.push(
      `/merchant-center/${currentMerchantSlug.value}/jasas?t=${Date.now()}`
    );
  } catch (error) {
    console.error("Error updating jasa:", error);
    const msg = error.response?.data?.message || "Gagal memperbarui jasa";
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCategories();
  loadJasa();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="mt-6 max-w-5xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Edit Layanan Jasa</h1>

        <!-- Loading State -->
        <div v-if="loadingData" class="flex justify-center items-center py-20">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-merchant-primary"
          ></div>
        </div>

        <Form
          v-else
          :key="formKey"
          :validationSchema="validationSchema"
          :initialValues="formData"
          @submit="submitForm"
          v-slot="{ handleSubmit }"
        >
          <form @submit.prevent="handleSubmit(submitForm)" class="space-y-6">
            <!-- 1. KLASIFIKASI LAYANAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                1. Klasifikasi Layanan
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Nama Layanan <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="Contoh: Jasa Kebersihan Rumah"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                    required
                  />
                </div>

                <SelectField
                  name="jasa_category_id"
                  label="Pilih Kategori Utama"
                  placeholder="Pilih kategori..."
                  :options="
                    jasaCategories.map((c) => ({
                      value: c.value ?? c.id,
                      label: c.label ?? c.name,
                    }))
                  "
                  v-model="formData.jasa_category_id"
                  @update:modelValue="handleCategoryChange"
                  required
                />

                <SelectField
                  name="jasa_subcategory_id"
                  label="Pilih Jenis Layanan Lebih Spesifik"
                  placeholder="Pilih sub kategori..."
                  :options="
                    jasaSubcategories.map((s) => ({
                      value: s.value ?? s.id,
                      label: s.label ?? s.name,
                    }))
                  "
                  v-model="formData.jasa_subcategory_id"
                />

                <Field name="description" v-slot="{ field }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Jelaskan Layanan Anda</label
                    >
                    <textarea
                      v-bind="field"
                      placeholder="Tuliskan detail tentang layanan yang Anda tawarkan..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      rows="3"
                    />
                  </div>
                </Field>
              </div>
            </div>

            <!-- 2. HARGA -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                2. Pengaturan Harga
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="fixed_price" v-slot="{ field, errors }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Harga Tetap</label
                    >
                    <div class="relative">
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="
                          (e) => field.onChange(parseCurrency(e.target.value))
                        "
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>
                    <p v-if="errors[0]" class="text-red-500 text-sm mt-1">
                      {{ errors[0] }}
                    </p>
                  </div>
                </Field>

                <Field name="base_price" v-slot="{ field, errors }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1"
                      >Harga Mulai Dari</label
                    >
                    <div class="relative">
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="
                          (e) => field.onChange(parseCurrency(e.target.value))
                        "
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>
                    <p v-if="errors[0]" class="text-red-500 text-sm mt-1">
                      {{ errors[0] }}
                    </p>
                  </div>
                </Field>
              </div>
            </div>

            <!-- 3. GAMBAR -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                3. Gambar
              </h2>

              <!-- Existing Images -->
              <div v-if="existingImages.length" class="mb-4">
                <label
                  class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <i class="pi pi-images text-gray-400 text-sm"></i>
                  <span>Gambar Saat Ini</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    v-for="(image, idx) in existingImages"
                    :key="image.id ?? idx"
                    class="relative group"
                  >
                    <div
                      v-if="!imagesToRemove.includes(image.id)"
                      class="relative"
                    >
                      <img
                        :src="getImageUrl(image.path || image.id)"
                        alt="preview"
                        class="w-full h-28 object-cover rounded border border-gray-200 bg-gray-50"
                        @error="(e) => (e.target.style.display = 'none')"
                      />
                      <span
                        v-if="image.is_cover"
                        class="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                      >
                        Cover
                      </span>
                      <div
                        class="absolute bottom-1 right-1 bg-white/90 text-gray-500 rounded-full p-1 shadow-sm flex items-center justify-center text-[10px] group-hover:bg-merchant-primary/90 group-hover:text-white transition"
                      >
                        <i class="pi pi-image"></i>
                      </div>
                      <button
                        type="button"
                        @click="imagesToRemove.push(image.id)"
                        class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        title="Hapus gambar"
                      >
                        <i class="pi pi-times text-xs"></i>
                      </button>
                    </div>
                    <div
                      v-else
                      class="w-full h-28 bg-gray-100 rounded border flex items-center justify-center"
                    >
                      <div class="text-center">
                        <i class="pi pi-trash text-gray-400 text-xl mb-1"></i>
                        <p class="text-xs text-gray-500">Akan dihapus</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upload New Images -->
              <div class="space-y-3">
                <div>
                  <label
                    class="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"
                  >
                    <i class="pi pi-image text-gray-400 text-sm"></i>
                    <span>Unggah Gambar Baru (opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleNewImageChange"
                    class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-merchant-primary/10 file:text-merchant-primary hover:file:bg-merchant-primary/20"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Gambar baru akan ditambahkan ke gambar yang ada.
                  </p>
                </div>

                <div
                  v-if="newImageFiles.length"
                  class="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  <div
                    v-for="(file, idx) in newImageFiles"
                    :key="idx"
                    class="relative rounded-lg border border-gray-200 overflow-hidden group bg-gray-50"
                  >
                    <img
                      :src="getNewImagePreviewUrl(file)"
                      alt="preview"
                      class="w-full h-28 object-cover"
                    />
                    <span
                      class="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                    >
                      Baru
                    </span>
                    <div
                      class="absolute bottom-1 right-1 bg-white/90 text-gray-500 rounded-full p-1 shadow-sm flex items-center justify-center text-[10px] group-hover:bg-merchant-primary/90 group-hover:text-white transition"
                    >
                      <i class="pi pi-image"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. LOKASI -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                4. Lokasi & Area Layanan
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  name="service_type"
                  label="Tempat Layanan?"
                  :options="[
                    { value: 'at_location', label: 'Di Tempat Saya' },
                    { value: 'on_site', label: 'Ke Rumah/Lokasi Pelanggan' },
                    { value: 'online', label: 'Online' },
                  ]"
                  v-model="formData.service_type"
                  required
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Alamat Tempat Layanan</label
                  >
                  <input
                    v-model="formData.location_address"
                    type="text"
                    placeholder="Masukkan alamat..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                  />
                </div>
              </div>
            </div>

            <!-- 5. HARI LAYANAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                5. Hari Layanan
              </h2>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3"
                  >Pilih Hari Buka Layanan</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="day in dayOptions"
                    :key="day.value"
                    type="button"
                    @click="toggleDay(day.value)"
                    class="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                    :class="[
                      selectedDays.includes(day.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary',
                    ]"
                  >
                    {{ day.label }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  <i class="pi pi-info-circle mr-1"></i>
                  Klik untuk memilih/membatalkan hari. Minimal pilih 1 hari.
                </p>
              </div>
            </div>

            <!-- 6. JAM LAYANAN (OPTIONAL) -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                6. Jam Layanan
                <span class="text-sm font-normal text-gray-500"
                  >(Opsional)</span
                >
              </h2>
              <p class="text-sm text-gray-600 mb-4">
                Pilih jam-jam yang tersedia untuk layanan Anda. Kosongkan jika
                tidak ingin membatasi jam.
              </p>

              <!-- Pagi -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700"
                    >Pagi (06.00 - 11.30)</span
                  >
                  <button
                    type="button"
                    @click="selectAllPeriod('morning')"
                    class="text-xs text-merchant-primary hover:underline"
                  >
                    {{
                      isAllPeriodSelected("morning")
                        ? "Hapus Semua"
                        : "Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in morningTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-3 py-1.5 rounded-lg border text-sm transition-all duration-200"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <!-- Siang -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700"
                    >Siang (12.00 - 17.00)</span
                  >
                  <button
                    type="button"
                    @click="selectAllPeriod('afternoon')"
                    class="text-xs text-merchant-primary hover:underline"
                  >
                    {{
                      isAllPeriodSelected("afternoon")
                        ? "Hapus Semua"
                        : "Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in afternoonTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-3 py-1.5 rounded-lg border text-sm transition-all duration-200"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <!-- Malam -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700"
                    >Malam (17.30 - 21.00)</span
                  >
                  <button
                    type="button"
                    @click="selectAllPeriod('evening')"
                    class="text-xs text-merchant-primary hover:underline"
                  >
                    {{
                      isAllPeriodSelected("evening")
                        ? "Hapus Semua"
                        : "Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in eveningTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-3 py-1.5 rounded-lg border text-sm transition-all duration-200"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <p class="text-xs text-gray-500 mt-3">
                <i class="pi pi-info-circle mr-1"></i>
                {{
                  selectedTimes.length > 0
                    ? `${selectedTimes.length} waktu dipilih`
                    : "Tidak ada waktu dipilih (tersedia kapan saja)"
                }}
              </p>
            </div>

            <!-- 7. PEMBAYARAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                7. Pembayaran
              </h2>
              <div class="space-y-4">
                <!-- Metode Pembayaran -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3"
                    >Metode Pembayaran yang Diterima</label
                  >
                  <div class="space-y-2">
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="payment_cod"
                        :checked="formData.payment_methods.includes('cod')"
                        @change="
                          (e) => {
                            const methods = formData.payment_methods
                              .split(',')
                              .filter((m) => m)
                              .map((m) => m.trim());
                            if (e.target.checked) {
                              if (!methods.includes('cod')) methods.push('cod');
                            } else {
                              methods.splice(methods.indexOf('cod'), 1);
                            }
                            formData.payment_methods = methods.length
                              ? methods.join(',')
                              : 'cod';
                          }
                        "
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="payment_cod" class="text-sm text-gray-700"
                        >COD (Bayar di Tempat)</label
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 8. ADMIN -->
            <div class="pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">8. Admin</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  name="status"
                  label="Status Layanan"
                  :options="[
                    { value: 'draft', label: 'Simpan Dulu (Draft)' },
                    { value: 'active', label: 'Aktif - Bisa Dipesan' },
                    { value: 'inactive', label: 'Non-aktif - Sedang Tutup' },
                  ]"
                  v-model="formData.status"
                />
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <Button
                type="button"
                variant="muted-outline"
                @click="router.back()"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                :disabled="loading"
                :loading="loading"
              >
                {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: vertical;
}
</style>
