<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useForm } from "vee-validate";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import TextField from "@/components/forms/TextField.vue";
import Button from "@/components/common/Button.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import api from "@/libs/axios";

const router = useRouter();
const toast = useToast();

const emit = defineEmits(["close", "created"]);
const { setErrors } = useForm();
const loading = ref(false);
const showSuccessModal = ref(false);

// Form state
const name = ref("");
const email = ref("");
const phone = ref("");
const nik = ref("");
const password = ref("");
const passwordConfirmation = ref("");

// Validation errors
const errors = ref({});

const resetForm = () => {
  name.value = "";
  email.value = "";
  phone.value = "";
  nik.value = "";
  password.value = "";
  passwordConfirmation.value = "";
  errors.value = {};
};

const handleSubmit = async () => {
  loading.value = true;
  errors.value = {};
  try {
    const response = await api.post("/admin/users", {
      name: name.value,
      email: email.value,
      phone: phone.value,
      nik: nik.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    toast.success("Customer berhasil dibuat!");
    showSuccessModal.value = true;
    resetForm();
    emit("created"); // emit event created
  } catch (error) {
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors);
    }

    toast.error(error.response?.data?.message || "Gagal membuat customer");
  } finally {
    loading.value = false;
  }
};

const goToList = () => {
  emit("close"); 
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-10">
    <!-- Form -->
    <div class="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <TextField
          variant="merchant"
          label="Nama Lengkap"
          v-model="name"
          name="name"
          required
          :error="errors.name?.join(' ')"
          placeholder="Nama lengkap customer"
        />

        <TextField
          variant="merchant"
          label="Email"
          v-model="email"
          name="email"
          type="email"
          required
          :error="errors.email?.join(' ')"
          placeholder="Email customer"
        />

        <TextField
          variant="merchant"
          label="No. HP"
          v-model="phone"
          name="phone"
          type="tel"
          :error="errors.phone?.join(' ')"
          placeholder="08xxxxxxxxxx"
        />

        <TextField
          variant="merchant"
          label="NIK"
          v-model="nik"
          name="nik"
          :error="errors.nik?.join(' ')"
          placeholder="Nomor Induk Kependudukan"
        />

        <TextField
          variant="merchant"
          label="Password"
          v-model="password"
          name="password"
          type="password"
          required
          :error="errors.password?.join(' ')"
          placeholder="Minimal 8 karakter"
        />

        <TextField
          variant="merchant"
          label="Konfirmasi Password"
          v-model="passwordConfirmation"
          name="password_confirmation"
          type="password"
          required
          :error="errors.password_confirmation?.join(' ')"
          placeholder="Ulangi password"
        />

        <div class="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" @click="goToList">Batal</Button>
          <Button type="submit" variant="merchant" :disabled="loading">
            <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
            Simpan
          </Button>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <ResponsiveModal :show="showSuccessModal" @close="showSuccessModal = false" title="Customer Ditambahkan">
      <div class="text-center py-4">
        <i class="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
        <p class="text-lg font-semibold mb-2">Customer berhasil dibuat!</p>
        <p class="text-gray-500">Customer baru telah ditambahkan ke sistem.</p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <Button @click="goToList" variant="merchant">Kembali ke Daftar</Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>