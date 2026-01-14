<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Form } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import ErrorAlert from "@/components/forms/ErrorAlert.vue";
import { useToast } from "vue-toastification";
import Button from "@/components/common/Button.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";

const router = useRouter();
const toast = useToast();

const isLoading = ref(false);
const errorMessage = ref("");
const showSuccessModal = ref(false);
const createdUserId = ref(null);
const createdUserName = ref("");

const schema = yup.object({
  name: yup.string().required("Nama wajib diisi").min(3, "Minimal 3 karakter"),
  email: yup
    .string()
    .required("Email wajib diisi")
    .email("Format email tidak valid"),
  phone: yup
    .string()
    .matches(/^[0-9+\-()\s]{8,20}$/, "Nomor telepon tidak valid")
    .required("Nomor telepon wajib diisi"),
  nik: yup
    .string()
    .matches(/^[0-9]{16}$/, "NIK harus 16 digit")
    .required("NIK wajib diisi"),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
  password_confirmation: yup
    .string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([yup.ref("password")], "Password tidak cocok"),
});

const handleRegister = async (values) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      nik: values.nik,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };

    const response = await api.post("/api/admin/users", payload);
    
    // Store created user info
    createdUserId.value = response.data.data?.id || response.data.id;
    createdUserName.value = values.name;
    
    toast.success("Customer berhasil dibuat", { timeout: 3000 });
    showSuccessModal.value = true;
  } catch (error) {
    console.error("Create customer error:", error);
    errorMessage.value =
      error.response?.data?.message || "Gagal membuat customer";
  } finally {
    isLoading.value = false;
  }
};

const goToList = () => {
  showSuccessModal.value = false;
  router.push({ name: "Admin - Customers List" });
};

const goToCreateMerchant = () => {
  showSuccessModal.value = false;
  router.push({
    name: "Admin - Merchant Create",
    query: { userId: createdUserId.value }
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <div class="px-4 sm:px-6 py-6">
      <div class="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Tambah Customer Baru</h2>
          <p class="text-sm text-gray-600 mt-1">
            Isi formulir di bawah untuk menambahkan customer baru
          </p>
        </div>

        <Form @submit="handleRegister" :validation-schema="schema">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Name -->
            <TextField
              variant="merchant"
              name="name"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              class="sm:col-span-2"
              required
            />

            <!-- Email -->
            <TextField
              variant="merchant"
              name="email"
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              required
            />

            <!-- Phone -->
            <TextField
              variant="merchant"
              name="phone"
              label="Nomor Telepon"
              placeholder="081234567890"
              required
            />

            <!-- NIK -->
            <TextField
              variant="merchant"
              name="nik"
              label="NIK (16 Digit)"
              placeholder="1234567890123456"
              maxlength="16"
              class="sm:col-span-2"
              required
            />

            <!-- Password -->
            <TextField
              variant="merchant"
              name="password"
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
            />

            <!-- Password Confirmation -->
            <TextField
              variant="merchant"
              name="password_confirmation"
              label="Konfirmasi Password"
              type="password"
              placeholder="Masukkan ulang password"
              required
            />

            <!-- Error Alert -->
            <ErrorAlert :message="errorMessage" class="sm:col-span-2" />

            <!-- Submit Button -->
            <div class="sm:col-span-2 flex gap-3 justify-end pt-4 border-t">
              <Button
                @click="router.push({ name: 'Admin - Customers List' })"
                variant="secondary"
                type="button"
              >
                Batal
              </Button>
              <Button
                variant="merchant"
                type="submit"
                :loading="isLoading"
                size="md"
              >
                <i class="pi pi-check mr-2"></i>
                Simpan Customer
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>

    <!-- Success Modal with Actions -->
    <ResponsiveModal 
      :show="showSuccessModal" 
      @close="goToList"
      title="Customer Berhasil Ditambahkan"
    >
      <div class="text-center py-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-check text-3xl text-green-600"></i>
        </div>
        <p class="text-lg font-semibold text-gray-900 mb-2">
          Customer <strong>{{ createdUserName }}</strong> berhasil dibuat!
        </p>
        <p class="text-sm text-gray-600">
          Anda dapat langsung menambahkan merchant untuk customer ini atau kembali ke daftar
        </p>
      </div>

      <template #footer>
        <div class="flex flex-col sm:flex-row gap-3">
          <Button 
            @click="goToList" 
            variant="secondary"
            block
          >
            <i class="pi pi-list mr-2"></i>
            Kembali ke Daftar
          </Button>
          <Button 
            @click="goToCreateMerchant" 
            variant="merchant"
            block
          >
            <i class="pi pi-building mr-2"></i>
            Tambah Merchant untuk User Ini
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>