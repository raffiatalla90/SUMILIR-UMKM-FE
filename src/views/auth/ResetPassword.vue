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
        <h1 class="text-xl font-bold">Reset Password</h1>
      </div>

      <Form
        @submit="handleSubmit"
        :validation-schema="schema"
        :initial-values="initialValues"
      >
        <div class="space-y-4">
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <TextField
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

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full active:scale-95 bg-primary text-white font-semibold py-2.5 px-4 rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {{ isLoading ? "Memproses..." : "Setel Ulang Password" }}
          </button>

          <button
            type="button"
            class="w-full border rounded-xl py-2.5 font-semibold hover:bg-gray-50"
            @click="goToLogin"
          >
            Kembali ke Login
          </button>
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

const route = useRoute();
// Ambil token dari param atau query
const token = ref((route.params.token || route.query.token || "").toString());
const emailFromQuery = (route.query.email || "").toString();

const initialValues = {
  email: emailFromQuery,
  password: "",
  password_confirmation: "",
};

const schema = yup.object({
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
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
  isLoading.value = true;
  try {
    await api.post("/auth/reset-password", {
      token: token.value,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    });
    toast.success("Password berhasil direset. Silakan login.", {
      timeout: 4000,
    });
    router.push({ name: "login" });
  } catch (e) {
    const msg = e.response?.data?.message || "Gagal reset password.";
    toast.error(msg);
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  router.push({ name: "login" }).catch(() => router.push("/login"));
}
</script>
