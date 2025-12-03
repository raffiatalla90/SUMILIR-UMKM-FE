<template>
  <div
    class="sm:bg-gray-50 bg-white flex min-h-svh sm:min-h-0 items-center sm:items-stretch justify-center p-4 sm:p-8"
  >
    <div
      class="w-full max-w-5xl bg-white rounded-2xl sm:shadow-lg shadow-none overflow-hidden"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-0">
        <!-- Left Side - Illustration (Hidden on Mobile) -->
        <div
          class="hidden sm:flex items-center justify-center  from-secondary p-12"
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
            class="mx-auto my-6 w-48 sm:hidden"
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

          <Form @submit="handleLogin" :validation-schema="schema">
            <!-- Email -->

            <div>
              <TextField
                name="email"
                label="Email"
                type="email"
                placeholder="Masukkan email"
              />
            </div>

            <!-- Password -->
            <div class="mt-4">
              <PasswordField
                name="password"
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
              />
            </div>

            <!-- Forgot Password -->
            <div class="mb-6 mt-2">
              <router-link to="forgot-password">
                <p
                  class="text-xs text-[#FFA30E] flex justify-end underline cursor-pointer hover:text-secondary-hover transition-colors"
                >
                  Lupa Kata Sandi?
                </p>
              </router-link>
            </div>

            <ErrorAlert :message="errorMessage" />

            <!-- Submit -->
            <AppButton
              type="submit"
              :loading="isLoading"
              variant="primary"
              size="md"
              block
              class="mb-4"
            >
              Masuk
            </AppButton>

            <!-- Register -->
            <div>
              <p class="text-black text-center text-xs md:text-sm">
                Belum punya akun?
                <router-link to="register">
                  <span
                    class="text-[#FFA30E] underline cursor-pointer hover:text-secondary-hover transition-colors font-semibold"
                  >
                    Daftar
                  </span>
                </router-link>
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
import { Form } from "vee-validate";
import * as yup from "yup";
import { RouterLink } from "vue-router";

import Illustration from "@/assets/images/login-illustration.svg";
import TextField from "@/components/forms/TextField.vue";
import PasswordField from "@/components/forms/PasswordField.vue";
import ErrorAlert from "@/components/forms/ErrorAlert.vue";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref("");
const apiUrl = import.meta.env.VITE_API_BASE_URL || "Not set";
const isDev = import.meta.env.DEV;

// Validation Schema
const schema = yup.object({
  email: yup
    .string()
    .required("Email wajib diisi")
    .email("Format email tidak valid"),
  password: yup.string().required("Kata sandi wajib diisi"),
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
