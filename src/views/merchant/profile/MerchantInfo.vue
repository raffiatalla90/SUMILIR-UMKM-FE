<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";

const router = useRouter();
const route = useRoute();

// Emit untuk toggle sidebar dari parent layout
const emit = defineEmits(['toggle-sidebar']);

// Get merchantId from route params
const merchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : 1;
});

// Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "Profil UMKM",
  },
]);

// Mock merchant name
const merchantName = computed(() => "Sembako Sari Alam");

// Mock data
const merchantInfo = ref({
  name: 'Sembako Sari Alam',
  contact: '08xxxxxxxx',
  description: 'Toko Sembako Rojolele menyediakan beragam kebutuhan pokok harian — beras, gula, minyak, dan produk lokal lainnya.',
  address: 'Jl. Pasar Rojolele No. 123',
  logo: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=SEMBAKO',
  coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop'
});

const operationalHours = ref([
  { name: 'Monday', hours: '[06:00 - 18:00]' },
  { name: 'Tuesday', hours: '[06:00 - 18:00]' },
  { name: 'Wednesday', hours: '[06:00 - 18:00]' },
  { name: 'Thursday', hours: '[06:00 - 18:00]' },
  { name: 'Friday', hours: '[06:00 - 18:00]' },
  { name: 'Saturday', hours: '[06:00 - 18:00]' },
  { name: 'Sunday', hours: '[06:00 - 18:00]' }
]);

const goToEdit = () => {
  router.push({
    name: 'Merchant - Profile Edit',
    params: { merchantId: merchantId.value }
  });
};
</script>

<template>
  <div class="">
    <!-- Header - FIXED (sama seperti halaman produk) -->
    <div
      class="fixed sm:static top-0 left-0 right-0 flex justify-between items-center py-6 px-4 sm:px-6 bg-white z-10"
    >
      <div class="flex items-center gap-3">
        <!-- Hamburger Button (Mobile) -->
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-muted-background transition sm:hidden"
        >
          <i class="pi pi-bars text-muted-foreground"></i>
        </button>

        <div>
          <!-- Desktop: Show breadcrumb -->
          <div class="hidden sm:block">
            <Breadcrumb
              :items="breadcrumbItems"
              :merchantId="merchantId"
            />
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">
              {{ merchantName }}
            </p>
          </div>

          <!-- Mobile: Show simple title -->
          <div class="sm:hidden">
            <h1 class="text-base font-semibold text-merchant-primary">
              Profil UMKM
            </h1>
            <p class="text-xs text-muted-foreground">
              {{ merchantName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Desktop Edit Button -->
      <div class="hidden sm:flex gap-3">
        <button
          @click="goToEdit"
          class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
        >
          <i class="pi pi-pencil"></i>
          <span>Edit UMKM</span>
        </button>
      </div>
    </div>

    <!-- Spacer untuk kompensasi fixed header -->
    <div class="h-24 sm:h-0"></div>

    <!-- Content -->
    <div class="px-0 sm:px-6">
      <!-- Cover & Logo -->
      <div class="relative bg-white mb-2 sm:mb-4 sm:rounded-xl sm:shadow-sm overflow-hidden">
        <img
          :src="merchantInfo.coverImage"
          alt="Cover"
          class="w-full h-48 md:h-64 lg:h-80 object-cover"
        />
        <div class="absolute -bottom-10 md:-bottom-12 left-6 md:left-8">
          <img
            :src="merchantInfo.logo"
            alt="Logo"
            class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      <!-- Info Content -->
      <div class="pt-14 md:pt-16">
        <div class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-6 md:space-y-8 sm:rounded-xl sm:shadow-sm">
          <!-- Title tanpa background (sama seperti "Produk") -->
          <h2 class="text-xl md:text-2xl font-bold text-merchant-primary">Informasi Toko</h2>

          <!-- Grid Layout for Desktop -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-6">
            <!-- Nama Toko -->
            <div>
              <label class="block text-sm md:text-base font-medium text-merchant-primary mb-2">
                Nama Toko
              </label>
              <div class="bg-gray-100 rounded-xl p-3 md:p-4 text-gray-700 text-sm md:text-base">
                {{ merchantInfo.name }}
              </div>
            </div>

            <!-- Kontak -->
            <div>
              <label class="block text-sm md:text-base font-medium text-merchant-primary mb-2">
                Kontak
              </label>
              <div class="bg-gray-100 rounded-xl p-3 md:p-4 text-gray-700 text-sm md:text-base">
                {{ merchantInfo.contact }}
              </div>
            </div>

            <!-- Tentang - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-sm md:text-base font-medium text-merchant-primary mb-2">
                Tentang
              </label>
              <div class="bg-gray-100 rounded-xl p-3 md:p-4 text-gray-700 text-sm md:text-base leading-relaxed">
                {{ merchantInfo.description }}
              </div>
            </div>

            <!-- Lokasi - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-sm md:text-base font-medium text-merchant-primary mb-2">
                Lokasi
              </label>
              <div class="bg-gray-100 rounded-xl p-3 h-48 md:h-64 lg:h-80 relative overflow-hidden">
                <!-- Placeholder Map -->
                <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">
                  <div class="text-center">
                    <svg class="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <p class="text-sm md:text-base text-gray-700 font-medium">{{ merchantInfo.address }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jam Operasional -->
          <div class="pt-4">
            <h3 class="text-lg md:text-xl font-bold text-merchant-primary mb-4">Jam Operasional</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div
                v-for="day in operationalHours"
                :key="day.name"
                class="flex items-center justify-between bg-gray-50 rounded-xl p-3 md:p-4"
              >
                <span class="px-4 py-2 bg-merchant-primary text-white rounded-full text-xs md:text-sm font-medium min-w-[100px] md:min-w-[110px] text-center">
                  {{ day.name }}
                </span>
                <span class="text-gray-700 font-medium text-sm md:text-base ml-3">{{ day.hours }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Edit Button (bawah) -->
        <div class="hidden sm:flex justify-end mt-6">
          <button
            @click="goToEdit"
            class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
          >
            <i class="pi pi-pencil"></i>
            <span>Edit UMKM</span>
          </button>
        </div>

        <!-- Mobile Edit Button - Fixed at Bottom -->
        <div class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <button
            @click="goToEdit"
            class="w-full bg-merchant-primary text-white text-center font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
          >
            <i class="pi pi-pencil"></i>
            <span>Edit UMKM</span>
          </button>
        </div>

        <!-- Spacer for Mobile Fixed Button -->
        <div class="h-20 sm:h-0"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for desktop */
@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}
</style>