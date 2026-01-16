<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { Form } from "vee-validate";
import { Carousel, Slide } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";

import TextField from "@/components/forms/TextField.vue";
import CategoryCard from "@/components/Card/CategoryCard.vue";
import ProductCardSkeleton from "@/components/Card/ProductCardSkeleton.vue";
import PromoCard from "@/components/Card/PromoCard.vue";
import PromoCardSkeleton from "@/components/Card/PromoCardSkeleton.vue";
import EventCard from "@/components/Card/EventCard.vue";
import EventCardSkeleton from "@/components/Card/EventCardSkeleton.vue";
import MerchantCard from "@/components/Card/MerchantCard.vue";
import jasaIcon from "@/assets/icons/Jasa.svg";
import kulinerIcon from "@/assets/icons/Kuliner.svg";
import tokoIcon from "@/assets/icons/Toko.svg";
import komunitasIcon from "@/assets/icons/Komunitas.svg";

import Button from "@/components/common/Button.vue";
import api from "@/libs/axios.js";
import { useRoute, useRouter } from "vue-router";
import { usePublicEvents } from "@/composables/usePublicEvents";
import { getEventBannerUrl } from "@/libs/getImageUrl";

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const searchQuery = ref("");
const isLoadingMerchants = ref(true);
const isLoadingPromo = ref(true);
const isLoadingEvent = ref(true);
const isLoadingBanner = ref(true);
const isLoadMore = ref(false); // ✅ ADD: Missing variable

// banner carousel
const { events: eventBanners, fetchPublicEvents } = usePublicEvents();

//Carousel config (enable touch/mouse drag)
const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 5000, // 5 seconds
  transition: 800,
  pauseAutoplayOnHover: true,
  snapAlign: "center",
  mouseDrag: true,
  touchDrag: true,
};

const navigates = ref([
  {
    label: "Kuliner",
    icon: kulinerIcon,
    to: { path: "/explore", query: { mode: "kuliner" } },
  },
  {
    label: "Toko",
    icon: tokoIcon,
    to: { path: "/explore", query: { mode: "toko" } },
  },
  {
    label: "Jasa",
    icon: jasaIcon,
    to: { path: "/explore", query: { mode: "jasa" } },
  },
  {
    label: "Komunitas",
    icon: komunitasIcon,
    to: { name: "community" },
  },
]);

const merchantList = ref([]);
const promoList = ref([]);
const eventList = ref([]);
const promoScroller = ref(null);

// === AUTO IMPORT PROMO BANNER ===
const promoImagesFiles = import.meta.glob("@/assets/banner/*.png", {
  eager: true,
});
const promoImages = Object.values(promoImagesFiles).map((img) => img.default);

// Format harga
const formatHarga = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID");
};

// Normalisasi URL gambar jasa dari backend -> public/storage/jasa/*.png
const resolveJasaImage = (jasa) => {
  // Cek relasi images (array) terlebih dahulu
  if (jasa.images && jasa.images.length > 0) {
    const coverImage =
      jasa.images.find((img) => img.is_cover) || jasa.images[0];
    const path = coverImage.path || coverImage.url || coverImage.image;
    if (path) {
      if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("/storage/")
      ) {
        return path;
      }
      if (path.startsWith("jasa/")) {
        return `/storage/${path}`;
      }
      return `/storage/jasa/${path}`;
    }
  }

  // Fallback ke field image langsung
  const img = jasa.image;
  if (!img) return null;
  const s = String(img);

  // Jika sudah URL penuh atau sudah diawali /storage, pakai apa adanya
  if (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("/storage/")
  ) {
    return s;
  }

  // Jika sudah ada prefix "jasa/..." cukup tambahkan /storage di depan
  if (s.startsWith("jasa/")) {
    return `/storage/${s}`;
  }

  // Default: anggap nama file di folder public/storage/jasa
  return `/storage/jasa/${s}`;
};

// Scroll promo
const scrollPromo = (dir = 1) => {
  const el = promoScroller.value;
  if (!el) return;
  const gap = 16;
  const card = el.querySelector(":scope > *");
  const step = (card?.clientWidth || el.clientWidth * 0.5) + gap;
  el.scrollBy({ left: dir * step, behavior: "smooth" });
};

