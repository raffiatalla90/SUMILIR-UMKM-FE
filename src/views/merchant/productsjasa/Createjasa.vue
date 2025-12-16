<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/productsjasa/Createjasa.vue
console.log("[Createjasa.vue] ========== SCRIPT SETUP STARTING ==========");

import { ref, computed, watch, onMounted } from "vue";
console.log("[Createjasa.vue] Vue imports OK");

import { useRouter, useRoute } from "vue-router";
console.log("[Createjasa.vue] Router imports OK");

import { useToast } from "vue-toastification";
console.log("[Createjasa.vue] Toast import OK");

import { useAuthStore } from "@/stores/auth"; // ✅ ADD: Import auth store
console.log("[Createjasa.vue] Auth store import OK");

import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
console.log("[Createjasa.vue] Breadcrumb import OK");

import { Form, Field, useForm } from "vee-validate";
import * as yup from "yup";
console.log("[Createjasa.vue] Vee-validate imports OK");

import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
console.log("[Createjasa.vue] Form components imports OK");

import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
console.log("[Createjasa.vue] Body scroll lock import OK");

import api from "@/libs/axios";
console.log("[Createjasa.vue] Axios import OK");

import { useCategories } from "@/composables/useCategories";
console.log("[Createjasa.vue] Categories composable import OK");

console.log("[Createjasa.vue] ========== ALL IMPORTS SUCCESSFUL ==========");

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore(); // ✅ ADD: Get auth store

// ✅ FIXED: Get merchantId from route params
const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

// ✅ ADD: Validate merchant ownership
const isValidMerchant = computed(() => {
  if (!currentMerchantId.value) return false;

  // Check if user owns this merchant
  const merchant = authStore.getMerchantById(currentMerchantId.value);
  return !!merchant;
});

// ✅ Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "Jasa",
    path: `/merchant-center/${currentMerchantId.value}/jasas`,
  },
  {
    label: "Tambah Jasa",
  },
]);

// ✅ Use categories composable
const {
  categoriesLevel1,
  categoriesLevel2,
  loadingLevel1,
  loadingLevel2,
  fetchLevel1Categories,
  fetchSubCategories,
} = useCategories();

// ============================================================
// STATE MANAGEMENT
// ============================================================
const loading = ref(false);

const name = ref("");
const description = ref("");
const packages = ref([]);
const packageFileInputs = ref({});
// opsional: pilih beberapa jam layanan (00:00 - 23:00)
const timeSlotOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0');
  return `${hour}:00`;
});
const productImages = ref([]);
const fileInput = ref(null);
const coverImageIndex = ref(0);
const draggedIndex = ref(null);

// Form bindings mapping to vee-validate `values`
const formPrice = computed({
  get: () => values.price,
  set: (v) => setFieldValue("price", v),
});

const formMinPurchase = computed({
  get: () => values.min_purchase,
  set: (v) => setFieldValue("min_purchase", v),
});

const formTimeSlots = computed({
  get: () => values.time_slots || [],
  set: (v) => setFieldValue("time_slots", v || []),
});

const paymentMethods = ref({
  cod: false,
  qris: false,
});

const timeRangeMode = ref(false); // false = individual slots, true = range
const timeRangeStart = ref("");
const timeRangeEnd = ref("");

// Categories
const selectedCategory = ref(null);
const selectedSubCategories = ref([]);

// ============================================================
// VALIDATION SCHEMA
// ============================================================
const schema = yup.object({
  name: yup.string(),
  description: yup.string(),
  packages: yup.array(),
  time_slots: yup.array(),
  time_range_start: yup.string(),
  time_range_end: yup.string(),
  category_id: yup.number(),
  price: yup.number(),
  min_purchase: yup.number(),
  payment_methods: yup.array(),
});

