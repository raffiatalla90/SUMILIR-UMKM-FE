<template>
  <div
    class="min-h-screen pb-32 bg-gradient-to-b from-gray-50 via-white to-gray-100 sm:pb-28"
  >
    <!-- AppBar -->
    <header
      class="sticky top-0 z-20 px-4 py-3 text-white shadow-md bg-gradient-to-r from-merchant-primary to-merchant-primary/90"
    >
      <div class="flex items-center max-w-screen-sm gap-3 mx-auto">
        <button
          type="button"
          class="flex items-center justify-center text-white transition rounded-full shadow-sm w-9 h-9 bg-white/15 hover:bg-white/25 backdrop-blur-sm"
          @click="goBack"
          aria-label="Kembali"
        >
          <i class="text-sm pi pi-arrow-left"></i>
        </button>
        <div class="flex flex-col">
          <h1 class="text-sm font-semibold sm:text-base">Ringkasan Pesanan</h1>
          <p class="text-[11px] sm:text-xs text-white/80">
            Cek kembali data sebelum mengirim ke chat penjual
          </p>
        </div>
      </div>
    </header>

    <main class="px-4 mt-4">
      <div class="max-w-screen-sm mx-auto space-y-4">
        <!-- Data Pemesan -->
        <section
          class="p-4 border border-gray-100 shadow-sm bg-white/95 rounded-2xl sm:p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2
                class="flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base"
              >
                <i class="pi pi-user text-merchant-primary"></i>
                Data Pemesan
              </h2>
              <p class="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                Pastikan nama dan nomor dapat dihubungi oleh penjual.
              </p>
            </div>
            <button
              type="button"
              class="px-2 py-1 text-xs border rounded-full border-amber-300 text-amber-700 bg-amber-50"
              @click="useProfileContact"
            >
              Gunakan data profil
            </button>
          </div>
          <div class="space-y-3">
            <input
              v-model="form.nama"
              type="text"
              placeholder="Nama Lengkap"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
            />
            <input
              v-model="form.tel"
              type="tel"
              placeholder="Nomor Telp"
              inputmode="numeric"
              pattern="[0-9]*"
              @input="onPhoneInput"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
            />
          </div>
        </section>

        <!-- Detail Pesanan -->
        <section
          class="p-4 border border-gray-100 shadow-sm bg-white/95 rounded-2xl sm:p-5"
        >
          <h2
            class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 sm:text-base"
          >
            <i class="pi pi-clipboard text-merchant-primary"></i>
            Detail Pesanan
          </h2>
          <div class="flex items-center gap-3">
            <div
              class="w-24 h-16 overflow-hidden bg-gray-100 shadow-sm rounded-xl"
            >
              <img :src="order.image" class="object-cover w-full h-full" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-900 line-clamp-2">
                {{ order.title }}
              </div>
              <div class="mt-1 flex items-baseline gap-1.5">
                <span class="text-sm font-semibold text-merchant-primary">
                  Rp {{ formatIDR(order.price) }}
                </span>
                <span
                  v-if="orderPriceTypeLabel"
                  class="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {{ orderPriceTypeLabel }}
                </span>
              </div>
            </div>
          </div>
          <textarea
            v-model="form.catatan"
            rows="3"
            placeholder="Catatan tambahan"
            class="w-full px-3 py-2 mt-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
          ></textarea>
        </section>

        <!-- Detail Alamat -->
        <section
          class="p-4 border border-gray-100 shadow-sm bg-white/95 rounded-2xl sm:p-5"
        >
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2
                class="flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base"
              >
                <i class="pi pi-map-marker text-merchant-primary"></i>
                Alamat Layanan Jasa
              </h2>
              <p
                v-if="isOnlineService"
                class="mt-0.5 text-[11px] text-gray-500"
              >
                Layanan ini dilakukan sepenuhnya secara online, jadi alamat
                tidak wajib diisi.
              </p>
            </div>
            <button
              v-if="!isOnlineService && serviceType === 'on_site'"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-200/90 hover:bg-amber-300 text-amber-900 text-xs font-semibold shadow-sm transition"
              @click="useDeviceLocation"
            >
              <i class="pi pi-map-marker text-[11px]"></i>
              <span>Ambil lokasi dari device</span>
            </button>
          </div>
          <div class="flex items-start gap-2 text-sm text-gray-800">
            <span class="mt-0.5">
              <i class="text-gray-500 pi pi-map-marker"></i>
            </span>
            <p class="leading-snug">{{ form.alamat }}</p>
          </div>
          <input
            v-model="form.catatanAlamat"
            type="text"
            placeholder="Catatan alamat"
            class="w-full px-3 py-2 mt-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
          />
        </section>

        <!-- Jadwal (auto filled) -->
        <section
          class="p-4 border border-gray-100 shadow-sm bg-white/95 rounded-2xl sm:p-5"
        >
          <h2
            class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 sm:text-base"
          >
            <i class="pi pi-calendar text-merchant-primary"></i>
            Jadwal Layanan
          </h2>
          <div class="space-y-3">
            <div class="relative">
              <input
                v-model="form.tanggalLabel"
                readonly
                @click="calendarOpen = true"
                class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
              />
              <span class="absolute -translate-y-1/2 right-3 top-1/2">
                <i class="text-gray-400 pi pi-calendar"></i>
              </span>
            </div>
            <div class="relative">
              <input
                v-model="form.waktu"
                readonly
                @click="openTimeOptions = true"
                class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-merchant-primary/70 focus:border-merchant-primary"
              />
              <span class="absolute -translate-y-1/2 right-3 top-1/2">
                <i class="text-gray-400 pi pi-clock"></i>
              </span>
            </div>
          </div>
        </section>

        <!-- Promo (hanya jika sudah login) -->
        <section
          v-if="!isGuest"
          class="overflow-hidden border border-gray-100 shadow-sm bg-white/95 rounded-2xl"
        >
          <div
            class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-lime-100 to-emerald-50"
          >
            <div class="text-sm font-semibold text-gray-800">
              {{
                selectedPromo
                  ? selectedPromo.title
                  : promos.length
                  ? "Pilih voucher diskon"
                  : "Tidak ada voucher tersedia"
              }}
            </div>
            <button
              class="px-3 py-1 text-xs font-semibold rounded-full"
              style="background: #ffa30e; color: #fff"
              :disabled="!promos.length"
              @click="selectedPromo ? clearPromo() : usePromo(promos[0])"
            >
              {{ selectedPromo ? "Batalkan" : "Pakai" }}
            </button>
          </div>

          <button
            class="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700"
            :disabled="!promos.length"
            @click="openPromo = true"
          >
            Lihat promo lainnya
            <span>➜</span>
          </button>
        </section>

        <!-- Ringkasan Pembayaran -->
        <section
          class="p-4 border border-gray-100 shadow-sm bg-white/95 rounded-2xl sm:p-5"
        >
          <h2
            class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900 sm:text-base"
          >
            <i class="pi pi-wallet text-merchant-primary"></i>
            Ringkasan Pembayaran
          </h2>

          <div class="space-y-3">
            <div class="text-sm text-gray-600">Metode Pembayaran</div>
            <div class="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
              <label
                class="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition text-xs sm:text-sm"
                :class="
                  pay.method === 'COD'
                    ? 'bg-merchant-primary text-white border-merchant-primary shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary/70'
                "
              >
                <input
                  type="radio"
                  value="COD"
                  v-model="pay.method"
                  class="accent-merchant-primary"
                />
                <span>COD</span>
              </label>
              <label
                v-if="
                  order.paymentMethods.includes('qris') ||
                  order.paymentMethods.includes('QRIS')
                "
                class="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition text-xs sm:text-sm"
                :class="
                  pay.method === 'QRIS'
                    ? 'bg-merchant-primary text-white border-merchant-primary shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-merchant-primary/70'
                "
              >
                <input
                  type="radio"
                  value="QRIS"
                  v-model="pay.method"
                  class="accent-merchant-primary"
                />
                <span>QRIS</span>
              </label>
            </div>

            <div class="pt-2 space-y-1 text-sm text-gray-700">
              <div class="flex justify-between">
                <span>Harga Jasa</span>
                <span>Rp {{ formatIDR(amounts.jasa) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Biaya Pengantaran</span>
                <span>Rp {{ formatIDR(amounts.ongkir) }}</span>
              </div>
              <div class="flex justify-between">
                <span>
                  Diskon
                  <span
                    v-if="selectedPromo"
                    class="font-semibold text-amber-600"
                    >({{ selectedPromo.code }})</span
                  >
                </span>
                <span>-Rp {{ formatIDR(amounts.diskon) }}</span>
              </div>
              <div class="my-1 border-t border-gray-300"></div>
              <div
                class="flex items-center justify-between px-3 py-2 mt-1 text-sm font-semibold bg-amber-50 rounded-xl"
              >
                <span>Total Pembayaran</span>
                <span>Rp {{ formatIDR(total) }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Bubble Notifikasi dengan tombol OK -->
    <transition name="fade">
      <div
        v-if="errorMessage || successMessage"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm sm:backdrop-blur"
      >
        <!-- backdrop untuk blok semua interaksi di belakang -->
        <div class="absolute inset-0"></div>

        <div
          class="relative max-w-sm w-[90%] sm:w-auto rounded-2xl shadow-lg px-4 py-3 flex flex-col gap-2 text-xs sm:text-sm border bg-opacity-95"
          :class="
            errorMessage
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          "
        >
          <p class="leading-snug">
            {{ errorMessage || successMessage }}
          </p>
          <button
            type="button"
            class="self-end mt-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
            :class="
              errorMessage
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            "
            @click="clearNotification"
          >
            Oke
          </button>
        </div>
      </div>
    </transition>

    <!-- Bottom bar (Total + Chat button) -->
    <div
      class="fixed left-0 right-0 bottom-16 sm:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-4 py-3"
    >
      <div class="max-w-screen-sm mx-auto space-y-1.5">
        <div
          class="flex items-center justify-between text-xs font-semibold text-gray-900 sm:text-sm"
        >
          <span>Total Pembayaran</span>
          <span>Rp {{ formatIDR(total) }}</span>
        </div>
        <p class="text-[11px] text-gray-500">
          Pesanan akan dikirim ke chat penjual.
        </p>

        <button
          class="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-[#FFA30E] to-[#ffba3d] hover:from-[#e5920d] hover:to-[#ffb024] text-white font-semibold text-center transition shadow-md"
          @click="sendToChat"
        >
          <i class="text-sm pi pi-send"></i>
          <span>Pesan Sekarang</span>
        </button>
      </div>
    </div>

    <!-- Bottom Sheet Promo List -->
    <transition name="fade">
      <div v-if="openPromo && !isGuest" class="fixed inset-0 z-40">
        <div
          class="absolute inset-0 bg-black/40"
          @click="openPromo = false"
        ></div>
        <div
          class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto"
        >
          <div class="w-12 h-1 mx-auto mb-3 bg-gray-300 rounded-full"></div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold text-gray-900">Pilih Promo</h3>
            <button class="text-gray-500" @click="openPromo = false">✕</button>
          </div>

          <div class="space-y-3">
            <div
              v-if="promosLoading"
              class="py-6 text-sm text-center text-gray-500"
            >
              Memuat voucher...
            </div>

            <div
              v-else-if="!promos.length"
              class="py-6 text-sm text-center text-gray-500"
            >
              Tidak ada voucher tersedia
            </div>

            <div
              v-for="p in promos"
              :key="p.code"
              class="overflow-hidden border border-gray-200 rounded-xl"
            >
              <div
                class="flex items-center justify-between px-4 py-3 bg-gray-50"
              >
                <div>
                  <div class="text-sm font-semibold text-gray-800">
                    {{ p.title }}
                  </div>
                  <div class="text-xs text-gray-600">{{ p.desc }}</div>
                </div>
                <button
                  class="px-3 py-1 text-xs font-semibold rounded-full"
                  :class="
                    selectedPromo && selectedPromo.code === p.code
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-900'
                  "
                  @click="usePromo(p)"
                >
                  {{
                    selectedPromo && selectedPromo.code === p.code
                      ? "Dipakai"
                      : "Gunakan"
                  }}
                </button>
              </div>

              <div class="px-4 py-3 text-xs text-gray-600">
                Kode:
                <span class="font-mono font-semibold">{{ p.code }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <button
              class="px-4 py-2 border border-gray-200 rounded-lg"
              @click="openPromo = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet Pilih Alamat -->
    <transition name="fade">
      <div v-if="openAlamatOptions" class="fixed inset-0 z-40">
        <div
          class="absolute inset-0 bg-black/40"
          @click="openAlamatOptions = false"
        ></div>
        <div
          class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto"
        >
          <div class="w-12 h-1 mx-auto mb-3 bg-gray-300 rounded-full"></div>
          <div class="mb-3">
            <h3 class="text-base font-semibold text-gray-900">
              Pilih Sumber Alamat
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Kamu bisa gunakan alamat profil atau lokasi perangkat.
            </p>
          </div>

          <div class="space-y-3 text-sm">
            <button
              type="button"
              class="flex items-center w-full gap-3 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
              @click="useProfileAddress"
            >
              <span
                class="flex items-center justify-center w-8 h-8 text-lg rounded-full bg-emerald-100 text-emerald-600"
              >
                <i class="pi pi-user"></i>
              </span>
              <div class="flex-1 text-left">
                <p class="font-semibold text-gray-800">Alamat Profil</p>
                <p class="text-xs text-gray-500">
                  Gunakan alamat yang tersimpan di profil kamu jika tersedia.
                </p>
              </div>
            </button>

            <button
              type="button"
              class="flex items-center w-full gap-3 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
              @click="useDeviceLocation"
            >
              <span
                class="flex items-center justify-center w-8 h-8 text-lg text-blue-600 bg-blue-100 rounded-full"
              >
                <i class="pi pi-map-marker"></i>
              </span>
              <div class="flex-1 text-left">
                <p class="font-semibold text-gray-800">Lokasi Perangkat</p>
                <p class="text-xs text-gray-500">
                  Deteksi lokasi sekarang dan isi alamat dengan koordinat.
                </p>
              </div>
            </button>
          </div>

          <div class="flex justify-end mt-4">
            <button
              class="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              @click="openAlamatOptions = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Bottom Sheet Pilih Jam Layanan -->
    <transition name="fade">
      <div v-if="openTimeOptions" class="fixed inset-0 z-40">
        <div
          class="absolute inset-0 bg-black/40"
          @click="openTimeOptions = false"
        ></div>
        <div
          class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto"
        >
          <div class="w-12 h-1 mx-auto mb-3 bg-gray-300 rounded-full"></div>
          <div class="mb-3">
            <h3 class="text-base font-semibold text-gray-900">
              Pilih Jam Layanan
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Pilih salah satu jam yang tersedia atau isi manual di kolom waktu.
            </p>
          </div>

          <div class="space-y-3 text-sm">
            <div v-if="times.morning.length" class="space-y-2">
              <p class="text-xs font-semibold text-gray-500 uppercase">Pagi</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="t in times.morning"
                  :key="'m-' + t"
                  type="button"
                  class="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-amber-50"
                  @click="
                    form.waktu = t;
                    openTimeOptions = false;
                  "
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <div v-if="times.afternoon.length" class="space-y-2">
              <p class="text-xs font-semibold text-gray-500 uppercase">
                Siang / Sore
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="t in times.afternoon"
                  :key="'a-' + t"
                  type="button"
                  class="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-amber-50"
                  @click="
                    form.waktu = t;
                    openTimeOptions = false;
                  "
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <div v-if="times.evening.length" class="space-y-2">
              <p class="text-xs font-semibold text-gray-500 uppercase">Malam</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="t in times.evening"
                  :key="'e-' + t"
                  type="button"
                  class="px-3 py-1.5 rounded-full border border-gray-300 text-xs hover:bg-amber-50"
                  @click="
                    form.waktu = t;
                    openTimeOptions = false;
                  "
                >
                  {{ t }}
                </button>
              </div>
            </div>
          </div>

          <div
            class="mt-4 flex justify-between items-center gap-2 text-[11px] text-gray-500"
          >
            <p>
              Ingin jam di luar pilihan? Tutup dan ketik manual di kolom waktu.
            </p>
            <button
              class="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg"
              @click="openTimeOptions = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Overlay Ringkasan Pemesanan (Card) -->
    <transition name="fade">
      <div
        v-if="showChat"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm sm:backdrop-blur-md"
      >
        <div
          class="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh] sm:max-h-[85vh]"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200"
          >
            <h2 class="text-sm font-semibold text-gray-900">
              Ringkasan Pemesanan
            </h2>
            <button
              class="text-sm text-gray-500 hover:text-gray-700"
              @click="showChat = false"
            >
              ✕
            </button>
          </div>
          <div class="flex flex-col flex-1 gap-4 p-4 bg-gray-50">
            <!-- Card ringkasan utama -->
            <div
              class="px-4 py-3 text-white transition cursor-pointer rounded-2xl bg-merchant-primary hover:bg-merchant-primary/90"
              @click="showDetails = !showDetails"
            >
              <p class="mb-1 text-xs opacity-90">Layanan Jasa</p>
              <p class="text-sm font-semibold truncate">
                {{ order.title }}
              </p>
              <p class="mt-1 text-sm font-medium">
                Rp {{ formatIDR(order.price) }}
              </p>
              <p
                class="text-[11px] mt-2 opacity-90 flex items-center justify-between"
              >
                <span>{{ form.tanggalLabel }} • {{ form.waktu }}</span>
                <span class="underline">
                  {{ showDetails ? "Sembunyikan detail" : "Lihat detail" }}
                </span>
              </p>
            </div>

            <!-- Detail pemesanan lengkap -->
            <div
              v-if="showDetails"
              class="px-4 py-3 text-xs text-gray-700 whitespace-pre-line bg-white border border-gray-200 rounded-2xl sm:text-sm"
            >
              {{ summaryText }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Kalender Pilih Tanggal (mengikuti hari operasional jasa) -->
    <CalendarModal
      v-model="selectedDate"
      :open="calendarOpen"
      :operating-days="jasaOperatingDays || ''"
      @close="calendarOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/libs/axios.js";
import CalendarModal from "@/components/CalendarModal.vue";
import { useVouchers } from "@/composables/useVouchers";

const route = useRoute();
const router = useRouter();
// ===== Data dari query =====
const order = {
  id: route.query.id || null,
  title: route.query.title || "Nama Jasa",
  image: route.query.image || "",
  price: Number(route.query.price || 0),
  tglISO: route.query.tgl || "",
  waktu: route.query.waktu || "",
  priceType: route.query.price_type || "",
  paymentMethods: (route.query.payment_methods || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean),
};

const goBack = () => {
  router.back();
};

// Jenis layanan jasa (online / di lokasi penyedia / ke lokasi pelanggan)
const serviceType = ref(route.query.service_type || null);

// ===== Form =====
const form = ref({
  nama: "",
  tel: "",
  alamat: route.query.alamat || "",
  catatan: route.query.catatan || "",
  catatanAlamat: route.query.catatanAlamat || "",
  tanggalISO: order.tglISO,
  tanggalLabel: fmtTanggal(order.tglISO),
  waktu: order.waktu || "—",
});

// ===== Jadwal (tanggal & jam) =====
const calendarOpen = ref(false);
const selectedDate = ref(order.tglISO ? new Date(order.tglISO) : new Date());

// Simpan data jadwal & kontak dari jasa
const jasaOperatingDays = ref("");
const jasaOperatingTimes = ref("");
const jasaWhatsappLink = ref("");

// Helper tanggal
const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// ===== Nominal (default mengikuti harga jasa) =====
const amounts = ref({
  jasa: Number(order.price || 0),
  ongkir: 0,
  diskon: 0,
});

const total = computed(() =>
  Math.max(0, amounts.value.jasa + amounts.value.ongkir - amounts.value.diskon)
);

// Label tipe harga untuk menandai harga tetap vs harga mulai
const orderPriceTypeLabel = computed(() => {
  if (order.priceType === "fixed") return "Harga Tetap";
  if (order.priceType === "base") return "Mulai dari";
  return "";
});
// Default metode: jika jasa hanya punya 1 metode, pakai itu; kalau tidak, COD.
const pay = ref({
  method:
    order.paymentMethods.length === 1 &&
    ["COD", "cod", "QRIS", "qris"].includes(order.paymentMethods[0])
      ? order.paymentMethods[0].toUpperCase()
      : "COD",
});

// Pesan error / sukses untuk ditampilkan di layar (bukan alert browser)
const errorMessage = ref("");
const successMessage = ref("");

const clearNotification = () => {
  errorMessage.value = "";
  successMessage.value = "";
};

const isOnlineService = computed(() => serviceType.value === "online");

// Validasi sederhana form sebelum lanjut pembayaran
const isFormValid = computed(() => {
  const needsAddress = !isOnlineService.value;
  return (
    (needsAddress ? !!form.value.alamat : true) &&
    !!pay.value.method &&
    form.value.tanggalLabel !== "—" &&
    !!form.value.waktu &&
    form.value.waktu !== "—"
  );
});

// Helper validasi nama (huruf dan spasi) & telp (angka saja)
function isValidName(value) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Huruf (termasuk aksen sederhana), spasi, titik, koma, apostrof, dan tanda hubung
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/.test(trimmed);
}

function isValidPhone(value) {
  if (!value) return false;
  const trimmed = String(value).trim();
  // Hanya angka, minimal 8 digit supaya tidak terlalu pendek
  return /^[0-9]{8,}$/.test(trimmed);
}

// Normalisasi input nomor telepon agar hanya berisi digit
function onPhoneInput(event) {
  const raw = event.target.value || "";
  const digits = raw.replace(/[^0-9]/g, "");
  form.value.tel = digits;
}

const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");
function fmtTanggal(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Default times jika tidak ada operating_times dari jasa
const defaultTimes = {
  morning: ["06.00", "08.30", "10.00"],
  afternoon: ["13.00", "15.00", "17.00"],
  evening: ["18.00", "19.00", "20.00"],
};

// Kelompokkan jam layanan dari operating_times jasa
const times = computed(() => {
  if (!jasaOperatingTimes.value) return defaultTimes;

  const operatingTimes = jasaOperatingTimes.value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  if (operatingTimes.length === 0) return defaultTimes;

  const morning = operatingTimes.filter((t) => {
    const hour = parseInt(t.split(".")[0]);
    return hour >= 6 && hour < 12;
  });

  const afternoon = operatingTimes.filter((t) => {
    const hour = parseInt(t.split(".")[0]);
    return hour >= 12 && hour < 18;
  });

  const evening = operatingTimes.filter((t) => {
    const hour = parseInt(t.split(".")[0]);
    return hour >= 18;
  });

  return { morning, afternoon, evening };
});

// Bottom sheet pilih jam
const openTimeOptions = ref(false);

// Sinkron selectedDate -> form tanggal
watch(
  selectedDate,
  (val) => {
    if (!val) return;
    form.value.tanggalISO = val.toISOString();
    form.value.tanggalLabel = fmtTanggal(form.value.tanggalISO);
  },
  { immediate: true }
);

// ===== Promo State =====
const openPromo = ref(false);
const selectedPromo = ref(null);
const merchantSlugForVouchers = ref(null);
const promos = computed(() =>
  (vouchers.value || []).map((v) => ({
    code: v.voucher_code,
    title: v.voucher_name,
    desc: v.voucher_description || "",
    type: v.voucher_type, // percent | fixed
    value: Number(v.value || 0),
    max_discount: Number(v.max_discount_amount || 0),
    min_purchase: Number(v.min_purchase_amount || 0),
    usage: v.usage,
    is_expired: v.is_expired,
  }))
);

function isPromoEligible(promo) {
  const subtotal = Number(amounts.value.jasa || 0);
  return !promo?.is_expired && subtotal >= Number(promo?.min_purchase || 0);
}

function computeDiscount(promo) {
  const subtotal = Number(amounts.value.jasa || 0);

  if (!promo) return 0;
  if (promo.is_expired) return 0;
  if (subtotal < Number(promo.min_purchase || 0)) return 0;

  if (promo.type === "fixed") {
    return Math.min(Number(promo.value || 0), subtotal);
  }

  if (promo.type === "percent") {
    let discount = Math.floor((Number(promo.value || 0) / 100) * subtotal);
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount;
    }
    return discount;
  }

  return 0;
}

function usePromo(p) {
  if (!p) return;

  if (!isPromoEligible(p)) {
    errorMessage.value = p?.is_expired
      ? "Voucher sudah tidak berlaku"
      : `Minimal pembelian Rp ${formatIDR(p?.min_purchase || 0)} untuk voucher ini`;
    return;
  }

  const discount = computeDiscount(p);
  if (discount <= 0) {
    selectedPromo.value = null;
    amounts.value.diskon = 0;
    return;
  }

  selectedPromo.value = p;
  amounts.value.diskon = discount;
  openPromo.value = false;
}

function clearPromo() {
  selectedPromo.value = null;
  amounts.value.diskon = 0;
}

watch(
  () => amounts.value.jasa,
  () => {
    if (selectedPromo.value) {
      const discount = computeDiscount(selectedPromo.value);
      if (discount <= 0) {
        clearPromo();
      } else {
        amounts.value.diskon = discount;
      }
    }
  }
);
// ===== Chat / WhatsApp integration =====
const showChat = ref(false);
const summaryText = ref("");
const showDetails = ref(false);

const authStore = useAuthStore();
const isGuest = computed(() => !authStore.isAuthenticated);

const { fetchVouchersByMerchant, vouchers, loading: promosLoading } =
  useVouchers();

// Modal pilihan alamat
const openAlamatOptions = ref(false);

// Coba gunakan alamat dari profil user (jika ada)
function useProfileAddress() {
  const user = authStore.user;
  // Sesuaikan jika nanti ada field alamat spesifik di profil
  const candidate =
    user?.address ||
    user?.alamat ||
    user?.profile?.address ||
    user?.profile?.alamat ||
    "";

  if (candidate) {
    form.value.alamat = candidate;
    openAlamatOptions.value = false;
    successMessage.value = "Alamat berhasil diisi dari profil.";
  } else {
    errorMessage.value =
      "Alamat profil belum tersedia. Silakan lengkapi profil atau gunakan lokasi perangkat.";
  }
}

// Helper: reverse geocode lat,lng menjadi alamat teks (best effort)
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    // gunakan display_name atau rangkai dari bagian alamat
    if (data.display_name) return data.display_name;
    if (data.address) {
      const a = data.address;
      const parts = [
        a.road,
        a.suburb,
        a.village || a.town || a.city,
        a.state,
        a.postcode,
        a.country,
      ].filter(Boolean);
      if (parts.length) return parts.join(", ");
    }
    return null;
  } catch (e) {
    console.error("Reverse geocode error", e);
    return null;
  }
}

// Gunakan geolocation perangkat untuk mengisi alamat sebagai koordinat
function useDeviceLocation() {
  if (!navigator.geolocation) {
    errorMessage.value =
      "Perangkat atau browser tidak mendukung deteksi lokasi otomatis.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Coba ubah koordinat menjadi alamat teks
      const pretty = await reverseGeocode(latitude, longitude);
      if (pretty) {
        form.value.alamat = pretty;
      } else {
        form.value.alamat = `Lokasi saat ini: ${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)}`;
      }
      openAlamatOptions.value = false;
      successMessage.value =
        "Lokasi perangkat berhasil dideteksi. Alamat sudah diisi otomatis, silakan cek kembali.";
    },
    (err) => {
      console.error("Geolocation error", err);
      errorMessage.value =
        "Gagal mendeteksi lokasi perangkat. Pastikan izin lokasi sudah diizinkan.";
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

// Isi nama & nomor telepon dari profil user (opsional, tetap bisa diedit manual)
function useProfileContact() {
  const user = authStore.user;
  if (!user) {
    errorMessage.value =
      "Silakan login terlebih dahulu agar data pemesan bisa diambil dari profil.";
    return;
  }

  const nameCandidate = user.name || user.full_name || user.profile?.name || "";
  const phoneCandidate =
    user.phone || user.no_telp || user.profile?.phone || "";

  if (!nameCandidate && !phoneCandidate) {
    errorMessage.value =
      "Data nama dan nomor telepon di profil belum lengkap. Silakan lengkapi profil terlebih dahulu.";
    return;
  }

  if (nameCandidate) {
    form.value.nama = nameCandidate;
  }
  if (phoneCandidate) {
    form.value.tel = phoneCandidate;
  }

  successMessage.value =
    "Data pemesan berhasil diisi dari profil. Kamu masih bisa mengubahnya jika perlu.";
}

// Ambil info jasa untuk jadwal (operating_days & operating_times) saat halaman dibuka
onMounted(async () => {
  if (!order.id) return;
  try {
    const { data } = await api.get(`/api/public/jasas/${order.id}`);
    const payload = data?.data ?? data;
    jasaOperatingDays.value = payload?.operating_days || "";
    jasaOperatingTimes.value = payload?.operating_times || "";
    jasaWhatsappLink.value = payload?.whatsapp_link || "";

    const merchantSlug =
      route.query.merchant_slug ||
      route.query.merchantSlug ||
      payload?.merchant?.slug ||
      payload?.merchant_slug ||
      payload?.merchantSlug ||
      null;

    merchantSlugForVouchers.value = merchantSlug;

    if (!isGuest.value && merchantSlug) {
      await fetchVouchersByMerchant(merchantSlug);
    }

    if (!serviceType.value && payload?.service_type) {
      serviceType.value = payload.service_type;
    }

    // Jika tanggal dari query kosong, set default ke hari pertama yang tersedia dalam 7 hari ke depan
    if (!order.tglISO && jasaOperatingDays.value) {
      const operatingDays = jasaOperatingDays.value
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !Number.isNaN(d));

      const today = atMidnight(new Date());
      for (let i = 0; i < 7; i++) {
        const checkDate = addDays(today, i);
        const jsDay = checkDate.getDay(); // 0 Minggu..6 Sabtu
        const dbDay = jsDay === 0 ? 7 : jsDay; // 1 Senin..7 Minggu
        if (operatingDays.includes(dbDay)) {
          selectedDate.value = checkDate;
          break;
        }
      }
    }
  } catch (e) {
    console.error("[PembayaranJasa] Gagal mengambil data jasa untuk jadwal", e);
  }
});

watch(
  isGuest,
  async (guest) => {
    if (guest) {
      openPromo.value = false;
      clearPromo();
      return;
    }

    if (merchantSlugForVouchers.value) {
      await fetchVouchersByMerchant(merchantSlugForVouchers.value);
    }
  },
  { immediate: true }
);

// Bangun pesan WhatsApp untuk dikirim ke penjual
function buildWhatsappMessage() {
  const lines = [
    "Halo, saya ingin memesan jasa berikut melalui Sumilir:",
    "",
    `Nama Pemesan : ${form.value.nama || "-"}`,
    `No. Telepon  : ${form.value.tel || "-"}`,
    "",
    `Jasa         : ${order.title}`,
    `Harga        : Rp ${formatIDR(order.price)}`,
  ];

  if (form.value.tanggalLabel && form.value.tanggalLabel !== "—") {
    lines.push(`Tanggal      : ${form.value.tanggalLabel}`);
  }
  if (form.value.waktu && form.value.waktu !== "—") {
    lines.push(`Waktu        : ${form.value.waktu}`);
  }

  if (!isOnlineService.value) {
    lines.push(`Alamat       : ${form.value.alamat || "-"}`);
  }

  if (form.value.catatan) {
    lines.push(`Catatan      : ${form.value.catatan}`);
  }
  if (form.value.catatanAlamat && !isOnlineService.value) {
    lines.push(`Catatan Alamat : ${form.value.catatanAlamat}`);
  }

  if (selectedPromo.value) {
    lines.push(
      "",
      `Kode Promo   : ${selectedPromo.value.code} (Diskon Rp ${formatIDR(
        amounts.value.diskon
      )})`
    );
  }

  lines.push(
    "",
    `Perkiraan Total : Rp ${formatIDR(total.value || order.price)}`
  );

  return lines.join("\n");
}

const sendToChat = async () => {
  // reset pesan
  errorMessage.value = "";
  successMessage.value = "";

  // Validasi khusus nama & nomor telepon
  if (!form.value.nama || !isValidName(form.value.nama)) {
    errorMessage.value = "Nama wajib diisi dan hanya boleh berisi huruf.";
    return;
  }

  if (!form.value.tel || !isValidPhone(form.value.tel)) {
    errorMessage.value =
      "Nomor telepon wajib diisi dan hanya boleh berisi angka (min. 8 digit).";
    return;
  }

  // Notif awal: pastikan form sudah terisi benar
  if (!isFormValid.value) {
    errorMessage.value = isOnlineService.value
      ? "Mohon lengkapi data pemesan, jadwal, dan metode pembayaran terlebih dahulu."
      : "Mohon lengkapi data pemesan, jadwal, alamat, dan metode pembayaran terlebih dahulu.";
    return;
  }

  const message = buildWhatsappMessage();
  if (!message) return;

  if (!jasaWhatsappLink.value) {
    errorMessage.value =
      "Nomor atau link WhatsApp penjual belum tersedia. Silakan hubungi penjual secara manual.";
    return;
  }

  // Susun URL WhatsApp
  const encoded = encodeURIComponent(message);
  let url = jasaWhatsappLink.value.trim();

  // Jika link sudah berbentuk URL lengkap
  if (
    url.startsWith("https://wa.me/6282138540196") ||
    url.startsWith("https://wa.me/6282138540196")
  ) {
    url += url.includes("?") ? `&text=${encoded}` : `?text=${encoded}`;
  } else {
    // Anggap sebagai nomor telepon (tanpa +), gunakan wa.me
    const phone = url.replace(/[^0-9]/g, "");
    url = `https://wa.me/6282138540196${phone}?text=${encoded}`;
  }

  // Redirect ke WhatsApp (tab baru jika memungkinkan)
  window.open(url, "_blank");
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
