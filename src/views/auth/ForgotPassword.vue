<template>
  <div class="max-w-md mx-auto px-4 py-10">
    <div class="bg-white border rounded-2xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 3a6 6 0 1 0 3.917 10.566l2.258 2.258A2 2 0 0 0 20.586 17H21a1 1 0 1 0 0-2h-.586l-.707-.707.293-.293H21a1 1 0 1 0 0-2h-2a1 1 0 0 0-.707.293l-.293.293-1.758-1.758A6 6 0 0 0 12 3Zm-4 6a4 4 0 1 1 8.001.001A4 4 0 0 1 8 9Z"
            />
          </svg>
        </span>
        <h1 class="text-xl font-bold">Lupa Password</h1>
      </div>

      <p class="text-sm text-gray-700 mb-6">
        Masukkan email Anda. Kami akan mengirim tautan untuk mengatur ulang
        password.
      </p>

      <Form @submit="handleSubmit" :validation-schema="schema">
        <div class="space-y-4">
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <AppButton
            type="submit"
            :loading="isLoading"
            variant="primary"
            size="md"
            block
          >
            Kirim Link Reset
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
import { useRouter } from "vue-router";
import { Form } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

const schema = yup.object({
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
});

async function handleSubmit(values) {
  isLoading.value = true;
  try {
    await api.post("/auth/forgot-password", { email: values.email });
    toast.success(
      "Jika email terdaftar, tautan reset telah dikirim ke inbox Anda.",
      { timeout: 4000 }
    );
  } catch (e) {
    const msg =
      e.response?.data?.message ||
      "Gagal mengirim tautan reset password. Coba lagi.";
    toast.error(msg, { timeout: 4000 });
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  router.push({ name: "Login" }).catch(() => router.push("/login"));
}
</script>
