<template>
  <div
    class="sm:bg-gray-50 bg-primary flex items-center flex-col sm:justify-center justify-end sm:pb-8"
  >
    <!-- Mobile header -->
    <div
      class="sm:hidden flex flex-col flex-1/3 justify-end sm:px-0 px-4 py-2 sm:pt-0 pt-8"
    >
      <h2
        class="sm:hidden inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-white"
      >
        Reset Password
      </h2>
      <p
        class="sm:hidden inline text-[10px] sm:text-sm text-center sm:text-left mb-6 text-white"
      >
        Atur ulang password Anda dengan aman
      </p>
    </div>

    <div
      class="flex flex-col justify-center sm:flex-0 flex-2/3 p-8 sm:p-12 sm:max-w-xl w-full bg-white sm:rounded-4xl rounded-t-4xl sm:shadow-lg shadow-none"
    >
      <!-- Desktop header -->
      <div class="hidden sm:flex gap-3 items-center mb-2">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <i class="pi pi-key"></i>
        </span>
        <h1 class="text-xl font-bold text-black">Reset Password</h1>
      </div>

      <p v-if="emailFromQuery" class="text-sm text-gray-600 mb-4">
        Mengatur ulang untuk:
        <span class="font-semibold">{{ emailFromQuery }}</span>
      </p>

      <Form @submit="handleSubmit" :validation-schema="schema">
        <div class="space-y-4">
          <PasswordField
            name="password"
            label="Password Baru"
            type="password"
            placeholder="Minimal 8 karakter"
          />
          <TextField
            name="password_confirmation"
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
          />

          <AppButton
            type="submit"
            :loading="isLoading"
            variant="primary"
            size="md"
            block
          >
            Setel Ulang Password
          </AppButton>

          <AppButton
            type="button"
            variant="outline"
            size="md"
            block
            @click="goToLogin"
          >
            Kembali ke Login
          </AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Form } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import PasswordField from "@/components/forms/PasswordField.vue";
import AppButton from "@/components/common/Button.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

// Ambil token & email dari URL (param atau query)
const token = ref((route.params.token || route.query.token || "").toString());
const emailFromQuery = (route.query.email || "").toString();

const schema = yup.object({
  password: yup
    .string()
    .min(8, "Min 8 karakter")
    .required("Password wajib diisi"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Konfirmasi password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
});

async function handleSubmit(values) {
  if (!token.value || !emailFromQuery) {
    toast.error("Link reset tidak valid. Minta tautan baru.");
    return;
  }

  isLoading.value = true;
  try {
    await api.post("/auth/reset-password", {
      token: token.value,
      email: emailFromQuery, // dikirim tersembunyi
      password: values.password,
      password_confirmation: values.password_confirmation,
    });
    toast.success("Password berhasil direset. Silakan login.", {
      timeout: 4000,
    });
    router.push({ name: "Login" });
  } catch (e) {
    const msg = e.response?.data?.message || "Gagal reset password.";
    toast.error(msg);
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  router.push({ name: "Login" }).catch(() => router.push("/login"));
}
</script>
