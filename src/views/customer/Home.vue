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

import jasaIcon from "@/assets/icons/Jasa.svg";
import kulinerIcon from "@/assets/icons/Kuliner.svg";
import tokoIcon from "@/assets/icons/Toko.svg";
import komunitasIcon from "@/assets/icons/Komunitas.svg";

import Button from "@/components/common/Button.vue";
import api from "@/libs/axios.js";

const searchQuery = ref("");
const isLoadingJasa = ref(true);
const isLoadingPromo = ref(true);
const isLoadingEvent = ref(true);

const jasaList = ref([]);
const promoList = ref([]);
const eventList = ref([]);
const promoScroller = ref(null);

const categories = ref([
  { label: "Kuliner", icon: kulinerIcon, to: { name: "JasaTeknisi" } },
  { label: "Toko", icon: tokoIcon, to: { name: "JasaTeknisi" } },
  { label: "Jasa", icon: jasaIcon, to: { name: "JasaTeknisi" } },
  { label: "Komunitas", icon: komunitasIcon, to: { name: "community" } },
]);

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
const resolveJasaImage = (img) => {
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
  // tambahkan logika search jika diperlukan
};

// LOAD DATA
onMounted(async () => {
  try {
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
  } catch (e) {
    console.error("Gagal memuat data:", e);
  } finally {
    isLoadingJasa.value = false;
    isLoadingPromo.value = false;
  }
});
</script>

<template>
  <div class="app-container relative">
    <!-- HERO -->
    <section id="hero" class="relative pb-2">
      <div class="h-[240px] sm:h-[370px] w-full bg-secondary"></div>

      <div class="flex justify-center -mt-10 px-4 relative z-10">
        <div class="w-full sm:w-[906px]">
          <div
            class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <!-- SEARCH -->
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

    <!-- PROMO -->
    <section id="promo" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
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
              :key="i"
              :promo="promo"
            />
          </template>
        </div>
      </div>
    </section>

    <!-- REKOMENDASI -->
    <section id="umkm-recommendation" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
          Rekomendasi Produk dan Jasa danasnansansq
        </span>
      </div>

      <div class="px-4 sm:px-[52px] mt-6 sm:mt-10">
        <div class="flex flex-wrap gap-3 sm:gap-6">
          <template v-if="isLoadingJasa">
            <ProductCardSkeleton v-for="i in 8" :key="i" />
          </template>

          <template v-else>
            <ProductCard
              v-for="product in jasaList"
              :key="product.id"
              :product="product"
            />
          </template>
        </div>

        <div class="mt-4 sm:mt-6 flex justify-center">
          <span
            class="text-sm sm:text-base text-gray-600 hover:text-primary cursor-pointer"
          >
            Tampilkan semua
          </span>
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
