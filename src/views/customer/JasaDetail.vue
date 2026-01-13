<template>
  <div class="min-h-screen bg-gray-50 pb-32 sm:pb-28">
    <!-- Gambar header -->
    <div class="w-full h-48 sm:h-60 bg-gray-200 overflow-hidden">
      <img :src="jasaImage" @error="onImgError($event, 'header')" class="w-full h-full object-cover" />
    </div>

    <!-- Info utama -->
    <div class="bg-white px-4 py-4 shadow-sm">
      <!-- Info Toko -->
      <div class="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <div class="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          <img 
            v-if="jasa?.merchant?.logo_path" 
            :src="getMerchantLogo(jasa.merchant.logo_path)" 
            alt="Logo Toko" 
            class="w-full h-full object-cover"
            @error="onImgError($event, 'logo')"
          />
          <i v-else class="pi pi-shop text-gray-400 text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-gray-900 truncate">
            {{ jasa?.merchant?.name || 'Nama Toko' }}
          </h2>
          <p class="text-xs text-gray-500">
            {{ jasa?.merchant?.segmentation?.name || 'UMKM Jasa' }}
          </p>
        </div>
        <router-link
          v-if="jasa?.merchant?.id"
          :to="{ name: 'MerchantStore', params: { id: jasa.merchant.id } }"
          class="px-3 py-1.5 rounded-lg bg-[#FFA30E] text-white text-xs font-semibold shrink-0 hover:bg-[#e5920d] transition"
        >
          Kunjungi
        </router-link>
        <button
          v-else
          class="px-3 py-1.5 rounded-lg bg-[#FFA30E] text-white text-xs font-semibold shrink-0"
        >
          Kunjungi
        </button>
      </div>

      <!-- Info Jasa -->
      <div>
        <h1 class="text-lg font-semibold text-gray-900">
          {{ jasa?.title || "Jasa Servis & Perawatan AC" }}
        </h1>
      </div>

      <div class="mt-2 text-gray-900 font-semibold">
        {{ priceDisplay }}
      </div>

      <!-- badge & info -->
      <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span class="px-2 py-1 rounded-md bg-green-100 text-green-700">
          Available
        </span>

        <span v-if="jasa?.estimated_duration" class="flex items-center gap-1">
          <img :src="jamIcon" alt="durasi" class="w-3.5 h-3.5" />
          <span>{{ jasa.estimated_duration }}</span>
        </span>
      </div>
    </div>

    <!-- Deskripsi Jasa -->
    <section class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-2">Deskripsi Jasa</h2>
      <p class="text-[15px] leading-relaxed text-gray-700">
        {{ jasaDesc }}
      </p>
    </section>



    <!-- Jam Operasional -->
    <section class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-3">Jam & Hari Operasional</h2>
      <div class="space-y-2 text-sm">
        <div v-if="jasa?.operating_hours_start" class="flex justify-between">
          <span class="text-gray-600 flex items-center gap-1.5"><i class="pi pi-clock text-gray-500"></i> Jam Operasional</span>
          <span class="font-medium text-gray-900">
            {{ formatTime(jasa.operating_hours_start) }} - {{ formatTime(jasa.operating_hours_end) }}
          </span>
        </div>
        <div v-if="jasa?.operating_days" class="flex justify-between">
          <span class="text-gray-600 flex items-center gap-1.5"><i class="pi pi-calendar text-gray-500"></i> Hari Kerja</span>
          <span class="font-medium text-gray-900">{{ formatOperatingDays(jasa.operating_days) }}</span>
        </div>
      </div>
    </section>

    <!-- Lokasi Layanan -->
    <section v-if="jasa?.location_address" class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5"><i class="pi pi-map-marker text-gray-500"></i> Lokasi Layanan</h2>
      <p class="text-sm text-gray-700">{{ jasa.location_address }}</p>
    </section>

    <!-- Pembayaran & Kontak -->
    <section class="bg-white mt-3 px-4 py-4">
      <h2 class="text-sm font-semibold text-gray-800 mb-3">Pembayaran & Kontak</h2>
      <div class="space-y-3 text-sm">
        <div v-if="jasa?.payment_methods">
          <span class="text-gray-600 flex items-center gap-1.5"><i class="pi pi-wallet text-gray-500"></i> Metode Pembayaran</span>
          <p class="font-medium text-gray-900 mt-1">{{ formatPaymentMethods(jasa.payment_methods) }}</p>
        </div>
        <div v-if="jasa?.whatsapp_link">
          <span class="text-gray-600 flex items-center gap-1.5"><i class="pi pi-whatsapp text-gray-500"></i> WhatsApp</span>
          <a :href="jasa.whatsapp_link" target="_blank" class="text-[#FFA30E] font-medium hover:underline mt-1 block">
            Hubungi via WhatsApp →
          </a>
        </div>
      </div>
    </section>

    <!-- Pilih Jadwal -->
    <section class="bg-white mt-3 px-4 py-4">
      <h3 class="text-sm font-semibold mb-3">Pilih Jadwal</h3>
      <div class="flex items-center gap-2">
        <button
          v-for="(d, i) in quickDays"
          :key="i"
          @click="selectQuick(d.date, d.available)"
          class="w-28 h-14 px-3 py-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200"
          :class="[
            !d.available 
              ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-70'
              : isSameDay(selectedDate, d.date)
                ? 'bg-[#FFA30E] text-white border-[#FFA30E] scale-[1.03]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#FFA30E]'
          ]"
          :disabled="!d.available"
        >
          <div class="text-[11px] leading-3">{{ d.label }}</div>
          <div class="text-sm font-semibold">{{ d.day }}</div>
          <div v-if="!d.available" class="text-[9px] text-red-400">Tidak tersedia</div>
        </button>

        <button
          class="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-gray-700 w-20 flex flex-col items-center"
          @click="calendarOpen = true"
        >
          <span class="text-sm font-semibold">{{ monthShort }}</span>
          <i class="pi pi-calendar text-xl text-[#FFA30E]"></i>
        </button>
      </div>
    </section>

    <!-- Pilih Waktu -->
    <section class="bg-white mt-3 px-4 py-4">
      <h3 class="text-sm font-semibold mb-2">Pilih Waktu</h3>
      <div class="rounded-2xl border border-gray-300/70 p-4">
        <!-- Pagi -->
        <div v-if="times.morning && times.morning.length > 0" class="mb-3">
          <div class="text-sm text-gray-700 mb-2">Pagi</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.morning"
              :key="'m' + i"
              @click="activeTime = t"
              class="px-4 py-2 rounded-lg border text-sm transition-all duration-200"
              :class="
                t === activeTime
                  ? 'bg-[#FFA30E] text-white border-[#FFA30E] scale-[1.03]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ t }}
            </button>
          </div>
        </div>
        
        <!-- Siang -->
        <div v-if="times.afternoon && times.afternoon.length > 0" class="mb-3">
          <div class="text-sm text-gray-700 mb-2">Siang</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.afternoon"
              :key="'a' + i"
              @click="activeTime = t"
              class="px-4 py-2 rounded-lg border text-sm transition-all duration-200"
              :class="
                t === activeTime
                  ? 'bg-[#FFA30E] text-white border-[#FFA30E] scale-[1.03]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ t }}
            </button>
          </div>
        </div>
        
        <!-- Malam -->
        <div v-if="times.evening && times.evening.length > 0">
          <div class="text-sm text-gray-700 mb-2">Malam</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.evening"
              :key="'e' + i"
              @click="activeTime = t"
              class="px-4 py-2 rounded-lg border text-sm transition-all duration-200"
              :class="
                t === activeTime
                  ? 'bg-[#FFA30E] text-white border-[#FFA30E] scale-[1.03]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              "
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom bar -->
    <div
      class="fixed left-0 right-0 bottom-16 sm:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3"
    >
      <div class="max-w-screen-sm mx-auto flex items-center gap-4">
        <button
          type="button"
          class="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FFA30E] hover:bg-[#e5920d] transition"
          @click="showChat = true"
          title="Chat dengan Penjual"
        >
          <i class="pi pi-comments text-white text-lg"></i>
        </button>

        <router-link
          :to="{
            name: 'Pembayaran Jasa',
            query: {
              id: route.params.id,
              title: jasa?.title || 'Jasa Servis & Perawatan AC',
              image: jasaImage,
              price: jasa?.fixed_price || jasa?.base_price || 100000,
              tgl: selectedDate.toISOString(),
              waktu: activeTime,
              payment_methods: jasa?.payment_methods || '',
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
      :operating-days="jasa?.operating_days || ''"
      @close="calendarOpen = false"
    />

    <!-- Chat Pembeli: bottom sheet sederhana -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div
        v-if="showChat"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        @click.self="showChat = false"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl h-[70vh] sm:h-[520px] flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  v-if="jasa?.merchant?.logo_path" 
                  :src="getMerchantLogo(jasa.merchant.logo_path)" 
                  alt="Logo Toko" 
                  class="w-full h-full object-cover"
                  @error="onImgError($event, 'logo')"
                />
                <i v-else class="pi pi-shop text-gray-400"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ jasa?.merchant?.name || 'Penjual' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ jasa?.title || 'Konsultasi Jasa' }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              @click="showChat = false"
            >
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <div class="flex-1 p-3">
            <ChatWindow :jasa-id="route.params.id" mode="buyer" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/libs/axios.js";
