<script setup>
import { ref, computed, onMounted, watch } from "vue";
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

// File uploads
const imageFiles = ref([]);

const getNewImagePreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

// Format currency helper
const formatCurrency = (value) => {
  if (!value) return "";
  const num = Number(value);
  return ` ${num.toLocaleString("id-ID")}`;
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
  return route.params && route.params.merchantSlug
    ? String(route.params.merchantSlug)
    : authStore.merchantSlug ?? null;
});

// Needed for API endpoints that still require merchantId
const currentMerchantId = computed(() => {
  const slug = currentMerchantSlug.value;
  if (slug) {
    const merchant = authStore.getMerchantBySlug(slug);
    return merchant?.id ?? authStore.merchantId ?? null;
  }
  return authStore.merchantId ?? null;
});

const breadcrumbItems = computed(() => [
  {
    label: "Jasa",
    path: `/merchant-center/${currentMerchantSlug.value}/jasas`,
  },
  { label: "Tambah Jasa" },
]);

// State
const loading = ref(false);
const jasaCategories = ref([]);
const jasaSubcategories = ref([]);

// LocalStorage key for form draft
const FORM_DRAFT_KEY = `jasa-create-draft-${currentMerchantSlug.value}`;

// Form data
const formData = ref({
  title: "",
  description: "",
  jasa_category_id: null,
  jasa_subcategory_id: null,
  fixed_price: 0,
  base_price: 0,
  service_type: "at_location",
  service_area: "",
  special_notes: "",
  payment_methods: "cod",
  status: "draft",
  operating_days: "1,2,3,4,5,6,7", // Default semua hari
  operating_times: "", // Optional: format "08.00,08.30,09.00"
});

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

// Computed untuk selected times
const selectedTimes = computed(() => {
  if (!formData.value.operating_times) return [];
  return formData.value.operating_times
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
});