// Submit search
const onSearch = () => {
  const q = (searchQuery.value || "").trim();
  if (!q) return;
  router.push({ path: "/search", query: { q } });
};

const loadMoreMerchants = async () => {
  isLoadMore.value = true;
  try {
    const merchantRes = await api.get("/api/public/merchants/random", {
      params: { limit: 8 },
    });

    const incoming = merchantRes.data?.data || [];
    const seen = new Set((merchantList.value || []).map((m) => m.id));
    for (const m of incoming) {
      if (!seen.has(m.id)) {
        merchantList.value.push(m);
        seen.add(m.id);
      }
    }
  } catch (e) {
    // Optional: tampilkan error
  } finally {
    isLoadMore.value = false;
  }
};

// LOAD DATA
onMounted(async () => {
  try {
    isLoadingBanner.value = true;
    await fetchPublicEvents();
  } catch (e) {
    console.error("Gagal memuat banner event:", e);
  } finally {
    isLoadingBanner.value = false;
  }

  try {
    isLoadingMerchants.value = true;
    const merchantRes = await api.get("/api/public/merchants/random", {
      params: { limit: 8 },
    });
    merchantList.value = merchantRes.data.data || [];
  } catch (e) {
    console.error("Gagal memuat data merchant:", e);
  } finally {
    isLoadingMerchants.value = false;
  }

  // Fetch promo (ganti dengan API call sebenarnya)
  try {
    isLoadingPromo.value = true;
    const promoRes = await api.get("/api/promos");
    promoList.value = Array.isArray(promoRes.data) ? promoRes.data : [];
  } catch (e) {
    console.error("Gagal memuat data promo:", e);
  } finally {
    isLoadingPromo.value = false;
  }

  // Simulasi loading event (ganti dengan API call sebenarnya)
  setTimeout(() => {
    eventList.value = Array(5).fill({ id: 1 });
    isLoadingEvent.value = false;
  }, 1000);
});
watch(
  () => route.query.focusSearch,
  async (val) => {
    if (!val) return;

    await nextTick();

    searchInputRef.value?.scrollIntoView();
    searchInputRef.value?.focus();

    router.replace({ query: {} });
  },
  { immediate: true }
);
</script>

