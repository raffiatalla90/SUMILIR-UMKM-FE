<template>
  <div class="min-h-screen bg-white">
    <!-- Banner -->
    <div class="bg-blue-500 h-48 sm:h-56 md:h-64 flex items-center justify-center">
      <h1 class="text-white text-2xl sm:text-3xl font-semibold">
        Selamat Datang di Sumilir
      </h1>
    </div>

    <!-- Search -->
    <div class="flex justify-center -mt-8 px-4 relative z-10">
      <div class="w-full sm:w-3/4 md:w-1/2 max-w-2xl">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pencarian"
            class="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-300 shadow-lg text-sm md:text-base bg-white"
          />
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            <i class="bi bi-search text-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 md:px-8 py-10 space-y-10">
      <!-- Pilih Kategori (6 kolom di semua ukuran) -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Pilih Kategori</h2>
        <div class="grid grid-cols-6 gap-4 sm:gap-6 justify-items-center">
          <!-- setiap kotak menuju /jasa-teknisi -->
          <router-link
            v-for="n in 6"
            :key="n"
            to="/jasa-teknisi"
            class="flex flex-col items-center gap-2"
          >
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-gray-300 flex items-center justify-center bg-white"
            >
              <img :src="teknisiIcon" alt="Teknisi" class="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <span class="text-xs sm:text-sm text-gray-600">Teknisi</span>
          </router-link>
        </div>
      </section>

      <!-- Promo Menarik -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Promo Menarik</h2>
        <div class="relative group">
          <!-- tombol kiri -->
          <button
            @click="scrollPromo(-1)"
            class="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 shadow items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
          >
            ‹
          </button>

          <!-- scroller -->
          <div
            ref="promoScroller"
            :class="[
              'grid grid-flow-col gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 pr-[35%] sm:pr-[25%]',
              '[grid-auto-columns:calc(80%-0.5rem)] sm:[grid-auto-columns:calc(50%-0.5rem)]'
            ]"
            style="scroll-behavior:smooth;"
          >
            <div
              v-for="(p, i) in promoList"
              :key="i"
              class="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition snap-start bg-white"
            >
              <img
                :src="p.image"
                alt="Promo"
                class="w-full h-44 sm:h-48 lg:h-52 object-cover"
              />
            </div>
          </div>

          <!-- tombol kanan -->
          <button
            @click="scrollPromo(1)"
            class="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 shadow items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
          >
            ›
          </button>
        </div>
      </section>

      <!-- Rekomendasi -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Rekomendasi</h2>

        <!-- 2 kolom, total 8 kartu -->
        <div class="grid grid-cols-2 gap-4 sm:gap-6">
          <router-link
            v-for="(jasa, index) in repeatedJasa"
            :key="index"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="block rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <!-- gambar -->
            <div class="h-24 sm:h-28 bg-gray-200 overflow-hidden">
              <img
                v-if="jasa.image"
                :src="jasa.image"
                alt="Jasa"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- isi kartu -->
            <div class="px-4 py-3 bg-white text-center">
              <h3 class="text-sm sm:text-base font-semibold text-gray-900">
                {{ jasa.title }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-600">
                Rp. {{ formatHarga(jasa.price) }}
              </p>

              <div
                class="mt-2 flex items-center justify-center gap-4 text-[11px] sm:text-xs text-gray-600"
              >
                <!-- rating -->
                <span class="flex items-center gap-1">
                  <img :src="starIcon" alt="rating" class="w-3 h-3" />
                  {{ jasa.rating ?? '4,9' }}
                </span>
                <!-- jarak -->
                <span class="flex items-center gap-1">
                  <img :src="lokasiIcon" alt="lokasi" class="w-3 h-3" />
                  {{ jasa.distance_km ?? '2,2' }} KM
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/libs/axios.js'

// ICONS
import starIcon from '@/assets/icons/Bintang.png'
import lokasiIcon from '@/assets/icons/TitikLokasi.png'
import teknisiIcon from '@/assets/icons/Teknisi.png'

const searchQuery = ref('')
const jasaList = ref([])
const promoList = ref([])
const promoScroller = ref(null)

// format harga: 100000 -> 100.000
const formatHarga = (value) => {
  if (!value) return '0'
  return Number(value).toLocaleString('id-ID')
}

const scrollPromo = (dir = 1) => {
  const el = promoScroller.value
  if (!el) return
  const gap = 16
  const card = el.querySelector(':scope > *')
  const step = (card?.clientWidth || el.clientWidth * 0.5) + gap
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

// ulangi data jasa sampai jadi 8 kartu
const repeatedJasa = computed(() => {
  const src = jasaList.value
  if (!src.length) return []
  const temp = []
  while (temp.length < 8) temp.push(...src)
  return temp.slice(0, 8).map((item, idx) => ({
    ...item,
    id: item.id ?? (idx % src.length) + 1
  }))
})

onMounted(async () => {
  try {
    const [jasaRes, promoRes] = await Promise.all([
      api.get('/jasa'),
      api.get('/promos')
    ])
    jasaList.value = jasaRes.data ?? []
    promoList.value = promoRes.data ?? []
  } catch (e) {
    console.error('Gagal memuat data:', e)
  }
})
</script>

<style>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
