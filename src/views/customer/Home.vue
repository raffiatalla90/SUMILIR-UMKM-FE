<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
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

const route = useRoute();
const router = useRouter();

const searchInputRef = ref(null);
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

// LOAD DATA
onMounted(async () => {
  // ✅ Fetch random merchants
  try {
<<<<<<< HEAD
    isLoadingMerchants.value = true;
    const merchantRes = await api.get("/api/public/merchants/random", {
      params: { limit: 8 },
    });
    merchantList.value = merchantRes.data.data || [];
=======
    const [jasaRes, promoRes] = await Promise.all([
      api.get("/public/jasas"),
      api.get("/promos"),
    ]);

    // Normalisasi image jasa ke /storage/jasa/*.png
    jasaList.value = (jasaRes.data ?? []).map((item) => ({
      ...item,
      image: resolveJasaImage(item.image),
    }));

    promoList.value = (promoRes.data ?? []).map((p, i) => ({
      ...p,
      image: promoImages[i % promoImages.length],
    }));

    setTimeout(() => {
      eventList.value = Array(5).fill({ id: 1 });
      isLoadingEvent.value = false;
    }, 1000);
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
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
    <section class="sr-only">
      <h1>Sumilir – Marketplace UMKM Lokal Banyuanyar</h1>
      <p>
        Sumilir adalah platform marketplace UMKM lokal Banyuanyar yang
        menghubungkan penjual dan pembeli untuk produk kuliner, toko, dan jasa.
      </p>
    </section>

    <!-- Section: Hero + Event Banner Slider -->
    <section id="hero" class="relative pb-2">
      <div class="h-[240px] sm:h-[370px] w-full bg-secondary"></div>

      <div
        class="flex justify-center -mt-10 px-4 relative z-10 max-w-7xl mx-auto"
      >
        <div class="w-full sm:w-[906px]">
          <div
            class="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl"
          >
            <!-- Search -->
            <div class="p-4 border-b border-gray-100 sm:p-5">
              <Form @submit="onSearch">
                <div class="flex items-center w-full gap-2 sm:gap-3">
                  <TextField
                    name="search"
                    ref="searchInputRef"
                    ref="searchInputRef"
                    :modelValue="searchQuery"
                    @update:modelValue="(v) => (searchQuery = v)"
                    placeholder="Cari produk, jasa, atau UMKM…"
                    placeholder="Cari produk, jasa, atau UMKM…"
                    :hideLabel="true"
                    variant="primary"
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
            class="text-base font-semibold sm:text-2xl lg:text-section-title"
            >Cek Promo Menarik</span
          >
        </div>
      </div>

      <div
        class="overflow-x-auto overflow-y-hidden no-scrollbar mx-4 lg:mx-[57px] pt-3 sm:pt-[17px] scroll-smooth snap-x snap-mandatory"
      >
        <div class="flex gap-4 sm:gap-8 min-w-max">
          <template v-if="isLoadingPromo">
            <PromoCardSkeleton v-for="i in 5" :key="i" />
          </template>

          <template v-else>
            <PromoCard
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

<<<<<<< HEAD
    <!-- ✅ Section Rekomendasi UMKM -->
    <section id="umkm-recommendation" class="relative pt-6">
      <div class="pl-4 lg:pl-[54px]">
        <div class="inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span
            class="text-base sm:text-2xl lg:text-section-title font-semibold"
            >Rekomendasi UMKM</span
          >
        </div>
=======
    <!-- REKOMENDASI -->
    <section id="umkm-recommendation" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
          Rekomendasi Produk dan Jasa danasnansansq
        </span>
>>>>>>> 28b9a8f (feat: Implement token-based authentication and jasa form)
      </div>

      <div class="px-4 lg:px-[52px] mt-6 lg:mt-10">
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

    <!-- EVENT -->
    <section id="event" class="relative pt-6 sm:pt-24 pb-6 sm:pb-12">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
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