// Toggle time selection
const toggleTime = (timeValue) => {
  const current = [...selectedTimes.value];
  const index = current.indexOf(timeValue);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(timeValue);
  }
  // Sort by time
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
    // Deselect all in this period
    formData.value.operating_times = current
      .filter((t) => !periodTimes.includes(t))
      .join(",");
  } else {
    // Select all in this period
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

// Computed untuk selected days
const selectedDays = computed(() => {
  if (!formData.value.operating_days) return [];
  return formData.value.operating_days
    .split(",")
    .map((d) => parseInt(d.trim()))
    .filter((d) => !isNaN(d));
});

// Toggle day selection
const toggleDay = (dayValue) => {
  const current = selectedDays.value;
  const index = current.indexOf(dayValue);
  if (index > -1) {
    // Remove if already selected (but keep at least 1 day)
    if (current.length > 1) {
      current.splice(index, 1);
    }
  } else {
    // Add if not selected
    current.push(dayValue);
  }
  // Sort and update
  current.sort((a, b) => a - b);
  formData.value.operating_days = current.join(",");
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
  // Harga: wajib pilih salah satu, tidak boleh keduanya sekaligus > 0
  fixed_price: yup
    .number()
    .min(0)
    .test(
      "fixed-or-base-required",
      "Isi salah satu: harga tetap ATAU harga mulai dari",
      function (value) {
        const { base_price } = this.parent;
        const fixed = Number(value || 0);
        const base = Number(base_price || 0);
        // minimal salah satu > 0
        return fixed > 0 || base > 0;
      }
    )
    .test(
      "not-both-fixed-and-base",
      "Pilih salah satu: jangan isi keduanya sekaligus",
      function (value) {
        const { base_price } = this.parent;
        const fixed = Number(value || 0);
        const base = Number(base_price || 0);
        // valid jika hanya salah satu yang > 0
        const fixedFilled = fixed > 0;
        const baseFilled = base > 0;
        return !(fixedFilled && baseFilled);
      }
    ),
  base_price: yup
    .number()
    .min(0)
    .test(
      "base-or-fixed-required",
      "Isi salah satu: harga tetap ATAU harga mulai dari",
      function (value) {
        const { fixed_price } = this.parent;
        const base = Number(value || 0);
        const fixed = Number(fixed_price || 0);
        return base > 0 || fixed > 0;
      }
    )
    .test(
      "not-both-base-and-fixed",
      "Pilih salah satu: jangan isi keduanya sekaligus",
      function (value) {
        const { fixed_price } = this.parent;
        const base = Number(value || 0);
        const fixed = Number(fixed_price || 0);
        const baseFilled = base > 0;
        const fixedFilled = fixed > 0;
        return !(baseFilled && fixedFilled);
      }
    ),
  service_type: yup.string().required("Tipe layanan wajib dipilih"),
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

// Auto-save form data to localStorage
watch(
  formData,
  (newData) => {
    try {
      localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error("Failed to save form draft:", error);
    }
  },
  { deep: true }
);

// Restore form data from localStorage
const restoreFormDraft = () => {
  try {
    const saved = localStorage.getItem(FORM_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      formData.value = { ...formData.value, ...parsed };
      
      // Load subcategories if category is selected
      if (parsed.jasa_category_id) {
        loadSubcategories(parsed.jasa_category_id);
      }
      
      toast.info("Data form sebelumnya berhasil dipulihkan");
    }
  } catch (error) {
    console.error("Failed to restore form draft:", error);
  }
};

// Clear form draft from localStorage
const clearFormDraft = () => {
  try {
    localStorage.removeItem(FORM_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear form draft:", error);
  }
};

// Handle image file selection (bisa tambah berkali-kali)
const handleImageChange = (e) => {
  const files = e.target.files;
  if (files && files.length) {
    const picked = Array.from(files);
    const merged = [...imageFiles.value];

    picked.forEach((file) => {
      const exists = merged.some(
        (f) =>
          f.name === file.name &&
          f.size === file.size &&
          f.lastModified === file.lastModified
      );
      if (!exists) {
        merged.push(file);
      }
    });

    imageFiles.value = merged;
    console.log(
      "Images selected (total):",
      imageFiles.value.length,
      imageFiles.value.map((f) => f.name)
    );

    // reset input supaya bisa pilih file yang sama lagi jika perlu
    e.target.value = "";
  }
};

const removeSelectedImage = (index) => {
  if (index < 0 || index >= imageFiles.value.length) return;
  imageFiles.value.splice(index, 1);
};

const addPackage = () => {
  packages.value.push({
    name: "",
    description: "",
    price: 0,
  });
};

const removePackage = (index) => {
  packages.value.splice(index, 1);
};

const submitForm = async (values) => {
  if (!currentMerchantSlug.value) {
    toast.error("Merchant slug tidak ditemukan");
    return;
  }

  if (!currentMerchantId.value) {
    toast.error("Merchant ID tidak ditemukan");
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
    // Build multipart form data
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      // location_address sudah tidak digunakan lagi
      if (k === "location_address") return;
      fd.append(k, v ?? "");
    });
    // Paksa status selalu disimpan sebagai draft saat create
    fd.set("status", "draft");
    // Tambahkan operating_days dan operating_times dari formData
    fd.append("operating_days", formData.value.operating_days);
    fd.append("operating_times", formData.value.operating_times || "");

    // Append images[] if any
    if (imageFiles.value && imageFiles.value.length) {
      imageFiles.value.forEach((file) => fd.append("images[]", file));
    }

    console.log("Submitting jasa with FormData:", {
      ...values,
      operating_days: formData.value.operating_days,
      images_count: imageFiles.value.length,
    });

    // Biarkan axios yang set header multipart/form-data + boundary secara otomatis
    const { data } = await api.post(
      `/api/merchants/${currentMerchantSlug.value}/jasas`,
      fd
    );

    toast.success("Jasa berhasil dibuat!");
    
    // Informative toast about draft status
    setTimeout(() => {
      toast.info(
        "💡 Jasa Anda masih dalam status DRAFT. Silakan publikasikan agar dapat dilihat pelanggan.",
        {
          timeout: 8000,
          closeButton: true,
        }
      );
    }, 1500);
    
    // Clear form draft after successful submission
    clearFormDraft();
    
    router.push(`/merchant-center/${currentMerchantSlug.value}/jasas`);
  } catch (error) {
    console.error("Error creating jasa:", error);
    const msg = error.response?.data?.message || "Gagal membuat jasa";
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCategories();
  
  // Restore form draft from localStorage
  restoreFormDraft();
});
</script>

<template>
  <div class="min-h-screen p-4 bg-linear-to-br from-gray-50 to-gray-100 sm:p-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="max-w-4xl mx-auto mt-6">
      <div class="mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div
          class="px-6 py-8 bg-linear-to-r from-merchant-primary to-merchant-primary/80 rounded-t-xl"
        >
          <div class="flex items-start justify-between">
            <div>
              <h1 class="mb-2 text-3xl font-bold text-white">
                Buat Layanan Jasa Baru
              </h1>
              <p class="text-sm text-white/80">
                Isi formulir dibawah untuk menambahkan layanan jasa baru Anda
              </p>
            </div>
            <i class="text-4xl text-white pi pi-plus-circle opacity-20"></i>
          </div>
        </div>

        <Form
          :validationSchema="validationSchema"
          @submit="submitForm"
          :initialValues="formData"
          v-slot="{ handleSubmit, values, setFieldValue }"
        >
          <form
            @submit.prevent="handleSubmit(submitForm)"
            class="p-6 space-y-6"
          >
            <!-- 1. KLASIFIKASI LAYANAN -->
            <div
              class="p-5 border border-blue-100 bg-linear-to-r from-blue-50 to-transparent rounded-xl"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-500 rounded-full"
                >
                  1
                </div>
                <h2 class="text-lg font-bold text-gray-800">
                  Identitas Layanan
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field name="title" v-slot="{ field, errors }">
                  <div>
                    <TextField
                      :name="field.name"
                      :modelValue="field.value"
                      @update:modelValue="field.onChange"
                      @blur="field.onBlur"
                      label="Nama Layanan"
                      placeholder="Contoh: Jasa Kebersihan Rumah"
                      required
                    />
                    <p v-if="errors[0]" class="mt-1 text-sm text-red-500">
                      {{ errors[0] }}
                    </p>
                  </div>
                </Field>

                <SelectField
                  name="jasa_category_id"
                  label="Kategori Utama"
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
                  label="Jenis Layanan Spesifik"
                  :placeholder="
                    jasaSubcategories.length
                      ? 'Pilih sub kategori...'
                      : 'Tidak ada subkategori untuk kategori ini'
                  "
                  :options="
                    jasaSubcategories.map((s) => ({
                      value: s.value ?? s.id,
                      label: s.label ?? s.name,
                    }))
                  "
                  v-model="formData.jasa_subcategory_id"
                  :disabled="!jasaSubcategories.length"
                />

                <Field name="description" v-slot="{ field }">
                  <div class="sm:col-span-2">
                    <label
                      class="block mb-2 text-sm font-semibold text-gray-700"
                      >Deskripsi Layanan</label
                    >
                    <textarea
                      v-bind="field"
                      placeholder="Jelaskan detail tentang layanan Anda secara lengkap..."
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
                </Field>
              </div>
            </div>

            <!-- 2. HARGA -->
            <div
              class="p-5 border bg-linear-to-r from-emerald-50 to-transparent rounded-xl border-emerald-100"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-emerald-500"
                >
                  2
                </div>
                <h2 class="text-lg font-bold text-gray-800">
                  Pengaturan Harga
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field name="fixed_price" v-slot="{ field, errors }">
                  <div>
                    <label
                      class="block mb-2 text-sm font-semibold text-gray-700"
                      >Harga Tetap</label
                    >
                    <div class="relative">
                      <span
                        class="absolute font-medium text-gray-500 transform -translate-y-1/2 left-4 top-1/2"
                        >Rp</span
                      >
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="
                          (e) => {
                            const newValue = parseCurrency(e.target.value);
                            field.onChange(newValue);
                            // Auto-clear base_price jika fixed_price diisi
                            if (newValue > 0 && values?.base_price > 0) {
                              setFieldValue('base_price', 0);
                            }
                          }
                        "
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        :disabled="Number(values?.base_price || 0) > 0"
                      />
                    </div>
                    <p v-if="errors[0]" class="mt-1 text-sm text-red-500">
                      {{ errors[0] }}
                    </p>
                    <p
                      v-else
                      class="mt-1 text-sm"
                      :class="
                        Number(values?.base_price || 0) > 0
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      "
                    >
                      Pilih salah satu: jangan isi keduanya sekaligus
                    </p>
                  </div>
                </Field>

                <Field name="base_price" v-slot="{ field, errors }">
                  <div>
                    <label
                      class="block mb-2 text-sm font-semibold text-gray-700"
                      >Harga Mulai Dari</label
                    >
                    <div class="relative">
                      <span
                        class="absolute font-medium text-gray-500 transform -translate-y-1/2 left-4 top-1/2"
                        >Rp</span
                      >
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="
                          (e) => {
                            const newValue = parseCurrency(e.target.value);
                            field.onChange(newValue);
                            // Auto-clear fixed_price jika base_price diisi
                            if (newValue > 0 && values?.fixed_price > 0) {
                              setFieldValue('fixed_price', 0);
                            }
                          }
                        "
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        :disabled="Number(values?.fixed_price || 0) > 0"
                      />
                    </div>
                    <p v-if="errors[0]" class="mt-1 text-sm text-red-500">
                      {{ errors[0] }}
                    </p>
                    <p
                      v-else
                      class="mt-1 text-sm"
                      :class="
                        Number(values?.fixed_price || 0) > 0
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      "
                    >
                      Pilih salah satu: jangan isi keduanya sekaligus
                    </p>
                  </div>
                </Field>
              </div>
            </div>

            <!-- 3. GAMBAR -->
            <div
              class="p-5 border border-purple-100 bg-linear-to-r from-purple-50 to-transparent rounded-xl"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-purple-500 rounded-full"
                >
                  3
                </div>
                <h2 class="text-lg font-bold text-gray-800">Gambar Layanan</h2>
              </div>
              <div class="space-y-3">
                <div>
                  <label
                    for="create_jasa_images"
                    class="block mb-1 text-sm font-medium text-gray-700"
                    >Unggah Gambar (satu atau lebih)</label
                  >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="create_jasa_images"
                    name="images"
                    @change="handleImageChange"
                    class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-merchant-primary/10 file:text-merchant-primary hover:file:bg-merchant-primary/20"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    <span class="inline-flex items-center gap-1">
                      <i class="text-xs text-gray-400 pi pi-image"></i>
                      <span>Gambar pertama akan dijadikan cover.</span>
                    </span>
                  </p>
                </div>

                <div
                  v-if="imageFiles.length"
                  class="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  <div
                    v-for="(file, idx) in imageFiles"
                    :key="idx"
                    class="relative overflow-hidden border border-gray-200 rounded-lg group bg-gray-50"
                  >
                    <img
                      :src="getNewImagePreviewUrl(file)"
                      alt="preview"
                      class="object-cover w-full h-28"
                    />
                    <span
                      v-if="idx === 0"
                      class="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                    >
                      Cover
                    </span>
                    <button
                      type="button"
                      @click="removeSelectedImage(idx)"
                      class="absolute p-1 text-white transition bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                      title="Hapus gambar ini"
                    >
                      <i class="text-xs pi pi-times"></i>
                    </button>
                    <div
                      class="absolute bottom-1 right-1 bg-white/90 text-gray-500 rounded-full p-1 shadow-sm flex items-center justify-center text-[10px] group-hover:bg-merchant-primary/90 group-hover:text-white transition"
                    >
                      <i class="pi pi-image"></i>
                    </div>
                  </div>
                </div>

                <p v-if="imageFiles.length" class="text-xs text-gray-500">
                  {{ imageFiles.length }} gambar dipilih.
                </p>
              </div>
            </div>

            <!-- 4. LOKASI -->
            <div
              class="p-5 border border-orange-100 bg-linear-to-r from-orange-50 to-transparent rounded-xl"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-orange-500 rounded-full"
                >
                  4
                </div>
                <h2 class="text-lg font-bold text-gray-800">
                  Lokasi & Area Layanan
                </h2>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            <!-- 5. HARI LAYANAN -->
            <div
              class="p-5 border border-pink-100 bg-linear-to-r from-pink-50 to-transparent rounded-xl"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-pink-500 rounded-full"
                >
                  5
                </div>
                <h2 class="text-lg font-bold text-gray-800">Hari Layanan</h2>
              </div>
              <div>
                <label class="block mb-3 text-sm font-medium text-gray-700"
                  >Pilih Hari Buka Layanan</label
                >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="day in dayOptions"
                    :key="day.value"
                    type="button"
                    @click="toggleDay(day.value)"
                    class="px-4 py-2 text-sm font-medium transition-all duration-200 border rounded-lg"
                    :class="[
                      selectedDays.includes(day.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary',
                    ]"
                  >
                    {{ day.label }}
                  </button>
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  <i class="mr-1 pi pi-info-circle"></i>
                  Klik untuk memilih/membatalkan hari. Minimal pilih 1 hari.
                </p>
              </div>
            </div>

            <!-- 6. JAM LAYANAN (OPTIONAL) -->
            <div
              class="p-5 border bg-linear-to-r from-cyan-50 to-transparent rounded-xl border-cyan-100"
            >
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-cyan-500"
                >
                  6
                </div>
                <h2 class="text-lg font-bold text-gray-800">
                  Jam Layanan
                  <span class="text-sm font-normal text-gray-500"
                    >(Opsional)</span
                  >
                </h2>
              </div>
              
              <!-- Info Box -->
              <div class="p-4 mb-4 border-l-4 rounded-r-lg bg-cyan-50/50 border-cyan-400">
                <div class="flex gap-2">
                  <svg class="flex-shrink-0 w-5 h-5 mt-0.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-cyan-900">Cara Penggunaan:</p>
                    <ul class="mt-1.5 space-y-1 text-sm text-cyan-800">
                      <li class="flex items-start gap-1">
                        <span class="mt-1">•</span>
                        <span><strong>Klik tombol waktu</strong> untuk memilih jam layanan yang tersedia</span>
                      </li>
                      <li class="flex items-start gap-1">
                        <span class="mt-1">•</span>
                        <span>Gunakan <strong>"Pilih Semua"</strong> untuk memilih seluruh waktu dalam periode</span>
                      </li>
                      <li class="flex items-start gap-1">
                        <span class="mt-1">•</span>
                        <span><strong>Kosongkan</strong> jika layanan tersedia sepanjang hari tanpa batasan jam</span>
                      </li>
                    </ul>
                    <p class="mt-2 text-xs text-cyan-700 italic">Contoh: Jika layanan cuci motor hanya tersedia pagi dan siang, pilih jam-jam pada periode tersebut</p>
                  </div>
                </div>
              </div>

              <!-- Pagi -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🌅</span>
                    <span class="text-sm font-semibold text-gray-700"
                      >Pagi (06.00 - 11.30)</span
                    >
                  </div>
                  <button
                    type="button"
                    @click="selectAllPeriod('morning')"
                    class="px-3 py-1 text-xs font-medium transition-colors rounded-md text-merchant-primary bg-merchant-primary/10 hover:bg-merchant-primary/20"
                  >
                    {{
                      isAllPeriodSelected("morning")
                        ? "❌ Hapus Semua"
                        : "✓ Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in morningTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 shadow-sm"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary shadow-md transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary hover:shadow',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <!-- Siang -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">☀️</span>
                    <span class="text-sm font-semibold text-gray-700"
                      >Siang (12.00 - 17.00)</span
                    >
                  </div>
                  <button
                    type="button"
                    @click="selectAllPeriod('afternoon')"
                    class="px-3 py-1 text-xs font-medium transition-colors rounded-md text-merchant-primary bg-merchant-primary/10 hover:bg-merchant-primary/20"
                  >
                    {{
                      isAllPeriodSelected("afternoon")
                        ? "❌ Hapus Semua"
                        : "✓ Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in afternoonTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 shadow-sm"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary shadow-md transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary hover:shadow',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <!-- Malam -->
              <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🌙</span>
                    <span class="text-sm font-semibold text-gray-700"
                      >Malam (17.30 - 21.00)</span
                    >
                  </div>
                  <button
                    type="button"
                    @click="selectAllPeriod('evening')"
                    class="px-3 py-1 text-xs font-medium transition-colors rounded-md text-merchant-primary bg-merchant-primary/10 hover:bg-merchant-primary/20"
                  >
                    {{
                      isAllPeriodSelected("evening")
                        ? "❌ Hapus Semua"
                        : "✓ Pilih Semua"
                    }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="time in eveningTimes"
                    :key="time.value"
                    type="button"
                    @click="toggleTime(time.value)"
                    class="px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 shadow-sm"
                    :class="[
                      selectedTimes.includes(time.value)
                        ? 'bg-merchant-primary text-white border-merchant-primary shadow-md transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary hover:shadow',
                    ]"
                  >
                    {{ time.label }}
                  </button>
                </div>
              </div>

              <!-- Status Info -->
              <div class="flex items-center gap-2 p-3 mt-4 rounded-lg" :class="selectedTimes.length > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'">
                <svg v-if="selectedTimes.length > 0" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm font-medium" :class="selectedTimes.length > 0 ? 'text-green-700' : 'text-gray-600'">
                  {{
                    selectedTimes.length > 0
                      ? `✓ ${selectedTimes.length} waktu dipilih - Layanan tersedia pada waktu yang dipilih`
                      : "⏰ Tidak ada waktu dipilih - Layanan tersedia sepanjang hari"
                  }}
                </p>
              </div>
            </div>

            <!-- 7. PEMBAYARAN -->
            <div
              class="p-5 border bg-linear-to-r from-violet-50 to-transparent rounded-xl border-violet-100"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-violet-500"
                >
                  7
                </div>
                <h2 class="text-lg font-bold text-gray-800">
                  Metode Pembayaran
                </h2>
              </div>
              <div class="space-y-4">
                <!-- Metode Pembayaran (hanya COD) -->
                <div
                  class="flex items-center gap-3 p-4 bg-white border border-violet-100 rounded-xl"
                >
                  <div
                    class="flex items-center justify-center rounded-full w-9 h-9 bg-violet-100 text-violet-600"
                  >
                    <i class="pi pi-credit-card"></i>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">
                      COD (Bayar di Tempat)
                    </p>
                    <p class="text-xs text-gray-500">
                      Untuk saat ini, pembayaran jasa dilakukan langsung di
                      lokasi (cash on delivery).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 8. STATUS -->
            <div
              class="p-5 border border-red-100 bg-linear-to-r from-red-50 to-transparent rounded-xl"
            >
              <div class="flex items-center gap-3 mb-5">
                <div
                  class="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-red-500 rounded-full"
                >
                  8
                </div>
                <h2 class="text-lg font-bold text-gray-800">Status Layanan</h2>
              </div>
              <div>
                <p class="mb-2 text-sm text-gray-700">
                  Layanan baru akan disimpan sebagai
                  <span class="font-semibold text-orange-600">Draft</span>.
                </p>
                <p class="text-xs text-gray-500">
                  Setelah tersimpan, Anda dapat membuka halaman Edit untuk
                  mem-publish layanan atau mengarsipkannya sesuai kebutuhan.
                </p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <Button
                type="button"
                variant="muted-outline"
                @click="router.back()"
                class="flex-1"
              >
                <i class="mr-2 pi pi-arrow-left"></i>Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                :disabled="loading"
                :loading="loading"
                class="flex-1"
              >
                <i class="mr-2 pi pi-check"></i
                >{{ loading ? "Menyimpan..." : "Simpan Jasa" }}
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
