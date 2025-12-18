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

// File uploads
const imageFiles = ref([]);

const getNewImagePreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

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

const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

const breadcrumbItems = computed(() => [
  { label: "Jasa", path: `/merchant-center/${currentMerchantId.value}/jasas` },
  { label: "Tambah Jasa" },
]);

// State
const loading = ref(false);
const jasaCategories = ref([]);
const jasaSubcategories = ref([]);

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
});

// Validation schema
const validationSchema = yup.object({
  title: yup.string().required("Nama layanan wajib diisi"),
  description: yup.string().nullable(),
  jasa_category_id: yup.number().required("Kategori layanan wajib dipilih"),
  jasa_subcategory_id: yup.number().nullable(),
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
    const { data } = await api.get("/public/jasa-categories", {
      params: { is_active: true },
    });
    jasaCategories.value = data;
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
    const { data } = await api.get(`/public/jasa-categories/${categoryId}/subcategories`);
    console.log("Subcategories loaded:", data);
    jasaSubcategories.value = data;
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
      fd.append(k, v ?? "");
    });
    // Append images[] if any
    if (imageFiles.value && imageFiles.value.length) {
      imageFiles.value.forEach((file) => fd.append("images[]", file));
    }

    console.log("Submitting jasa with FormData:", { ...values, images_count: imageFiles.value.length });

    // Biarkan axios yang set header multipart/form-data + boundary secara otomatis
    const { data } = await api.post(
      `/merchants/${currentMerchantId.value}/jasas`,
      fd
    );

    toast.success("Jasa berhasil dibuat!");
    router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
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
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="mt-6 max-w-5xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Buat Layanan Jasa Baru</h1>

        <Form
          :validationSchema="validationSchema"
          @submit="submitForm"
          :initialValues="formData"
          v-slot="{ handleSubmit, errors, setFieldValue }"
        >
          <form @submit.prevent="handleSubmit(submitForm)" class="space-y-6">
            <!-- 1. KLASIFIKASI LAYANAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">1. Identitas Layanan</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="title" v-slot="{ field, errors }">
                  <TextField
                    label="Nama Layanan"
                    placeholder="Contoh: Jasa Kebersihan Rumah"
                    v-bind="field"
                    :error="errors[0]"
                    required
                  />
                </Field>

                <SelectField
                  name="jasa_category_id"
                  label="Pilih Kategori Utama"
                  placeholder="Pilih kategori..."
                  :options="jasaCategories.map(c => ({ value: c.id, label: c.name }))"
                  v-model="formData.jasa_category_id"
                  @update:modelValue="handleCategoryChange"
                  required
                />

                <SelectField
                  name="jasa_subcategory_id"
                  label="Pilih Jenis Layanan Lebih Spesifik"
                  placeholder="Pilih sub kategori..."
                  :options="jasaSubcategories.map(s => ({ value: s.id, label: s.name }))"
                  v-model="formData.jasa_subcategory_id"
                />

                <Field name="description" v-slot="{ field }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jelaskan Layanan Anda</label>
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
              <h2 class="text-lg font-semibold text-gray-800 mb-4">2. Pengaturan Harga</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="fixed_price" v-slot="{ field, errors }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Harga Tetap</label>
                    <div class="relative">
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="(e) => field.onChange(parseCurrency(e.target.value))"
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>
                    <p v-if="errors[0]" class="text-red-500 text-sm mt-1">{{ errors[0] }}</p>
                  </div>
                </Field>

                <Field name="base_price" v-slot="{ field, errors }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Harga Mulai Dari</label>
                    <div class="relative">
                      <input
                        :value="formatCurrency(field.value || 0)"
                        @input="(e) => field.onChange(parseCurrency(e.target.value))"
                        @blur="field.onBlur"
                        type="text"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>
                    <p v-if="errors[0]" class="text-red-500 text-sm mt-1">{{ errors[0] }}</p>
                  </div>
                </Field>
              </div>
            </div>

            <!-- 3. GAMBAR -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">3. Gambar</h2>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Unggah Gambar (satu atau lebih)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="(e) => { imageFiles.value = Array.from(e.target.files || []); }"
                    class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-merchant-primary/10 file:text-merchant-primary hover:file:bg-merchant-primary/20"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    <span class="inline-flex items-center gap-1">
                      <i class="pi pi-image text-gray-400 text-xs"></i>
                      <span>Gambar pertama akan dijadikan cover.</span>
                    </span>
                  </p>
                </div>

                <div
                  v-if="imageFiles.length"
                  class="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  <div
                    v-for="(file, idx) in imageFiles"
                    :key="idx"
                    class="relative rounded-lg border border-gray-200 overflow-hidden group bg-gray-50"
                  >
                    <img
                      :src="getNewImagePreviewUrl(file)"
                      alt="preview"
                      class="w-full h-28 object-cover"
                    />
                    <span
                      v-if="idx === 0"
                      class="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded shadow"
                    >
                      Cover
                    </span>
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
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">4. Lokasi & Area Layanan</h2>
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

                <Field name="location_address" v-slot="{ field }">
                  <TextField
                    label="Alamat Tempat Layanan"
                    v-bind="field"
                  />
                </Field>

              </div>
            </div>

            <!-- 5. PEMBAYARAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">6. Pembayaran</h2>
              <div class="space-y-4">
                <!-- Metode Pembayaran -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Metode Pembayaran yang Diterima</label>
                  <div class="space-y-2">
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="payment_cod"
                        :checked="formData.payment_methods.includes('cod')"
                        @change="(e) => {
                          const methods = formData.payment_methods.split(',').filter(m => m).map(m => m.trim());
                          if (e.target.checked) {
                            if (!methods.includes('cod')) methods.push('cod');
                          } else {
                            methods.splice(methods.indexOf('cod'), 1);
                          }
                          formData.payment_methods = methods.length ? methods.join(',') : 'cod';
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="payment_cod" class="text-sm text-gray-700">COD (Bayar di Tempat)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 7. ADMIN -->
            <div class="pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">7. Admin</h2>
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
              <Button type="submit" variant="primary" :disabled="loading" :loading="loading">
                {{ loading ? "Menyimpan..." : "Simpan Jasa" }}
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
