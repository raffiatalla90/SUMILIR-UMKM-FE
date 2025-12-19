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
      <!-- Pilih Kategori -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Pilih Kategori</h2>
        <div class="grid grid-cols-5 sm:grid-cols-6 gap-3 sm:gap-4">
          <!-- Kategori dari Backend (4 kategori awal atau semua) -->
          <button
            v-for="cat in displayedCategories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="flex flex-col items-center gap-2 transition-all duration-200"
            :class="selectedCategoryId === cat.id ? 'scale-105' : 'hover:scale-105'"
          >
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200"
              :class="selectedCategoryId === cat.id 
                ? 'bg-[#FFA30E] border-[#FFA30E] text-white' 
                : 'bg-white border-gray-300 text-gray-600 hover:border-[#FFA30E]'"
            >
              <i :class="getCategoryIcon(cat)" class="text-xl"></i>
            </div>
            <span class="text-xs sm:text-sm text-gray-700 text-center line-clamp-2">{{ cat.name }}</span>
          </button>
          
          <!-- Tombol Semua / Tutup -->
          <button
            @click="toggleShowAllCategories"
            class="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <div
              class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200"
              :class="showAllCategories 
                ? 'bg-gray-500 border-gray-500 text-white' 
                : 'bg-[#FFA30E] border-[#FFA30E] text-white'"
            >
              <i :class="showAllCategories ? 'pi pi-times' : 'pi pi-th-large'" class="text-xl"></i>
            </div>
            <span class="text-xs sm:text-sm text-gray-700 text-center font-medium">{{ showAllCategories ? 'Tutup' : 'Semua' }}</span>
          </button>
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
                class="w-full h-auto object-contain rounded-2xl"
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
        <h2 class="text-lg font-semibold mb-4">
          {{ selectedCategoryId ? selectedCategoryName : 'Rekomendasi' }}
        </h2>

        <!-- Loading -->
        <div v-if="loadingJasa" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFA30E]"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredJasaList || filteredJasaList.length === 0" class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">Belum ada layanan di kategori ini</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-4 sm:gap-6">
          <router-link
            v-for="jasa in filteredJasaList"
            :key="jasa.id"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="block rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div class="h-24 sm:h-28 bg-gray-200 overflow-hidden">
              <img
                v-if="jasa.image"
                :src="jasa.image"
                alt="Jasa"
                class="w-full h-auto object-contain rounded-2xl"
              />
            </div>

            <div class="px-4 py-3 bg-white text-center">
              <h3 class="text-sm sm:text-base font-semibold text-gray-900">
                {{ jasa.title }}
              </h3>
              <p class="text-xs sm:text-sm text-[#FFA30E] font-semibold">
                <template v-if="jasa.fixed_price && Number(jasa.fixed_price) > 0">
                  Rp {{ formatHarga(jasa.fixed_price) }}
                </template>
                <template v-else-if="jasa.base_price && Number(jasa.base_price) > 0">
                  <span class="text-gray-500 font-normal">Mulai dari </span>Rp {{ formatHarga(jasa.base_price) }}
                </template>
                <template v-else>
                  <span class="text-gray-400 font-normal text-xs">Hubungi untuk harga</span>
                </template>
              </p>
              <!-- Hari Operasional -->
              <p class="text-xs text-gray-500 mt-1">
                <i class="pi pi-calendar text-gray-400 mr-1"></i>
                {{ formatOperatingDays(jasa.operating_days) }}
              </p>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/libs/axios.js'

const searchQuery = ref('')
const jasaList = ref([])
const categories = ref([])
const promoList = ref([])
const promoScroller = ref(null)
const selectedCategoryId = ref(null)
const loadingJasa = ref(false)
const showAllCategories = ref(false)

// Tampilkan 4 kategori awal atau semua
const displayedCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value;
  }
  return categories.value.slice(0, 4);
});

// Toggle show all categories
const toggleShowAllCategories = () => {
  showAllCategories.value = !showAllCategories.value;
  // Reset filter ke semua jika menutup
  if (!showAllCategories.value) {
    selectedCategoryId.value = null;
  }
};

// import semua banner promo
const promoImagesFiles = import.meta.glob('@/assets/banner/*.png', { eager: true })
const promoImages = Object.values(promoImagesFiles).map((img) => img.default)

