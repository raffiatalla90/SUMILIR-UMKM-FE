<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import InputDateField from "@/components/forms/InputDateField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useEvents } from "@/composables/useEvents";

const router = useRouter();
const toast = useToast();
const { createEvent, loading } = useEvents();

const breadcrumbItems = [
  { label: "Events", to: { name: "Admin - Events" } },
  { label: "Buat Event Baru" },
];

// Form state
const bannerPreview = ref(null);
const bannerFile = ref(null);
const formValues = ref({
  event_start_date: "",
  event_end_date: "",
  status: "draft",
});

const allowedStatus = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!formValues.value.event_start_date || !formValues.value.event_end_date) {
    return { status: "draft", options: statusOptions, message: "", isError: false };
  }

  const startDate = new Date(formValues.value.event_start_date);
  const endDate = new Date(formValues.value.event_end_date);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate < today) {
    return {
      status: "draft",
      options: [{ value: "draft", label: "Draft" }],
      message: "Tanggal mulai tidak boleh di masa lalu. Pilih hari ini atau di masa depan.",
      messageColor: "text-red-600",
      isError: true,
      disabled: true,
    };
  }

  if (endDate < today) {
    return {
      status: "archived",
      options: [{ value: "archived", label: "Archived" }],
      message: "Event sudah melewati tanggal selesai. Status otomatis diset ke Archived.",
      messageColor: "text-blue-600",
      isError: false,
    };
  }

  if (startDate.getTime() === today.getTime()) {
    return {
      status: formValues.value.status || "published",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
      message: "Event dimulai hari ini. Anda dapat memilih Draft atau Published.",
      messageColor: "text-green-600",
      isError: false,
    };
  }

  if (startDate > today) {
    return {
      status: "draft",
      options: [{ value: "draft", label: "Draft" }],
      message: "Event belum memasuki tanggal mulai. Status hanya dapat diset Draft untuk saat ini.",
      messageColor: "text-blue-600",
      isError: false,
    };
  }

  // Default
  return {
    status: "draft",
    options: statusOptions,
    message: "",
    isError: false,
  };
});

// Watch dates to auto-update status
watch(
  () => [formValues.value.event_start_date, formValues.value.event_end_date],
  () => {
    formValues.value.status = allowedStatus.value.status;
  }
);

// Validation schema with banner required
const schema = yup.object({
  event_name: yup
    .string()
    .required("Nama event wajib diisi")
    .min(3, "Minimal 3 karakter")
    .max(255, "Maksimal 255 karakter"),
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
});

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

// Handle banner upload
const handleBannerChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    toast.error("Format file harus JPG, PNG, WebP, atau SVG");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Ukuran file maksimal 5MB");
    return;
  }

  bannerFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    bannerPreview.value = e.target?.result;
  };
  reader.readAsDataURL(file);
};

const removeBanner = () => {
  bannerFile.value = null;
  bannerPreview.value = null;
};

