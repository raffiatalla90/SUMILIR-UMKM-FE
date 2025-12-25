<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Form } from "vee-validate";
import TextField from "@/components/forms/TextField.vue";
import CategoryCard from "@/components/Card/CategoryCard.vue";
import ProductCardSkeleton from "@/components/Card/ProductCardSkeleton.vue";
import PromoCard from "@/components/Card/PromoCard.vue";
import PromoCardSkeleton from "@/components/Card/PromoCardSkeleton.vue";
import EventCard from "@/components/Card/EventCard.vue";
import EventCardSkeleton from "@/components/Card/EventCardSkeleton.vue";
import MerchantCard from "@/components/Card/MerchantCard.vue"; // ✅ NEW
import jasaIcon from "@/assets/icons/Jasa.svg";
import kulinerIcon from "@/assets/icons/Kuliner.svg";
import tokoIcon from "@/assets/icons/Toko.svg";
import komunitasIcon from "@/assets/icons/Komunitas.svg";
import Button from "@/components/common/Button.vue";
import api from "@/libs/axios.js";
import { useRoute, useRouter } from "vue-router";
import { getImageUrl } from "@/libs/getImageUrl"; // pastikan ada

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
const searchQuery = ref("");
const isLoadingMerchants = ref(true);
const isLoadingPromo = ref(true);
const isLoadingEvent = ref(true);

