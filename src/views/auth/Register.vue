<template>
  <div
    class="sm:bg-gray-50 bg-primary flex items-center flex-col sm:justify-center justify-end sm:pb-8"
  >
    <div
      class="sm:hidden flex flex-col flex-1/3 justify-end sm:px-0 px-4 py-2 sm:pt-0 pt-8"
    >
      <h2
        class="sm:hidden inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-white"
      >
        Daftar
      </h2>
      <p
        class="sm:hidden inline text-[10px] sm:text-sm text-center sm:text-left mb-6 text-white"
      >
        Lengkapi data dirimu untuk membuat akun dan mulai jelajahi layanan
        terbaik
      </p>
    </div>
    <div
      class="flex flex-col justify-center sm:flex-0 flex-2/3 p-8 sm:p-12 sm:max-w-xl w-full bg-white sm:rounded-4xl rounded-t-4xl sm:shadow-lg shadow-none"
    >
      <!-- Right Side - Form -->
      <div class="sm:flex flex-col">
        <div class="flex gap-3 items-center mb-2">
          <span
            class="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <!-- <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 3a6 6 0 1 0 3.917 10.566l2.258 2.258A2 2 0 0 0 20.586 17H21a1 1 0 1 0 0-2h-.586l-.707-.707.293-.293H21a1 1 0 1 0 0-2h-2a1 1 0 0 0-.707.293l-.293.293-1.758-1.758A6 6 0 0 0 12 3Zm-4 6a4 4 0 1 1 8.001.001A4 4 0 0 1 8 9Z"
              />
            </svg> -->
            <i class="pi pi-user-plus"></i>
          </span>
          <h2
            class="hidden sm:inline text-2xl sm:text-xl font-bold text-center sm:text-left text-black"
          >
            Daftar
          </h2>
        </div>

        <p
          class="hidden sm:inline text-xs sm:text-sm text-center sm:text-left mb-6 text-gray-600"
        >
          Lengkapi data dirimu untuk membuat akun dan mulai jelajahi layanan
          terbaik
        </p>
        <Form
          @submit="handleRegister"
          :validation-schema="schema"
          v-slot="{ errors }"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Name Field -->
            <div class="">
              <label for="name" class="block text-sm font-bold text-black mb-2">
                Nama Lengkap
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                :class="errors.name ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="name" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Email Field -->
            <div class="">
              <label
                for="email"
                class="block text-sm font-bold text-black mb-2"
              >
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                :class="errors.email ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- NIK Field -->
            <div class="">
              <label for="nik" class="block text-sm font-bold text-black mb-2">
                NIK
              </label>
              <Field
                id="nik"
                name="nik"
                type="text"
                placeholder="Masukkan NIK"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                :class="errors.nik ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="nik" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Telepon Field -->
            <div class="">
              <label
                for="telepon"
                class="block text-sm font-bold text-black mb-2"
              >
                No. Telepon
              </label>
              <Field
                id="telepon"
                name="telepon"
                type="tel"
                placeholder="Masukkan no. telepon"
                class="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                :class="errors.telepon ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="telepon" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Password Field -->
            <div class="">
              <label
                for="password"
                class="block text-sm font-bold text-black mb-2"
              >
                Kata Sandi
              </label>
              <div class="relative">
                <Field
                  id="password"
                  name="password"
                  v-model="passwordValue"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan kata sandi"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                  :class="errors.password ? 'border-red-500' : 'border-primary'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-gray-700"
                  :aria-label="
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  "
                >
                  <svg
                    v-if="showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678a1 1 0 010 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3 3l18 18M10.584 10.587A3 3 0 0113.414 13.41M9.88 4.603A9.76 9.76 0 0112 4.5c4.64 0 8.577 2.51 9.964 6.678a1 1 0 010 .644 10.21 10.21 0 01-2.126 3.358M6.228 6.232C4.48 7.38 3.152 9.01 2.036 11.678a1 1 0 000 .644c1.387 4.168 5.324 6.678 9.964 6.678 1.088 0 2.141-.15 3.144-.43"
                    />
                  </svg>
                </button>
              </div>
              <ErrorMessage name="password" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Password Confirmation Field -->
            <div class="">
              <label
                for="password_confirmation"
                class="block text-sm font-bold text-black mb-2"
              >
                Konfirmasi Kata Sandi
              </label>
              <div class="relative">
                <Field
                  id="password_confirmation"
                  name="password_confirmation"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  placeholder="Ulangi kata sandi"
                  class="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder:text-gray-400 transition-all"
                  :class="
                    errors.password_confirmation
                      ? 'border-red-500'
                      : 'border-primary'
                  "
                  autocomplete="new-password"
                  @paste.prevent
                  @drop.prevent
                  @contextmenu.prevent
                />
              </div>
              <ErrorMessage
                name="password_confirmation"
                class="text-red-500 text-xs mt-1"
              />
            </div>

            <!-- Indicators -->
            <div
              class="text-xs p-4 rounded-xl bg-muted-background sm:col-span-2 col-span-1 flex flex-col gap-1"
              aria-live="polite"
            >
              <div
                class="flex items-center"
                :class="
                  hasMinLength ? 'text-green-600' : 'text-muted-foreground'
                "
              >
                <svg
                  v-if="hasMinLength"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" stroke-width="2" />
                </svg>
                Minimal 8 karakter
              </div>
              <div
                class="flex items-center"
                :class="
                  hasUppercase ? 'text-green-600' : 'text-muted-foreground'
                "
              >
                <svg
                  v-if="hasUppercase"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" stroke-width="2" />
                </svg>
                Mengandung huruf besar (A-Z)
              </div>
              <div
                class="flex items-center"
                :class="hasNumber ? 'text-green-600' : 'text-muted-foreground'"
              >
                <svg
                  v-if="hasNumber"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" stroke-width="2" />
                </svg>
                Mengandung angka (0-9)
              </div>
              <div
                class="flex items-center"
                :class="hasSymbol ? 'text-green-600' : 'text-muted-foreground'"
              >
                <svg
                  v-if="hasSymbol"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="9" stroke-width="2" />
                </svg>
                Mengandung simbol (!@#$%^&*-_)
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="mb-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm sm:col-span-2"
            >
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <div class="sm:col-span-2">
              <AppButton
                type="submit"
                :loading="isLoading"
                variant="primary"
                size="md"
                block
                class="mb-2"
              >
                Daftar
              </AppButton>
            </div>

            <!-- Login Link -->
            <div class="sm:col-span-2">
              <p class="text-black text-center text-xs sm:text-sm">
                Sudah punya akun?
                <router-link
                  to="login"
                  class="text-primary underline cursor-pointer hover:text-[#ff8c00] transition-colors font-semibold"
                >
                  Masuk
                </router-link>
              </p>
            </div>
          </div>
        </Form>
        <!-- Debug Info (Development Only) -->
        <div
          v-if="isDev"
          class="mt-6 p-4 bg-gray-50 rounded-xl text-xs border border-gray-200"
        >
          <p class="font-semibold mb-2 text-gray-700">Debug Info:</p>
          <p class="text-gray-600"><strong>API URL:</strong> {{ apiUrl }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import { RouterLink } from "vue-router";
import { useToast } from "vue-toastification"; // NEW
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const toast = useToast(); // NEW

const isLoading = ref(false);
const errorMessage = ref("");
const apiUrl = import.meta.env.VITE_API_BASE_URL || "Not set";
const isDev = import.meta.env.DEV;

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Nama wajib diisi"),
  email: yup
    .string()
    .required("Email wajib diisi")
    .email("Format email tidak valid"),
  telepon: yup
    .string()
    .required("No. Telepon wajib diisi")
    .matches(
      /^08[0-9]{8,11}$/,
      "Format telepon tidak valid (contoh: 08123456789)"
    )
    .min(10, "No. Telepon minimal 10 digit")
    .max(13, "No. Telepon maksimal 13 digit"),
  nik: yup
    .string()
    .required("NIK wajib diisi")
    .length(16, "NIK harus 16 karakter"),
  password: yup
    .string()
    .required("Kata sandi wajib diisi")
    .min(8, "Persyaratan kata sandi belum terpenuhi")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*\-_]).+$/,
      "Persyaratan kata sandi belum terpenuhi"
    ),
  password_confirmation: yup
    .string()
    .required("Konfirmasi kata sandi wajib diisi")
    .oneOf([yup.ref("password")], "Kata sandi tidak cocok"),
});

// Password indicators
const passwordValue = ref("");
const hasMinLength = computed(() => passwordValue.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(passwordValue.value));
const hasNumber = computed(() => /\d/.test(passwordValue.value));
const hasSymbol = computed(() => /[!@#$%^&*\-_]/.test(passwordValue.value));

const handleRegister = async (values) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data } = await api.post("/auth/register", {
      name: values.name,
      email: values.email,
      nik: values.nik,
      phone: values.telepon,
      password: values.password,
      password_confirmation: values.password_confirmation,
    });

    // Toast sukses langsung, tanpa menunggu email terkirim
    toast.success("Registrasi berhasil. Cek email untuk verifikasi.", {
      timeout: 4000,
    }); // NEW

    // Arahkan ke halaman login
    router.push({ name: "Login" }).catch(() => {});
  } catch (error) {
    console.error("Register error:", error);
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors).flat().join(", ");
    } else {
      errorMessage.value =
        error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
    }
  } finally {
    isLoading.value = false;
  }
};

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
</script>
