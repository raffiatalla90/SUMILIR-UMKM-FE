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
import { getImageUrl, getImageUrlJasa } from "@/libs/getImageUrl.js";

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
  return route.params && route.params.merchantSlug
    ? String(route.params.merchantSlug)
    : authStore.merchantSlug ?? null;
});

const currentMerchantId = computed(() => {
  const slug = currentMerchantSlug.value;
  if (slug) {
    const merchant = authStore.getMerchantBySlug(slug);
    return merchant?.id ?? authStore.merchantId ?? null;
  }
  return authStore.merchantId ?? null;
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

// LocalStorage key for form draft (unique per jasa ID)
const FORM_DRAFT_KEY = computed(
  () => `jasa-edit-draft-${currentJasaId.value}`
);

// Image management
const existingImages = ref([]);
const imagesToRemove = ref([]);
const newImageFiles = ref([]); // Array<File> untuk gambar baru yang diupload
const newImagePreviews = ref([]); // Array<string> blob URLs untuk preview gambar baru
const currentCoverId = ref(null);

// Helper untuk membuat URL preview satu kali per file
const buildNewImagePreviews = (files) => {
  // Bersihkan URL lama agar tidak bocor memori
  newImagePreviews.value.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  });

  newImagePreviews.value = files.map((file) => URL.createObjectURL(file));
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

// Auto-save form data to localStorage (debounced)
let saveTimeout = null;
watch(
  formData,
  (newData) => {
    if (!currentJasaId.value) return;
    
    // Debounce to avoid excessive writes
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(FORM_DRAFT_KEY.value, JSON.stringify(newData));
      } catch (error) {
        console.error("Failed to save form draft:", error);
      }
    }, 500);
  },
  { deep: true }
);

// Restore form data from localStorage
const restoreFormDraft = () => {
  if (!currentJasaId.value) return;
  
  try {
    const saved = localStorage.getItem(FORM_DRAFT_KEY.value);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Only restore if draft is newer than last load
      // This prevents overwriting with old data
      Object.assign(formData.value, parsed);
      
      // Load subcategories if category is selected
      if (parsed.jasa_category_id) {
        loadSubcategories(parsed.jasa_category_id);
      }
      
      toast.info("Perubahan yang belum disimpan berhasil dipulihkan");
    }
  } catch (error) {
    console.error("Failed to restore form draft:", error);
  }
};

// Clear form draft from localStorage
const clearFormDraft = () => {
  if (!currentJasaId.value) return;
  
  try {
    localStorage.removeItem(FORM_DRAFT_KEY.value);
  } catch (error) {
    console.error("Failed to clear form draft:", error);
  }
};

// Handle new image file selection (bisa tambah berkali-kali dan hapus sebelum simpan)
const handleNewImageChange = (e) => {
  const files = e.target.files;
  if (files && files.length) {
    const picked = Array.from(files);
    const merged = [...newImageFiles.value];

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

    newImageFiles.value = merged;
    buildNewImagePreviews(newImageFiles.value);
    console.log(
      "New images selected (total):",
      newImageFiles.value.length,
      newImageFiles.value.map((f) => f.name)
    );

    // reset input supaya bisa pilih file yang sama lagi jika perlu
    e.target.value = "";
  }
};

const removeNewImage = (index) => {
  if (index < 0 || index >= newImageFiles.value.length) return;
  newImageFiles.value.splice(index, 1);
  buildNewImagePreviews(newImageFiles.value);
};

const setAsCover = (image) => {
  if (!image || !image.id) return;
  currentCoverId.value = image.id;
  existingImages.value = existingImages.value.map((img) => ({
    ...img,
    is_cover: img.id === image.id,
  }));
};

