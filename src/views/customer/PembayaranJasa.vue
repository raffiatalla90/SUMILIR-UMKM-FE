<template>
  <div class="min-h-screen bg-gray-50 pb-32 sm:pb-28">
    <!-- AppBar -->
    <header
      class="sticky top-0 z-10 bg-blue-600 text-white px-4 py-3 flex items-center gap-3"
    >
      <router-link
        :to="{ name: 'JasaDetail', params: { id: order.id } }"
        class="text-xl"
      >
        ←
      </router-link>
      <h1 class="font-semibold">Pesananmu</h1>
    </header>

    <main class="px-4 space-y-4 mt-4">
      <!-- Data Pemesan -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Data Pemesan</h2>
        <div class="space-y-3">
          <input
            v-model="form.nama"
            type="text"
            placeholder="Nama Lengkap"
            class="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            v-model="form.tel"
            type="tel"
            placeholder="Nomor Telp"
            class="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      </section>

      <!-- Detail Pesanan -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Detail Pesanan</h2>
        <div class="flex items-center gap-3">
          <div class="w-24 h-16 rounded-lg bg-gray-100 overflow-hidden">
            <img :src="order.image" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1">
            <div class="text-sm font-semibold text-gray-800">
              {{ order.title }}
            </div>
            <div class="text-sm text-gray-600">
              Rp {{ formatIDR(order.price) }}
            </div>
          </div>
        </div>
        <textarea
          v-model="form.catatan"
          rows="3"
          placeholder="Catatan tambahan"
          class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
        ></textarea>
      </section>

      <!-- Detail Alamat -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-semibold text-gray-800">Detail Alamat</h2>
          <button
            class="px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold"
          >
            Ganti Alamat
          </button>
        </div>
        <div class="text-sm text-gray-800 flex items-start gap-2">
          <span class="mt-0.5">📍</span>
          <p class="leading-snug">{{ form.alamat }}</p>
        </div>
        <input
          v-model="form.catatanAlamat"
          type="text"
          placeholder="Catatan alamat"
          class="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </section>

      <!-- Jadwal (auto filled) -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Jadwal</h2>
        <div class="space-y-3">
          <div class="relative">
            <input
              v-model="form.tanggalLabel"
              readonly
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2">
              <img :src="lokasiIcon" alt="" class="w-4 h-4 opacity-70" />
            </span>
          </div>
          <div class="relative">
            <input
              v-model="form.waktu"
              readonly
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2">
              <img :src="jamIcon" alt="" class="w-4 h-4 opacity-70" />
            </span>
          </div>
        </div>
      </section>

      <!-- Promo -->
      <section
        class="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div class="px-4 py-3 flex items-center justify-between bg-lime-100">
          <div class="text-sm font-semibold text-gray-800">
            {{ selectedPromo ? selectedPromo.title : 'Diskon 5%' }}
          </div>
          <button
            class="px-3 py-1 rounded-full text-xs font-semibold"
            style="background:#FFA30E; color:#fff;"
            @click="selectedPromo ? clearPromo() : usePromo(promos[0])"
          >
            {{ selectedPromo ? 'Batalkan' : 'Pakai' }}
          </button>
        </div>

        <button
          class="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-700"
          @click="openPromo = true"
        >
          Lihat promo lainnya
          <span>➜</span>
        </button>
      </section>

      <!-- Ringkasan Pembayaran -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ringkasan Pembayaran</h2>

        <div class="space-y-3">
          <div class="text-sm text-gray-600">Metode Pembayaran</div>
          <div class="flex items-center gap-6 text-sm">
            <label class="flex items-center gap-2">
              <input type="radio" value="COD" v-model="pay.method" />
              <span>COD</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="radio" value="QRIS" v-model="pay.method" />
              <span>Qris</span>
            </label>
          </div>

          <div class="pt-2 text-sm text-gray-700 space-y-1">
            <div class="flex justify-between">
              <span>Harga Jasa A</span>
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
                  class="text-amber-600 font-semibold"
                  >({{ selectedPromo.code }})</span
                >
              </span>
              <span>-Rp {{ formatIDR(amounts.diskon) }}</span>
            </div>
            <div class="border-t border-gray-300 my-1"></div>
            <div class="flex justify-between font-semibold">
              <span>Total Pembayaran</span>
              <span>Rp {{ formatIDR(total) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom bar (Total + WA button, versi seperti "Booking Sekarang") -->
    <div
      class="fixed left-0 right-0 bottom-16 sm:bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3"
    >
      <div class="max-w-screen-sm mx-auto space-y-2">
        <div
          class="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900"
        >
          <span>Total Pembayaran</span>
          <span>Rp {{ formatIDR(total) }}</span>
        </div>

        <button
          class="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold text-center transition"
          @click="openWhatsapp"
        >
          <img :src="waIcon" alt="WhatsApp" class="w-4 h-4" />
          <span>Pesan Sekarang</span>
        </button>
      </div>
    </div>

    <!-- Bottom Sheet Promo List -->
    <transition name="fade">
      <div v-if="openPromo" class="fixed inset-0 z-40">
        <div
          class="absolute inset-0 bg-black/40"
          @click="openPromo = false"
        ></div>
        <div
          class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[70vh] overflow-y-auto"
        >
          <div class="h-1 w-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-base font-semibold text-gray-900">Pilih Promo</h3>
            <button class="text-gray-500" @click="openPromo = false">✕</button>
          </div>

          <div class="space-y-3">
            <div
              v-for="p in promos"
              :key="p.code"
              class="rounded-xl border border-gray-200 overflow-hidden"
            >
              <div
                class="px-4 py-3 flex items-center justify-between bg-gray-50"
              >
                <div>
                  <div class="text-sm font-semibold text-gray-800">
                    {{ p.title }}
                  </div>
                  <div class="text-xs text-gray-600">{{ p.desc }}</div>
                </div>
                <button
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="
                    selectedPromo && selectedPromo.code === p.code
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-900'
                  "
                  @click="usePromo(p)"
                >
                  {{
                    selectedPromo && selectedPromo.code === p.code
                      ? 'Dipakai'
                      : 'Gunakan'
                  }}
                </button>
              </div>

              <div class="px-4 py-3 text-xs text-gray-600">
                Kode:
                <span class="font-mono font-semibold">{{ p.code }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              class="px-4 py-2 rounded-lg border border-gray-200"
              @click="openPromo = false"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import jamIcon from '@/assets/icons/Jam.png'
import lokasiIcon from '@/assets/icons/TitikLokasi.png'
import waIcon from '@/assets/icons/Whatsapp.png'

const route = useRoute()

// ===== Data dari query =====
const order = {
  id: route.query.id || null,
  title: route.query.title || 'Nama Jasa',
  image: route.query.image || '',
  price: Number(route.query.price || 0),
  tglISO: route.query.tgl || '',
  waktu: route.query.waktu || '',
}

// ===== Form =====
const form = ref({
  nama: '',
  tel: '',
  alamat: 'Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyuan…',
  catatan: '',
  catatanAlamat: '',
  tanggalISO: order.tglISO,
  tanggalLabel: fmtTanggal(order.tglISO),
  waktu: order.waktu || '—',
})

// ===== Nominal (default Rp 0) =====
const amounts = ref({
  jasa: 0,
  ongkir: 0,
  diskon: 0,
})

const total = computed(() =>
  Math.max(0, amounts.value.jasa + amounts.value.ongkir - amounts.value.diskon)
)
const pay = ref({ method: 'COD' })

const formatIDR = (v) => Number(v || 0).toLocaleString('id-ID')
function fmtTanggal(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ===== Promo Logic =====
const openPromo = ref(false)
const selectedPromo = ref(null)

const promos = ref([
  {
    code: 'PROMO5',
    title: 'Diskon 5%',
    desc: 'Potongan 5% dari harga jasa',
    type: 'percent',
    value: 5,
  },
  {
    code: 'PROMO2',
    title: 'Promo 2 - Cashback 10%',
    desc: 'Potongan 10% dari harga jasa',
    type: 'percent',
    value: 10,
  },
  {
    code: 'HEMAT5',
    title: 'Potongan Rp5.000',
    desc: 'Potongan flat 5rb',
    type: 'flat',
    value: 5000,
  },
])

function computeDiscount(promo) {
  const base = Number(order.price || 0)
  if (promo.type === 'percent') {
    return Math.round((promo.value / 100) * base)
  }
  return Math.max(0, Math.min(promo.value, base))
}

function usePromo(p) {
  selectedPromo.value = p
  amounts.value.diskon = computeDiscount(p)
  openPromo.value = false
}

function clearPromo() {
  selectedPromo.value = null
  amounts.value.diskon = 0
}

// ===== Buka WhatsApp =====
const WA_NUMBER = '6282138540196'

const openWhatsapp = () => {
  const text = [
    'Halo, saya ingin pesan jasa melalui Sumilir.',
    '',
    `Jasa     : ${order.title}`,
    `Harga    : Rp ${formatIDR(order.price)}`,
    `Tanggal  : ${form.value.tanggalLabel}`,
    `Waktu    : ${form.value.waktu}`,
    `Metode   : ${pay.value.method}`,
    '',
    `Nama     : ${form.value.nama || '-'}`,
    `Telp     : ${form.value.tel || '-'}`,
    `Alamat   : ${form.value.alamat || '-'}`,
    `Catatan  : ${form.value.catatan || '-'}`,
    `Catatan Alamat : ${form.value.catatanAlamat || '-'}`,
    '',
    selectedPromo.value
      ? `Kode Promo : ${selectedPromo.value.code} (Diskon Rp ${formatIDR(
          amounts.value.diskon
        )})`
      : '',
    `Perkiraan Total : Rp ${formatIDR(total.value || order.price)}`,
  ]
    .filter(Boolean)
    .join('\n')

  const url = `https://wa.me/${6285764134767}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}
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
