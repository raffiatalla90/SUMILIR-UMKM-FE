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
const packages = ref([]);

// Form data
const formData = ref({
  title: "",
  description: "",
  jasa_category_id: null,
  jasa_subcategory_id: null,
  price_type: "per_sesi",
  base_price: 0,
  min_order: 1,
  negotiable: false,
  estimated_duration: "",
  operating_hours_start: "09:00",
  operating_hours_end: "17:00",
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
  payment_methods: "cod",
  whatsapp_link: "",
  status: "draft",
  internal_code: "",
  is_featured: false,
  image: "",
});

// Validation schema
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
  payment_methods: yup.string().nullable(),
  whatsapp_link: yup.string().nullable(),
  status: yup.string(),
  internal_code: yup.string().nullable(),
  is_featured: yup.boolean(),
  image: yup.string().nullable(),
});

const loadCategories = async () => {
  try {
    const { data } = await api.get("/jasa-categories", {
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
    const { data } = await api.get(`/jasa-categories/${categoryId}/subcategories`);
    jasaSubcategories.value = data;
  } catch (error) {
    console.error("Error loading subcategories:", error);
  }
};

const handleCategoryChange = (value) => {
  formData.value.jasa_category_id = value;
  formData.value.jasa_subcategory_id = null;
  loadSubcategories(value);
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

  loading.value = true;
  try {
    const payload = {
      ...values,
      negotiable: values.negotiable || false,
      is_featured: values.is_featured || false,
      packages: packages.value.filter(p => p.name && p.price > 0),
    };

    const { data } = await api.post(
      `/merchants/${currentMerchantId.value}/jasas`,
      payload
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
          v-slot="{ handleSubmit, errors }"
        >
          <form @submit="handleSubmit" class="space-y-6">
            <!-- 1. KLASIFIKASI LAYANAN -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">1. Klasifikasi Layanan</h2>
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
                <SelectField
                  name="price_type"
                  label="Pengaturan Harga"
                  :options="[
                    { value: 'per_jam', label: 'Per Jam' },
                    { value: 'per_sesi', label: 'Per Sesi' },
                    { value: 'per_hari', label: 'Per Hari' },
                    { value: 'per_project', label: 'Per Proyek' },
                  ]"
                  v-model="formData.price_type"
                  required
                />

                <Field name="base_price" v-slot="{ field }">
                  <TextField
                    label="Harga Mulai Dari (Rp)"
                    type="number"
                    placeholder="150000"
                    v-bind="field"
                    required
                  />
                </Field>

                <Field name="min_order" v-slot="{ field }">
                  <TextField
                    label="Minimal Jumlah Pemesanan"
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
                      v-bind="field"
                      :value="true"
                      class="w-4 h-4 text-merchant-primary rounded"
                    />
                    <label class="text-sm font-medium text-gray-700">Harga Bisa Dinegosiasikan</label>
                  </div>
                </Field>
              </div>
            </div>

            <!-- 2.5 PAKET LAYANAN -->
            <div class="border-b pb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">2.5. Paket Layanan (Opsional)</h2>
                <Button
                  type="button"
                  variant="primary"
                  @click="addPackage"
                  class="text-sm"
                >
                  + Tambah Paket
                </Button>
              </div>

              <div v-if="packages.length === 0" class="text-center py-8 text-gray-500">
                <p class="text-sm">Belum ada paket. Klik tombol "Tambah Paket" untuk membuat paket layanan.</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(pkg, index) in packages"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div class="flex items-start justify-between mb-4">
                    <h3 class="font-semibold text-gray-800">Paket {{ index + 1 }}</h3>
                    <button
                      type="button"
                      @click="removePackage(index)"
                      class="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
                      <input
                        v-model="pkg.name"
                        type="text"
                        placeholder="Contoh: Paket Standar"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Harga Paket (Rp)</label>
                      <input
                        v-model.number="pkg.price"
                        type="number"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Paket</label>
                      <textarea
                        v-model="pkg.description"
                        placeholder="Jelaskan apa yang termasuk dalam paket ini..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. DURASI & WAKTU -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">3. Durasi & Waktu Layanan</h2>
              <div class="space-y-4">
                <!-- Estimasi Durasi -->
                <Field name="estimated_duration" v-slot="{ field }">
                  <TextField
                    label="Berapa Lama Layanan"
                    placeholder="Contoh: 60 menit, 3 jam, 1 hari"
                    v-bind="field"
                  />
                </Field>

                <!-- Jam Layanan (Mulai & Selesai dalam satu baris) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field name="operating_hours_start" v-slot="{ field }">
                    <TextField
                      label="Jam Mulai Layanan"
                      type="time"
                      v-bind="field"
                    />
                  </Field>

                  <Field name="operating_hours_end" v-slot="{ field }">
                    <TextField
                      label="Jam Selesai Layanan"
                      type="time"
                      v-bind="field"
                    />
                  </Field>
                </div>

                <!-- Hari Operasional dengan Checkbox -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">Hari Operasional (Hari Apa Saja Anda Bekerja?)</label>
                  <div class="space-y-2">
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_1"
                        :checked="formData.operating_days.includes('1')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('1')) days.push('1');
                          } else {
                            days.splice(days.indexOf('1'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_1" class="text-sm text-gray-700">Senin</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_2"
                        :checked="formData.operating_days.includes('2')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('2')) days.push('2');
                          } else {
                            days.splice(days.indexOf('2'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_2" class="text-sm text-gray-700">Selasa</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_3"
                        :checked="formData.operating_days.includes('3')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('3')) days.push('3');
                          } else {
                            days.splice(days.indexOf('3'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_3" class="text-sm text-gray-700">Rabu</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_4"
                        :checked="formData.operating_days.includes('4')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('4')) days.push('4');
                          } else {
                            days.splice(days.indexOf('4'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_4" class="text-sm text-gray-700">Kamis</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_5"
                        :checked="formData.operating_days.includes('5')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('5')) days.push('5');
                          } else {
                            days.splice(days.indexOf('5'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_5" class="text-sm text-gray-700">Jumat</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_6"
                        :checked="formData.operating_days.includes('6')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('6')) days.push('6');
                          } else {
                            days.splice(days.indexOf('6'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_6" class="text-sm text-gray-700">Sabtu</label>
                    </div>
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="day_7"
                        :checked="formData.operating_days.includes('7')"
                        @change="(e) => {
                          const days = formData.operating_days.split(',').filter(d => d).map(d => d.trim());
                          if (e.target.checked) {
                            if (!days.includes('7')) days.push('7');
                          } else {
                            days.splice(days.indexOf('7'), 1);
                          }
                          formData.operating_days = days.join(',');
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="day_7" class="text-sm text-gray-700">Minggu</label>
                    </div>
                  </div>
                </div>

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

            <!-- 5. KAPASITAS -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">5. Kapasitas & Batasan</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="capacity_per_slot" v-slot="{ field }">
                  <TextField
                    label="Kapasitas Per Sesi"
                    type="number"
                    v-bind="field"
                  />
                </Field>

                <Field name="max_orders_per_day" v-slot="{ field }">
                  <TextField
                    label="Maks Order Per Hari"
                    type="number"
                    v-bind="field"
                  />
                </Field>
              </div>
            </div>

            <!-- 7. SYARAT -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">7. Syarat & Ketentuan</h2>
              <div class="space-y-4">
                <Field name="cancellation_policy" v-slot="{ field }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Syarat Pembatalan Pesanan</label>
                    <textarea
                      v-bind="field"
                      placeholder="Contoh: Bisa dibatalkan H-1, setelah itu kena charge 50%"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>
                </Field>

                <Field name="customer_requirements" v-slot="{ field }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apa Yang Pelanggan Perlu Siapkan?</label>
                    <textarea
                      v-bind="field"
                      placeholder="Contoh: Ruangan kosong, colokan listrik, dokumen"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>
                </Field>

                <Field name="special_notes" v-slot="{ field }">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Khusus (Opsional)</label>
                    <textarea
                      v-bind="field"
                      placeholder="Contoh: Hasil bergantung kondisi lapangan dan cuaca"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>
                </Field>
              </div>
            </div>

            <!-- 8. MEDIA -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">8. Media Pendukung</h2>
              <div class="space-y-4">

                <Field name="social_media" v-slot="{ field }">
                  <TextField
                    label="Link Instagram, Website, Atau Kontak Lain"
                    placeholder="https://instagram.com/... (pisahkan dengan koma jika lebih dari satu)"
                    v-bind="field"
                  />
                </Field>
              </div>
            </div>

            <!-- 9. PEMBAYARAN & KONTAK -->
            <div class="border-b pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">9. Pembayaran & Kontak</h2>
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
                    <div class="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="payment_qris"
                        :checked="formData.payment_methods.includes('qris')"
                        @change="(e) => {
                          const methods = formData.payment_methods.split(',').filter(m => m).map(m => m.trim());
                          if (e.target.checked) {
                            if (!methods.includes('qris')) methods.push('qris');
                          } else {
                            methods.splice(methods.indexOf('qris'), 1);
                          }
                          formData.payment_methods = methods.length ? methods.join(',') : 'cod';
                        }"
                        class="w-4 h-4 text-merchant-primary rounded"
                      />
                      <label for="payment_qris" class="text-sm text-gray-700">QRIS (Scan & Transfer)</label>
                    </div>
                  </div>
                </div>

                <!-- Link WhatsApp -->
                <Field name="whatsapp_link" v-slot="{ field }">
                  <TextField
                    label="Link WhatsApp untuk Hubungi Penjual"
                    placeholder="Contoh: https://wa.me/6281234567890"
                    v-bind="field"
                  />
                </Field>
                <p class="text-xs text-gray-500">Customer akan klik tombol ini untuk chat Anda via WhatsApp</p>
              </div>
            </div>

            <!-- 10. ADMIN -->
            <div class="pb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">10. Info Admin</h2>
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

                <Field name="internal_code" v-slot="{ field }">
                  <TextField
                    label="Kode Referensi (Untuk Arsip Anda)"
                    placeholder="Contoh: JASA-001"
                    v-bind="field"
                  />
                </Field>

                <Field name="priority" v-slot="{ field }">
                  <TextField
                    label="Urutan Tampilan (1-10, Angka Kecil Lebih Atas)"
                    type="number"
                    v-bind="field"
                  />
                </Field>

                <Field name="is_featured" v-slot="{ field }">
                  <div class="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      v-bind="field"
                      :value="true"
                      class="w-4 h-4 text-merchant-primary rounded"
                    />
                    <label class="text-sm font-medium text-gray-700">Tampilkan di Unggulan?</label>
                  </div>
                </Field>
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