const categories = ref([
  {
    label: "Kuliner",
    icon: kulinerIcon,
    to: { name: "Product Kuliner" },
  },
  {
    label: "Toko",
    icon: tokoIcon,
    to: { name: "Product Toko" },
  },
  {
    label: "Jasa",
    icon: jasaIcon,
    to: { name: "JasaTeknisi" },
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
const eventBannerList = ref([]);
const isLoadMore = ref(false); // Untuk loading state tombol
const activeBanner = ref(0); // Untuk menyimpan index banner yang aktif

const onSearch = () => {
  const q = (searchQuery.value || "").trim();
  if (!q) return;
  router.push({ path: "/search", query: { q } });
};

const loadMoreMerchants = async () => {
  isLoadMore.value = true;
  try {
    // Ambil produk baru dengan limit lebih banyak
    const newProducts = await api.get("/api/public/merchants/random", {
      params: { limit: 8 },
    });
    productList.value = newProducts;
    productLimit.value += 8;
  } catch (e) {
    // Optional: tampilkan error
  } finally {
    isLoadMore.value = false;
  }
};

function nextBanner() {
  activeBanner.value = (activeBanner.value + 1) % eventBannerList.value.length;
}
function prevBanner() {
  activeBanner.value =
    (activeBanner.value - 1 + eventBannerList.value.length) % eventBannerList.value.length;
}
function slideTo(idx) {
  activeBanner.value = idx;
}

// Optional: auto slide
let bannerInterval = null;
onMounted(() => {
  bannerInterval = setInterval(() => {
    if (eventBannerList.value.length > 1) nextBanner();
  }, 5000);
});
onUnmounted(() => {
  if (bannerInterval) clearInterval(bannerInterval);
});

onMounted(async () => {
  // ✅ Fetch random merchants
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

  try {
    const res = await api.get("/api/public/events", {
      params: { status: "published" },
    });
    // Ambil hanya event yang punya banner
    eventBannerList.value = (res.data.data || []).filter((e) => e.banner_img_path);
  } catch (e) {
    eventBannerList.value = [];
  }
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
  <div class="app-container relative">
    <!-- Section: Hero + Event Banner Slider -->
    <section id="hero" class="relative pb-2">
      <div class="relative w-full">
        <div class="relative h-[240px] sm:h-[370px] overflow-hidden rounded-base">
          <!-- Slider Images -->
          <div v-for="(banner, idx) in eventBannerList" :key="banner.id"
            class="absolute inset-0 transition-all duration-700 ease-in-out"
            :class="activeBanner === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'">
            <img
              :src="getImageUrl(banner.banner_img_path)"
              class="w-full h-full object-cover"
              :alt="banner.event_name"
            />
            <!-- Optional: Overlay title -->
            <div class="absolute bottom-0 left-0 w-full bg-black/30 text-white p-4">
              <h2 class="text-lg sm:text-2xl font-bold">{{ banner.event_name }}</h2>
              <p class="text-sm">{{ banner.event_description }}</p>
            </div>
          </div>
          <!-- Slider Controls -->
          <button
            type="button"
            class="absolute top-1/2 left-2 -translate-y-1/2 z-20 flex items-center justify-center h-10 w-10 rounded-base bg-white/30 hover:bg-white/50 transition"
            @click="prevBanner"
            aria-label="Previous"
          >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7"/></svg>
          </button>
          <button
            type="button"
            class="absolute top-1/2 right-2 -translate-y-1/2 z-20 flex items-center justify-center h-10 w-10 rounded-base bg-white/30 hover:bg-white/50 transition"
            @click="nextBanner"
            aria-label="Next"
          >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/></svg>
          </button>
          <!-- Slider Indicators -->
          <div class="absolute z-30 flex -translate-x-1/2 bottom-4 left-1/2 space-x-3">
            <button
              v-for="(banner, idx) in eventBannerList"
              :key="banner.id"
              type="button"
              class="w-3 h-3 rounded-base"
              :class="activeBanner === idx ? 'bg-white' : 'bg-white/50'"
              @click="slideTo(idx)"
              :aria-current="activeBanner === idx ? 'true' : 'false'"
              :aria-label="`Slide ${idx + 1}`"
            ></button>
          </div>
        </div>
      </div>
      <div
        class="flex justify-center -mt-10 px-4 relative z-10 max-w-7xl mx-auto"
      >
        <div class="w-full sm:w-[906px]">
          <div
            class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <!-- Search -->
            <div class="p-4 sm:p-5 border-b border-gray-100">
              <Form @submit="onSearch">
                <div class="flex w-full items-center gap-2 sm:gap-3">
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
                    class="text-sm sm:text-base px-3 sm:px-4"
                  >
                    Search
                  </Button>
                </div>
              </Form>
            </div>

            <!-- Kategori -->
            <div class="p-4 sm:p-5">
              <div class="grid grid-cols-4 gap-3 sm:gap-4">
                <CategoryCard
                  v-for="cat in categories"
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

    <!-- Section Promo -->
    <section id="promo" class="relative pt-6">
      <div class="pl-4 lg:pl-[54px]">
        <div class="inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span
            class="text-base sm:text-2xl lg:text-section-title font-semibold"
            >Cek Promo Menarik</span
          >
        </div>
      </div>

      <div
        class="overflow-x-auto overflow-y-hidden no-scrollbar mx-4 lg:mx-[57px] pt-3 sm:pt-[17px] scroll-smooth snap-x snap-mandatory"
      >
        <div class="flex gap-4 sm:gap-8 min-w-max">
          <!-- Skeleton loading -->
          <template v-if="isLoadingPromo">
            <div v-for="i in 5" :key="i" class="snap-start shrink-0">
              <PromoCardSkeleton />
            </div>
          </template>
          <!-- Actual content -->
          <template v-else>
            <div
              v-for="(promo, i) in promoList"
              :key="promo.id || i"
              class="snap-start shrink-0"
            >
              <PromoCard :promo="promo" />
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ✅ Section Rekomendasi UMKM -->
    <section id="umkm-recommendation" class="relative pt-6">
      <div class="pl-4 lg:pl-[54px]">
        <div class="inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span
            class="text-base sm:text-2xl lg:text-section-title font-semibold"
            >Rekomendasi UMKM</span
          >
        </div>
      </div>

      <div class="px-4 lg:px-[52px] mt-6 lg:mt-10">
        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6"
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
  </div>
</template>
