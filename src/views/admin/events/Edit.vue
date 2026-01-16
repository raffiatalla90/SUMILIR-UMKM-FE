<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import InputDateField from "@/components/forms/InputDateField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useEvents } from "@/composables/useEvents";
import { getEventBannerUrl } from "@/libs/getImageUrl";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const { fetchEventDetail, updateEvent, loading } = useEvents();

const event = ref(null);
const bannerPreview = ref(null);
const bannerFile = ref(null);
const isDataLoaded = ref(false);
const fileInputRef = ref(null);
const hasNewBanner = ref(false); 

const formValues = ref({
  event_start_date: "",
  event_end_date: "",
  status: "draft",
});

const originalStartDate = ref(null);

const allowedStatus = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!formValues.value.event_start_date || !formValues.value.event_end_date) {
    return { status: "draft", options: statusOptions, message: "", isError: false };
  }

  const startDate = new Date(formValues.value.event_start_date);
  const endDate = new Date(formValues.value.event_end_date);
  const origStart = originalStartDate.value ? new Date(originalStartDate.value) : null;
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  if (origStart) origStart.setHours(0, 0, 0, 0);

  if (origStart && origStart < today) {
    if (startDate.getTime() !== origStart.getTime()) {
      return {
        status: "draft",
        options: [{ value: "draft", label: "Draft" }],
        message: "Event yang sudah dimulai tidak dapat diubah tanggal mulainya. Mohon kembalikan ke tanggal original.",
        messageColor: "text-red-600",
        isError: true,
        disabled: true,
      };
    }

    return {
      status: formValues.value.status || "published",
      options: [
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
      message: "Event sudah berjalan. Status Draft tidak tersedia.",
      messageColor: "text-orange-600",
      isError: false,
    };
  }

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

  if (startDate > today) {
    return {
      status: "draft",
      options: [{ value: "draft", label: "Draft" }],
      message: "Event belum memasuki tanggal mulai. Status hanya dapat diset Draft.",
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

  return { status: "draft", options: statusOptions, message: "", isError: false };
});

watch(
  () => [formValues.value.event_start_date, formValues.value.event_end_date],
  () => {
    formValues.value.status = allowedStatus.value.status;
  }
);

// Validation schema
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

    const startDate = formatDateForInput(data.event_start_date);
    originalStartDate.value = startDate;

    formValues.value = {
      event_start_date: startDate,
      event_end_date: formatDateForInput(data.event_end_date),
      status: data.status,
    };

    if (data.banner_img_path) {
      bannerPreview.value = getEventBannerUrl(data);
      hasNewBanner.value = false;
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

  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    toast.error("Format file harus JPG, PNG, WebP, atau SVG");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Ukuran file maksimal 5MB");
    event.target.value = "";
    return;
  }

  bannerFile.value = file;
  hasNewBanner.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    bannerPreview.value = e.target?.result;
  };
  reader.readAsDataURL(file);
};

const removeBanner = () => {
  bannerFile.value = null;
  hasNewBanner.value = false;
  
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
  
  // Restore original banner preview
  bannerPreview.value = event.value?.banner_img_path 
    ? getEventBannerUrl(event.value) 
    : null;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// Submit handler - banner optional on edit but warn if removed
const handleSubmit = async (values) => {
  try {
    if (allowedStatus.value.isError) {
      toast.error("Tidak dapat menyimpan perubahan dengan tanggal yang tidak valid");
      return;
    }

    // ✅ WARN if no banner exists (shouldn't happen if required on create)
    if (!event.value.banner_img_path && !bannerFile.value) {
      toast.error("Banner event wajib ada");
      return;
    }

    const formData = new FormData();
    formData.append("event_name", values.event_name);
    formData.append("event_description", values.event_description);
    formData.append("event_start_date", formValues.value.event_start_date);
    formData.append("event_end_date", formValues.value.event_end_date);
    formData.append("status", allowedStatus.value.status);
    formData.append("_method", "PUT");

    if (hasNewBanner.value && bannerFile.value) {
      formData.append("banner_img", bannerFile.value);
    }

    const response = await updateEvent(route.params.id, formData);
    
    if (response?.data) {
      event.value = response.data;
      
      if (response.data.banner_img_path) {
        const timestamp = new Date(response.data.updated_at).getTime();
        bannerPreview.value = `${getEventBannerUrl(response.data)}`;
        hasNewBanner.value = false;
        bannerFile.value = null;
      }
    }
    
    router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });
  } catch (error) {
    console.error("[Edit] Update failed:", error);
    
    if (error.response?.data?.errors?.event_name) {
      toast.error(error.response.data.errors.event_name[0] || "Nama event sudah digunakan");
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
  }
};

