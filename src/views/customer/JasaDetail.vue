<template>
  <div class="min-h-screen bg-gray-50 pb-32 sm:pb-28">
    <!-- Gambar header -->
    <div class="w-full h-48 sm:h-60 bg-gray-200 overflow-hidden">
      <img :src="jasa?.image" class="w-full h-full object-cover" />
    </div>

    <!-- Info utama -->
    <div class="bg-white px-4 py-4 shadow-sm">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-lg font-semibold text-gray-900">
            {{ jasa?.title || "Jasa Servis & Perawatan AC" }}
          </h1>
          <p class="text-sm text-gray-500">ArcticFix</p>
        </div>
        <button
          class="px-3 py-1.5 rounded-lg bg-[#FFA30E] text-white text-xs font-semibold"
        >
          Kunjungi
        </button>
      </div>

      <div class="mt-2 text-gray-900 font-semibold">
        Rp {{ formatIDR(jasa?.price ?? 100000) }}
      </div>

      <!-- badge & info -->
      <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span class="px-2 py-1 rounded-md bg-green-100 text-green-700">
          Available
        </span>

        <span class="flex items-center gap-1">
          <img :src="starIcon" alt="rating" class="w-3.5 h-3.5" />
          <span>4,9</span>
        </span>

        <span class="flex items-center gap-1">
          <img :src="lokasiIcon" alt="lokasi" class="w-3.5 h-3.5" />
          <span>2,2 KM</span>
        </span>

        <span class="flex items-center gap-1">
          <img :src="jamIcon" alt="durasi" class="w-3.5 h-3.5" />
          <span>2 Jam</span>
        </span>
      </div>
    </div>

    <!-- Paket -->
    <section class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-2">Paket</h2>
      <div class="flex gap-3 overflow-x-auto no-scrollbar">
        <div
          v-for="p in pkgList"
          :key="p.id"
          class="min-w-[160px] max-w-[180px] rounded-xl border border-gray-200 overflow-hidden bg-white"
        >
          <img :src="p.image" class="w-full h-24 object-cover" />
          <div class="px-3 py-2">
            <div class="text-[12px] text-gray-500">
              Rp {{ formatIDR(p.price) }}
            </div>
            <div class="text-sm font-medium">{{ p.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Deskripsi Jasa -->
    <section class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-2">Deskripsi Jasa</h2>
      <p class="text-[15px] leading-relaxed text-gray-700">
        {{ jasaDesc }}
      </p>
    </section>

    <!-- Pilih Jadwal -->
    <section class="bg-white mt-3 px-4 py-4">
      <h3 class="text-sm font-semibold mb-3">Pilih Jadwal</h3>
      <div class="flex items-center gap-2">
        <button
          v-for="(d, i) in quickDays"
          :key="i"
          @click="selectQuick(d.date)"
          class="w-28 h-14 px-3 py-2 rounded-xl border flex flex-col items-center justify-center text-center"
          :class="
            isSameDay(selectedDate, d.date)
              ? 'bg-[#FFA30E] text-white border-[#FFA30E]'
              : 'bg-white text-gray-700 border-gray-200'
          "
        >
          <div class="text-[11px] leading-3">{{ d.label }}</div>
          <div class="text-sm font-semibold">{{ d.day }}</div>
        </button>

        <button
          class="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-gray-700 w-20 flex flex-col items-center"
          @click="calendarOpen = true"
        >
          <span class="text-sm font-semibold">{{ monthShort }}</span>
          <span class="text-xl">📅</span>
        </button>
      </div>
    </section>

    <!-- Pilih Waktu -->
    <section class="bg-white mt-3 px-4 py-4">
      <h3 class="text-sm font-semibold mb-2">Pilih Waktu</h3>
      <div class="rounded-2xl border border-gray-300/70 p-4">
        <div class="mb-3">
          <div class="text-sm text-gray-700 mb-2">Pagi</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.morning"
              :key="'m' + i"
              @click="activeTime = t"
              class="px-4 py-2 rounded-lg border text-sm"
              :class="
                t === activeTime
                  ? 'bg-[#FFA30E] text-white border-[#FFA30E]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ t }}
            </button>
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-700 mb-2">Siang</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.afternoon"
              :key="'a' + i"
              @click="activeTime = t"
              class="px-4 py-2 rounded-lg border text-sm"
              :class="
                t === activeTime
                  ? 'bg-[#FFA30E] text-white border-[#FFA30E]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom bar - muncul di atas dock mobile -->
    <div
      class="fixed left-0 right-0 bottom-16 sm:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3"
    >
      <div class="max-w-screen-sm mx-auto flex items-center gap-4">
        <!-- Tombol chat: kotak oranye dengan icon Chat.png -->
        <button
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FFA30E] hover:bg-[#e5920d] transition"
        >
          <img :src="chatIcon" alt="Chat" class="w-5 h-5" />
        </button>

        <!-- Tombol Booking -->
        <router-link
          :to="{
            name: 'Pembayaran Jasa',
            query: {
              id: route.params.id,
              title: jasa?.title || 'Jasa Servis & Perawatan AC',
              image: jasa?.image || '',
              price: jasa?.price || 100000,
              tgl: selectedDate.toISOString(),
              waktu: activeTime,
            },
          }"
          class="flex-1 py-3 rounded-full bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold text-center transition"
        >
          Booking Sekarang
        </router-link>
      </div>
    </div>

    <!-- Kalender -->
    <CalendarModal
      v-model="selectedDate"
      :open="calendarOpen"
      @close="calendarOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/libs/axios.js";
import CalendarModal from "@/components/CalendarModal.vue";

import starIcon from "@/assets/icons/Bintang.png";
import lokasiIcon from "@/assets/icons/TitikLokasi.png";
import jamIcon from "@/assets/icons/Jam.png";
import chatIcon from "@/assets/icons/Chat.png";

const route = useRoute();
const jasa = ref(null);

// ----- jadwal -----
const selectedDate = ref(new Date());
const calendarOpen = ref(false);

const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const two = (n) => String(n).padStart(2, "0");
const isSameDay = (a, b) => atMidnight(a).getTime() === atMidnight(b).getTime();
const dayName = (d) =>
  d
    .toLocaleDateString("id-ID", { weekday: "long" })
    .replace(/^\w/u, (c) => c.toUpperCase());

const today = ref(atMidnight(new Date()));
const quickDays = computed(() => {
  const d0 = today.value;
  const d1 = addDays(d0, 1);
  const d2 = addDays(d0, 2);
  return [
    { label: "Hari Ini", date: d0, day: two(d0.getDate()) },
    { label: dayName(d1), date: d1, day: two(d1.getDate()) },
    { label: dayName(d2), date: d2, day: two(d2.getDate()) },
  ];
});
const monthShort = computed(() =>
  selectedDate.value.toLocaleString("id-ID", { month: "short" })
);
const selectQuick = (d) => {
  selectedDate.value = new Date(d);
};

// ----- waktu -----
const times = ref({
  morning: ["06.00", "08.30", "10.00"],
  afternoon: ["13.35", "15.00", "17.00"],
});
const activeTime = ref("08.30");

// ----- paket & deskripsi -----
const pkgList = computed(() => {
  return jasa.value?.packages && jasa.value.packages.length
    ? jasa.value.packages
    : [
        {
          id: 1,
          name: "Paket 1",
          price: 149999,
          image: "https://picsum.photos/seed/pk1/320/200",
        },
        {
          id: 2,
          name: "Paket 2",
          price: 244999,
          image: "https://picsum.photos/seed/pk2/320/200",
        },
        {
          id: 3,
          name: "Paket 3",
          price: 454500,
          image: "https://picsum.photos/seed/pk3/320/200",
        },
      ];
});

const jasaDesc = computed(
  () =>
    jasa.value?.description ||
    "Layanan servis dan perawatan AC untuk menjaga udara tetap sejuk dan bersih. Termasuk cuci unit indoor/outdoor, pemeriksaan sistem pendingin, pengisian freon (jika dibutuhkan), dan pengecekan kelistrikan. Dikerjakan teknisi berpengalaman dengan garansi hasil kerja."
);

const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");

onMounted(async () => {
  try {
    const { data } = await api.get(`/jasa/${route.params.id}`);
    jasa.value = data;
  } catch (e) {
    jasa.value = {
      title: "Jasa Servis & Perawatan AC",
      price: 100000,
      image: "https://picsum.photos/seed/ac/1200/600",
    };
    console.warn("API detail belum tersedia, memakai data fallback.");
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
