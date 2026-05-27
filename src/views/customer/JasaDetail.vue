<template>
  <div class="min-h-screen pb-32 bg-gradient-to-b from-gray-50 via-white to-gray-100 sm:pb-28">
    <!-- Gambar header (mobile/tablet) -->
    <div class="relative w-full h-48 overflow-hidden bg-gray-200 sm:h-60 lg:h-72 lg:hidden">
      <img :src="jasaImage" @error="onImgError($event, 'header')" class="object-cover w-full h-full" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
      <!-- Tombol kembali -->
      <button
        type="button"
        class="absolute z-20 flex items-center justify-center text-white transition rounded-full shadow-md top-3 left-3 w-9 h-9 bg-black/35 backdrop-blur-sm hover:bg-black/50"
        @click="goBack"
        aria-label="Kembali"
      >
        <i class="text-sm pi pi-arrow-left"></i>
      </button>
    </div>

    <!-- Preview galeri di bawah cover (mobile/tablet) -->
    <section
      v-if="jasa?.images && jasa.images.length > 1"
      class="px-4 pt-3 pb-2 bg-white border-b border-gray-100 lg:hidden"
    >
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <h2 class="mb-2 text-xs font-semibold text-gray-700">
          Galeri Layanan
        </h2>
        <div class="flex gap-2 pb-1 overflow-x-auto">
          <button
            v-for="img in jasa.images"
            :key="img.id || img.path || img.image"
            type="button"
            class="relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border text-[10px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFA30E] focus:ring-offset-1"
            :class="[
              (resolveJasaAssetSrc(img) === selectedImagePath) || (!selectedImagePath && img.is_cover)
                ? 'border-[#FFA30E]'
                : 'border-gray-200'
            ]"
            @click="onSelectGalleryImage(img)"
          >
            <img
              :src="resolveJasaAssetSrc(img)"
              class="object-cover w-full h-full"
              @error="onImgError($event, 'gallery')"
            />
            <span
              v-if="img.is_cover"
              class="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-[9px] py-0.5 text-center"
            >
              Cover
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Info utama -->
    <div v-if="jasa" class="px-4 py-4 border-b border-gray-100 shadow-sm bg-white/95">
      <div class="max-w-3xl mx-auto lg:max-w-5xl lg:grid lg:grid-cols-12 lg:gap-6">
        <!-- Kolom kiri (desktop): gambar & galeri -->
        <div class="hidden lg:flex lg:flex-col lg:gap-3 lg:col-span-5">
          <div class="relative w-full h-64 overflow-hidden bg-gray-200 rounded-2xl">
            <img
              :src="jasaImage"
              @error="onImgError($event, 'header')"
              class="object-cover w-full h-full"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent"></div>
          </div>
          <div
            v-if="jasa?.images && jasa.images.length > 1"
            class="flex gap-2 pb-1 overflow-x-auto no-scrollbar"
          >
            <button
              v-for="img in jasa.images"
              :key="img.id || img.path || img.image"
              type="button"
              class="relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border text-[10px] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#FFA30E] focus:ring-offset-1"
              :class="[
                (resolveJasaAssetSrc(img) === selectedImagePath) || (!selectedImagePath && img.is_cover)
                  ? 'border-[#FFA30E]'
                  : 'border-gray-200'
              ]"
              @click="onSelectGalleryImage(img)"
            >
              <img
                :src="resolveJasaAssetSrc(img)"
                class="object-cover w-full h-full"
                @error="onImgError($event, 'gallery')"
              />
              <span
                v-if="img.is_cover"
                class="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-[9px] py-0.5 text-center"
              >
                Cover
              </span>
            </button>
          </div>
        </div>

        <!-- Kolom kanan: Info Toko & Info Jasa -->
        <div class="lg:col-span-7">
          <!-- Info Toko -->
          <div class="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100">
        <div class="flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 rounded-full shrink-0">
          <img 
                v-if="jasa?.merchant?.id || jasa?.merchant?.logo_path || jasa?.merchant?.logo_url" 
            :src="getMerchantLogo(jasa.merchant.logo_path)" 
            alt="Logo Toko" 
            class="object-cover w-full h-full"
            @error="onImgError($event, 'logo')"
          />
          <i v-else class="text-xl text-gray-400 pi pi-shop"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-sm font-semibold text-gray-900 truncate">
            {{ jasa?.merchant?.name || '-' }}
          </h2>
          <p class="text-xs text-gray-500">
            {{ jasa?.merchant?.segmentation?.name || '-' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <router-link
            v-if="jasa?.merchant?.slug"
            :to="{ name: 'Merchant Detail', params: { slug: jasa.merchant.slug } }"
            class="px-3 py-1.5 rounded-lg bg-[#FFA30E] text-white text-xs font-semibold shrink-0 hover:bg-[#e5920d] transition"
          >
            Kunjungi
          </router-link>
          <router-link
            v-if="jasa?.merchant?.slug"
            :to="{ name: 'Merchant Detail', params: { slug: jasa.merchant.slug }, hash: '#reviews' }"
            class="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold shrink-0 hover:bg-gray-100 transition"
          >
            Ulasan
          </router-link>
          <button
            v-else
            class="px-3 py-1.5 rounded-lg bg-[#FFA30E] text-white text-xs font-semibold shrink-0"
          >
            Kunjungi
          </button>
        </div>
      </div>

      <!-- Info Jasa -->
      <div class="mt-3">
        <h1 class="text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
          {{ jasa?.title || '-' }}
        </h1>

        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-xl font-semibold text-merchant-primary">
            {{ priceDisplayMain }}
          </span>
          <span
            v-if="priceTypeLabel"
            class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
            :class="priceTypeLabel === 'Harga Tetap' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ priceTypeLabel }}
          </span>
        </div>

        <!-- badge & info -->
        <div class="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
          <span v-if="jasa?.estimated_duration" class="flex items-center gap-1.5">
            <img :src="jamIcon" alt="durasi" class="w-3.5 h-3.5" />
            <span>Perkiraan durasi {{ jasa.estimated_duration }}</span>
          </span>
        </div>

        <!-- Deskripsi Jasa -->
        <div class="mt-4">
          <h2 class="flex items-center gap-2 mb-1 text-sm font-semibold text-gray-900">
            <i class="pi pi-info-circle text-merchant-primary"></i>
            Deskripsi Jasa
          </h2>
          <p class="text-[14px] leading-relaxed text-gray-700">
            {{ jasaDesc }}
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- Lokasi & Tipe Layanan -->
    <section
      v-if="jasa?.service_type || jasa?.location_address || merchantAddress"
      class="px-4 py-4 mt-3 bg-white/95"
    >
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <h2
          class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5"
        >
          <i class="pi pi-map-marker text-merchant-primary"></i>
          Lokasi & Layanan
        </h2>

        <div class="space-y-2 text-sm">
          <div v-if="jasa?.service_type" class="flex items-center justify-between">
            <span class="text-gray-600 flex items-center gap-1.5">
              <i class="text-gray-500 pi pi-briefcase"></i>
              Tipe Layanan
            </span>
            <span class="font-medium text-gray-900">
              {{ serviceTypeLabel }}
            </span>
          </div>

          <div v-if="jasa?.service_type_booking" class="flex items-center justify-between">
            <span class="text-gray-600 flex items-center gap-1.5">
              <i class="text-gray-500 pi pi-list"></i>
              Mekanisme Pemesanan
            </span>
            <span class="font-medium text-gray-900">
              {{ serviceBookingLabel }}
            </span>
          </div>

          <div v-if="isConsultationMode" class="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
            Layanan ini memerlukan konsultasi terlebih dahulu sebelum pemesanan. Setelah konsultasi selesai, penjual akan mengirim link layanan jasa atau detail pemesanan.
            Gunakan tombol <strong>Minta Konsultasi</strong> di bawah untuk langsung menghubungi penjual.
          </div>

          <!-- Lokasi UMKM (untuk service_type at_location) -->
          <div
            v-if="jasa?.service_type === 'at_location' && merchantAddress"
            class="flex items-start gap-2"
          >
            <span class="mt-0.5">
              <i class="text-gray-500 pi pi-map-marker"></i>
            </span>
            <div class="flex-1">
              <p class="text-xs text-gray-500 mb-0.5">Lokasi UMKM</p>
              <p class="text-sm leading-snug text-gray-700">
                {{ merchantAddress }}
              </p>
            </div>
          </div>

          <!-- Alamat untuk service_type on_site atau fallback -->
          <div
            v-if="jasa?.service_type === 'on_site' || (jasa?.service_type !== 'at_location' && jasa?.service_type !== 'online' && jasa?.location_address)"
            class="flex items-start gap-2"
          >
            <span class="mt-0.5">
              <i class="text-gray-500 pi pi-map-marker"></i>
            </span>
            <p class="text-sm leading-snug text-gray-700">
              {{ jasa.location_address || '-' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pembayaran & Kontak -->
    <section v-if="jasa" class="px-4 py-4 mt-3 bg-white/95">
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <h2 class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
          <i class="pi pi-wallet text-merchant-primary"></i>
          Pembayaran & Kontak
        </h2>
        <div class="space-y-3 text-sm">
          <div>
            <span class="text-gray-600 flex items-center gap-1.5"><i class="text-gray-500 pi pi-wallet"></i> Metode Pembayaran</span>
            <p class="mt-1 font-medium text-gray-900">{{ formatPaymentMethods(jasa?.payment_methods) }}</p>
          </div>
          <div>
            <span class="text-gray-600 flex items-center gap-1.5"><i class="text-gray-500 pi pi-whatsapp"></i> WhatsApp</span>
            <a
              v-if="whatsappLink"
              :href="whatsappLink"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-[#25D366] font-medium hover:underline mt-1"
            >
              <span>Hubungi via WhatsApp</span>
              <i class="text-xs pi pi-external-link"></i>
            </a>
            <p v-else class="mt-1 font-medium text-gray-900">Belum tersedia</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isBookingMode" class="px-4 py-4 mt-3 bg-white/95">
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <h3 class="flex items-center gap-2 mb-3 text-sm font-semibold">
          <i class="pi pi-calendar text-merchant-primary"></i>
          Pilih Jadwal
        </h3>
        <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="(d, i) in quickDays"
          :key="i"
          @click="selectQuick(d.date, d.available)"
          class="flex flex-col items-center justify-center px-3 py-2 text-center transition-all duration-200 border w-28 h-14 rounded-xl"
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
            class="flex flex-col items-center w-20 px-3 py-2 mt-3 ml-auto text-gray-700 transition border border-gray-200 rounded-xl hover:border-merchant-primary/80 hover:bg-merchant-primary/5 sm:mt-0"
            @click="calendarOpen = true"
          >
            <span class="text-sm font-semibold">{{ monthShort }}</span>
            <i class="pi pi-calendar text-xl text-[#FFA30E]"></i>
          </button>
        </div>
      </div>
    </section>

    <section v-if="jasa && !isBookingMode" class="px-4 py-4 mt-3 bg-white/95">
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <div class="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm">
          <p class="font-semibold">Mekanisme layanan</p>
          <p class="mt-2">
            Layanan ini diproses sebagai <strong>{{ serviceBookingLabel }}</strong>.
          </p>
          <div class="mt-2 space-y-2 text-sm">
            <p v-if="isCartMode">
              • Langsung masuk ke keranjang dan dapat dilanjutkan ke pembayaran.
            </p>
            <p v-else-if="isConsultationMode">
              • Pelanggan akan menghubungi penjual terlebih dahulu. Setelah konsultasi selesai, penjual akan mengirim link layanan atau detail pemesanan.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pilih Waktu -->
    <section v-if="hasOperatingTimes && isBookingMode" class="px-4 py-4 mt-3 mb-2 bg-white/95">
      <div class="max-w-3xl mx-auto lg:max-w-5xl">
        <h3 class="flex items-center gap-2 mb-2 text-sm font-semibold">
          <i class="pi pi-clock text-merchant-primary"></i>
          Pilih Waktu
        </h3>
        <div class="p-4 border border-gray-200 rounded-2xl bg-gray-50/60">
        <!-- Pagi -->
        <div v-if="times.morning && times.morning.length > 0" class="mb-3">
          <div class="mb-2 text-sm text-gray-700">Pagi</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.morning"
              :key="'m' + i"
              @click="activeTime = t"
              class="px-4 py-2 text-sm transition-all duration-200 border rounded-lg"
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
          <div class="mb-2 text-sm text-gray-700">Siang</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.afternoon"
              :key="'a' + i"
              @click="activeTime = t"
              class="px-4 py-2 text-sm transition-all duration-200 border rounded-lg"
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
          <div class="mb-2 text-sm text-gray-700">Malam</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(t, i) in times.evening"
              :key="'e' + i"
              @click="activeTime = t"
              class="px-4 py-2 text-sm transition-all duration-200 border rounded-lg"
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
      </div>
    </section>

    <!-- Bottom bar -->
    <div
      v-if="jasa"
      class="fixed left-0 right-0 bottom-16 sm:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-4 py-3"
    >
      <div class="flex items-center max-w-3xl gap-4 mx-auto lg:max-w-5xl">
        <template v-if="isBookingMode">
          <router-link
            :to="{
              name: 'Pembayaran Jasa',
              query: {
                 title: jasa?.title || '-',
                image: jasaImage,
                price: jasa?.fixed_price || jasa?.base_price || 100000,
                tgl: hasOperatingDays ? selectedDate.toISOString() : '',
                waktu: hasOperatingTimes ? activeTime : '',
                payment_methods: jasa?.payment_methods || '',
                service_type: jasa?.service_type || '',
                merchant_slug: jasa?.merchant?.slug || '',
                jasa_slug: jasa?.slug || route.params.slug || '',
                alamat:
                  jasa?.service_type === 'on_site'
                    ? ''
                    : jasa?.location_address || merchantAddress || '',
                price_type:
                  jasa?.fixed_price && jasa.fixed_price > 0
                    ? 'fixed'
                    : jasa?.base_price && jasa.base_price > 0
                      ? 'base'
                      : '',
                service_type_booking: 'booking',
              },
            }"
            class="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FFA30E] to-[#ffba3d] hover:from-[#e5920d] hover:to-[#ffb024] text-white font-semibold text-center transition shadow-md"
          >
            Booking Sekarang
          </router-link>
        </template>
        <template v-else-if="isConsultationMode">
          <div class="flex items-center gap-3 flex-1">
            <!-- Tombol Chat In-App -->
            <button
              type="button"
              @click="openConsultationChat"
              class="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white font-semibold text-center transition shadow-md flex items-center justify-center gap-2"
            >
              <i class="pi pi-comments"></i>
              Konsultasi Gratis
            </button>

            <!-- Tombol WhatsApp -->
            <button
              v-if="whatsappLink"
              type="button"
              @click="openConsultationContact"
              class="px-5 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition shadow-md"
              title="Hubungi via WhatsApp"
            >
              <i class="pi pi-whatsapp text-xl"></i>
            </button>
          </div>
        </template>
        <template v-else-if="isCartMode">
          <router-link
            :to="{
              name: 'Pembayaran Jasa',
              query: {
                title: jasa?.title || '-',
                image: jasaImage,
                price: jasa?.fixed_price || jasa?.base_price || 100000,
                tgl: '',
                waktu: '',
                payment_methods: jasa?.payment_methods || '',
                service_type: jasa?.service_type || '',
                merchant_slug: jasa?.merchant?.slug || '',
                jasa_slug: jasa?.slug || route.params.slug || '',
                alamat:
                  jasa?.service_type === 'on_site'
                    ? ''
                    : jasa?.location_address || merchantAddress || '',
                price_type:
                  jasa?.fixed_price && jasa.fixed_price > 0
                    ? 'fixed'
                    : jasa?.base_price && jasa.base_price > 0
                      ? 'base'
                      : 'cart',
                service_type_booking: 'cart',
              },
            }"
            class="flex-1 py-3 rounded-full bg-gradient-to-r from-[#FFA30E] to-[#ffba3d] hover:from-[#e5920d] hover:to-[#ffb024] text-white font-semibold text-center transition shadow-md"
          >
            Checkout Cepat
          </router-link>
        </template>
        <template v-else>
          <button
            type="button"
            disabled
            class="flex-1 py-3 rounded-full bg-gray-200 text-gray-600 font-semibold text-center"
          >
            Pilih Mekanisme Pemesanan
          </button>
        </template>
      </div>
    </div>

    <!-- Kalender -->
    <CalendarModal
      v-model="selectedDate"
      :open="calendarOpen"
      :operating-days="jasa?.operating_days || ''"
      @close="calendarOpen = false"
    />

    <!-- ⭐ Consultation Chat Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="chatModalOpen && currentConversationId"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          @click.self="chatModalOpen = false"
        >
          <div class="w-full max-w-lg h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-purple-500 to-purple-400 text-white shrink-0">
              <div>
                <h3 class="font-semibold">Konsultasi</h3>
                <p class="text-xs text-white/80">{{ jasa?.title }}</p>
              </div>
              <button
                @click="chatModalOpen = false"
                class="p-2 hover:bg-white/20 rounded-full transition"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Chat Window -->
            <div class="flex-1 min-h-0">
              <ChatWindow
                :conversationId="currentConversationId"
                mode="buyer"
                :title="jasa?.title"
                @service-link-created="handleServiceLinkCreated"
                @close="chatModalOpen = false"
              />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Kalender -->
    <CalendarModal
      v-model="selectedDate"
      :open="calendarOpen"
      :operating-days="jasa?.operating_days || ''"
      @close="calendarOpen = false"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/libs/axios.js";
import { getImageUrl, getMerchantLogoUrl } from "@/libs/getImageUrl.js";
import CalendarModal from "@/components/CalendarModal.vue";
import ChatWindow from "@/components/common/ChatWindow.vue";
import { useChat } from "@/composables/useChat";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const { startConversation, loadConversation } = useChat();

const jasa = ref(null);
const selectedImagePath = ref(null);

// ⭐ Konsultasi chat state
const chatModalOpen = ref(false);
const currentConversationId = ref(null);

// Fallback images for error handling
const fallbackHeader = 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23E5E7EB" width="400" height="300"/%3E%3C/svg%3E';
const fallbackLogo = 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23E5E7EB" width="100" height="100"/%3E%3C/svg%3E';

const goBack = () => {
  router.back();
};

const hasOperatingDays = computed(() =>
  Boolean(String(jasa.value?.operating_days || "").trim())
);

const parsedOperatingTimes = computed(() =>
  String(jasa.value?.operating_times || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
);

const hasOperatingTimes = computed(() => parsedOperatingTimes.value.length > 0);

// Helper untuk mendapatkan URL logo merchant
const getMerchantLogo = (logo) => {
  if (jasa.value?.merchant?.id) {
    return getMerchantLogoUrl(jasa.value.merchant);
  }
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
// Parse operating_times dari jasa. Jika tidak diatur saat create, waktu tidak ditampilkan di customer.
const times = computed(() => {
  const operatingTimes = parsedOperatingTimes.value;

  if (operatingTimes.length === 0) {
    return { morning: [], afternoon: [], evening: [] };
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
    return;
  }

  if (allTimes.length === 0) {
    activeTime.value = "";
  }
};

// ----- gambar jasa -----
const resolveJasaAssetSrc = (img) => {
  if (!img) return "";
  // Prioritas: API URL terlebih dahulu (sama seperti produk)
  if (img.id) return getImageUrl(img.id);
  if (img.src_url) return getImageUrl(img.src_url);
  if (img.url) return getImageUrl(img.url);
  return "";
};

const jasaImage = computed(() => {
  if (selectedImagePath.value) return selectedImagePath.value;

  if (!jasa.value) return "";

  // Prioritaskan cover URL dari API agar aman di environment deploy
  if (jasa.value.cover_img?.id) {
    return getImageUrl(jasa.value.cover_img.id);
  }
  if (jasa.value.cover_img?.src_url) {
    return getImageUrl(jasa.value.cover_img.src_url);
  }
  if (jasa.value.cover_img?.url) {
    return getImageUrl(jasa.value.cover_img.url);
  }

  // Fallback ke array images (cover image)
  if (jasa.value.images && jasa.value.images.length > 0) {
    const coverImg =
      jasa.value.images.find((img) => img.is_cover) || jasa.value.images[0];
    const resolved = resolveJasaAssetSrc(coverImg);
    if (resolved) return resolved;
  }

  return "";
});

const onSelectGalleryImage = (img) => {
  if (!img) return;
  const src = resolveJasaAssetSrc(img);
  if (src) {
    selectedImagePath.value = src;
  }
};

// ----- deskripsi -----
const jasaDesc = computed(
  () => jasa.value?.description || "Belum ada deskripsi jasa."
);

// ----- mekanisme pemesanan (cart / booking / consultation) -----
const serviceBookingLabel = computed(() => {
  const t = jasa.value?.service_type_booking;
  if (!t) return "Tidak tersedia";
  if (t === "cart") return "Keranjang (Tanpa Jadwal)";
  if (t === "booking") return "Booking (Pilih Jadwal)";
  if (t === "consultation") return "Konsultasi (Hubungi Penjual)";
  return String(t);
});

const isBookingMode = computed(() => jasa.value?.service_type_booking === "booking");
const isConsultationMode = computed(() => jasa.value?.service_type_booking === "consultation");
const isCartMode = computed(() => jasa.value?.service_type_booking === "cart");

function buildConsultationMessage() {
  const jasaTitle = jasa.value?.title || "Layanan Jasa";
  const serviceType = serviceTypeLabel.value || "-";
  const lines = [
    "Halo, saya ingin konsultasi layanan Sumilir.",
    "",
    "Layanan yang ingin dikonsultasikan:",
    `- ${jasaTitle}`,
    `- Tipe layanan: ${serviceType}`,
    `- Mekanisme: ${serviceBookingLabel.value}`,
    "",
    "Mohon bantuannya untuk menjelaskan detail, harga, dan jadwal layanan.",
  ];
  return lines.join("\n");
}

function openConsultationContact() {
  if (!whatsappLink.value) {
    window.alert(
      "Kontak WhatsApp penjual belum tersedia. Silakan hubungi penjual secara manual."
    );
    return;
  }

  const encoded = encodeURIComponent(buildConsultationMessage());
  let url = whatsappLink.value.trim();
  if (url.startsWith("http")) {
    url += url.includes("?") ? `&text=${encoded}` : `?text=${encoded}`;
  } else {
    const phone = url.replace(/[^0-9]/g, "");
    url = `https://wa.me/${phone}?text=${encoded}`;
  }

  window.open(url, "_blank");
}

const goToCart = () => {
  router.push({ name: "Keranjang" });
};

// ⭐ Konsultasi functions
async function openConsultationChat() {
  if (!authStore.isAuthenticated) {
    toast.warning("Silakan login terlebih dahulu");
    router.push({ name: "Login", query: { redirect: route.fullPath } });
    return;
  }

  try {
    // Start conversation untuk jasa ini
    const convo = await startConversation(jasa.value.id);
    if (convo?.id) {
      currentConversationId.value = convo.id;
      // Also load the conversation to get messages
      await loadConversation(convo.id);
      chatModalOpen.value = true;
    } else {
      // Fallback to WhatsApp
      toast.info("Mengalihkan ke WhatsApp...");
      openConsultationContact();
    }
  } catch (err) {
    console.error("[JasaDetail] Failed to start consultation:", err);
    toast.error("Gagal memulai konsultasi. Mengalihkan ke WhatsApp...");
    openConsultationContact();
  }
}

function handleServiceLinkCreated(serviceLink) {
  chatModalOpen.value = false;

  // Navigasi ke halaman pembayaran dengan harga nego
  router.push({
    name: "Pembayaran Jasa",
    query: {
      title: jasa.value?.title || "-",
      image: jasaImage.value,
      price: serviceLink.agreed_price,
      agreed_price: serviceLink.agreed_price,
      conversation_id: serviceLink.conversation_id,
      tgl: serviceLink.booking_date || "",
      waktu: serviceLink.booking_time || "",
      payment_methods: jasa.value?.payment_methods || "",
      service_type: jasa.value?.service_type || "",
      merchant_slug: jasa.value?.merchant?.slug || "",
      jasa_slug: route.params.slug || "",
      price_type: "consultation",
    },
  });
}

// ----- tipe layanan (online / di tempat / ke alamat pelanggan) -----
const serviceTypeLabel = computed(() => {
  const t = jasa.value?.service_type;
  if (!t) return "-";
  if (t === "at_location") return "Di Tempat Saya";
  if (t === "on_site") return "Ke Rumah/Lokasi Pelanggan";
  if (t === "online") return "Online";
  return t;
});

// ----- alamat merchant untuk service_type at_location -----
const merchantAddress = computed(() => {
  const merchant = jasa.value?.merchant;
  if (!merchant) return '';

  const primaryAddress = merchant.primary_address;
  if (!primaryAddress) {
    // Fallback ke field address atau alamat lama
    return merchant.address || merchant.alamat || '';
  }

  // Format alamat lengkap dari primary_address
  const parts = [
    primaryAddress.detail,
    primaryAddress.village,
    primaryAddress.district,
    primaryAddress.city,
    primaryAddress.province,
  ].filter(Boolean);

  return parts.join(', ') || '';
});

// ----- harga display -----
const priceTypeLabel = computed(() => {
  if (!jasa.value) return "";
  if (jasa.value.fixed_price && jasa.value.fixed_price > 0) return "Harga Tetap";
  if (jasa.value.base_price && jasa.value.base_price > 0) return "Mulai dari";
  return "";
});

const priceDisplayMain = computed(() => {
  if (!jasa.value) return "Rp 0";

  if (jasa.value.fixed_price && jasa.value.fixed_price > 0) {
    return `Rp ${formatIDR(jasa.value.fixed_price)}`;
  }

  if (jasa.value.base_price && jasa.value.base_price > 0) {
    return `Rp ${formatIDR(jasa.value.base_price)}`;
  }

  return "Rp 0";
});

const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");

const formatPaymentMethods = (methods) => {
  if (!methods) return "COD (Bayar di Tempat)";
  const methodsMap = { cod: "COD (Bayar di Tempat)", qris: "QRIS (Scan & Transfer)" };
  return methods
    .split(",")
    .map(m => methodsMap[m.trim()])
    .filter(Boolean)
    .join(", ");
};

const whatsappLink = computed(() => {
  const raw =
    jasa.value?.whatsapp_link ||
    jasa.value?.merchant?.whatsapp ||
    jasa.value?.merchant?.phone ||
    "";

  const cleaned = String(raw).trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("http")) return cleaned;
  const digits = cleaned.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
});

onMounted(async () => {
  const slugParam = String(route.params.slug || "").trim();
  if (!slugParam) {
    console.error("[JasaDetail] Missing slug param");
    jasa.value = null;
    return;
  }

  try {
    console.log("[JasaDetail] Fetching jasa slug:", slugParam);
    const encoded = encodeURIComponent(slugParam);
    let response;

    try {
      response = await api.get(`/api/public/jasas/${encoded}`);
    } catch (firstError) {
      // fallback retry once with raw value (beberapa backend lama tidak cocok dengan encoded tertentu)
      response = await api.get(`/api/public/jasas/${slugParam}`);
    }

    const { data } = response;
    const payload = data?.data ?? data;
    console.log("[JasaDetail] Jasa data:", payload);
    jasa.value = payload;
    
    // Set selectedDate ke hari pertama yang tersedia
    if (payload?.operating_days) {
      const operatingDays = payload.operating_days.split(',').map(d => parseInt(d.trim()));
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
    // Biarkan jasa kosong jika tidak ditemukan / 404 supaya tidak menampilkan data dummy
    jasa.value = null;
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