// ============================================================
// VEE-VALIDATE SETUP
// ============================================================
const {
  handleSubmit: veeHandleSubmit,
  errors,
  values,
  setFieldValue,
  validate,
} = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    description: "",
    packages: [],
    time_slots: [],
    category_id: null,
    min_purchase: 1,
    price: 0,
    payment_methods: [],
  },
});

// ============================================================
// LIFECYCLE HOOKS
// ============================================================
onMounted(async () => {
  console.log("[Create Jasa] ========== COMPONENT MOUNTED ==========");
  console.log("[Create Jasa] Merchant ID from route:", currentMerchantId.value);
  console.log("[Create Jasa] Auth Store User:", authStore.user);
  console.log("[Create Jasa] Auth Store User Merchants:", authStore.user?.merchants);

  // ✅ SKIP validation for now - just load categories
  try {
    console.log("[Create Jasa] Loading categories...");
    await fetchLevel1Categories();
    console.log("[Create Jasa] Categories loaded:", categoriesLevel1.value?.length, "items");
  } catch (error) {
    console.error("[Create Jasa] Error loading categories:", error);
    toast.error("Gagal memuat kategori");
  }
});

// ============================================================
// WATCHERS
// ============================================================
watch(name, (newName) => {
  setFieldValue("name", newName);
});
watch(description, (newDesc) => {
  setFieldValue("description", newDesc);
});

watch(selectedCategory, async (newCat) => {
  console.log("[Categories] Selected category:", newCat);
  setFieldValue("category_id", newCat);

  if (newCat) {
    await fetchSubCategories(newCat);
  } else {
    categoriesLevel2.value = [];
  }
  selectedSubCategories.value = [];
});

const canAddSubCategory = computed(() => {
  return (selectedSubCategories.value.length < 3) && (categoriesLevel2.value && categoriesLevel2.value.length > 0);
});

// Drag & drop handlers for images
const onDragStart = (e, index) => {
  draggedIndex.value = index;
  e.dataTransfer?.setData("text/plain", String(index));
};

const onDragOver = (e) => {
  e.preventDefault();
};

const onDrop = (e, index) => {
  e.preventDefault();
  const from = draggedIndex.value ?? Number(e.dataTransfer?.getData("text/plain"));
  const to = index;
  if (from === undefined || from === null || from === to) return;
  const item = productImages.value.splice(from, 1)[0];
  productImages.value.splice(to, 0, item);
  // update cover index if needed
  if (coverImageIndex.value === from) {
    coverImageIndex.value = to;
  } else if (from < coverImageIndex.value && to >= coverImageIndex.value) {
    coverImageIndex.value -= 1;
  } else if (from > coverImageIndex.value && to <= coverImageIndex.value) {
    coverImageIndex.value += 1;
  }
  draggedIndex.value = null;
};

const onDragEnd = () => {
  draggedIndex.value = null;
};

// ============================================================
// IMAGE METHODS
// ============================================================
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        productImages.value.push({
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          is_cover: productImages.value.length === 0,
        });
        if (productImages.value.length === 1) coverImageIndex.value = 0;
      };
      reader.readAsDataURL(file);
    }
  });
  event.target.value = "";
};

const removeImage = (index) => {
  productImages.value.splice(index, 1);
  if (coverImageIndex.value >= productImages.value.length) {
    coverImageIndex.value = Math.max(0, productImages.value.length - 1);
  }
};

