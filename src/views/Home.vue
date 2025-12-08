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
          <div
            v-for="jasa in jasaCategories"
            :key="jasa.id"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow h-[120px] sm:h-[160px] lg:h-[180px] bg-gray-200">
              <img
                v-if="jasa.image"
                :src="jasa.image"
                :alt="jasa.label"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-300">
                <span class="text-gray-500 text-xs sm:text-sm">No Image</span>
              </div>
            </div>
            <h3 class="mt-2 text-sm sm:text-base font-medium text-gray-800 text-center">
              {{ jasa.label }}
            </h3>
          </div>
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

// === AUTO IMPORT JASA IMAGES ===
const jasaImagesFiles = import.meta.glob("@/assets/jasa/*.png", {
  eager: true,
});
const jasaImages = Object.keys(jasaImagesFiles).reduce((acc, key) => {
  const name = key.split("/").pop().replace(".png", "");
  acc[name] = jasaImagesFiles[key].default;
  return acc;
}, {});

const categories = ref([
  { label: "Kuliner", icon: kulinerIcon, to: { name: "JasaTeknisi" } },
  { label: "Toko", icon: tokoIcon, to: { name: "JasaTeknisi" } },
  { label: "Jasa", icon: jasaIcon, to: { name: "JasaTeknisi" } },
  { label: "Komunitas", icon: komunitasIcon, to: { name: "community" } },
]);

// Data kategori jasa dengan image
const jasaCategories = ref([
  { id: 1, label: "Les Private", image: jasaImages["lesprivate"] || null },
  { id: 2, label: "Service AC", image: jasaImages["serviceac"] || null },
  { id: 3, label: "Laundry", image: jasaImages["jasalaundry"] || null },
  { id: 4, label: "Cleaning", image: jasaImages["cleaning"] || null },
  { id: 5, label: "Plumbing", image: jasaImages["plumbing"] || null },
  { id: 6, label: "Elektrik", image: jasaImages["elektrik"] || null },
]);
</script>

<style scoped>
/* ...existing styles... */
</style>