const goBack = () => router.push({ name: "Admin - Event Detail", params: { id: route.params.id } });

onMounted(() => {
  loadEvent();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="px-4 sm:px-6 py-6" v-if="isDataLoaded && event">
      <div class="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <Form
          @submit="handleSubmit"
          :validation-schema="schema"
          :initial-values="{
            event_name: event.event_name,
            event_description: event.event_description,
            event_start_date: formValues.event_start_date,
            event_end_date: formValues.event_end_date,
          }"
          v-slot="{ errors, setFieldValue }"
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
            <!-- Unique validation hint -->
            <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <i class="pi pi-info-circle"></i>
              <span>Nama event tidak boleh sama dengan event lain</span>
            </p>
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
              :disabled="allowedStatus.options.length === 1"
              class="w-full px-4 py-2.5 text-sm border border-merchant-primary rounded-xl bg-white text-black focus:ring-2 focus:ring-merchant-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option 
                v-for="opt in allowedStatus.options" 
                :key="opt.value" 
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>

            <!-- Info Message -->
            <p 
              v-if="allowedStatus.message" 
              :class="['text-xs mt-2 flex items-start gap-2', allowedStatus.messageColor]"
            >
              <i class="pi pi-info-circle mt-0.5"></i>
              <span>{{ allowedStatus.message }}</span>
            </p>
          </div>

          <!-- Banner Upload -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Banner Event <span class="text-red-500">*</span>
            </label>

            <input
              ref="fileInputRef"
              type="file"
              @change="handleBannerChange"
              accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
              class="hidden"
            />

            <!-- ✅ NO BANNER STATE (should rarely happen) -->
            <div
              v-if="!bannerPreview"
              @click="triggerFileInput"
              class="border-2 border-dashed border-red-300 bg-red-50 rounded-lg p-8 text-center cursor-pointer"
            >
              <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
              <p class="text-sm text-red-600 font-semibold mb-2">
                Banner event wajib ada!
              </p>
              <p class="text-xs text-gray-600">
                Klik untuk upload banner baru (JPG, PNG, WebP, SVG)
              </p>
              <p class="text-xs text-gray-400 mt-1">
                Rekomendasi: 1920x480px (4:1) atau 1920x540px (16:9), Max 5MB
              </p>
            </div>

            <!-- Preview -->
            <div v-else class="relative">
              <img
                :src="bannerPreview"
                alt="Banner preview"
                class="w-full aspect-4/1 object-cover rounded-lg"
              />
              
              <span 
                v-if="hasNewBanner"
                class="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
              >
                <i class="pi pi-check mr-1"></i>
                Banner Baru
              </span>
              
              <!-- ✅ REMOVED: Delete button (banner required) -->
              <!-- Keep only Change Banner button -->
              
              <button
                @click="triggerFileInput"
                type="button"
                class="absolute bottom-2 right-2 bg-merchant-primary text-white px-4 py-2 rounded-lg hover:bg-merchant-primary/90 transition shadow-lg text-sm"
              >
                <i class="pi pi-upload mr-2"></i>
                Ganti Banner
              </button>
            </div>

            <!-- ✅ INFO MESSAGE -->
            <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <i class="pi pi-info-circle"></i>
              <span>Banner event wajib ada. Klik "Ganti Banner" untuk mengubah.</span>
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
              :disabled="loading || !bannerPreview"
            >
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