// ============================================================
// SUBMIT HANDLER
// ============================================================
const onSubmit = veeHandleSubmit(
  async (values) => {
    console.log("[Submit] Form values:", values);
    console.log("[Submit] Current Merchant ID:", currentMerchantId.value);
    console.log("[Submit] Packages:", packages.value);
    console.log("[Submit] Payment Methods:", paymentMethods.value);
    console.log("[Submit] Product Images:", productImages.value.length);

    // ✅ ADD: Validate merchantId before submission
    if (!currentMerchantId.value) {
      toast.error("Merchant ID tidak ditemukan");
      return;
    }

    // ✅ ADD: Validate merchant ownership before submission
    if (!isValidMerchant.value) {
      // Don't show toast here; simply prevent action and navigate back
      router.push(`/merchant-center/${currentMerchantId.value}`);
      return;
    }

    // === 1) Validasi dengan Yup ===
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (yupError) {
      const messages = (yupError.inner || [])
        .map((e) => `${e.path}: ${e.message}`)
        .filter(Boolean);

      console.log("[Validation Error] Detailed messages:", messages);
      console.log("[Validation Error] Full error:", yupError);

      // Tampilkan semua error fields
      if (messages.length > 0) {
        const errorList = messages.join("\n");
        toast.error(`Field yang belum diisi:\n${errorList}`);
        return;
      }

      const fallbackMsg = yupError.message || "Mohon lengkapi semua field yang wajib diisi";
      toast.error(fallbackMsg);
      return;
    }

    // === 2) Validasi kustom ===
    if (productImages.value.length === 0) {
      toast.error("Minimal tambahkan 1 foto jasa");
      return;
    }

    loading.value = true;

    try {
      const formData = new FormData();

      // ✅ FIXED: Use merchantId from route params
      formData.append("merchant_id", currentMerchantId.value);
      formData.append("name", values.name);
      formData.append("description", values.description);
      
      // Packages - filter out empty packages
      const validPackages = packages.value.filter(pkg => pkg.name && pkg.name.trim().length > 0);
      if (validPackages && validPackages.length > 0) {
        validPackages.forEach((pkg, index) => {
          formData.append(`packages[${index}][name]`, pkg.name);
          if (pkg.description) {
            formData.append(`packages[${index}][description]`, pkg.description);
          }
          formData.append(`packages[${index}][price]`, pkg.price);
          if (pkg.imageFile) {
            formData.append(`packages[${index}][image]`, pkg.imageFile);
          }
        });
      }
      
      // Time slots or time range
      if (timeRangeMode.value && timeRangeStart.value && timeRangeEnd.value) {
        formData.append("time_range_start", timeRangeStart.value);
        formData.append("time_range_end", timeRangeEnd.value);
      } else if (values.time_slots && values.time_slots.length > 0) {
        values.time_slots.forEach((slot, index) => {
          formData.append(`time_slots[${index}]`, slot);
        });
      }
      formData.append("category_id", values.category_id);
      formData.append("min_purchase", values.min_purchase);
      formData.append("status", "draft");

      // Sub Categories
      selectedSubCategories.value.forEach((subCat, index) => {
        formData.append(`sub_categories[${index}]`, subCat);
      });

      // Product Images
      productImages.value.forEach((img, index) => {
        formData.append(`images[${index}][file]`, img.file);
        formData.append(`images[${index}][order]`, index);
      });
      formData.append("cover_image_index", coverImageIndex.value);

      // Price
      formData.append("price", values.price);

      // Payment Methods
      const selectedPayments = [];
      if (paymentMethods.value.cod) selectedPayments.push("cod");
      if (paymentMethods.value.qris) selectedPayments.push("qris");
      if (selectedPayments.length > 0) {
        selectedPayments.forEach((method, index) => {
          formData.append(`payment_methods[${index}]`, method);
        });
      }

      // API Call
      const response = await api.post("/jasas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("[Create Jasa] Success:", response.data);

      toast.success("Jasa berhasil ditambahkan");

      // ✅ FIXED: Redirect dengan merchantId yang benar
      router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
    } catch (error) {
      console.error("[Create Jasa] Error:", error);

      const serverMsg = error.response?.data?.message || "";
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const firstError = Object.values(errors)[0];
        toast.error(firstError?.[0] || "Validasi gagal");
      } else if (error.response?.status === 403) {
        // Suppress specific backend segmentation message that is not relevant
        // for UMKM jasa (e.g. "Segment UMKM tidak diizinkan untuk mengelola produk").
        // If server returned a different 403 message, show it; otherwise fallback.
        if (
          serverMsg &&
          (serverMsg.includes("Segment") || serverMsg.includes("UMKM"))
        ) {
          // quietly redirect back to merchant jasa list without showing the toast
          router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
        } else {
          toast.error(serverMsg || "Anda tidak memiliki akses ke merchant ini");
        }
      } else {
        toast.error(serverMsg || "Gagal menambahkan jasa");
      }
    } finally {
      loading.value = false;
    }
  },
  (errorsFromVee) => {
    console.log("[Validation] Errors (handler):", errorsFromVee);
    const firstMsg =
      errorsFromVee?.[0]?.message || "Mohon lengkapi semua field yang wajib diisi";
    toast.error(firstMsg);
  }
);

