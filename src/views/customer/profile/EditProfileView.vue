<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";

const router = useRouter();
const profileStore = useProfileStore();
const toast = useToast();

// Form data
const formData = ref({
  name: "",
  email: "",
  phone: "",
  nik: "",
  full_address: "",
  profile_picture: "",
});
const profilePictureFile = ref(null);
const fileInput = ref(null);

// Watch for changes in store user data
watch(
  () => profileStore.user,
  (newUser) => {
    if (newUser) {
      formData.value = { ...newUser };
    }
  },
  { immediate: true }
);

const handleSave = async () => {
  try {
    const payload = new FormData();
    payload.append("name", formData.value.name);
    payload.append("email", formData.value.email);
    payload.append("phone", formData.value.phone);
    payload.append("nik", formData.value.nik);
    payload.append("full_address", formData.value.full_address);
    if (profilePictureFile.value) {
      payload.append("profile_picture", profilePictureFile.value);
    }

    await profileStore.updateProfile(payload);
    toast.success("Profil berhasil diperbarui");
    router.push("/profile");
  } catch (error) {
    console.error("Error saving profile:", error);
    const message =
      error.response?.data?.message ||
      "Gagal memperbarui profil. Silakan coba lagi.";
    toast.error(message);
  }
};

const handleCancel = () => {
  router.push("/profile");
};

const handlePhotoUpload = () => {
  fileInput.value.click();
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    profilePictureFile.value = file;
    formData.value.profile_picture = URL.createObjectURL(file);
  }
};

onMounted(() => {
  if (!profileStore.user) {
    profileStore.fetchProfile();
  }
});
</script>

<template>
  <div class="min-h-screen pb-20 bg-gray-50 md:bg-white md:pb-0">
    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInput"
      @change="onFileChange"
      class="hidden"
      accept="image/*"
    />

    <!-- Header -->
    <div
      class="sticky top-0 z-10 px-4 py-4 bg-white border-b border-gray-100 md:px-8 md:py-6"
    >
      <div class="mx-auto max-w-7xl">
        <button
          @click="handleCancel"
          class="flex items-center gap-2 text-gray-700 transition-colors hover:text-gray-900"
        >
          <svg
            class="w-6 h-6"
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
          <span class="text-lg font-medium md:text-xl">Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Content Container -->
    <div class="px-4 py-6 mx-auto max-w-7xl md:px-8 md:py-12">
      <!-- DESKTOP LAYOUT -->
      <div class="hidden gap-8 md:grid md:grid-cols-12">
        <!-- Left: Profile Picture -->
        <div class="md:col-span-4">
          <div
            class="sticky p-8 bg-white border border-gray-100 shadow-sm rounded-2xl top-24"
          >
            <div class="flex flex-col items-center">
              <div class="relative">
                <img
                  :src="formData.profile_picture"
                  :alt="formData.name"
                  class="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
                />
                <button
                  @click="handlePhotoUpload"
                  class="absolute p-3 text-white transition-all rounded-full shadow-lg bottom-2 right-2 bg-primary hover:bg-orange-600 hover:scale-110"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>

              <button
                @click="handlePhotoUpload"
                class="mt-4 text-sm font-medium transition-colors text-primary hover:text-orange-600"
              >
                Edit Foto Profile
              </button>

              <p class="mt-2 text-xs text-center text-gray-500">
                Format: JPG, PNG<br />Max size: 2MB
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Form -->
        <div class="md:col-span-8">
          <div
            class="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl"
          >
            <h3 class="mb-6 text-xl font-bold text-gray-900">
              Edit Informasi Profil
            </h3>

            <form @submit.prevent="handleSave">
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <!-- Nama -->
                <div class="lg:col-span-2">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    Nama Lengkap <span class="text-red-500">*</span>
                  </label>
                  <TextField
                    name="name"
                    v-model="formData.name"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <!-- Telepon -->
                <div>
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    Nomor Telepon <span class="text-red-500">*</span>
                  </label>
                  <TextField
                    name="phone"
                    v-model="formData.phone"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <TextField
                    name="email"
                    v-model="formData.email"
                    type="email"
                    required
                    placeholder="contoh@email.com"
                  />
                </div>

                <!-- NIK -->
                <div class="lg:col-span-2">
                  <label class="block mb-2 text-sm font-semibold text-gray-700">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <TextField
                    name="nik"
                    v-model="formData.nik"
                    type="text"
                    :maxlength="16"
                    placeholder="16 digit NIK"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 mt-8">
                <button
                  type="button"
                  @click="handleCancel"
                  class="flex-1 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="profileStore.loading"
                  class="flex items-center justify-center flex-1 gap-2 py-3 font-semibold text-white transition-all shadow-md rounded-xl bg-primary hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="profileStore.loading"
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
                  {{
                    profileStore.loading ? "Menyimpan..." : "Simpan Perubahan"
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div class="md:hidden">
        <div class="flex flex-col items-center mb-8">
          <div class="relative">
            <img
              :src="formData.profile_picture"
              :alt="formData.name"
              class="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
            />
            <button
              @click="handlePhotoUpload"
              class="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full shadow-lg bg-primary hover:bg-orange-600"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <button
            @click="handlePhotoUpload"
            class="mt-3 text-sm font-medium transition-colors text-primary hover:text-orange-600"
          >
            Edit Foto Profile
          </button>
        </div>

        <form @submit.prevent="handleSave" class="mb-6 space-y-4">
          <!-- Nama -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700"
              >Nama</label
            >
            <TextField
              name="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Masukkan nama"
            />
          </div>

          <!-- Telepon -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700"
              >Telepon</label
            >
            <TextField
              name="phone"
              v-model="formData.phone"
              type="tel"
              required
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700"
              >Email</label
            >
            <TextField
              name="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="Masukkan email"
            />
          </div>

          <!-- NIK -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700"
              >NIK</label
            >
            <TextField
              name="nik"
              v-model="formData.nik"
              type="text"
              :maxlength="16"
              placeholder="Masukkan NIK"
            />
          </div>

          <!-- Alamat -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700"
              >Alamat</label
            >
            <TextField
              name="full_address"
              v-model="formData.full_address"
              textarea
              :rows="3"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          <!-- Save Button -->
          <button
            type="submit"
            :disabled="profileStore.loading"
            class="flex items-center justify-center w-full gap-2 py-4 font-semibold text-white transition-all rounded-full shadow-md bg-primary hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="profileStore.loading"
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
            {{ profileStore.loading ? "Menyimpan..." : "Simpan" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