import { getImageUrl } from "@/libs/getImageUrl.js";
import CalendarModal from "@/components/CalendarModal.vue";
import ChatWindow from "@/components/common/ChatWindow.vue";

const route = useRoute();
const jasa = ref(null);
const showChat = ref(false);

// Helper untuk mendapatkan URL logo merchant
const getMerchantLogo = (logo) => {
  if (!logo) return null;
  return getImageUrl(logo);
};

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

// Konversi hari JS (0=Minggu, 1=Senin...) ke format database (1=Senin...7=Minggu)
const jsToDbDay = (jsDay) => (jsDay === 0 ? 7 : jsDay);

// Cek apakah hari tersedia berdasarkan operating_days
const isDayAvailable = (date) => {
  if (!jasa.value?.operating_days) return true; // Jika tidak ada data, anggap semua tersedia
  const operatingDays = jasa.value.operating_days.split(',').map(d => parseInt(d.trim()));
  const dbDay = jsToDbDay(date.getDay());
  return operatingDays.includes(dbDay);
};

const today = ref(atMidnight(new Date()));
const quickDays = computed(() => {
  const days = [];
  for (let i = 0; i < 3; i++) {
    const date = addDays(today.value, i);
    const available = isDayAvailable(date);
    days.push({
      label: i === 0 ? "Hari Ini" : dayName(date),
      date: date,
      day: two(date.getDate()),
      available: available
    });
  }
  return days;
});
const monthShort = computed(() =>
  selectedDate.value.toLocaleString("id-ID", { month: "short" })
);
const selectQuick = (d, available) => {
  if (!available) return; // Tidak bisa pilih hari yang tidak tersedia
  selectedDate.value = new Date(d);
};

