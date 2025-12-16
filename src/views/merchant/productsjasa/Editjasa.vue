<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import api from "@/libs/axios";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const serviceId = computed(() => {
  const id = Number(route.params.id);
  return Number.isNaN(id) ? null : id;
});

const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

const breadcrumbItems = computed(() => [
  { label: "Jasa", path: `/merchant-center/${currentMerchantId.value}/jasas` },
  { label: "Edit Jasa" },
]);

const loading = ref(false);
const loadingData = ref(true);
const formKey = ref(0);
const jasaCategories = ref([]);
const jasaSubcategories = ref([]);

const initialForm = () => ({
  title: "",
  description: "",
  jasa_category_id: null,
  jasa_subcategory_id: null,
  price_type: "per_sesi",
  base_price: 0,
  min_order: 1,
  negotiable: false,
  estimated_duration: "",
  operating_hours_start: "",
  operating_hours_end: "",
  operating_days: "1,2,3,4,5,6,7",
  booking_advance_days: 0,
  service_type: "at_location",
  location_address: "",
  service_area: "",
  capacity_per_slot: 1,
  max_orders_per_day: null,
  cancellation_policy: "",
  customer_requirements: "",
  special_notes: "",
  portfolio: "",
  social_media: "",
  status: "draft",
  internal_code: "",
  priority: 0,
  is_featured: false,
  image: "",
});

const formData = ref(initialForm());

const validationSchema = yup.object({
  title: yup.string().required("Nama layanan wajib diisi"),
  description: yup.string().nullable(),
  jasa_category_id: yup.number().required("Kategori layanan wajib dipilih"),
  jasa_subcategory_id: yup.number().nullable(),
  price_type: yup.string().required("Tipe harga wajib dipilih"),
  base_price: yup.number().min(0).required("Harga wajib diisi"),
  min_order: yup.number().min(1).required("Minimal order wajib diisi"),
  negotiable: yup.boolean(),
  estimated_duration: yup.string().nullable(),
  operating_hours_start: yup.string().nullable(),
  operating_hours_end: yup.string().nullable(),
  operating_days: yup.string().nullable(),
  booking_advance_days: yup.number().min(0),
  service_type: yup.string().required("Tipe layanan wajib dipilih"),
  location_address: yup.string().nullable(),
  service_area: yup.string().nullable(),
  capacity_per_slot: yup.number().min(1),
  max_orders_per_day: yup.number().nullable(),
  cancellation_policy: yup.string().nullable(),
  customer_requirements: yup.string().nullable(),
  special_notes: yup.string().nullable(),
  portfolio: yup.string().nullable(),
  social_media: yup.string().nullable(),
  status: yup.string(),
  internal_code: yup.string().nullable(),
  is_featured: yup.boolean(),
  image: yup.string().nullable(),
});

const loadCategories = async () => {
  try {
    const { data } = await api.get("/jasa-categories", { params: { is_active: true } });
    jasaCategories.value = data;
  } catch (error) {
    console.error("Error loading categories:", error);
    toast.error("Gagal memuat kategori");
  }
};

const loadSubcategories = async (categoryId) => {
  if (!categoryId) {
    jasaSubcategories.value = [];
    return;
  }
  try {
    const { data } = await api.get(`/jasa-categories/${categoryId}/subcategories`);
    jasaSubcategories.value = data;
  } catch (error) {
    console.error("Error loading subcategories:", error);
    toast.error("Gagal memuat subkategori");
  }
};

const handleCategoryChange = (value) => {
  formData.value.jasa_category_id = value;
  formData.value.jasa_subcategory_id = null;
  loadSubcategories(value);
};

const loadJasa = async () => {
  if (!serviceId.value) {
    toast.error("Jasa tidak ditemukan");
    router.back();
    return;
  }

  loadingData.value = true;
  try {
    const { data } = await api.get(`/jasas/${serviceId.value}`);
    formData.value = {
      ...initialForm(),
      title: data.title || "",
      description: data.description || "",
      jasa_category_id: data.jasa_category_id || null,
      jasa_subcategory_id: data.jasa_subcategory_id || null,
      price_type: data.price_type || "per_sesi",
      base_price: data.base_price ?? 0,
      min_order: data.min_order ?? 1,
      negotiable: !!data.negotiable,
      estimated_duration: data.estimated_duration || "",
      operating_hours_start: data.operating_hours_start || "",
      operating_hours_end: data.operating_hours_end || "",
      operating_days: Array.isArray(data.operating_days)
        ? data.operating_days.join(",")
        : data.operating_days || "1,2,3,4,5,6,7",
      booking_advance_days: data.booking_advance_days ?? 0,
      service_type: data.service_type || "at_location",
      location_address: data.location_address || "",
      service_area: data.service_area || "",
      capacity_per_slot: data.capacity_per_slot ?? 1,
      max_orders_per_day: data.max_orders_per_day ?? null,
      cancellation_policy: data.cancellation_policy || "",
      customer_requirements: data.customer_requirements || "",
      special_notes: data.special_notes || "",
      portfolio: data.portfolio || "",
      social_media: data.social_media || "",
      status: data.status || "draft",
      internal_code: data.internal_code || "",
      priority: data.priority ?? 0,
      is_featured: !!data.is_featured,
      image: data.image || "",
    };

    if (formData.value.jasa_category_id) {
      await loadSubcategories(formData.value.jasa_category_id);
    }

    formKey.value += 1;
  } catch (error) {
    console.error("Error loading jasa:", error);
    toast.error(error.response?.data?.message || "Gagal memuat jasa");
    router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
  } finally {
    loadingData.value = false;
  }
};

