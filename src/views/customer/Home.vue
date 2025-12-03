<template>
  <div class="min-h-screen bg-white">
    <!-- Banner -->
    <div
      class="bg-blue-500 h-48 sm:h-56 md:h-64 flex items-center justify-center"
    >
      <h1 class="text-white text-2xl sm:text-3xl font-semibold">
        Selamat Datang di Sumilir
      </h1>
    </div>

    <!-- Search + Kategori (menyatu) -->
    <div class="flex justify-center -mt-10 px-4 relative z-10">
      <div class="w-full sm:w-3/4 md:w-1/2 max-w-2xl">
        <div
          class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <!-- Search -->
          <div class="p-4 sm:p-5 border-b border-gray-100">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari produk, jasa, atau tempat"
                class="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-300 bg-white text-sm md:text-base border border-gray-200"
              />
              <button
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                <i class="bi bi-search text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Kategori -->
          <div class="p-4 sm:p-5">
            <div class="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mx-auto">
              <!-- Kuliner -->
              <router-link
                :to="{ name: 'JasaTeknisi' }"
                class="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-primary"
                >
                  <img
                    :src="kulinerIcon"
                    alt="Kuliner"
                    class="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </div>
                <span
                  class="text-xs sm:text-sm text-gray-700 group-hover:text-blue-700"
                  >Kuliner</span
                >
              </router-link>

              <!-- Toko -->
              <router-link
                :to="{ name: 'JasaTeknisi' }"
                class="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-primary"
                >
                  <img
                    :src="tokoIcon"
                    alt="Toko"
                    class="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </div>
                <span
                  class="text-xs sm:text-sm text-gray-700 group-hover:text-blue-700"
                  >Toko</span
                >
              </router-link>

              <!-- Jasa -->
              <router-link
                :to="{ name: 'JasaTeknisi' }"
                class="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-primary"
                >
                  <img
                    :src="teknisiIcon"
                    alt="Jasa"
                    class="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </div>
                <span
                  class="text-xs sm:text-sm text-gray-700 group-hover:text-blue-700"
                  >Jasa</span
                >
              </router-link>

              <!-- Tambahan placeholder kategori agar grid rapi -->
              <div v-for="n in 3" :key="n" class="hidden sm:block"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 md:px-8 py-10 space-y-10">
      <!-- Promo Menarik -->
      <section>
        <h2 class="text-lg font-semibold mb-4">Promo Menarik</h2>

        <!-- Ganti dengan komponen -->
        <PromoCarousel :items="promoList">
          <template #item="{ item }">
            <img :src="item.image" alt="Promo" />
          </template>
        </PromoCarousel>
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
                  {{ jasa.rating ?? "4,9" }}
                </span>
                <!-- jarak -->
                <span class="flex items-center gap-1">
                  <img :src="lokasiIcon" alt="lokasi" class="w-3 h-3" />
                  {{ jasa.distance_km ?? "2,2" }} KM
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
import { ref, onMounted, computed } from "vue";
import PromoCarousel from "@/components/PromoCarousel.vue";
import api from "@/libs/axios.js";

// ICONS
import starIcon from "@/assets/icons/Bintang.png";
import lokasiIcon from "@/assets/icons/TitikLokasi.png";
import teknisiIcon from "@/assets/icons/Jasa.svg";
import kulinerIcon from "@/assets/icons/Kuliner.svg"; // ganti ke ikon yang tersedia
import tokoIcon from "@/assets/icons/Toko.svg"; // ganti ke ikon yang tersedia

import DummyPromo from "@/assets/images/dummy-promo.jpg";

const searchQuery = ref("");
const jasaList = ref([]);
const promoList = ref([
  {
    id: 1,
    title: "Diskon 50% Kuliner",
    image: DummyPromo,
    href: "/jasa-teknisi",
  },
  {
    id: 2,
    title: "Gratis Ongkir Toko",
    image: DummyPromo,
    href: "/jasa-teknisi",
  },
  {
    id: 3,
    title: "Service AC Spesial",
    image: DummyPromo,
    href: "/jasa-teknisi",
  },
  {
    id: 4,
    title: "Paket Hemat Bulanan",
    image: DummyPromo,
    href: "/jasa-teknisi",
  },
  {
    id: 5,
    title: "Voucher Rp25.000",
    image: DummyPromo,
    href: "/jasa-teknisi",
  },
]);

const promoScroller = ref(null);

// format harga: 100000 -> 100.000
const formatHarga = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID");
};

const scrollPromo = (dir = 1) => {
  const el = promoScroller.value;
  if (!el) return;
  const gap = 16;
  const card = el.querySelector(":scope > *");
  const step = (card?.clientWidth || el.clientWidth * 0.5) + gap;
  el.scrollBy({ left: dir * step, behavior: "smooth" });
};

// ulangi data jasa sampai jadi 8 kartu
const repeatedJasa = computed(() => {
  const src = jasaList.value;
  if (!src.length) return [];
  const temp = [];
  while (temp.length < 8) temp.push(...src);
  return temp.slice(0, 8).map((item, idx) => ({
    ...item,
    id: item.id ?? (idx % src.length) + 1,
  }));
});

onMounted(async () => {
  try {
    const [jasaRes, promoRes] = await Promise.all([
      api.get("/jasa"),
      // api.get("/promos"),
    ]);
    jasaList.value = Array.isArray(jasaRes.data) ? jasaRes.data : [];
    const promos = Array.isArray(promoRes.data) ? promoRes.data : [];
    if (promos.length) promoList.value = promos;
  } catch (e) {
    console.error("Gagal memuat data:", e);
    // biarkan promoList dummy tetap dipakai
  }
});
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