// ----- waktu -----
// Default times jika tidak ada operating_times
const defaultTimes = {
  morning: ["06.00", "08.30", "10.00"],
  afternoon: ["13.00", "15.00", "17.00"],
  evening: ["18.00", "19.00", "20.00"],
};

// Parse operating_times dari jasa
const times = computed(() => {
  if (!jasa.value?.operating_times) {
    return defaultTimes;
  }
  
  const operatingTimes = jasa.value.operating_times.split(',').map(t => t.trim()).filter(t => t);
  if (operatingTimes.length === 0) {
    return defaultTimes;
  }
  
  // Kategorikan waktu berdasarkan periode
  const morning = operatingTimes.filter(t => {
    const hour = parseInt(t.split('.')[0]);
    return hour >= 6 && hour < 12;
  });
  
  const afternoon = operatingTimes.filter(t => {
    const hour = parseInt(t.split('.')[0]);
    return hour >= 12 && hour < 18;
  });
  
  const evening = operatingTimes.filter(t => {
    const hour = parseInt(t.split('.')[0]);
    return hour >= 18;
  });
  
  return { morning, afternoon, evening };
});

// Active time - pilih pertama yang tersedia
const activeTime = ref("");

// Set active time ketika times berubah
const initActiveTime = () => {
  const allTimes = [...times.value.morning, ...times.value.afternoon, ...(times.value.evening || [])];
  if (allTimes.length > 0 && !activeTime.value) {
    activeTime.value = allTimes[0];
  }
};

