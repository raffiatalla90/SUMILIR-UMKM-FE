<script setup>
import { ref, onMounted, watch } from 'vue';
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/libs/axios';
import { getImageUrl } from '@/libs/getImageUrl';
import { getMerchantBannerUrl } from '@/libs/getImageUrl'; 

const merchants = ref([]);
const loading = ref(true);
const map = ref(null);
const markers = ref([]);
const currentSlide = ref(0);

// Carousel config
const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 4000,
  pauseAutoplayOnHover: true,
  snapAlign: 'center',
  mouseDrag: true,
  touchDrag: true,
};

// Initialize map
const initMap = () => {
  if (map.value) return;

  const mapElement = document.getElementById('home-map-preview');
  if (!mapElement) return;

  // Default center: Yogyakarta
  map.value = L.map('home-map-preview', {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: true,
    touchZoom: true,
  }).setView([-7.5420536, 110.8082958], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value);
};

// Create merchant marker - SAMA SEPERTI PetaUmkm.vue
const createMarker = (merchant, isActive = false) => {
  const lat = parseFloat(merchant.latitude);
  const lng = parseFloat(merchant.longitude);
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.warn('[MapPreview] Invalid coordinates for merchant:', merchant.name);
    return null;
  }

  const color = isActive ? '#ffa30e' : '#058895';

  const icon = L.divIcon({
    className: 'umkm-marker-icon',
    html: `
      <div class="umkm-marker ${isActive ? 'active' : ''}" style="--umkm-marker-color: ${color}">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 10.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9.5"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 10.5l2-7h14l2 7"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 21v-7h6v7"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });

  return L.marker([lat, lng], { icon });
};

// ✅ Update map markers dengan POPUP INFO - SAMA SEPERTI PetaUmkm.vue
const updateMapMarkers = () => {
  if (!map.value || merchants.value.length === 0) return;

  markers.value.forEach(m => m.remove());
  markers.value = [];

  merchants.value.forEach((merchant, index) => {
    const isActive = index === currentSlide.value;
    const marker = createMarker(merchant, isActive);
    
    if (marker) {
      const logoTag = merchant.logo_url
        ? `<div class="popup-gmaps__img"><img src="${merchant.logo_url}" alt="${merchant.name}" /></div>`
        : `<div class="popup-gmaps__img" style="background: #f3f4f6; display: flex; align-items: center; justify-content: center;">
            <svg class="w-12 h-12 p-2 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 6H6v-6h6v6z" />
            </svg>
          </div>`;

      const segmentation = merchant.segmentation?.name || 'UMKM';
      const distance = merchant.distance_km ? `${merchant.distance_km} km` : '';
      const distanceInfo = distance
        ? `<div class="popup-gmaps__distance">
            <i class="pi pi-map-marker" style="color: #f87171; margin-right: 2px;"></i>
            ${distance}
          </div>`
        : '';

      const popup = `
        <div class="popup-card">
          <div class="popup-card__body">
            ${logoTag}
            <div class="popup-gmaps__title">${merchant.name}</div>
            <div class="popup-gmaps__meta">
              <span class="popup-gmaps__badge">${segmentation}</span>
              ${distanceInfo}
            </div>
          </div>
        </div>`;

      marker.bindPopup(popup, {
        maxWidth: 240,
        className: 'modern-leaflet-popup'
      });
      marker.addTo(map.value);
      
      if (isActive) {
        marker.openPopup();
      }
      
      markers.value.push(marker);
    }
  });

  const activeMerchant = merchants.value[currentSlide.value];
  if (activeMerchant?.latitude && activeMerchant?.longitude) {
    const lat = parseFloat(activeMerchant.latitude);
    const lng = parseFloat(activeMerchant.longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      map.value.flyTo([lat, lng], 18, {
        animate: true,
        duration: 1,
      });
    }
  }
};

const loadMerchants = async () => {
  loading.value = true;
  
  try {
    // ❌ SEBELUM: const params = { limit: 6 };
    // ✅ SESUDAH: Hapus limit atau set ke nilai lebih besar
    const params = {}; // Tampilkan semua UMKM

    const response = await api.get('/api/public/home/map-carousel-merchants', { params });
    merchants.value = (response.data.data || []).filter(m => m.latitude && m.longitude);
    
    console.log('[MapPreview] Loaded merchants:', merchants.value.length);
    
    // Initialize map and markers after merchants loaded
    if (merchants.value.length > 0) {
      setTimeout(() => {
        initMap();
        updateMapMarkers();
      }, 100);
    }
  } catch (error) {
    console.error('[MapPreview] Failed to load merchants:', error);
    merchants.value = [];
  } finally {
    loading.value = false;
  }
};

watch(currentSlide, (newIndex) => {
  console.log('[MapPreview] Slide changed to:', newIndex);
  updateMapMarkers();
});

const slideTo = (index) => {
  currentSlide.value = index;
};

onMounted(async () => {
  await loadMerchants();
});
</script>

<template>
  <section id="map-preview" class="relative py-8 bg-gray-50 sm:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <!-- Section Header -->
      <div class="text-center mb-6 sm:mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Jelajahi UMKM di Peta
        </h2>
        <p class="text-sm sm:text-base text-gray-600">
          Temukan lokasi merchant lokal melalui peta interaktif
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>

      <!-- Map + Carousel Layout -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Map Preview - FIXED HEIGHT -->
        <div class="relative lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div 
            id="home-map-preview" 
            class="w-full h-[240px] sm:h-[360px] lg:h-[400px]"
          ></div>

          <!-- View Full Map Button - ALWAYS VISIBLE -->
          <div class="absolute top-4 right-4 z-[1000]">
            <router-link 
              to="/map"
              class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-merchant-primary font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg border-2 border-merchant-primary transition-all duration-300 hover:scale-105"
            >
              <i class="pi pi-map text-base"></i>
              <span class="hidden sm:inline">Lihat Peta Lengkap</span>
              <span class="sm:hidden">Peta</span>
            </router-link>
          </div>
        </div>

        <!-- Merchant Carousel  -->
        <div class="relative lg:col-span-1">
          <div class="lg:sticky lg:top-4">
            <!-- DESKTOP -->
            <div class="hidden lg:flex lg:flex-col lg:space-y-4">
              <!-- Main Carousel Desktop  -->
              <div class="flex-shrink-0">
                <Carousel
                  v-if="merchants.length > 0"
                  id="merchant-carousel-desktop"
                  v-bind="carouselConfig"
                  v-model="currentSlide"
                  class="[&_.carousel__prev]:hidden [&_.carousel__next]:hidden"
                >
                  <Slide v-for="merchant in merchants" :key="merchant.id">
                    <router-link
                      :to="{ name: 'Merchant Detail', params: { slug: merchant.slug || merchant.id } }"
                      class="block w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <!-- Banner/Cover -->
                      <div class="relative aspect-video bg-linear-to-br from-primary/10 to-merchant-primary/10 overflow-hidden">
                        <img
                          v-if="merchant.cover_path"
                          :src="getMerchantBannerUrl(merchant)"
                          :alt="merchant.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <i class="pi pi-shop text-5xl text-merchant-primary/30"></i>
                        </div>

                        <!-- Segmentation Badge -->
                        <div
                          v-if="merchant.segmentation"
                          class="absolute top-3 left-3 bg-merchant-primary/90 backdrop-blur-sm text-white font-semibold text-xs px-3 py-1.5 rounded-full"
                        >
                          {{ merchant.segmentation.name }}
                        </div>
                      </div>

                      <!-- Merchant Info -->
                      <div class="p-3">
                        <div class="flex items-start gap-2 mb-2">
                          <div class="shrink-0">
                            <div
                              v-if="merchant.logo_url"
                              class="w-12 h-12 -mt-6 bg-white border-2 border-white rounded-lg shadow-md overflow-hidden"
                            >
                              <img
                                :src="merchant.logo_url"
                                :alt="merchant.name"
                                class="w-full h-full object-cover"
                              />
                            </div>
                            <div
                              v-else
                              class="w-12 h-12 -mt-6 bg-muted-background border-2 border-white rounded-lg shadow-md flex items-center justify-center"
                            >
                              <i class="pi pi-shop text-xl text-merchant-primary"></i>
                            </div>
                          </div>

                          <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-bold text-gray-900 mb-1 line-clamp-1" :title="merchant.name">
                              {{ merchant.name }}
                            </h3>
                            <div class="flex items-center gap-1 text-[10px] text-gray-500">
                              <i class="pi pi-shopping-bag text-xs text-merchant-primary"></i>
                              <span>{{ merchant.products_count || 0 }} Produk</span>
                            </div>
                          </div>
                        </div>

                        <!-- Location Info -->
                        <div v-if="merchant.primary_address" class="space-y-1">
                          <div v-if="merchant.distance_km" class="flex items-center gap-1 text-[10px] text-gray-600">
                            <i class="pi pi-map-marker text-xs text-danger-foreground"></i>
                            <span class="font-medium">{{ merchant.distance_km }} km</span>
                          </div>

                          <div class="flex items-start gap-1 text-[10px] text-gray-500">
                            <i class="pi pi-home text-xs flex-shrink-0 mt-0.5"></i>
                            <span class="line-clamp-1">
                              {{ merchant.primary_address.detail }},
                              {{ merchant.primary_address.village?.name }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </router-link>
                  </Slide>
                </Carousel>
              </div>

              <!-- Thumbnails Desktop  -->
              <div v-if="merchants.length > 1" class="h-25 shrink-0">
                <Carousel
                  id="merchant-thumbnails-desktop"
                  :items-to-show="3"
                  :wrap-around="true"
                  :snap-align="'center'"
                  v-model="currentSlide"
                  class="h-full [&_.carousel__prev]:top-1/2 [&_.carousel__prev]:-translate-y-1/2 [&_.carousel__prev]:w-6 [&_.carousel__prev]:h-6 [&_.carousel__prev]:bg-merchant-primary/70 [&_.carousel__prev]:rounded-full
                         [&_.carousel__next]:top-1/2 [&_.carousel__next]:-translate-y-1/2 [&_.carousel__next]:w-6 [&_.carousel__next]:h-6 [&_.carousel__next]:bg-merchant-primary/70 [&_.carousel__next]:rounded-full"
                >
                  <Slide v-for="(merchant, index) in merchants" :key="`thumb-desktop-${merchant.id}`">
                    <template #default="{ isActive }">
                      <div class="px-1 h-full w-full transition-all" @click="slideTo(index)">
                        <div 
                          class="relative h-full bg-white border-2 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group"
                          :class="isActive 
                            ? 'border-merchant-primary shadow-md' 
                            : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-merchant-primary/50'"
                        >
                          <div class="relative aspect-video bg-linear-to-br from-primary/5 to-merchant-primary/5 overflow-hidden">
                            <img
                              v-if="merchant.cover_path"
                              :src="getMerchantBannerUrl(merchant)"
                              :alt="merchant.name"
                              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div v-else class="w-full h-full flex items-center justify-center">
                              <i class="pi pi-shop text-lg text-merchant-primary/30"></i>
                            </div>

                            <div v-if="isActive" class="absolute inset-0 border-2 border-merchant-primary rounded-t-lg"></div>
                          </div>

                          <div class="p-1 bg-white">
                            <p 
                              class="text-[9px] font-semibold text-center truncate"
                              :class="isActive ? 'text-merchant-primary' : 'text-gray-700'"
                            >
                              {{ merchant.name }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Slide>

                  <template #addons>
                    <Navigation />
                  </template>
                </Carousel>
              </div>
            </div>

            <!-- MOBILE/TABLET -->
            <div class="flex gap-3 lg:hidden h-[240px] sm:h-[360px]">
              <!-- Main Carousel Mobile/Tablet -->
              <div class="flex-[2] sm:flex-[3] min-w-0">
                <Carousel
                  v-if="merchants.length > 0"
                  id="merchant-carousel-mobile"
                  v-bind="carouselConfig"
                  v-model="currentSlide"
                  class="h-full [&_.carousel__prev]:hidden [&_.carousel__next]:hidden"
                >
                  <Slide v-for="merchant in merchants" :key="merchant.id">
                    <router-link
                      :to="{ name: 'Merchant Detail', params: { slug: merchant.slug || merchant.id } }"
                      class="block w-full h-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <!-- Banner/Cover -->
                      <div class="relative h-32 sm:h-68 bg-gradient-to-br from-primary/10 to-merchant-primary/10 overflow-hidden">
                        <img
                          v-if="merchant.cover_path"
                          :src="getMerchantBannerUrl(merchant)"
                          :alt="merchant.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <i class="pi pi-shop text-4xl sm:text-5xl text-merchant-primary/30"></i>
                        </div>

                        <!-- Segmentation Badge -->
                        <div
                          v-if="merchant.segmentation"
                          class="absolute top-2 left-2 bg-merchant-primary/90 backdrop-blur-sm text-white font-semibold text-[10px] px-2 py-1 rounded-full"
                        >
                          {{ merchant.segmentation.name }}
                        </div>
                      </div>

                      <!-- Merchant Info -->
                      <div class="p-3">
                        <div class="flex items-start gap-2 mb-2">
                          <div class="shrink-0">
                            <div
                              v-if="merchant.logo_url"
                              class="w-10 h-10 sm:w-12 sm:h-12 -mt-5 sm:-mt-6 bg-white border-2 border-white rounded-lg shadow-md overflow-hidden"
                            >
                              <img
                                :src="merchant.logo_url"
                                :alt="merchant.name"
                                class="w-full h-full object-cover"
                              />
                            </div>
                            <div
                              v-else
                              class="w-10 h-10 sm:w-12 sm:h-12 -mt-5 sm:-mt-6 bg-muted-background border-2 border-white rounded-lg shadow-md flex items-center justify-center"
                            >
                              <i class="pi pi-shop text-lg sm:text-xl text-merchant-primary"></i>
                            </div>
                          </div>

                          <div class="flex-1 min-w-0">
                            <h3 class="text-xs sm:text-sm font-bold text-gray-900 mb-1 line-clamp-2" :title="merchant.name">
                              {{ merchant.name }}
                            </h3>
                            <div class="flex items-center gap-1 text-[10px] text-gray-500">
                              <i class="pi pi-shopping-bag text-xs text-merchant-primary"></i>
                              <span>{{ merchant.products_count || 0 }} Produk</span>
                            </div>
                          </div>
                        </div>

                        <!-- Location Info -->
                        <div v-if="merchant.primary_address" class="space-y-1">
                          <div v-if="merchant.distance_km" class="flex items-center gap-1 text-[10px] text-gray-600">
                            <i class="pi pi-map-marker text-xs text-danger-foreground"></i>
                            <span class="font-medium">{{ merchant.distance_km }} km</span>
                          </div>

                          <div class="flex items-start gap-1 text-[10px] text-gray-500">
                            <i class="pi pi-home text-xs flex-shrink-0 mt-0.5"></i>
                            <span class="line-clamp-2">
                              {{ merchant.primary_address.detail }},
                              {{ merchant.primary_address.village?.name }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </router-link>
                  </Slide>
                </Carousel>
              </div>

              <!-- Thumbnails Mobile/Tablet -->
              <div v-if="merchants.length > 1" class="flex-1 sm:flex-[1] max-w-[100px] sm:max-w-[120px] overflow-x-hidden">
                <div class="flex flex-col gap-2 h-full overflow-y-auto [&::-webkit-scrollbar]:w-0 [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div
                    v-for="(merchant, index) in merchants"
                    :key="`thumb-mobile-${merchant.id}`"
                    @click="slideTo(index)"
                    class="relative flex-shrink-0 bg-white border-2 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group"
                    :class=" [
                      currentSlide === index 
                        ? 'border-merchant-primary shadow-md' 
                        : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-merchant-primary/50',
                      index < 3 ? 'h-[calc((100%-16px)/3)]' : 'h-0 overflow-hidden'
                    ]"
                  >
                    <div class="relative w-full h-full bg-gradient-to-br from-primary/5 to-merchant-primary/5 overflow-hidden">
                      <img
                        v-if="merchant.cover_path"
                        :src="getMerchantBannerUrl(merchant)"
                        :alt="merchant.name"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <i class="pi pi-shop text-base sm:text-lg text-merchant-primary/30"></i>
                      </div>

                      <div v-if="currentSlide === index" class="absolute inset-0 border-2 border-merchant-primary"></div>
                      
                      <!-- Mini Name Overlay -->
                      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p class="text-[8px] sm:text-[9px] font-semibold text-white text-center truncate">
                          {{ merchant.name }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="merchants.length === 0" class="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <i class="pi pi-map-marker text-4xl text-gray-300 mb-3"></i>
              <p class="font-semibold text-gray-700 mb-1">Tidak ada UMKM</p>
              <p class="text-xs text-gray-500">Belum ada merchant terdaftar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Leaflet popup styles */
:deep(.leaflet-container) {
  font-family: inherit;
  z-index: 1;
}

/* ✅ POPUP STYLES - SAMA SEPERTI PetaUmkm.vue */
:deep(.modern-leaflet-popup .leaflet-popup-content-wrapper) {
  padding: 0 !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

:deep(.modern-leaflet-popup .leaflet-popup-tip) {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

:deep(.modern-leaflet-popup .leaflet-popup-close-button) {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  font-size: 20px !important;
  color: rgba(0, 0, 0, 0.6) !important;
  opacity: 1 !important;
  z-index: 10 !important;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}

:deep(.modern-leaflet-popup .leaflet-popup-close-button:hover) {
  color: var(--color-primary) !important;
  transform: scale(1.04);
}

:deep(.leaflet-popup-content) {
  margin: 0 !important;
}

/* Popup Card Styles - SAMA SEPERTI PetaUmkm.vue */
.popup-card {
  width: 220px;
  max-width: 240px;
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.popup-card__body {
  padding: 14px 14px 12px 14px;
  text-align: center;
}

.popup-gmaps__img {
  width: 72px;
  height: 72px;
  margin: 2px auto 10px auto;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.popup-gmaps__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.popup-gmaps__title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(0, 0, 0, 1);
  line-height: 1.25;
  word-break: break-word;
  margin-bottom: 6px;
}

.popup-gmaps__meta {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.popup-gmaps__badge {
  color: var(--color-merchant-primary);
  font-size: 12px;
  font-weight: 700;
}

.popup-gmaps__distance {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

/* UMKM Marker */
:deep(.umkm-marker-icon) {
  background: transparent !important;
  border: 0 !important;
}

.umkm-marker {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--umkm-marker-color, #10b981);
  border: 3px solid rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.umkm-marker::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 12px solid var(--umkm-marker-color, #10b981);
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.25));
}

.umkm-marker svg {
  width: 18px;
  height: 18px;
  display: block;
}

.umkm-marker.active {
  animation: pulse-marker 2s infinite;
}

@keyframes pulse-marker {
  0%, 100% {
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.15), 0 0 0 0 var(--umkm-marker-color);
  }
  50% {
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.15), 0 0 0 10px transparent;
  }
}
</style>