<template>
  <div class="relative app-container">
    <!-- HERO -->
    <section id="hero" class="relative">
      <div
        class="relative w-full overflow-hidden bg-gray-100 aspect-video sm:aspect-21/9 lg:aspect-24/9 xl:aspect-4/1"
      >
        <!-- Loading skeleton -->
        <div
          v-if="isLoadingBanner"
          class="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="text-4xl text-gray-400 pi pi-spin pi-spinner"></i>
          </div>
        </div>

        <Carousel
          v-else-if="eventBanners.length > 0"
          v-bind="carouselConfig"
          class="h-full"
        >
          <Slide
            v-for="event in eventBanners"
            :key="`${event.id}-${event.updated_at}`"
          >
            <div
              class="relative w-full h-full group cursor-grab active:cursor-grabbing"
            >
              <!-- ✅ ADDED: Key menggunakan updated_at untuk force re-render -->
              <img
                :key="`banner-${event.id}-${event.updated_at}`"
                :src="getEventBannerUrl(event)"
                :alt="event.event_name"
                class="object-cover w-full h-full pointer-events-none select-none"
                draggable="false"
                @error="(e) => (e.target.src = '/placeholder-banner.png')"
              />
            </div>
          </Slide>
        </Carousel>

        <!-- Fallback: No banners available -->
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center bg-secondary"
        >
          <div class="px-4 text-center text-white">
            <i class="mb-4 text-5xl opacity-50 pi pi-calendar"></i>
            <p class="text-lg font-semibold">Belum ada event aktif</p>
          </div>
        </div>
      </div>

      <!-- Search Bar Container -->
      <div
        class="relative z-10 flex justify-center px-4 mx-auto -mt-10 max-w-7xl"
      >
        <div class="w-full sm:w-[906px]">
          <div
            class="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl"
          >
            <!-- SEARCH -->
            <div class="p-4 border-b border-gray-100 sm:p-5">
              <Form @submit="onSearch">
                <div class="flex items-center w-full gap-2 sm:gap-3">
                  <TextField
                    name="search"
                    ref="searchInputRef"
                    :modelValue="searchQuery"
                    @update:modelValue="(v) => (searchQuery = v)"
                    placeholder="Cari produk, jasa, atau UMKM…"
                    :hideLabel="true"
                    variant="primary"
                    wrapperClass="flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    class="px-3 text-sm sm:text-base sm:px-4"
                  >
                    Search
                  </Button>
                </div>
              </Form>
            </div>

            <!-- KATEGORI -->
            <div class="p-4 sm:p-5">
              <div class="grid grid-cols-4 gap-3 sm:gap-4">
                <CategoryCard
                  v-for="cat in navigates"
                  :key="cat.label"
                  :label="cat.label"
                  :icon="cat.icon"
                  :to="cat.to"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROMO -->
    <section id="promo" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base font-semibold sm:text-section-title">
          Cek Promo Menarik
        </span>
      </div>

      <div
        ref="promoScroller"
        class="overflow-x-auto no-scrollbar mx-4 sm:mx-[57px] pt-3 sm:pt-[17px] scroll-smooth snap-x snap-mandatory"
      >
        <div class="flex gap-4 sm:gap-8 min-w-max">
          <template v-if="isLoadingPromo">
            <PromoCardSkeleton v-for="i in 5" :key="i" />
          </template>

          <template v-else>
            <PromoCard
              v-for="(promo, i) in promoList"
              :key="promo.id || i"
              :promo="promo"
              class="snap-start shrink-0"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- ✅ Section Rekomendasi UMKM -->
    <section id="umkm-recommendation" class="relative pt-6">
      <div class="pl-4 lg:pl-[54px]">
        <div class="inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span
            class="text-base font-semibold sm:text-2xl lg:text-section-title"
            >Rekomendasi UMKM</span
          >
        </div>
      </div>

      <div class="px-4 lg:px-[52px] mt-6 lg:mt-10">
        <div
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 sm:gap-6"
        >
          <!-- Skeleton loading -->
          <template v-if="isLoadingMerchants">
            <ProductCardSkeleton v-for="i in 8" :key="i" />
          </template>
          <!-- Actual merchants -->
          <template v-else>
            <MerchantCard
              v-for="merchant in merchantList"
              :key="merchant.id"
              :merchant="merchant"
            />
          </template>
        </div>

        <!-- ✅ Tombol Muat Lebih Banyak -->
        <div class="flex justify-center mt-6">
          <Button
            @click="loadMoreMerchants"
            :disabled="isLoadMore"
            variant="primary-outline"
          >
            <span v-if="!isLoadMore">Muat Lebih Banyak</span>
            <span v-else>Memuat...</span>
          </Button>
        </div>
      </div>
    </section>

    <!-- EVENT -->
    <section id="event" class="relative pt-6 pb-6 sm:pt-24 sm:pb-12">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base font-semibold sm:text-section-title">
          Event
        </span>
      </div>

      <div
        class="overflow-x-auto no-scrollbar mx-4 sm:mx-[57px] pt-3 sm:pt-[17px] scroll-smooth snap-x snap-mandatory"
      >
        <div class="flex gap-4 sm:gap-8 min-w-max">
          <template v-if="isLoadingEvent">
            <EventCardSkeleton v-for="i in 5" :key="i" />
          </template>

          <template v-else>
            <EventCard
              v-for="(event, i) in eventList"
              :key="i"
              :event="event"
            />
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.carousel) {
  height: 100%;
}

:deep(.carousel__viewport) {
  height: 100%;
}

:deep(.carousel__track) {
  height: 100%;
}

:deep(.carousel__slide) {
  height: 100%;
}

:deep(.carousel__prev),
:deep(.carousel__next) {
  display: none !important;
}

:deep(.carousel__viewport) {
  cursor: grab;
}

:deep(.carousel__viewport:active) {
  cursor: grabbing;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
