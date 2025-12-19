<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <i class="pi pi-spin pi-spinner text-3xl text-[#FFA30E]"></i>
    </div>

    <template v-else-if="merchant">
      <!-- Header Toko -->
      <div class="bg-white shadow-sm">
        <div class="px-4 py-5">
          <div class="flex items-center gap-4">
            <!-- Logo Toko -->
            <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
              <img 
                v-if="merchant.logo_path" 
                :src="getImageUrl(merchant.logo_path)" 
                alt="Logo Toko" 
                class="w-full h-full object-cover"
              />
              <i v-else class="pi pi-shop text-gray-400 text-2xl"></i>
            </div>
            
            <!-- Info Toko -->
            <div class="flex-1 min-w-0">
              <h1 class="text-lg font-bold text-gray-900 truncate">
                {{ merchant.name }}
              </h1>
              <p class="text-sm text-gray-500">
                {{ merchant.segmentation?.name || 'UMKM' }}
              </p>
              <p v-if="merchant.description" class="text-xs text-gray-500 mt-1 line-clamp-2">
                {{ merchant.description }}
              </p>
            </div>

            <!-- Tombol Chat -->
            <button
              v-if="jasaList.length > 0"
              @click="openChat"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFA30E] hover:bg-[#e5920d] transition shrink-0"
              title="Chat dengan Toko"
            >
              <i class="pi pi-comments text-white"></i>
            </button>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-900">{{ jasaList.length }}</p>
              <p class="text-xs text-gray-500">Layanan</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-900">{{ merchant.status === 'approved' ? 'Aktif' : 'Nonaktif' }}</p>
              <p class="text-xs text-gray-500">Status</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar Jasa -->
      <div class="px-4 py-4">
        <h2 class="text-base font-semibold text-gray-800 mb-3">
          <i class="pi pi-list text-gray-500 mr-1.5"></i>
          Daftar Layanan
        </h2>

        <!-- Empty State -->
        <div v-if="jasaList.length === 0" class="bg-white rounded-xl p-8 text-center shadow-sm">
          <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Belum ada layanan yang tersedia</p>
        </div>

        <!-- Grid Jasa -->
        <div v-else class="grid grid-cols-2 gap-3 sm:gap-4">
          <router-link
            v-for="jasa in jasaList"
            :key="jasa.id"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="block rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <!-- Gambar -->
            <div class="h-28 sm:h-32 bg-gray-100 overflow-hidden">
              <img
                v-if="resolveJasaImage(jasa)"
                :src="resolveJasaImage(jasa)"
                :alt="jasa.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="pi pi-image text-gray-300 text-3xl"></i>
              </div>
            </div>

            <!-- Info -->
            <div class="px-3 py-2.5">
              <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                {{ jasa.title }}
              </h3>
              <p class="text-sm font-bold text-[#FFA30E] mt-1">
                <template v-if="jasa.fixed_price && Number(jasa.fixed_price) > 0">
                  Rp {{ formatHarga(jasa.fixed_price) }}
                </template>
                <template v-else-if="jasa.base_price && Number(jasa.base_price) > 0">
                  Mulai Rp {{ formatHarga(jasa.base_price) }}
                </template>
                <template v-else>
                  <span class="text-gray-400 font-normal text-xs">Hubungi untuk harga</span>
                </template>
              </p>
              <p v-if="jasa.category" class="text-xs text-gray-500 mt-1 truncate">
                {{ jasa.category.name }}
              </p>
            </div>
          </router-link>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center justify-center h-64 px-4">
      <i class="pi pi-exclamation-circle text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500 text-center">Toko tidak ditemukan</p>
      <router-link to="/" class="mt-4 text-sm text-[#FFA30E] hover:underline">
        Kembali ke Beranda
      </router-link>
    </div>

    <!-- Chat Modal -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showChat && selectedJasaId"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        @click.self="showChat = false"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl h-[70vh] sm:h-[520px] flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  v-if="merchant?.logo_path" 
                  :src="getImageUrl(merchant.logo_path)" 
                  alt="Logo Toko" 
                  class="w-full h-full object-cover"
                />
                <i v-else class="pi pi-shop text-gray-400"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ merchant?.name || 'Penjual' }}
                </p>
                <p class="text-xs text-gray-500">
                  Konsultasi Layanan
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              @click="showChat = false"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <div class="flex-1 p-3">
            <ChatWindow :jasa-id="selectedJasaId" mode="buyer" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/libs/axios.js'
import { getImageUrl } from '@/libs/getImageUrl.js'
import ChatWindow from '@/components/common/ChatWindow.vue'

const route = useRoute()

const merchant = ref(null)
const jasaList = ref([])
const loading = ref(true)
const showChat = ref(false)
const selectedJasaId = ref(null)

// Format harga
const formatHarga = (value) => {
  if (!value) return '0'
  return Number(value).toLocaleString('id-ID')
}

// Resolve gambar jasa
const resolveJasaImage = (jasa) => {
  // Cek relasi images (array) terlebih dahulu
  if (jasa.images && jasa.images.length > 0) {
    const coverImage = jasa.images.find((img) => img.is_cover) || jasa.images[0]
    const path = coverImage.path || coverImage.url || coverImage.image
    if (path) {
      return getImageUrl(path)
    }
  }
  
  // Fallback ke field image langsung
  if (jasa.image) {
    return getImageUrl(jasa.image)
  }
  
  return null
}

// Buka chat dengan jasa pertama dari merchant
const openChat = () => {
  if (jasaList.value.length > 0) {
    selectedJasaId.value = jasaList.value[0].id
    showChat.value = true
  }
}

// Fetch data merchant dan jasa-jasanya
const fetchMerchantData = async () => {
  loading.value = true
  try {
    const merchantId = route.params.id
    
    // Fetch merchant detail
    const { data: merchantData } = await api.get(`/public/merchants/${merchantId}`)
    merchant.value = merchantData.data || merchantData
    
    // Fetch jasa dari merchant tersebut
    const { data: jasaData } = await api.get('/public/jasas', {
      params: {
        merchant_id: merchantId,
        per_page: 50
      }
    })
    jasaList.value = jasaData.data || jasaData
  } catch (error) {
    console.error('Error fetching merchant:', error)
    merchant.value = null
    jasaList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMerchantData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
