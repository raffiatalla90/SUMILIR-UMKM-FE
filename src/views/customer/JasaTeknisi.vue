<!-- src/views/JasaTeknisi.vue -->
<template>
  <div class="min-h-screen bg-gray-100 pb-6">
    <!-- Header -->
    <header class="bg-gray-200 px-4 pt-3 pb-2 flex items-center justify-between">
      <button
        class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xl"
        @click="$router.back()"
      >
        ←
      </button>

      <h1 class="flex-1 text-center font-semibold text-sm">
        Semua Jasa Teknisi
      </h1>

      <button class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        🛒
      </button>
    </header>

    <!-- Filter bar -->
    <div class="bg-[#f3eaea] px-4 py-3">
      <div class="flex items-center gap-3 mb-2">
        <button class="w-8 h-8 rounded-full border flex items-center justify-center">
          ☰
        </button>
        <div class="flex-1 flex gap-2 text-xs">
          <button class="px-3 py-1 rounded-full border bg-white">Beras</button>
          <button class="px-3 py-1 rounded-full border bg-white">Minyak</button>
          <button class="px-3 py-1 rounded-full border bg-white">Gula</button>
        </div>
      </div>
    </div>

    <!-- List Jasa -->
    <main class="px-4 pt-3 space-y-3">
      <div
        v-for="(jasa, index) in repeatedJasa"
        :key="index"
        class="flex rounded-2xl overflow-hidden bg-gray-100 shadow-sm"
      >
        <!-- gambar -->
        <div class="w-32 h-24 bg-gray-300 flex-shrink-0 overflow-hidden">
          <img
            v-if="jasa.image"
            :src="jasa.image"
            alt="Jasa"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- detail -->
        <div class="flex-1 bg-gray-100 px-3 py-2">
          <h2 class="text-sm font-semibold text-gray-900">
            {{ jasa.title || 'Nama Jasa' }}
          </h2>
          <p class="text-[11px] text-gray-600">Nama UMKM</p>

          <p class="mt-1 text-sm font-semibold text-gray-900">
            Rp {{ jasa.price || 'xx.xxx' }}
          </p>

          <div
            class="mt-2 flex items-center gap-4 text-[11px] text-gray-700"
          >
            <span class="flex items-center gap-1">
              <i class="bi bi-star-fill text-gray-600"></i>
              {{ jasa.rating ?? '4,9' }}
            </span>
            <span class="flex items-center gap-1">
              <i class="bi bi-geo-alt-fill text-gray-600"></i>
              {{ jasa.distance_km ?? '2,2' }} KM
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/libs/axios.js'

const jasaList = ref([])

const repeatedJasa = computed(() => {
  const src = jasaList.value
  if (!src.length) {
    // fallback dummy 8 item kalau API error
    return Array.from({ length: 8 }, (_, i) => ({
      title: `Jasa Teknisi ${i + 1}`,
      price: '100000',
      rating: '4,9',
      distance_km: '2,2',
      image: '',
    }))
  }

  const result = []
  while (result.length < 8) {
    result.push(...src)
  }
  return result.slice(0, 8)
})

onMounted(async () => {
  try {
    const res = await api.get('/jasa')
    jasaList.value = res.data ?? []
  } catch (err) {
    console.error('Gagal memuat data jasa teknisi:', err)
  }
})
</script>
