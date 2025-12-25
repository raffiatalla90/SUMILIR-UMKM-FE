<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import TextField from "@/components/forms/TextField.vue";
import Button from "@/components/common/Button.vue";
import { useEvents } from "@/composables/useEvents";
import { getImageUrl } from "@/libs/getImageUrl";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { fetchEventDetail, updateEvent, loading } = useEvents();

const event = ref(null);
const bannerPreview = ref(null);
const bannerFile = ref(null);
const initialValues = ref({});

const breadcrumbItems = computed(() => [
  { label: "Events", to: { name: "Admin - Events" } },
  { label: event.value?.event_name || "Edit Event", to: { name: "Admin - Event Detail", params: { id: route.params.id } } },
  { label: "Edit" },
]);

// Validation schema
const schema = yup.object({
  event_name: yup
    .string()
    .required("Nama event wajib diisi")
    .min(3, "Minimal 3 karakter"),
  event_description: yup
    .string()
    .required("Deskripsi event wajib diisi")
    .min(10, "Minimal 10 karakter"),
  event_start_date: yup
    .date()
    .required("Tanggal mulai wajib diisi")
    .typeError("Format tanggal tidak valid"),
  event_end_date: yup
    .date()
    .required("Tanggal selesai wajib diisi")
    .min(yup.ref("event_start_date"), "Tanggal selesai harus setelah tanggal mulai")
    .typeError("Format tanggal tidak valid"),
  status: yup
    .string()
    .required("Status wajib dipilih")
    .oneOf(["draft", "published", "archived"], "Status tidak valid"),
});

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

// Load event data
const loadEvent = async () => {
  try {
    const data = await fetchEventDetail(route.params.id);
    event.value = data;

    // Set initial form values
    initialValues.value = {
      event_name: data.event_name,
      event_description: data.event_description,
      event_start_date: data.event_start_date,
      event_end_date: data.event_end_date,
      status: data.status,
    };

    // Set current banner preview
    if (data.banner_img_path) {
      bannerPreview.value = getImageUrl(data.banner_img_path);
    }
  } catch (error) {
    console.error("Failed to load event:", error);
    router.push({ name: "Admin - Events" });
  }
};

// Handle banner upload
const handleBannerChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast.error("Format file harus JPG, PNG, atau WebP");
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error("Ukuran file maksimal 2MB");
    return;
  }

  bannerFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    bannerPreview.value = e.target?.result;
  };
  reader.readAsDataURL(file);
};

const removeBanner = () => {
  bannerFile.value = null;
  bannerPreview.value = event.value?.banner_img_path 
    ? getImageUrl(event.value.banner_img_path) 
    : null;
};

// Submit handler
const handleSubmit = async (values) => {
  try {
    const formData = new FormData();
    formData.append("event_name", values.event_name);
    formData.append("event_description", values.event_description);
    formData.append("event_start_date", values.event_start_date);
    formData.append("event_end_date", values.event_end_date);
    formData.append("status", values.status);
    formData.append("_method", "PUT"); // Laravel method spoofing

    // Only append banner if new file selected
    if (bannerFile.value) {
      formData.append("banner_img", bannerFile.value);
    }

    await updateEvent(route.params.id, formData);
    router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });
  } catch (error) {
    console.error("Update event failed:", error);
  }
};

const goBack = () => router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });

onMounted(() => {
  loadEvent();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
      <Breadcrumb :items="breadcrumbItems" />
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-primary">
          Edit Event
        </h1>
        <Button @click="goBack" variant="secondary">
          <i class="pi pi-arrow-left mr-2"></i>
          Kembali
        </Button>
      </div>
    </div>

    <!-- Form -->
    <div class="px-4 sm:px-6 py-6" v-if="event">
      <div class="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <Form
          @submit="handleSubmit"
          :validation-schema="schema"
          :initial-values="initialValues"
          v-slot="{ errors }"
        >
          <!-- Event Name -->
          <div class="mb-6">
            <Field name="event_name" v-slot="{ field }">
              <TextField
                v-bind="field"
                label="Nama Event"
                placeholder="Contoh: Promo Ramadan 2025"
                :error="errors.event_name"
                required
              />
            </Field>
          </div>

          <!-- Event Description -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Event <span class="text-red-500">*</span>
            </label>
            <Field name="event_description" v-slot="{ field }">
              <textarea
                v-bind="field"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                :class="{ 'border-red-500': errors.event_description }"
                placeholder="Deskripsi lengkap tentang event..."
              />
            </Field>
            <p v-if="errors.event_description" class="text-red-500 text-sm mt-1">
              {{ errors.event_description }}
            </p>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Field name="event_start_date" v-slot="{ field }">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span class="text-red-500">*</span>
                </label>
                <input
                  v-bind="field"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :class="{ 'border-red-500': errors.event_start_date }"
                />
                <p v-if="errors.event_start_date" class="text-red-500 text-sm mt-1">
                  {{ errors.event_start_date }}
                </p>
              </div>
            </Field>

            <Field name="event_end_date" v-slot="{ field }">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span class="text-red-500">*</span>
                </label>
                <input
                  v-bind="field"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :class="{ 'border-red-500': errors.event_end_date }"
                />
                <p v-if="errors.event_end_date" class="text-red-500 text-sm mt-1">
                  {{ errors.event_end_date }}
                </p>
              </div>
            </Field>
          </div>

          <!-- Status -->
          <div class="mb-6">
            <Field name="status" v-slot="{ field }">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  v-bind="field"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  :class="{ 'border-red-500': errors.status }"
                >
                  <option value="">Pilih Status</option>
                  <option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <p v-if="errors.status" class="text-red-500 text-sm mt-1">
                  {{ errors.status }}
                </p>
              </div>
            </Field>
          </div>

          <!-- Banner Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Banner Event
            </label>

            <!-- Current/New Banner Preview -->
            <div v-if="bannerPreview" class="relative mb-4">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="w-full h-64 object-cover rounded-lg"
              />
              <button
                v-if="bannerFile"
                @click="removeBanner"
                type="button"
                class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Upload Area -->
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <input
                type="file"
                @change="handleBannerChange"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                class="hidden"
                id="banner-upload"
              />
              <label for="banner-upload" class="cursor-pointer">
                <i class="pi pi-cloud-upload text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm text-gray-600">
                  {{ bannerFile ? "Ganti banner" : "Upload banner baru (opsional)" }}
                </p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP - Max 2MB</p>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <Button @click="goBack" variant="secondary" type="button">
              Batal
            </Button>
            <Button type="submit" variant="primary" :disabled="loading">
              <i class="pi pi-check mr-2"></i>
              {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
            </Button>
          </div>
        </Form>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center py-12">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
        <p class="text-gray-600">Memuat data event...</p>
      </div>
    </div>
  </div>
</template>