// ----- gambar jasa -----
const jasaImage = computed(() => {
  if (!jasa.value) return 'https://picsum.photos/seed/jasa/1200/600';
  
  // Cek dari array images (prioritas cover image)
  if (jasa.value.images && jasa.value.images.length > 0) {
    const coverImg = jasa.value.images.find(img => img.is_cover) || jasa.value.images[0];
    return getImageUrl(coverImg?.path || jasa.value.image);
  }
  
  // Fallback ke field image lama
  if (jasa.value.image) {
    return getImageUrl(jasa.value.image);
  }
  
  return 'https://picsum.photos/seed/jasa/1200/600';
});

// ----- deskripsi -----
const jasaDesc = computed(
  () =>
    jasa.value?.description ||
    "Layanan servis dan perawatan AC untuk menjaga udara tetap sejuk dan bersih. Termasuk cuci unit indoor/outdoor, pemeriksaan sistem pendingin, pengisian freon (jika dibutuhkan), dan pengecekan kelistrikan. Dikerjakan teknisi berpengalaman dengan garansi hasil kerja."
);

// ----- harga display -----
const priceDisplay = computed(() => {
  if (!jasa.value) return "Rp 0";
  
  // Prioritas: fixed_price > base_price
  if (jasa.value.fixed_price && jasa.value.fixed_price > 0) {
    return `Rp ${formatIDR(jasa.value.fixed_price)}`;
  }
  
  if (jasa.value.base_price && jasa.value.base_price > 0) {
    return `Mulai Rp ${formatIDR(jasa.value.base_price)}`;
  }
  
  return "Rp 0";
});

const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");

// Helper functions untuk format data
const formatTime = (timeStr) => {
  if (!timeStr) return "-";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
};

const formatOperatingDays = (days) => {
  if (!days) return "-";
  const daysMap = { 1: "Sen", 2: "Sel", 3: "Rab", 4: "Kam", 5: "Jum", 6: "Sab", 7: "Min" };
  const dayList = days.split(",").map(d => daysMap[d.trim()]).filter(Boolean);
  return dayList.join(", ");
};

const formatPaymentMethods = (methods) => {
  if (!methods) return "-";
  const methodsMap = { cod: "COD (Bayar di Tempat)", qris: "QRIS (Scan & Transfer)" };
  return methods
    .split(",")
    .map(m => methodsMap[m.trim()])
    .filter(Boolean)
    .join(", ");
};

onMounted(async () => {
  try {
    console.log("[JasaDetail] Fetching jasa ID:", route.params.id);
    const { data } = await api.get(`/api/public/jasas/${route.params.id}`);
    console.log("[JasaDetail] Jasa data:", data);
    jasa.value = data;
    
    // Set selectedDate ke hari pertama yang tersedia
    if (data.operating_days) {
      const operatingDays = data.operating_days.split(',').map(d => parseInt(d.trim()));
      // Cari hari tersedia dalam 7 hari ke depan
      for (let i = 0; i < 7; i++) {
        const checkDate = addDays(today.value, i);
        const dbDay = jsToDbDay(checkDate.getDay());
        if (operatingDays.includes(dbDay)) {
          selectedDate.value = checkDate;
          break;
        }
      }
    }
    
    // Set active time ke waktu pertama yang tersedia
    initActiveTime();
  } catch (e) {
    console.error("[JasaDetail] Error fetching jasa:", e);
    jasa.value = {
      title: "Jasa Servis & Perawatan AC",
      fixed_price: 100000,
      images: [],
    };
    console.warn("API detail belum tersedia, memakai data fallback.");
    initActiveTime();
  }
});


function onImgError(e, type) {
  if (type === 'header') {
    e.target.src = fallbackHeader
  } else if (type === 'logo') {
    e.target.src = fallbackLogo
  }
}
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