// Category icon mapping - prioritas dari database, fallback ke mapping nama
const getCategoryIcon = (cat) => {
  // Jika cat adalah string (nama), buat object
  if (typeof cat === 'string') {
    cat = { name: cat };
  }
  
  // Jika ada icon dari database, gunakan itu
  if (cat?.icon) {
    const iconName = String(cat.icon);
    return 'pi ' + (iconName.startsWith('pi-') ? iconName : 'pi-' + iconName);
  }
  
  // Fallback: mapping berdasarkan nama
  const name = cat?.name;
  if (!name || typeof name !== 'string') return 'pi pi-briefcase';
  
  const lowerName = name.toLowerCase();
  if (lowerName.includes('teknisi') || lowerName.includes('servis')) return 'pi pi-wrench';
  if (lowerName.includes('kebersihan') || lowerName.includes('cleaning')) return 'pi pi-sparkles';
  if (lowerName.includes('kecantikan') || lowerName.includes('beauty')) return 'pi pi-heart';
  if (lowerName.includes('kesehatan') || lowerName.includes('health')) return 'pi pi-heart-fill';
  if (lowerName.includes('pendidikan') || lowerName.includes('les') || lowerName.includes('kursus')) return 'pi pi-book';
  if (lowerName.includes('otomotif') || lowerName.includes('mobil') || lowerName.includes('motor')) return 'pi pi-car';
  if (lowerName.includes('elektronik') || lowerName.includes('gadget') || lowerName.includes('teknologi')) return 'pi pi-desktop';
  if (lowerName.includes('rumah') || lowerName.includes('home') || lowerName.includes('perbaikan')) return 'pi pi-wrench';
  if (lowerName.includes('makanan') || lowerName.includes('kuliner') || lowerName.includes('catering')) return 'pi pi-shopping-bag';
  if (lowerName.includes('foto') || lowerName.includes('video')) return 'pi pi-camera';
  if (lowerName.includes('acara') || lowerName.includes('event')) return 'pi pi-calendar';
  if (lowerName.includes('pengiriman') || lowerName.includes('kurir') || lowerName.includes('transportasi') || lowerName.includes('logistik')) return 'pi pi-truck';
  if (lowerName.includes('konsultasi') || lowerName.includes('profesional')) return 'pi pi-briefcase';
  return 'pi pi-briefcase'; // default icon
};

// Selected category name
const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return 'Rekomendasi';
  const cat = categories.value.find(c => c.id === selectedCategoryId.value);
  return cat?.name || 'Kategori';
});

// Filtered jasa list
const filteredJasaList = computed(() => {
  let result = jasaList.value || [];
  
  // Filter by category
  if (selectedCategoryId.value) {
    result = result.filter(j => j.jasa_category_id === selectedCategoryId.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(j => 
      j.title?.toLowerCase().includes(query) ||
      j.description?.toLowerCase().includes(query)
    );
  }
  
  return result || [];
});

// Select category
const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
};

// normalisasi path gambar jasa
const resolveJasaImage = (jasa) => {
  // Cek relasi images (array) terlebih dahulu
  if (jasa.images && jasa.images.length > 0) {
    const coverImage = jasa.images.find((img) => img.is_cover) || jasa.images[0];
    const path = coverImage.path || coverImage.url || coverImage.image;
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/storage/')) {
        return path;
      }
      if (path.startsWith('jasa/')) {
        return `/storage/${path}`;
      }
      return `/storage/jasa/${path}`;
    }
  }
  
  // Fallback ke field image langsung
  const img = jasa.image;
  if (!img) return null;
  const s = String(img);

  if (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('/storage/')
  ) {
    return s
  }

  if (s.startsWith('jasa/')) {
    return `/storage/${s}`
  }

  return `/storage/jasa/${s}`
}

// format harga
const formatHarga = (value) => {
  if (!value) return '0'
  return Number(value).toLocaleString('id-ID')
}

// format hari operasional
const dayLabels = { 1: 'Sen', 2: 'Sel', 3: 'Rab', 4: 'Kam', 5: 'Jum', 6: 'Sab', 7: 'Min' }

const formatOperatingDays = (operatingDays) => {
  if (!operatingDays) return 'Buka Setiap Hari'
  const days = operatingDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
  if (days.length === 0 || days.length === 7) return 'Buka Setiap Hari'
  return days.map(d => dayLabels[d] || d).join(', ')
}

// scroll promo
const scrollPromo = (dir = 1) => {
  const el = promoScroller.value
  if (!el) return
  const gap = 16
  const card = el.querySelector(':scope > *')
  const step = (card?.clientWidth || el.clientWidth * 0.5) + gap
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

// fetch data
onMounted(async () => {
  loadingJasa.value = true;
  try {
    const [jasaRes, promoRes, categoryRes] = await Promise.all([
      api.get('/public/jasas'),
      api.get('/promos'),
      api.get('/public/jasa-categories')
    ])

    jasaList.value = (jasaRes.data ?? []).map((j) => ({
      ...j,
      image: resolveJasaImage(j)
    }))

    promoList.value = (promoRes.data ?? []).map((p, i) => ({
      ...p,
      image: promoImages[i % promoImages.length]
    }))
    
    // Filter only active categories
    categories.value = (categoryRes.data ?? []).filter(c => c.is_active !== false);
  } catch (e) {
    console.error('Gagal memuat data:', e)
  } finally {
    loadingJasa.value = false;
  }
})
</script>
