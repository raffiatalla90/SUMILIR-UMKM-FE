<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <h1 class="text-xl font-bold">My Order</h1>
        <div class="flex items-center gap-2">
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="bg-white border-b sticky top-14 z-10">
      <div class="flex max-w-6xl mx-auto">
        <button 
          @click="activeTab = 'aktif'"
          :class="['flex-1 py-3 font-semibold text-center border-b-2 transition-colors', 
                   activeTab === 'aktif' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500']">
          Aktif
        </button>
        <button 
          @click="activeTab = 'selesai'"
          :class="['flex-1 py-3 font-semibold text-center border-b-2 transition-colors',
                   activeTab === 'selesai' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500']">
          Selesai
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-6xl mx-auto p-4 pb-20">
      
      <!-- TAB AKTIF -->
      <div v-if="activeTab === 'aktif'" class="space-y-4">
        <!-- Order Card 1: CemalCemil -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Merchant Header -->
          <div class="p-4 border-b">
            <div class="flex items-center gap-3">
              <img 
                src="https://via.placeholder.com/100x100/D2B48C/FFFFFF?text=CemalCemil" 
                alt="CemalCemil" 
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-bold text-lg">CemalCemil</h3>
                <p class="text-sm text-gray-600">Pentol Juara, Pempek Kapal selam</p>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div class="p-4 border-b">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Total Pesanan</span>
              <span class="font-bold text-lg">Rp xx.xxx</span>
            </div>
            <div class="flex justify-end gap-2">
              <span class="text-orange-500 text-sm font-medium">Dalam Proses</span>
              <button class="px-4 py-1 bg-orange-500 text-white rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
                Hubungi Penjual
              </button>
            </div>
          </div>
        </div>

        <!-- Order Card 2: Sumber Rejeki -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Merchant Header -->
          <div class="p-4 border-b">
            <div class="flex items-center gap-3">
              <img 
                src="https://via.placeholder.com/100x100/FFE4B5/8B4513?text=Sumber+Rejeki" 
                alt="Sumber Rejeki" 
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-bold text-lg">Sumber Rejeki</h3>
                <p class="text-sm text-gray-600">Beras WangiKu, MinyakKita</p>
              </div>
            </div>
          </div>

          <!-- Order Info -->
          <div class="p-4 border-b">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Total Pesanan</span>
              <span class="font-bold text-lg">Rp xx.xxx</span>
            </div>
            <div class="flex justify-end gap-2">
              <span class="text-orange-500 text-sm font-medium">Dalam Proses</span>
              <button class="px-4 py-1 bg-orange-500 text-white rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors">
                Hubungi Penjual
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB SELESAI -->
      <div v-else class="space-y-4">
        <!-- Merchant 1: CemalCemil -->
        <div class="bg-white rounded-lg shadow mb-4 overflow-hidden">
          <div class="p-4 border-b flex items-center gap-2">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="font-bold">CemalCemil</span>
          </div>

          <!-- Product 1 -->
          <div class="p-4 border-b flex items-start gap-3">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300 mt-1">
            <img src="https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Pentol" 
                 alt="Pentol Juara" 
                 class="w-20 h-20 rounded object-cover">
            <div class="flex-1">
              <h3 class="font-semibold">Pentol Juara</h3>
              <p class="text-blue-600 font-bold">Rp 11.000</p>
            </div>
          </div>

          <!-- Product 2 -->
          <div class="p-4 border-b flex items-start gap-3">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300 mt-1">
            <img src="https://via.placeholder.com/80x80/D2691E/FFFFFF?text=Pempek" 
                 alt="Pempek Kapal Selam" 
                 class="w-20 h-20 rounded object-cover">
            <div class="flex-1">
              <h3 class="font-semibold">Pempek Kapal Selam</h3>
              <p class="text-blue-600 font-bold">Rp 25.000</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 flex gap-2 justify-end">
            <button
              @click="router.push('/my-order/give-review')"
              class="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Beri Nilai
            </button>
            <button class="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Pesan Lagi
            </button>
          </div>
        </div>

        <!-- Merchant 2: Sumber Rejeki -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4 border-b flex items-center gap-2">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="font-bold">Sumber Rejeki</span>
          </div>

          <!-- Product 1 -->
          <div class="p-4 border-b flex items-start gap-3">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300 mt-1">
            <img src="https://via.placeholder.com/80x80/32CD32/FFFFFF?text=Beras" 
                 alt="Beras Wangiku" 
                 class="w-20 h-20 rounded object-cover">
            <div class="flex-1">
              <h3 class="font-semibold">Beras Wangiku</h3>
              <p class="text-blue-600 font-bold">Rp 70.000</p>
            </div>
          </div>

          <!-- Product 2 -->
          <div class="p-4 border-b flex items-start gap-3">
            <input type="checkbox" class="w-5 h-5 rounded border-gray-300 mt-1">
            <img src="https://via.placeholder.com/80x80/FFD700/FFFFFF?text=Minyak" 
                 alt="MinyakKita" 
                 class="w-20 h-20 rounded object-cover">
            <div class="flex-1">
              <h3 class="font-semibold">MinyakKita</h3>
              <p class="text-blue-600 font-bold">Rp 15.000</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 flex gap-2 justify-end">
            <button 
              @click="router.push('/my-order/review')"
              class="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Lihat Penilaian
            </button>
            <button class="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Pesan Lagi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div class="flex justify-around max-w-6xl mx-auto">
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span class="text-xs mt-1">Home</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-blue-500 font-semibold">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Orders</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Favorites</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Messages</span>
        </button>
        
        <button 
          @click="router.push('/profile')"
          class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('aktif');
</script>

<style scoped>
/* Responsive adjustments */
@media (min-width: 768px) {
  .max-w-6xl {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>