// Submit handler with banner validation
const handleSubmit = async (values) => {
  try {
    if (allowedStatus.value.isError) {
      toast.error("Tidak dapat membuat event dengan tanggal yang sudah terlewat");
      return;
    }

    if (!bannerFile.value) {
      toast.error("Banner event wajib diupload");
      return;
    }

    const formData = new FormData();
    formData.append("event_name", values.event_name);
    formData.append("event_description", values.event_description);
    formData.append("event_start_date", values.event_start_date);
    formData.append("event_end_date", values.event_end_date);
    formData.append("status", allowedStatus.value.status);
    formData.append("banner_img", bannerFile.value);

    await createEvent(formData);
    toast.success("Event berhasil dibuat");
    router.push({ name: "Admin - Events" });
  } catch (error) {
    console.error("Create event failed:", error);
    
    if (error.response?.data?.errors?.event_name) {
      toast.error(error.response.data.errors.event_name[0] || "Nama event sudah digunakan");
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
  }
};

const goBack = () => router.push({ name: "Admin - Events" });
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Form -->
    <div class="px-4 sm:px-6 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <Form
          @submit="handleSubmit"
          :validation-schema="schema"
          v-slot="{ errors, setFieldValue }"
        >
          <!-- Event Name -->
          <div class="mb-6">
            <Field name="event_name" v-slot="{ field }">
              <TextField
                variant="merchant"
                v-bind="field"
                label="Nama Event"
                placeholder="Contoh: Promo Ramadan 2025"
                :error="errors.event_name"
                required
              />
            </Field>
            <!-- Unique validation hint -->
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <i class="pi pi-info-circle"></i>
              <span>Nama event tidak boleh sama dengan event lain</span>
            </p>
          </div>

          <!-- Event Description -->
          <div class="mb-6">
            <Field name="event_description" v-slot="{ field }">
              <TextField
                variant="merchant"
                label="Deskripsi Event"
                v-bind="field"
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
                v-model="formValues.event_start_date"
                @update:modelValue="(v) => { formValues.event_start_date = v; setFieldValue('event_start_date', v); }"
                variant="merchant"
                label="Tanggal Mulai"
                :error="errors.event_start_date"
                required
              />
            </Field>

            <Field name="event_end_date" v-slot="{ field }">
              <InputDateField
                v-model="formValues.event_end_date"
                @update:modelValue="(v) => { formValues.event_end_date = v; setFieldValue('event_end_date', v); }"
                variant="merchant"
                label="Tanggal Selesai"
                :error="errors.event_end_date"
                required
              />
            </Field>
          </div>

          <!-- Status (Auto-determined) -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-black mb-2">
              Status <span class="text-red-500">*</span>
            </label>
            
            <select
              v-model="formValues.status"
              :disabled="allowedStatus.options.length === 1 || allowedStatus.disabled"
              :class="[
                'w-full px-4 py-2.5 text-sm border rounded-xl bg-white text-black focus:ring-2 focus:ring-merchant-primary focus:outline-none',
                allowedStatus.disabled ? 'bg-gray-100 cursor-not-allowed border-red-300' : 'border-merchant-primary',
                allowedStatus.isError ? 'border-red-500' : ''
              ]"
            >
              <option 
                v-for="opt in allowedStatus.options" 
                :key="opt.value" 
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>

            <!-- Info/Error Message -->
            <p 
              v-if="allowedStatus.message" 
              :class="['text-xs mt-2 flex items-start gap-2', allowedStatus.messageColor]"
            >
              <i :class="allowedStatus.isError ? 'pi pi-times-circle' : 'pi pi-info-circle'" class="mt-0.5"></i>
              <span>{{ allowedStatus.message }}</span>
            </p>
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
                accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                class="hidden"
                id="banner-upload"
              />
              <label for="banner-upload" class="cursor-pointer">
                <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-3"></i>
                <p class="text-sm text-gray-600">
                  Klik untuk upload banner (JPG, PNG, WebP, SVG)
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  Format: JPG, PNG, WebP, SVG | Rekomendasi: 1920x480px (4:1) | Max 5MB
                </p>
              </label>
            </div>

            <!-- Preview -->
            <div v-else class="relative">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="w-full aspect-4/1 object-cover rounded-lg"
              />
              <button
                @click="removeBanner"
                type="button"
                class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- ✅ REQUIRED ERROR MESSAGE -->
            <p v-if="!bannerFile" class="text-xs text-red-500 mt-2 flex items-center gap-1">
              <i class="pi pi-exclamation-circle"></i>
              <span>Banner event wajib diupload sebelum menyimpan</span>
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <Button @click="goBack" variant="secondary" type="button">
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="merchant" 
              :disabled="loading || allowedStatus.isError || !bannerFile"
            >
              <i class="pi pi-check mr-2"></i>
              {{ loading ? "Menyimpan..." : "Simpan Event" }}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>