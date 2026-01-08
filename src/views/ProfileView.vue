<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

// Menggunakan computed property untuk user dengan fallback
const user = computed(() => profileStore.user || {
  name: 'Guest',
  email: '',
  phone: '',
  nik: '',
  address: '',
  profile_picture: 'https://via.placeholder.com/150' // Placeholder image
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/auth/login');
};

const menuItems = [
  {
    icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    label: 'Edit Profile',
    action: () => router.push('/profile/edit')
  },
  {
    icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    label: 'Ubah Kata Sandi',
    action: () => router.push('/profile/change-password')
  },
  {
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    label: 'Buka Toko',
    action: () => router.push('/my-store')
  }
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 md:bg-white pb-20 md:pb-0">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-8 py-4 md:py-6">
      <div class="max-w-7xl mx-auto">
        <button 
          @click="router.back()"
          class="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium text-lg md:text-xl">Profile</span>
        </button>
      </div>
    </div>

    <!-- Content Container -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
      
      <!-- DESKTOP LAYOUT -->
      <div class="hidden md:grid md:grid-cols-12 gap-8">
        
        <!-- Left: Profile Card -->
        <div class="md:col-span-4">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <div class="flex flex-col items-center">
              <img 
                :src="user.profile_picture" 
                :alt="user.name"
                class="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
              
              <h2 class="mt-6 text-2xl font-bold text-gray-900">
                {{ user.name }}
              </h2>

              <!-- Quick Info -->
              <div class="w-full mt-8 space-y-4">
                <div class="flex items-center gap-3 text-gray-600">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">{{ user.email }}</span>
                </div>
                <div class="flex items-center gap-3 text-gray-600">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-sm">{{ user.phone }}</span>
                </div>
              </div>
            </div>

            <button
              @click="handleLogout"
              class="w-full mt-8 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Keluar
            </button>
          </div>
        </div>

        <!-- Right: Menu List -->
        <div class="md:col-span-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Pengaturan Akun</h3>
            <div class="space-y-3">
              <button
                v-for="item in menuItems"
                :key="item.label"
                @click="item.action"
                class="w-full flex items-center gap-4 p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all text-left group hover:shadow-md"
              >
                <div class="p-3 bg-white rounded-lg group-hover:bg-primary/10 transition-colors">
                  <svg class="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                </div>
                <span class="flex-1 font-semibold text-gray-700 group-hover:text-gray-900">{{ item.label }}</span>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div class="md:hidden">
        <div class="flex flex-col items-center mb-8">
          <img 
            :src="user.profile_picture" 
            :alt="user.name"
            class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <h2 class="mt-4 text-xl font-semibold text-gray-900">{{ user.name }}</h2>
        </div>

        <div class="space-y-3 mb-6">
          <button
            v-for="item in menuItems"
            :key="item.label"
            @click="item.action"
            class="w-full flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left group shadow-sm"
          >
            <svg class="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            <span class="flex-1 font-medium text-gray-700 group-hover:text-gray-900">{{ item.label }}</span>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          @click="handleLogout"
          class="w-full py-4 rounded-full font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
        >
          Keluar
        </button>
      </div>

    </div>
  </div>
</template>