<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import MobileHeader from "@/components/customer/MobileHeader.vue";
import AppButton from "@/components/common/Button.vue";

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

const isInitialProfileLoading = computed(
  () => profileStore.loading && !profileStore.user
);

const imgLoaded = ref(false);
const imgError = ref(false);

const hasProfilePicture = computed(() => {
  const val = formData.value?.profile_picture;
  return typeof val === "string" && val.trim().length > 0;
});

watch(
  () => formData.value?.profile_picture,
  () => {
    imgLoaded.value = false;
    imgError.value = false;
  }
);

const onImgLoad = () => {
  imgLoaded.value = true;
};

const onImgError = () => {
  imgError.value = true;
  imgLoaded.value = true;
};

// Watch for changes in store user data
watch(
  () => profileStore.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        ...newUser,
        profile_picture:
          typeof newUser?.profile_picture === "string"
            ? newUser.profile_picture
            : "",
      };
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

const goBack = () => {
  router.back();
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
  <div class="">
    <!-- Hidden file input -->
    <input
      type="file"
      ref="fileInput"
      @change="onFileChange"
      class="hidden"
      accept="image/*"
    />

    <!-- Header -->
    <MobileHeader title="Edit Profil" @back="goBack" />

    <!-- Content Container -->
    <div class="px-4 py-4 mx-auto max-w-7xl">
      <!-- DESKTOP LAYOUT -->
      <div class="hidden gap-8 sm:grid sm:grid-cols-12">
        <!-- Left: Profile Picture -->
        <div class="sm:col-span-4">
          <div
            class="sticky p-8 bg-white border border-gray-100 shadow-sm rounded-2xl top-12"
          >
            <div class="flex flex-col items-center">
              <div class="relative w-40 h-40">
                <div
                  v-if="
                    isInitialProfileLoading ||
                    (hasProfilePicture && !imgLoaded && !imgError)
                  "
                  class="w-40 h-40 bg-gray-200 border-4 border-white rounded-full shadow-lg animate-pulse"
                />
                <img
                  v-if="
                    !isInitialProfileLoading && hasProfilePicture && !imgError
                  "
                  :src="formData.profile_picture"
                  :alt="formData.name"
                  loading="lazy"
                  class="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
                  :class="imgLoaded ? '' : 'opacity-0'"
                  @load="onImgLoad"
                  @error="onImgError"
                />
                <span v-else>
                  <svg
                    class="w-40 h-40 p-8 text-gray-300 bg-gray-100 border-4 border-white rounded-full shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </span>
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
        <div class="sm:col-span-8">
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
                <AppButton
                  type="button"
                  variant="muted-outline"
                  class="w-full"
                  @click="handleCancel"
                >
                  Batal
                </AppButton>
                <AppButton
                  type="submit"
                  variant="primary"
                  :loading="profileStore.loading"
                  :disabled="profileStore.loading"
                  class="w-full"
                >
                  {{
                    profileStore.loading ? "Menyimpan..." : "Simpan Perubahan"
                  }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div class="sm:hidden">
        <div class="flex flex-col items-center mb-8">
          <div class="relative w-32 h-32">
            <div
              v-if="
                isInitialProfileLoading ||
                (hasProfilePicture && !imgLoaded && !imgError)
              "
              class="w-32 h-32 bg-gray-200 border-4 border-white rounded-full shadow-lg animate-pulse"
            />
            <img
              v-if="!isInitialProfileLoading && hasProfilePicture && !imgError"
              :src="formData.profile_picture"
              :alt="formData.name"
              loading="lazy"
              class="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
              :class="imgLoaded ? '' : 'opacity-0'"
              @load="onImgLoad"
              @error="onImgError"
            />
            <span v-else>
              <svg
                class="w-32 h-32 p-6 text-gray-300 bg-gray-100 border-4 border-white rounded-full shadow-lg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </span>
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

          <!-- Save Button -->
          <AppButton
            type="submit"
            variant="primary"
            size="md"
            block
            :loading="profileStore.loading"
            :disabled="profileStore.loading"
            customClass="w-full"
          >
            {{ profileStore.loading ? "Menyimpan..." : "Simpan" }}
          </AppButton>
        </form>
      </div>
    </div>
  </div>
</template>