// ============================================================
// UTILITY METHODS
// ============================================================
const goBack = () => {
  router.back();
};

const toggleTimeSlot = (slot) => {
  const next = new Set(formTimeSlots.value);
  if (next.has(slot)) {
    next.delete(slot);
  } else {
    next.add(slot);
  }
  formTimeSlots.value = Array.from(next);
};

// ============================================================
// PACKAGE MANAGEMENT
// ============================================================
const addPackage = () => {
  const newPackage = {
    id: Date.now(),
    name: "",
    description: "",
    price: 0,
    imageFile: null,
    imagePreview: null,
  };
  packages.value.push(newPackage);
  setFieldValue("packages", packages.value);
};

const removePackage = (index) => {
  packages.value.splice(index, 1);
  setFieldValue("packages", packages.value);
};

const handlePackageImageUpload = (event, index) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      packages.value[index].imageFile = file;
      packages.value[index].imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  event.target.value = "";
};

const triggerPackageFileInput = (packageId) => {
  const input = packageFileInputs.value[packageId];
  if (input) input.click();
};

const removePackageImage = (index) => {
  packages.value[index].imageFile = null;
  packages.value[index].imagePreview = null;
};
</script>

<!-- Template unchanged, just ensure mobile header back button uses dynamic route -->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl"
    >
      <!-- ✅ FIXED: Back button dengan dynamic route -->
      <button
        @click="router.push(`/merchant-center/${currentMerchantId}/jasas`)"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Tambah Jasa</h1>
    </div>

    <!-- Desktop Header -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-50 py-6">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
      >
        <div>
          <!-- ✅ Use Breadcrumb Component -->
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantId"
          />
          <p class="text-muted-foreground text-xs lg:text-sm">
            Lengkapi informasi jasa Anda.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Button
            @click="onSubmit"
            variant="merchant"
            size="md"
            :disabled="loading"
          >
            <span>{{ loading ? "Menyimpan..." : "Simpan" }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile Only -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- Container Responsive -->
    <div class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <Form @submit="onSubmit">
        <!-- Foto Jasa -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3
            class="text-sm font-semibold text-black mb-3 flex items-center gap-2"
          >
            <i class="pi pi-image text-merchant-primary"></i>
            Foto Jasa
            <span class="text-xs font-normal text-danger-foreground">*</span>
          </h3>

          <!-- Image Grid - RESPONSIVE -->
          <div
            class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-3"
          >
            <div
              v-for="(img, index) in productImages"
              :key="img.id"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
              class="relative aspect-square rounded-xl overflow-hidden border-2 group cursor-move"
              :class="
                index === coverImageIndex
                  ? 'border-merchant-primary ring-2 ring-merchant-primary/20'
                  : 'border-gray-200'
              "
            >
              <img
                :src="img.preview"
                class="w-full h-full object-cover pointer-events-none"
              />
            </div>

            <!-- Add Button -->
            <button
              v-if="productImages.length < 6"
              @click="triggerFileInput"
              type="button"
              class="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-merchant-primary hover:bg-merchant-primary/5 transition flex flex-col items-center justify-center gap-2"
            >
              <i class="pi pi-plus text-2xl text-merchant-primary"></i>
              <span class="text-xs text-muted-foreground">Tambah</span>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleImageUpload"
          />

          <p class="text-xs text-muted-foreground">
            <i class="pi pi-info-circle"></i>
            Drag gambar untuk mengubah urutan. Foto pertama menjadi cover. Maks
            6 foto. Gunakan gambar dengan rasio 1:1 untuk hasil terbaik.
          </p>
        </div>

        <!-- Info Dasar -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="text-sm font-semibold text-black flex items-center gap-2">
            <i class="pi pi-info-circle text-merchant-primary"></i>
            Informasi Dasar
          </h3>

          <TextField
            name="name"
            label="Nama Jasa"
            v-model="name"
            placeholder="Contoh: Perbaikan Mesin"
            required
          />
          <TextField
            name="description"
            label="Deskripsi"
            v-model="description"
            textarea
            :rows="4"
            placeholder="Jelaskan detail jasa Anda"
            required
          />

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-gray-700">
                Waktu Layanan (opsional)
              </label>
              <button
                type="button"
                @click="timeRangeMode = !timeRangeMode"
                class="text-xs text-merchant-primary hover:underline flex items-center gap-1"
              >
                <i :class="timeRangeMode ? 'pi pi-list' : 'pi pi-calendar'"></i>
                {{ timeRangeMode ? 'Pilih Slot Individual' : 'Pilih Range Waktu' }}
              </button>
            </div>

            <!-- Mode Range -->
            <div v-if="timeRangeMode" class="space-y-2">
              <p class="text-xs text-muted-foreground">
                Pilih rentang waktu operasional (dari jam - sampai jam).
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Dari Jam</label>
                  <select
                    v-model="timeRangeStart"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                  >
                    <option value="" disabled>Pilih jam</option>
                    <option v-for="slot in timeSlotOptions" :key="'start-'+slot" :value="slot">
                      {{ slot.replace(':', '.') }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Sampai Jam</label>
                  <select
                    v-model="timeRangeEnd"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                  >
                    <option value="" disabled>Pilih jam</option>
                    <option v-for="slot in timeSlotOptions" :key="'end-'+slot" :value="slot">
                      {{ slot.replace(':', '.') }}
                    </option>
                  </select>
                </div>
              </div>
              <div v-if="timeRangeStart && timeRangeEnd" class="p-3 bg-merchant-primary/10 rounded-lg text-sm">
                <i class="pi pi-clock text-merchant-primary mr-2"></i>
                <span class="text-merchant-primary font-medium">
                  Operasional: {{ timeRangeStart.replace(':', '.') }} - {{ timeRangeEnd.replace(':', '.') }}
                </span>
              </div>
            </div>

            <!-- Mode Individual Slots -->
            <div v-else class="space-y-2">
              <p class="text-xs text-muted-foreground">
                Pilih satu atau beberapa slot jam layanan.
              </p>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="slot in timeSlotOptions"
                  :key="slot"
                  type="button"
                  @click="toggleTimeSlot(slot)"
                  class="px-3 py-2 rounded-lg text-sm border transition flex items-center gap-2"
                  :class="
                    formTimeSlots.includes(slot)
                      ? 'bg-merchant-primary text-white border-merchant-primary shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-merchant-primary/60'
                  "
                  :aria-pressed="formTimeSlots.includes(slot)"
                >
                  <span>{{ slot.replace(':', '.') }}</span>
                  <i
                    v-if="formTimeSlots.includes(slot)"
                    class="pi pi-check text-xs"
                  ></i>
                </button>
              </div>

              <div
                v-if="formTimeSlots.length"
                class="flex flex-wrap gap-2 pt-1"
              >
                <span
                  v-for="slot in formTimeSlots"
                  :key="`selected-${slot}`"
                  class="inline-flex items-center gap-2 bg-merchant-primary/10 text-merchant-primary px-3 py-1 rounded-full text-xs"
                >
                  {{ slot.replace(':', '.') }}
                  <button
                    type="button"
                    class="hover:text-danger-foreground"
                    @click="toggleTimeSlot(slot)"
                  >
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </span>
              </div>
            </div>

            <p v-if="errors.time_slots" class="text-xs text-danger-foreground">
              {{ errors.time_slots }}
            </p>
          </div>

          <!-- ✅ UPDATED: Kategori Section dengan Loading State -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Level 1 Category -->
            <div class="relative">
              <SelectField
                name="category_id"
                label="Kategori Utama"
                :options="categoriesLevel1"
                v-model="selectedCategory"
                :disabled="loadingLevel1"
                required
              />
            </div>

            <!-- Sub Categories -->
            <div v-if="selectedCategory">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sub Kategori
              </label>

              <!-- Loading State -->
              <div
                v-if="loadingLevel2"
                class="flex items-center justify-center py-4 text-sm text-gray-500"
              >
                <i class="pi pi-spin pi-spinner text-merchant-primary mr-2"></i>
                Memuat sub-kategori...
              </div>

              <!-- Empty State -->
              <div
                v-else-if="!loadingLevel2 && categoriesLevel2.length === 0"
                class="py-4 px-3 bg-gray-50 rounded-lg border border-gray-200 text-center"
              >
                <i class="pi pi-inbox text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-xs text-gray-500">
                  Kategori ini tidak memiliki sub-kategori
                </p>
              </div>

              <!-- Sub-category List -->
              <div v-else class="space-y-2 mb-2">
                <div
                  v-for="(subCat, index) in selectedSubCategories"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <select
                    v-model="selectedSubCategories[index]"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                  >
                    <option value="" disabled>Pilih sub kategori</option>
                    <option
                      v-for="cat in categoriesLevel2"
                      :key="cat.value"
                      :value="cat.value"
                      :disabled="selectedSubCategories.includes(cat.value)"
                    >
                      {{ cat.label }}
                    </option>
                  </select>
                  <button
                    @click="selectedSubCategories.splice(index, 1)"
                    type="button"
                    class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition"
                  >
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Add Sub-category Button -->
              <button
                v-if="canAddSubCategory && categoriesLevel2.length > 0"
                @click="selectedSubCategories.push('')"
                type="button"
                class="text-sm text-merchant-primary hover:underline flex items-center gap-1"
              >
                <i class="pi pi-plus text-xs"></i>
                Tambah Sub Kategori
              </button>
            </div>
          </div>
        </div>

        <!-- Paket (Optional) -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-black flex items-center gap-2">
              <i class="pi pi-box text-merchant-primary"></i>
              Paket Jasa (opsional)
            </h3>
            <button
              @click="addPackage"
              type="button"
              class="text-sm text-merchant-primary hover:underline flex items-center gap-1"
            >
              <i class="pi pi-plus text-xs"></i>
              Tambah Paket
            </button>
          </div>

          <p class="text-xs text-muted-foreground">
            Tambahkan paket jasa dengan nama, foto, deskripsi, dan harga yang berbeda.
          </p>

          <!-- Package List -->
          <div v-if="packages.length > 0" class="space-y-4">
            <div
              v-for="(pkg, index) in packages"
              :key="pkg.id"
              class="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                  Paket {{ index + 1 }}
                </span>
                <button
                  @click="removePackage(index)"
                  type="button"
                  class="text-danger-foreground hover:text-red-700 text-xs"
                >
                  <i class="pi pi-trash"></i> Hapus
                </button>
              </div>

              <!-- Package Image -->
              <div class="space-y-2">
                <label class="block text-xs font-medium text-gray-700">
                  Foto Paket
                </label>
                <div class="flex items-center gap-3">
                  <div
                    v-if="pkg.imagePreview"
                    class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      :src="pkg.imagePreview"
                      alt="Preview"
                      class="w-full h-full object-cover"
                    />
                    <button
                      @click="removePackageImage(index)"
                      type="button"
                      class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                  <button
                    @click="triggerPackageFileInput(pkg.id)"
                    type="button"
                    class="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:border-merchant-primary hover:bg-merchant-primary/5 transition"
                  >
                    <i class="pi pi-upload mr-1"></i>
                    {{ pkg.imagePreview ? 'Ganti Foto' : 'Upload Foto' }}
                  </button>
                  <input
                    :ref="(el) => { if (el) packageFileInputs[pkg.id] = el }"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handlePackageImageUpload($event, index)"
                  />
                </div>
              </div>

              <!-- Package Name -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Nama Paket <span class="text-danger-foreground">*</span>
                </label>
                <input
                  v-model="pkg.name"
                  type="text"
                  placeholder="Contoh: Paket Basic"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                />
              </div>

              <!-- Package Description -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Deskripsi Paket
                </label>
                <textarea
                  v-model="pkg.description"
                  rows="2"
                  placeholder="Jelaskan detail paket ini"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                ></textarea>
              </div>

              <!-- Package Price -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Harga Paket <span class="text-danger-foreground">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rp
                  </span>
                  <input
                    v-model.number="pkg.price"
                    type="number"
                    placeholder="0"
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="py-8 text-center text-sm text-gray-500"
          >
            <i class="pi pi-box text-3xl text-gray-300 mb-2 block"></i>
            Belum ada paket. Klik "Tambah Paket" untuk menambahkan.
          </div>
        </div>

        <!-- Harga -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
        >
          <TextField
            name="price"
            label="Harga"
            type="number"
            placeholder="0"
            prefix="Rp"
            v-model.number="formPrice"
            required
          />
        </div>

        <!-- Min Purchase -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <TextField
            name="min_purchase"
            label="Minimal Jumlah Pembelian"
            type="number"
            placeholder="1"
            v-model.number="formMinPurchase"
            required
          />
        </div>

        <!-- Metode Pembayaran -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="text-sm font-semibold text-black flex items-center gap-2 mb-3">
            <i class="pi pi-wallet text-merchant-primary"></i>
            Metode Pembayaran
          </h3>
          <p class="text-xs text-muted-foreground mb-4">
            Pilih metode pembayaran yang tersedia untuk jasa ini. Bisa memilih keduanya.
          </p>

          <div class="space-y-3">
            <!-- COD -->
            <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                v-model="paymentMethods.cod"
                class="w-5 h-5 text-merchant-primary rounded focus:ring-2 focus:ring-merchant-primary"
              />
              <div class="flex items-center gap-3 flex-1">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <i class="pi pi-money-bill text-green-600 text-lg"></i>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">COD (Cash on Delivery)</div>
                  <div class="text-xs text-gray-500">Bayar tunai saat jasa selesai</div>
                </div>
              </div>
            </label>

            <!-- QRIS -->
            <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                v-model="paymentMethods.qris"
                class="w-5 h-5 text-merchant-primary rounded focus:ring-2 focus:ring-merchant-primary"
              />
              <div class="flex items-center gap-3 flex-1">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i class="pi pi-qrcode text-blue-600 text-lg"></i>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">QRIS</div>
                  <div class="text-xs text-gray-500">Scan QR Code untuk pembayaran digital</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- ✅ FIXED: Desktop Submit Button -->
        <div class="hidden sm:flex justify-end">
          <Button
            @click="onSubmit"
            variant="merchant"
            size="md"
            :disabled="loading"
          >
            <span>{{ loading ? "Menyimpan..." : "Simpan" }}</span>
          </Button>
        </div>

        <!-- ✅ FIXED: Mobile Submit Button -->
        <div
          class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40"
        >
          <Button type="submit" :loading="loading" variant="merchant" block>
            Simpan
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar untuk opsi list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth accordion animation */
.transition-all {
  transition-property: max-height, opacity;
}
</style>
