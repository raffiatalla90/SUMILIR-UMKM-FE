<template>
  <div class="app-container relative">
    <!-- HERO -->
    <!-- ...existing code... -->

    <!-- PROMO -->
    <!-- ...existing code... -->

    <!-- REKOMENDASI JASA -->
    <section id="jasa-recommendation" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
          Rekomendasi Jasa
        </span>
      </div>

      <div class="px-4 sm:px-[52px] mt-6 sm:mt-10">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          <router-link
            v-for="jasa in jasaList"
            :key="jasa.id"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="group cursor-pointer block"
          >
            <div class="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-[160px] lg:h-[180px] bg-gray-200">
              <img
                v-if="jasa.image"
                :src="jasa.image"
                :alt="jasa.name || jasa.title || 'Jasa'"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-300">
                <span class="text-gray-500 text-xs sm:text-sm">No Image</span>
              </div>
            </div>
            <h3 class="mt-2 text-sm sm:text-base font-medium text-gray-800 text-center">
              {{ jasa.name || jasa.title || jasa.label || 'Jasa' }}
            </h3>
            <p v-if="jasa.price" class="text-xs sm:text-sm text-center text-merchant-primary font-semibold">
              {{ formatPrice(jasa.price, jasa.packages) }}
            </p>
          </router-link>
        </div>

        <div class="mt-4 sm:mt-6 flex justify-center">
          <router-link
            :to="{ name: 'JasaTeknisi' }"
            class="text-sm sm:text-base text-gray-600 hover:text-primary cursor-pointer"
          >
            Tampilkan semua
          </router-link>
        </div>
      </div>
    </section>

    <!-- REKOMENDASI PRODUK DAN JASA -->
    <section id="umkm-recommendation" class="relative pt-6 sm:pt-24">
      <div class="pl-4 sm:pl-[54px]">
        <span class="text-base sm:text-section-title font-semibold">
          Rekomendasi Produk dan Jasa
        </span>
      </div>

      <div class="px-4 sm:px-[52px] mt-6 sm:mt-10">
        <div class="flex flex-wrap gap-3 sm:gap-6">
          <!-- ...existing code... -->
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
    <!-- ...existing code... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Form } from "vee-validate";
import api from "@/libs/axios.js";

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

const categories = ref([
  { label: "Kuliner", icon: kulinerIcon, to: { name: "JasaTeknisi" } },
  { label: "Toko", icon: tokoIcon, to: { name: "JasaTeknisi" } },
  { label: "Jasa", icon: jasaIcon, to: { name: "JasaTeknisi" } },
  { label: "Komunitas", icon: komunitasIcon, to: { name: "community" } },
]);

const jasaList = ref([]);

const resolveJasaImage = (img) => {
  if (!img) return null;
  const s = String(img);
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/storage/")) {
    return s;
  }
  if (s.startsWith("jasa/")) {
    return `/storage/${s}`;
  }
  return `/storage/jasa/${s}`;
};

const formatPrice = (basePrice, packages) => {
  if (!packages || packages.length === 0) {
    return `Rp ${Number(basePrice || 0).toLocaleString("id-ID")}`;
  }
  const allPrices = [basePrice, ...packages.map(p => p.price || 0)].filter(p => p > 0);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  if (minPrice === maxPrice) {
    return `Rp ${Number(minPrice).toLocaleString("id-ID")}`;
  }
  return `Rp ${Number(minPrice).toLocaleString("id-ID")} - ${Number(maxPrice).toLocaleString("id-ID")}`;
};

onMounted(async () => {
  try {
    const jasaRes = await api.get("/public/jasas");
    console.log("Jasa Response:", jasaRes.data);
    jasaList.value = (jasaRes.data ?? []).map((item) => ({
      ...item,
      image: resolveJasaImage(item.image),
    }));
    console.log("Jasa List after mapping:", jasaList.value);
  } catch (e) {
    console.error("Gagal memuat jasa:", e);
  }
});
</script>

<style scoped>
/* ...existing styles... */
</style>