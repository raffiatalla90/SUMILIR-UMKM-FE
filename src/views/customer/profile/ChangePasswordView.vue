<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import TextField from "@/components/forms/TextField.vue";

const router = useRouter();
const profileStore = useProfileStore();

// Form data
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

// Show/hide password states
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Validation states
const errors = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
// Password indicators (mirip Register.vue)
const hasMinLength = computed(() => newPassword.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value));
const hasLowercase = computed(() => /[a-z]/.test(newPassword.value));
const hasNumber = computed(() => /[0-9]/.test(newPassword.value));
const hasSymbol = computed(() =>
  /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value)
);

const loading = ref(false);

// Password validation
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid:
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSymbol,
  };
};

// Validate form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // Validate current password
  if (!currentPassword.value) {
    errors.value.currentPassword = "Kata sandi sekarang wajib diisi";
    isValid = false;
  }

  // Validate new password
  if (!newPassword.value) {
    errors.value.newPassword = "Kata sandi baru wajib diisi";
    isValid = false;
  } else {
    const validation = validatePassword(newPassword.value);
    if (!validation.isValid) {
      errors.value.newPassword = "Kata sandi tidak memenuhi syarat";
      isValid = false;
    }
  }

  // Validate confirm password
  if (!confirmPassword.value) {
    errors.value.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Kata sandi tidak cocok";
    isValid = false;
  }

  return isValid;
};

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    await profileStore.changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirmation: confirmPassword.value,
    });

    alert("Kata sandi berhasil diubah!");
    router.push("/profile");
  } catch (error) {
    console.error("Error changing password:", error);
    if (error.response && error.response.data && error.response.data.message) {
      // Display server-side error message
      errors.value.currentPassword = error.response.data.message;
    } else {
      alert("Gagal mengubah kata sandi. Silakan coba lagi.");
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="flex items-center max-w-4xl px-4 py-4 mx-auto">
        <button @click="goBack" class="mr-3">
          <svg
            class="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-900">Ubah Kata Sandi</h1>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl px-4 py-6 pb-24 mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Current Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Kata Sandi Sekarang <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <TextField
              name="currentPassword"
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :required="true"
              :customClass="
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              "
              :label="''"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
            >
              <svg
                v-if="!showCurrentPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-500">
            {{ errors.currentPassword }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Kata Sandi Baru <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <TextField
              name="newPassword"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :required="true"
              :customClass="
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              "
              :label="''"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
            >
              <svg
                v-if="!showNewPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.newPassword" class="mt-1 text-sm text-red-500">
            {{ errors.newPassword }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Konfirmasi Sandi Baru <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <TextField
              name="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :required="true"
              :customClass="
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              "
              :label="''"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-700"
            >
              <svg
                v-if="!showConfirmPassword"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-500">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Password Requirements -->
        <!-- Password Indicators (mirip Register.vue) -->
        <div
          class="flex flex-col gap-1 p-4 text-xs border border-blue-200 rounded-xl bg-blue-50"
          aria-live="polite"
        >
          <div
            class="flex items-center"
            :class="hasMinLength ? 'text-green-600' : 'text-muted-foreground'"
          >
            <svg
              v-if="hasMinLength"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
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
            :class="hasUppercase ? 'text-green-600' : 'text-muted-foreground'"
          >
            <svg
              v-if="hasUppercase"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
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
            :class="hasLowercase ? 'text-green-600' : 'text-muted-foreground'"
          >
            <svg
              v-if="hasLowercase"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9" stroke-width="2" />
            </svg>
            Mengandung huruf kecil (a-z)
          </div>
          <div
            class="flex items-center"
            :class="hasNumber ? 'text-green-600' : 'text-muted-foreground'"
          >
            <svg
              v-if="hasNumber"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
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
              class="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="9" stroke-width="2" />
            </svg>
            Mengandung simbol (!@#$%^&*(),.?":{}|<>)
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 font-semibold text-white transition-colors bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Simpan</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg
              class="w-5 h-5 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Menyimpan...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Status bar simulation */
.status-bar {
  height: 44px;
  background: white;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .max-w-4xl {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>
