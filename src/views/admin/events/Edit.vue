<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import InputDateField from "@/components/forms/InputDateField.vue";
import SelectField from "@/components/forms/SelectField.vue";
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
const isDataLoaded = ref(false);

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

// Helper function to format date from ISO to YYYY-MM-DD
const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Load event data
const loadEvent = async () => {
  try {
    const data = await fetchEventDetail(route.params.id);
    event.value = data;

    // Set current banner preview
    if (data.banner_img_path) {
      bannerPreview.value = getImageUrl(data.banner_img_path);
    }

    isDataLoaded.value = true;
  } catch (error) {
    console.error("Failed to load event:", error);
    toast.error("Gagal memuat data event");
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
    toast.success("Event berhasil diupdate");
    router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });
  } catch (error) {
    console.error("Update event failed:", error);
    toast.error("Gagal mengupdate event");
  }
};

const goBack = () => router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });

onMounted(() => {
  loadEvent();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Form -->
    <div class="px-4 sm:px-6 py-6" v-if="isDataLoaded && event">
      <div class="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <Form
          @submit="handleSubmit"
          :validation-schema="schema"
          :initial-values="{
            event_name: event.event_name,
            event_description: event.event_description,
            event_start_date: formatDateForInput(event.event_start_date),
            event_end_date: formatDateForInput(event.event_end_date),
            status: event.status,
          }"
          v-slot="{ errors }"
        >
          <!-- Event Name -->
          <div class="mb-6">
            <Field name="event_name" v-slot="{ field, value }">
              <TextField
                variant="merchant"
                v-bind="field"
                :modelValue="value"
                label="Nama Event"
                placeholder="Contoh: Promo Ramadan 2025"
                :error="errors.event_name"
                required
              />
            </Field>
          </div>

          <!-- Event Description -->
          <div class="mb-6">
            <Field name="event_description" v-slot="{ field, value }">
              <TextField
                variant="merchant"
                label="Deskripsi Event"
                v-bind="field"
                :modelValue="value"
                :error="errors.event_description"
                placeholder="Deskripsi lengkap tentang event..."
                required
              />
            </Field>
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Field name="event_start_date" v-slot="{ field }">
              <InputDateField
                v-model="field.value"
                variant="merchant"
                label="Tanggal Mulai"
                v-bind="field"
                :error="errors.event_start_date"
                required
              />
            </Field>

            <Field name="event_end_date" v-slot="{ field }">
              <InputDateField
                v-model="field.value"
                variant="merchant"
                label="Tanggal Selesai"
                v-bind="field"
                :error="errors.event_end_date"
                required
              />
            </Field>
          </div>

          <!-- Status -->
          <div class="mb-6">
            <Field name="status" v-slot="{ field, value, errors }">
              <SelectField
                v-bind="field"
                :modelValue="value"
                :options="statusOptions"
                label="Status"
                variant="merchant"
                required
                :error="errors[0]"
                placeholder="Pilih Status"
              />
            </Field>
          </div>

          <!-- Banner Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Banner Event <span class="text-red-500">*</span>
            </label>

            <!-- Upload Area -->
            <div
              v-if="!bannerPreview"
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-merchant-primary transition-colors cursor-pointer"
            >
              <input
                type="file"
                @change="handleBannerChange"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                class="hidden"
                id="banner-upload"
              />
              <label for="banner-upload" class="cursor-pointer">
                <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-3"></i>
                <p class="text-sm text-gray-600">
                  Klik untuk upload banner baru (JPG, PNG, WebP)
                </p>
                <p class="text-xs text-gray-400 mt-1">Maksimal 2MB</p>
              </label>
            </div>

            <!-- Preview -->
            <div v-else class="relative">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="w-full h-64 object-cover rounded-lg"
              />
              <button
                @click="removeBanner"
                type="button"
                class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <Button @click="goBack" variant="secondary" type="button">
              Batal
            </Button>
            <Button type="submit" variant="merchant" :disabled="loading">
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
        <i class="pi pi-spin pi-spinner text-4xl text-merchant-primary mb-4"></i>
        <p class="text-gray-600">Memuat data event...</p>
      </div>
    </div>
  </div>
</template>