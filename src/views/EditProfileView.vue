<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useToast } from 'vue-toastification';

const router = useRouter();
const profileStore = useProfileStore();
const toast = useToast();

// Form data
const formData = ref({
  name: '',
  email: '',
  phone: '',
  nik: '',
  full_address: '',
  profile_picture: '',
});
const profilePictureFile = ref(null);
const fileInput = ref(null);

// Watch for changes in store user data
watch(() => profileStore.user, (newUser) => {
  if (newUser) {
    formData.value = { ...newUser };
  }
}, { immediate: true });

const handleSave = async () => {
  try {
    const payload = new FormData();
    payload.append('name', formData.value.name);
    payload.append('email', formData.value.email);
    payload.append('phone', formData.value.phone);
    payload.append('nik', formData.value.nik);
    payload.append('full_address', formData.value.full_address);
    if (profilePictureFile.value) {
      payload.append('profile_picture', profilePictureFile.value);
    }
    
    await profileStore.updateProfile(payload);
    toast.success('Profil berhasil diperbarui');
    router.push('/profile');
  } catch (error) {
    console.error('Error saving profile:', error);
    const message = error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.';
    toast.error(message);
  }
};

const handleCancel = () => {
  router.push('/profile');
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
  <div class="min-h-screen bg-gray-50 md:bg-white pb-20 md:pb-0">
    <!-- Hidden file input -->
    <input type="file" ref="fileInput" @change="onFileChange" class="hidden" accept="image/*">

    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6">
      <div class="max-w-7xl mx-auto">
        <button 
          @click="handleCancel"
          class="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium text-lg md:text-xl">Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Content Container -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
      
      <!-- DESKTOP LAYOUT -->
      <div class="hidden md:grid md:grid-cols-12 gap-8">
        
        <!-- Left: Profile Picture -->
        <div class="md:col-span-4">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <div class="flex flex-col items-center">
              <div class="relative">
                <img 
                  :src="formData.profile_picture" 
                  :alt="formData.name"
                  class="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button 
                  @click="handlePhotoUpload"
                  class="absolute bottom-2 right-2 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-orange-600 transition-all hover:scale-110"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <button 
                @click="handlePhotoUpload"
                class="mt-4 text-primary font-medium text-sm hover:text-orange-600 transition-colors"
              >
                Edit Foto Profile
              </button>

              <p class="mt-2 text-xs text-gray-500 text-center">
                Format: JPG, PNG<br/>Max size: 2MB
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Form -->
        <div class="md:col-span-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Edit Informasi Profil</h3>
            
            <form @submit.prevent="handleSave">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Nama -->
                <div class="lg:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <!-- Telepon -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="contoh@email.com"
                  />
                </div>

                <!-- NIK -->
                <div class="lg:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    NIK (Nomor Induk Kependudukan)
                  </label>
                  <input
                    v-model="formData.nik"
                    type="text"
                    maxlength="16"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="16 digit NIK"
                  />
                </div>

                <!-- Alamat -->
                <div class="lg:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    v-model="formData.full_address"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Masukkan alamat lengkap termasuk RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten"
                  ></textarea>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 mt-8">
                <button
                  type="button"
                  @click="handleCancel"
                  class="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="profileStore.loading"
                  class="flex-1 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg v-if="profileStore.loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ profileStore.loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
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
              class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button 
              @click="handlePhotoUpload"
              class="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-orange-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <button 
            @click="handlePhotoUpload"
            class="mt-3 text-primary font-medium text-sm hover:text-orange-600 transition-colors"
          >
            Edit Foto Profile
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-4 mb-6">
          <!-- Nama -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masukkan nama"
            />
          </div>

          <!-- Telepon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
            <input
              v-model="formData.phone"
              type="tel"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masukkan email"
            />
          </div>

          <!-- NIK -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NIK</label>
            <input
              v-model="formData.nik"
              type="text"
              maxlength="16"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masukkan NIK"
            />
          </div>

          <!-- Alamat -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              v-model="formData.full_address"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              placeholder="Masukkan alamat lengkap"
            ></textarea>
          </div>

          <!-- Save Button -->
          <button
            type="submit"
            :disabled="profileStore.loading"
            class="w-full py-4 rounded-full font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="profileStore.loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ profileStore.loading ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>