const submitForm = async (values) => {
  if (!currentMerchantId.value) {
    toast.error("Merchant ID tidak ditemukan");
    return;
  }

  loading.value = true;
  try {
    const payload = {
      ...values,
      base_price: Number(values.base_price) || 0,
      min_order: Number(values.min_order) || 1,
      booking_advance_days: Number(values.booking_advance_days) || 0,
      capacity_per_slot: values.capacity_per_slot ? Number(values.capacity_per_slot) : 1,
      max_orders_per_day:
        values.max_orders_per_day === null || values.max_orders_per_day === ""
          ? null
          : Number(values.max_orders_per_day),
      negotiable: !!values.negotiable,
      is_featured: !!values.is_featured,
    };

    await api.put(`/jasas/${serviceId.value}`, payload);

    toast.success("Jasa berhasil diperbarui!");
    router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
  } catch (error) {
    console.error("Error updating jasa:", error);
    const msg = error.response?.data?.message || "Gagal memperbarui jasa";
    toast.error(msg);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadCategories();
  await loadJasa();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
    <Breadcrumb :items="breadcrumbItems" />

    <div class="mt-6 max-w-5xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Edit Layanan Jasa</h1>
        <p class="text-sm text-gray-500 mb-6" v-if="!loadingData">
          {{ formData.title || "Perbarui informasi jasa" }}
        </p>

        <div v-if="loadingData" class="py-10 text-center text-gray-500">
          Memuat data jasa...
        </div>

        <div v-else>
          <Form
            :key="formKey"
            :validationSchema="validationSchema"
            :initialValues="formData"
            @submit="submitForm"
            v-slot="{ handleSubmit }"
          >
            <form @submit="handleSubmit" class="space-y-6">
              <!-- 1. Klasifikasi Layanan -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">1. Klasifikasi Layanan</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="title" v-slot="{ field, errors }">
                    <TextField
                      label="Nama Layanan *"
                      placeholder="Contoh: Jasa Kebersihan Rumah"
                      v-bind="field"
                      :error="errors[0]"
                      required
                    />
                  </Field>

                  <SelectField
                    name="jasa_category_id"
                    label="Kategori Utama *"
                    placeholder="Pilih kategori..."
                    :options="jasaCategories.map(c => ({ value: c.id, label: c.name }))"
                    v-model="formData.jasa_category_id"
                    @update:modelValue="handleCategoryChange"
                    required
                  />

                  <SelectField
                    name="jasa_subcategory_id"
                    label="Sub Kategori"
                    placeholder="Pilih sub kategori..."
                    :options="jasaSubcategories.map(s => ({ value: s.id, label: s.name }))"
                    v-model="formData.jasa_subcategory_id"
                  />

                  <Field name="description" v-slot="{ field }">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea
                        v-bind="field"
                        placeholder="Jelaskan layanan Anda..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                        rows="3"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <!-- 2. Pengaturan Harga -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">2. Pengaturan Harga</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="price_type"
                    label="Tipe Harga *"
                    :options="[
                      { value: 'per_jam', label: 'Per Jam' },
                      { value: 'per_sesi', label: 'Per Sesi' },
                      { value: 'per_hari', label: 'Per Hari' },
                      { value: 'per_project', label: 'Per Project' },
                    ]"
                    v-model="formData.price_type"
                    required
                  />

                  <Field name="base_price" v-slot="{ field }">
                    <TextField
                      label="Harga Dasar (Rp) *"
                      type="number"
                      placeholder="150000"
                      v-bind="field"
                      required
                    />
                  </Field>

                  <Field name="min_order" v-slot="{ field }">
                    <TextField
                      label="Minimal Order *"
                      type="number"
                      placeholder="2"
                      v-bind="field"
                      required
                    />
                  </Field>

                  <Field name="negotiable" v-slot="{ field }">
                    <div class="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        :checked="field.value"
                        @change="field.handleChange"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label class="text-sm font-medium text-gray-700">Bisa dinegosiasikan</label>
                    </div>
                  </Field>
                </div>
              </div>

              <!-- 3. Durasi & Waktu -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">3. Durasi & Waktu Layanan</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="estimated_duration" v-slot="{ field }">
                    <TextField
                      label="Estimasi Durasi"
                      placeholder="60 menit, 3 jam, 1 hari"
                      v-bind="field"
                    />
                  </Field>

                  <Field name="operating_hours_start" v-slot="{ field }">
                    <TextField label="Jam Mulai" type="time" v-bind="field" />
                  </Field>

                  <Field name="operating_hours_end" v-slot="{ field }">
                    <TextField label="Jam Selesai" type="time" v-bind="field" />
                  </Field>

                  <Field name="operating_days" v-slot="{ field }">
                    <TextField
                      label="Hari Operasional"
                      placeholder="1,2,3,4,5,6,7"
                      v-bind="field"
                    />
                  </Field>

                  <Field name="booking_advance_days" v-slot="{ field }">
                    <TextField
                      label="Pemesanan Dimuka (hari)"
                      type="number"
                      v-bind="field"
                    />
                  </Field>
                </div>
              </div>

              <!-- 4. Lokasi -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">4. Lokasi & Area Layanan</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="service_type"
                    label="Tipe Layanan *"
                    :options="[
                      { value: 'at_location', label: 'Di Tempat Penyedia' },
                      { value: 'on_site', label: 'Datang ke Pelanggan' },
                      { value: 'online', label: 'Online' },
                    ]"
                    v-model="formData.service_type"
                    required
                  />

                  <Field name="location_address" v-slot="{ field }">
                    <TextField label="Alamat Lokasi" v-bind="field" />
                  </Field>

                  <Field name="service_area" v-slot="{ field }">
                    <TextField
                      label="Area Layanan"
                      placeholder="Jakarta Barat, radius 10km"
                      v-bind="field"
                    />
                  </Field>
                </div>
              </div>

              <!-- 5. Kapasitas -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">5. Kapasitas & Batasan</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="capacity_per_slot" v-slot="{ field }">
                    <TextField label="Kapasitas Per Slot" type="number" v-bind="field" />
                  </Field>

                  <Field name="max_orders_per_day" v-slot="{ field }">
                    <TextField label="Maks Order Per Hari" type="number" v-bind="field" />
                  </Field>
                </div>
              </div>

              <!-- 7. Syarat -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">7. Syarat & Ketentuan</h2>
                <div class="space-y-4">
                  <Field name="cancellation_policy" v-slot="{ field }">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Kebijakan Pembatalan</label>
                      <textarea
                        v-bind="field"
                        placeholder="Bisa cancel H-1, setelah itu kena charge 50%"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>
                  </Field>

                  <Field name="customer_requirements" v-slot="{ field }">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Kebutuhan Pelanggan</label>
                      <textarea
                        v-bind="field"
                        placeholder="Ruangan kosong, colokan listrik, dokumen"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>
                  </Field>

                  <Field name="special_notes" v-slot="{ field }">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Khusus</label>
                      <textarea
                        v-bind="field"
                        placeholder="Hasil bergantung kondisi lapangan dan cuaca"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="2"
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <!-- 8. Media -->
              <div class="border-b pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">8. Media Pendukung</h2>
                <div class="space-y-4">
                  <Field name="image" v-slot="{ field }">
                    <TextField label="Foto Layanan (URL)" v-bind="field" />
                  </Field>

                  <Field name="portfolio" v-slot="{ field }">
                    <TextField label="Portfolio/Contoh Proyek" v-bind="field" />
                  </Field>

                  <Field name="social_media" v-slot="{ field }">
                    <TextField
                      label="Sosial Media/Website"
                      placeholder="https://instagram.com/... (pisahkan dengan koma)"
                      v-bind="field"
                    />
                  </Field>
                </div>
              </div>

              <!-- 9. Admin -->
              <div class="pb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">9. Info Admin</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="status"
                    label="Status"
                    :options="[
                      { value: 'draft', label: 'Draft' },
                      { value: 'active', label: 'Aktif' },
                      { value: 'inactive', label: 'Non-aktif' },
                    ]"
                    v-model="formData.status"
                  />

                  <Field name="internal_code" v-slot="{ field }">
                    <TextField label="Kode Internal" placeholder="JASA-001" v-bind="field" />
                  </Field>

                  <Field name="priority" v-slot="{ field }">
                    <TextField label="Prioritas" type="number" v-bind="field" />
                  </Field>

                  <Field name="is_featured" v-slot="{ field }">
                    <div class="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        :checked="field.value"
                        @change="field.handleChange"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label class="text-sm font-medium text-gray-700">Unggulan</label>
                    </div>
                  </Field>
                </div>
              </div>

              <div class="flex gap-3">
                <Button type="button" variant="muted-outline" @click="router.back()">
                  Batal
                </Button>
                <Button type="submit" variant="primary" :disabled="loading" :loading="loading">
                  {{ loading ? "Menyimpan..." : "Simpan Perubahan" }}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: vertical;
}
</style>
