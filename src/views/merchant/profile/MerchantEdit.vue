<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl"
    >
       <!-- ✅ FIXED: Back button dengan dynamic route -->
      <button
        @click="router.push(`/merchant-center/${currentMerchantId}/profile`)"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Edit Profil UMKM</h1>
    </div>

    <!-- Desktop Header with Breadcrumb -->
    <div class="hidden sm:block bg-gray-50 py-6">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-y-2 items-center justify-between gap-x-4">
          <div>
            <!-- Breadcrumb Component -->
            <Breadcrumb
              :items="breadcrumbItems"
              :merchantId="merchantId"
            />
            <p class="text-muted-foreground text-xs lg:text-sm mt-1">
              Perbarui informasi toko Anda.
            </p>
          </div>

          <!-- Desktop Save Button -->
          <div class="flex items-center gap-3">
            <button
              @click="handleSave"
              class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile Only -->
    <div class="h-[88px] sm:h-0"></div>

    <!-- Container Responsive -->
    <div class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <!-- Mobile: Card with Cover & Logo -->
      <div class="sm:hidden bg-white mx-4 rounded-2xl shadow-sm overflow-hidden mb-4">
        <!-- Cover Image -->
        <div class="relative h-40">
          <img
            :src="form.coverImage"
            alt="Cover"
            class="w-full h-full object-cover"
          />
          <button 
            @click="handleUploadCover"
            class="absolute top-3 right-3 w-10 h-10 bg-merchant-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            <i class="pi pi-camera text-base"></i>
          </button>
        </div>
        
        <!-- Logo - Overlapping -->
        <div class="relative px-4 pb-4">
          <div class="absolute -top-12 left-4">
            <div class="relative">
              <img
                :src="form.logo"
                alt="Logo"
                class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button 
                @click="handleUploadLogo"
                class="absolute bottom-0 right-0 w-8 h-8 bg-merchant-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <i class="pi pi-camera text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Cover & Logo -->
      <div class="hidden sm:block relative bg-white mb-4 rounded-xl shadow-sm overflow-hidden">
        <img
          :src="form.coverImage"
          alt="Cover"
          class="w-full h-64 lg:h-80 object-cover"
        />
        <button 
          @click="handleUploadCover"
          class="absolute top-6 right-6 bg-merchant-primary text-white rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <div class="absolute -bottom-12 left-8">
          <div class="relative">
            <img
              :src="form.logo"
              alt="Logo"
              class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <button 
              @click="handleUploadLogo"
              class="absolute bottom-0 right-0 bg-merchant-primary text-white rounded-full p-2 shadow-lg hover:opacity-90 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="sm:pt-16">
        <!-- Mobile: Single Card -->
        <div class="sm:hidden bg-white mx-4 rounded-2xl shadow-sm p-4 space-y-5">
          <h2 class="text-lg font-bold text-merchant-primary">Informasi Toko</h2>

          <!-- Nama Toko -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Nama Toko
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
              placeholder="Masukkan nama toko"
            />
          </div>

          <!-- Kontak -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Kontak
            </label>
            <input
              v-model="form.contact"
              type="tel"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
              placeholder="Masukkan nomor kontak"
            />
          </div>

          <!-- Tentang -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Tentang
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow resize-none"
              placeholder="Ceritakan tentang toko Anda..."
            ></textarea>
          </div>

          <!-- Lokasi -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Lokasi
            </label>
            <div class="bg-gray-100 rounded-xl h-48 relative overflow-hidden mb-3">
              <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">
                <div class="text-center">
                  <svg class="w-12 h-12 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <p class="text-sm text-gray-700 font-medium">{{ form.address }}</p>
                </div>
              </div>
            </div>
            <button 
              @click="handleSetLocation"
              class="w-full flex items-center justify-center gap-2 bg-merchant-primary text-white font-semibold 
                     py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <i class="pi pi-map-marker"></i>
              <span>Atur Lokasi</span>
            </button>
          </div>

          <!-- Jam Operasional -->
          <div>
            <h3 class="text-base font-bold text-merchant-primary mb-3">Jam Operasional</h3>
            <div class="space-y-2.5">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <div class="flex items-center gap-3 flex-1">
                  <span class="px-3 py-1.5 bg-merchant-primary text-white rounded-full text-xs font-semibold min-w-[85px] text-center">
                    {{ day.name }}
                  </span>
                  
                  <div class="flex-1">
                    <span v-if="day.isOpen" class="text-gray-700 font-medium text-sm">
                      {{ day.hours }}
                    </span>
                    <span v-else class="text-red-500 font-medium text-sm">
                      Tutup
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    v-if="day.isOpen"
                    @click="handleEditHours(index)"
                    class="text-merchant-primary text-xs font-semibold hover:underline"
                  >
                    Edit
                  </button>
                  
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="day.isOpen"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-merchant-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Original Layout -->
        <div class="hidden sm:block bg-white mb-4 p-6 space-y-8 rounded-xl shadow-sm">
          <h2 class="text-2xl font-bold text-merchant-primary">Informasi Toko</h2>

          <!-- Grid Layout for Desktop -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-6">
            <!-- Nama Toko -->
            <div>
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Nama Toko
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
                placeholder="Masukkan nama toko"
              />
            </div>

            <!-- Kontak -->
            <div>
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Kontak
              </label>
              <input
                v-model="form.contact"
                type="tel"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
                placeholder="Masukkan nomor kontak"
              />
            </div>

            <!-- Tentang - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Tentang
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow resize-none"
                placeholder="Ceritakan tentang toko Anda..."
              ></textarea>
            </div>

            <!-- Lokasi - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Lokasi
              </label>
              <div class="bg-gray-100 rounded-xl p-3 h-64 lg:h-80 relative overflow-hidden mb-3">
                <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">
                  <div class="text-center">
                    <svg class="w-16 h-16 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <p class="text-base text-gray-700 font-medium">{{ form.address }}</p>
                  </div>
                </div>
              </div>
              <button 
                @click="handleSetLocation"
                class="w-full flex items-center justify-center space-x-2 bg-merchant-primary text-white font-semibold 
                       py-4 rounded-full hover:opacity-90 transition-opacity text-base"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Atur Lokasi</span>
              </button>
            </div>
          </div>

          <!-- Jam Operasional -->
          <div class="pt-4">
            <h3 class="text-xl font-bold text-merchant-primary mb-4">Jam Operasional</h3>
            <div class="space-y-4">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl p-4"
              >
                <span class="px-4 py-2 bg-merchant-primary text-white rounded-full text-sm font-medium 
                             min-w-[120px] text-center flex-shrink-0">
                  {{ day.name }}
                </span>
                
                <span class="text-gray-700 font-medium text-base flex-grow">
                  {{ day.hours }}
                </span>
                
                <button
                  v-if="day.isOpen"
                  @click="handleEditHours(index)"
                  class="text-merchant-primary text-base font-medium hover:underline flex-shrink-0"
                >
                  Edit
                </button>
                <span
                  v-else
                  class="text-red-500 text-base font-medium flex-shrink-0"
                >
                  Tutup
                </span>
                
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    v-model="day.isOpen"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 
                              rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                              peer-checked:bg-merchant-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Save Button -->
        <div class="hidden sm:flex justify-end mt-6">
          <button
            @click="handleSave"
            class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Simpan
          </button>
        </div>

        <!-- Mobile Action Button - Fixed at Bottom -->
        <div class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <button
            @click="handleSave"
            class="w-full bg-merchant-primary text-white text-center font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";

