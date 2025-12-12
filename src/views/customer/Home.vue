<script setup>
import { ref, onMounted } from "vue";
import { Form } from "vee-validate";
import TextField from "@/components/forms/TextField.vue";
import CategoryCard from "@/components/Card/CategoryCard.vue";
import ProductCard from "@/components/Card/ProductCard.vue";
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
const isLoadMore = ref(false); // Untuk loading state tombol

const onSearch = () => {
  const q = (searchQuery.value || "").trim();
  // router.push({ name: "Search", query: q ? { q } : {} });
};

const loadMoreMerchants = async () => {
  isLoadMore.value = true;
  try {
    // Ambil produk baru dengan limit lebih banyak
    const newProducts = await api.get("/public/merchants/random", {
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

onMounted(async () => {
  // ✅ Fetch random merchants
  try {
    isLoadingMerchants.value = true;
    const merchantRes = await api.get("/public/merchants/random", {
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
    const promoRes = await api.get("/promos");
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
</script>

<template>
  <div class="app-container relative">
    <!-- Section: Hero + Menu Box -->
    <section id="hero" class="relative pb-2">
      <div class="h-[240px] sm:h-[370px] w-full bg-secondary"></div>

      <div class="flex justify-center -mt-10 px-4 relative z-10">
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
                    :modelValue="searchQuery"
                    @update:modelValue="(v) => (searchQuery = v)"
                    placeholder="Cari produk, jasa, atau tempat"
                    :hideLabel="true"
                    variant="muted"
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

    <!-- Section Event -->
    <section id="event" class="relative pt-6 sm:pt-24 pb-6 lg:pb-12">
      <div class="pl-4 lg:pl-[54px]">
        <div class="inline-flex items-center gap-2.5 w-auto h-[35px] py-[5px]">
          <span
            class="text-base sm:text-2xl lg:text-section-title font-semibold"
            >Event</span
          >
        </div>
      </div>

      <div
        class="overflow-x-auto overflow-y-hidden no-scrollbar mx-4 lg:mx-[57px] pt-3 lg:pt-[17px] scroll-smooth snap-x snap-mandatory"
      >
        <div class="flex gap-4 sm:gap-8 min-w-max">
          <!-- Skeleton loading -->
          <template v-if="isLoadingEvent">
            <div v-for="i in 5" :key="i" class="snap-start shrink-0">
              <EventCardSkeleton />
            </div>
          </template>
          <!-- Actual content -->
          <template v-else>
            <div
              v-for="(event, i) in eventList"
              :key="i"
              class="snap-start shrink-0"
            >
              <EventCard :event="event" />
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
