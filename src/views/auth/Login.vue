<template>
  <div
    class="min-h-screen sm:bg-gray-50 bg-white flex items-center justify-center p-4 sm:p-8"
  >
    <div
      class="w-full max-w-5xl bg-white rounded-2xl sm:shadow-lg shadow-none overflow-hidden"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-0">
        <!-- Left Side - Illustration (Hidden on Mobile) -->
        <div
          class="hidden sm:flex items-center justify-center bg-gradient-to-br from-primary to-[#FFA30E] p-12"
        >
          <img
            :src="Illustration"
            alt="Ilustration Login"
            class="w-full max-w-md"
          />
        </div>

        <!-- Right Side - Form -->
        <div class="p-4 sm:p-12 flex flex-col justify-center">
          <!-- Mobile Illustration -->
          <img
            :src="Illustration"
            alt="Ilustration Login"
            class="mx-auto mb-6 w-48 sm:hidden"
          />

          <h2
            class="text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-black"
          >
            Selamat Datang
          </h2>
          <p
            class="text-xs sm:text-sm text-center sm:text-left mb-8 text-gray-600"
          >
            Masukkan akunmu untuk melanjutkan perjalananmu
          </p>

          <Form
            @submit="handleLogin"
            :validation-schema="schema"
            v-slot="{ errors }"
          >
            <!-- Email Field -->
            <div class="mb-4">
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
                placeholder="contoh@email.com"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA30E] text-black placeholder:text-gray-400 transition-all"
                :class="errors.email ? 'border-red-500' : 'border-primary'"
              />
              <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
            </div>

            <!-- Password Field -->
            <div class="mb-2">
              <label
                for="password"
                class="block text-sm font-bold text-black mb-2"
              >
                Password
              </label>
              <div class="relative">
                <Field
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  class="w-full px-4 py-2.5 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA30E] text-black placeholder:text-gray-400 transition-all"
                  :class="errors.password ? 'border-red-500' : 'border-primary'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  :aria-label="
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  "
                >
                  <svg
                    v-if="!showPassword"
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

            <!-- Forgot Password -->
            <div class="mb-6">
              <p
                class="text-xs text-[#FFA30E] flex justify-end underline cursor-pointer hover:text-[#ff8c00] transition-colors"
              >
                Lupa Kata Sandi?
              </p>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#FFA30E] text-white font-bold text-base md:text-lg py-2.5 px-4 mb-4 rounded-xl hover:bg-[#ff8c00] focus:outline-none focus:ring-2 focus:ring-[#FFA30E] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {{ isLoading ? "Loading..." : "Masuk" }}
            </button>

            <!-- Register Link -->
            <div>
              <p class="text-black text-center text-xs md:text-sm">
                Belum punya akun?

                <router-link to="register">
                  <span
                    class="text-[#FFA30E] underline cursor-pointer hover:text-[#ff8c00] transition-colors font-semibold"
                  >
                    Daftar
                  </span></router-link
                >
              </p>
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { RouterLink } from "vue-router";

import Illustration from "@/assets/images/login-illustration.svg";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref("");
const apiUrl = import.meta.env.VITE_API_BASE_URL || "Not set";
const showPassword = ref(false);
const isDev = import.meta.env.DEV;

// Validation Schema
const schema = yup.object({
  email: yup
    .string()
    .required("Email wajib diisi")
    .email("Format email tidak valid"),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

const handleLogin = async (values) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await authStore.login({
      email: values.email,
      password: values.password,
    });

    router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    errorMessage.value =
      error.response?.data?.message || "Login gagal. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};
</script>