const router = useRouter();
const route = useRoute();

const merchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : 1;
});

const breadcrumbItems = computed(() => [
  {
    label: "Profil UMKM",
    path: `/merchant-center/${merchantId.value}/profile`,
  },
  {
    label: "Edit Profil UMKM",
  },
]);

const form = ref({
  name: 'Sembako Sari Alam',
  contact: '08xxxxxxxx',
  description: 'Toko Sembako Rojolele menyediakan beragam kebutuhan pokok harian — beras, gula, minyak, dan produk lokal lainnya.',
  address: 'Jl. Pasar Rojolele No. 123',
  logo: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=SEMBAKO',
  coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop',
  operationalHours: [
    { name: 'Monday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Tuesday', hours: '[06:00 - 18:00]', isOpen: false },
    { name: 'Wednesday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Thursday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Friday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Saturday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Sunday', hours: '[06:00 - 18:00]', isOpen: true }
  ]
});

const handleUploadCover = () => {
  console.log('Upload cover image');
};

const handleUploadLogo = () => {
  console.log('Upload logo image');
};

const handleSetLocation = () => {
  console.log('Set location');
};

const handleEditHours = (index) => {
  console.log('Edit hours for day:', index);
};

const handleSave = () => {
  console.log('Saving changes...', form.value);
  router.push(`/merchant-center/${merchantId.value}/profile`);
};
</script>

<style scoped>
@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #0891b2;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #047280;
  }
}

.fixed.z-40 {
  z-index: 40;
}
</style>