const removeExistingImage = (image) => {
  if (!image || !image.id) return;
  if (!imagesToRemove.value.includes(image.id)) {
    imagesToRemove.value.push(image.id);
  }
  if (currentCoverId.value === image.id) {
    currentCoverId.value = null;
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

    const cover = existingImages.value.find((img) => img.is_cover && img.id);
    currentCoverId.value = cover ? cover.id : null;

    // Initialize form with loaded data
    formData.value = {
      title: jasaData.title || "",
      description: jasaData.description || "",
      jasa_category_id: jasaData.jasa_category_id || null,
      jasa_subcategory_id: jasaData.jasa_subcategory_id || null,
      fixed_price: parseInt(jasaData.fixed_price) || 0,
      base_price: parseInt(jasaData.base_price) || 0,
      service_type: jasaData.service_type || "at_location",
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

// Catatan: Di halaman edit jasa, alamat layanan selalu mengacu pada lokasi UMKM
// dan/atau area layanan yang diinput merchant. Kita tidak lagi mengambil
// lokasi perangkat customer di sini; lokasi customer hanya diminta saat booking.

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

    // Add all form fields (location_address sudah tidak digunakan lagi)
    Object.entries(values).forEach(([key, value]) => {
      if (key === "location_address") return;
      fd.append(key, value ?? "");
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

    // Set cover image id if selected
    if (currentCoverId.value) {
      fd.append("cover_image_id", currentCoverId.value);
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

    // Warn if status is still draft
    if (formData.value.status === 'draft') {
      setTimeout(() => {
        toast.info(
          "\ud83d\udca1 Jasa Anda masih dalam status DRAFT. Silakan publikasikan agar dapat dilihat pelanggan.",
          {
            timeout: 8000,
            closeButton: true,
          }
        );
      }, 1500);
    }

    // Clear form draft after successful submission
    clearFormDraft();

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
  
  // Restore form draft after data is loaded
  // Use nextTick to ensure loadJasa has populated the form first
  setTimeout(() => {
    restoreFormDraft();
  }, 1000);
});
</script>

<template>
  <div class="min-h-screen p-4 bg-linear-to-br from-gray-50 to-gray-100 sm:p-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="max-w-4xl mx-auto mt-6">
      <!-- Header Card -->
      <div class="mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div
          class="px-6 py-8 bg-linear-to-r from-merchant-primary to-merchant-primary/80 rounded-t-xl"
        >
          <div class="flex items-start justify-between">
            <div>
              <h1 class="mb-2 text-3xl font-bold text-white">
                Edit Layanan Jasa
              </h1>
              <p class="text-sm text-white/80">
                Perbarui informasi layanan jasa Anda di formulir dibawah
              </p>
            </div>
            <i class="text-4xl text-white pi pi-pencil opacity-20"></i>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="loadingData"
          class="flex items-center justify-center px-6 py-20"
        >
          <div class="text-center">
            <div
              class="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-merchant-primary"
            ></div>
            <p class="text-gray-500">Memuat data layanan...</p>
          </div>
        </div>

        <Form
          v-else
          :key="formKey"
          :validationSchema="validationSchema"
          :initialValues="formData"
          @submit="submitForm"
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
                    <label
                      class="block mb-2 text-sm font-semibold text-gray-700"
                      >Nama Layanan</label
                    >
                    <input
                      v-bind="field"
                      type="text"
                      placeholder="Contoh: Jasa Kebersihan Rumah"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <!-- Existing Images -->
              <div v-if="existingImages.length" class="mb-4">
                <label
                  class="inline-flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"
                >
                  <i class="text-sm text-gray-400 pi pi-images"></i>
                  <span>Gambar Saat Ini</span>
                </label>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                        :src="getImageUrlJasa(image.path || image.id)"
                        alt="preview"
                        class="object-cover w-full border border-gray-200 rounded h-28 bg-gray-50"
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
                        @click="removeExistingImage(image)"
                        class="absolute p-1 text-white transition bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                        title="Hapus gambar"
                      >
                        <i class="text-xs pi pi-times"></i>
                      </button>
                      <button
                        v-if="image.id && !image.is_cover"
                        type="button"
                        @click="setAsCover(image)"
                        class="absolute bottom-1 left-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition"
                        title="Jadikan cover"
                      >
                        Jadikan Cover
                      </button>
                    </div>
                    <div
                      v-else
                      class="flex items-center justify-center w-full bg-gray-100 border rounded h-28"
                    >
                      <div class="text-center">
                        <i class="mb-1 text-xl text-gray-400 pi pi-trash"></i>
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
                    for="edit_jasa_new_images"
                    class="inline-flex items-center gap-2 mb-1 text-sm font-medium text-gray-700"
                  >
                    <i class="text-sm text-gray-400 pi pi-image"></i>
                    <span>Unggah Gambar Baru (opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="edit_jasa_new_images"
                    name="new_images"
                    @change="handleNewImageChange"
                    class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-merchant-primary/10 file:text-merchant-primary hover:file:bg-merchant-primary/20"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Gambar baru akan ditambahkan ke gambar yang ada.
                  </p>
                </div>

                <div
                  v-if="newImageFiles.length"
                  class="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  <div
                    v-for="(file, idx) in newImageFiles"
                    :key="idx"
                    class="relative overflow-hidden border border-gray-200 rounded-lg group bg-gray-50"
                  >
                    <img
                      :src="newImagePreviews[idx] || ''"
                      alt="preview"
                      class="object-cover w-full h-28"
                    />
                    <span
                      class="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                    >
                      Baru
                    </span>
                    <button
                      type="button"
                      @click="removeNewImage(idx)"
                      class="absolute p-1 text-white transition bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                      title="Hapus gambar baru ini"
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
                <p v-if="newImageFiles.length" class="text-xs text-gray-500">
                  {{ newImageFiles.length }} gambar baru dipilih.
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
                  label="Tipe Layanan"
                  :options="[
                    { value: 'at_location', label: '📍 Di Tempat Saya' },
                    { value: 'on_site', label: '🏠 Ke Rumah Pelanggan' },
                    { value: 'online', label: '💻 Online' },
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
                <p class="mb-4 text-sm text-gray-600">
                  Pilih hari-hari saat layanan Anda aktif:
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="day in dayOptions"
                    :key="day.value"
                    type="button"
                    @click="toggleDay(day.value)"
                    class="px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 shadow-sm"
                    :class="[
                      selectedDays.includes(day.value)
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-500 hover:shadow-md',
                    ]"
                  >
                    {{ day.label }}
                  </button>
                </div>
                <p class="mt-3 text-xs text-gray-500">
                  <i class="mr-1 pi pi-check-circle"></i>
                  {{ selectedDays.length }} hari dipilih
                </p>
              </div>
            </div>

            <!-- 6. JAM LAYANAN -->
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
              <div class="space-y-3">
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
                <p
                  class="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800"
                >
                  Status saat ini:
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                    :class="[
                      formData.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : formData.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-700',
                    ]"
                  >
                    <span v-if="formData.status === 'draft'">📝 Draft</span>
                    <span v-else-if="formData.status === 'published'"
                      >✅ Dipublish</span
                    >
                    <span v-else>🔒 Diarsipkan</span>
                  </span>
                </p>
                <p class="mt-1 text-xs text-gray-600">
                  Draft: belum tampil ke pelanggan. Dipublish: bisa dipesan
                  pelanggan. Diarsipkan: disembunyikan dari pelanggan.
                </p>

                <div class="flex flex-wrap gap-3 mt-4">
                  <!-- Dari draft bisa langsung publish -->
                  <Button
                    v-if="formData.status === 'draft'"
                    type="button"
                    variant="primary"
                    @click="
                      formData.status = 'published';
                      handleSubmit(submitForm)();
                    "
                    class="flex items-center gap-2"
                  >
                    <i class="pi pi-check"></i>
                    Publish Sekarang
                  </Button>

                  <!-- Dari published bisa diarsipkan -->
                  <Button
                    v-if="formData.status === 'published'"
                    type="button"
                    variant="muted-outline"
                    @click="
                      formData.status = 'archived';
                      handleSubmit(submitForm)();
                    "
                    class="flex items-center gap-2 text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                  >
                    <i class="pi pi-box"></i>
                    Arsipkan Layanan
                  </Button>

                  <!-- Dari archived bisa dipublish lagi -->
                  <Button
                    v-if="formData.status === 'archived'"
                    type="button"
                    variant="primary"
                    @click="
                      formData.status = 'published';
                      handleSubmit(submitForm)();
                    "
                    class="flex items-center gap-2"
                  >
                    <i class="pi pi-upload"></i>
                    Publikasikan Lagi
                  </Button>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="muted-outline"
                @click="router.back()"
                class="flex-1"
              >
                <i class="mr-2 pi pi-arrow-left"></i>
                Kembali
              </Button>
              <Button
                type="submit"
                variant="primary"
                :disabled="loading"
                :loading="loading"
                class="flex-1"
              >
                <i class="mr-2 pi pi-check"></i>
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
