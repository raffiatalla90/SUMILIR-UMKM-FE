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
          <span class="mt-0.5">
            <i class="pi pi-map-marker text-gray-500"></i>
          </span>
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
              <i class="pi pi-calendar text-gray-400"></i>
            </span>
          </div>
          <div class="relative">
            <input
              v-model="form.waktu"
              readonly
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2">
              <i class="pi pi-clock text-gray-400"></i>
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
            <label
              v-if="order.paymentMethods.includes('qris') || order.paymentMethods.includes('QRIS')"
              class="flex items-center gap-2"
            >
              <input type="radio" value="QRIS" v-model="pay.method" />
              <span>QRIS</span>
            </label>
          </div>

          <div class="pt-2 text-sm text-gray-700 space-y-1">
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
          :class="errorMessage
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'"
        >
          <p class="leading-snug">
            {{ errorMessage || successMessage }}
          </p>
          <button
            type="button"
            class="self-end mt-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
            :class="errorMessage
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'"
            @click="clearNotification"
          >
            Oke
          </button>
        </div>
      </div>
    </transition>

    <!-- Bottom bar (Total + Chat button) -->
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
          @click="sendToChat"
        >
          <i class="pi pi-comments text-sm"></i>
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

    <!-- Overlay Ringkasan Pemesanan (Card) -->
    <transition name="fade">
      <div
        v-if="showChat"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm sm:backdrop-blur-md px-4"
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
              class="text-gray-500 text-sm hover:text-gray-700"
              @click="showChat = false"
            >
              ✕
            </button>
          </div>
          <div class="flex-1 flex flex-col bg-gray-50 p-4 gap-4">
            <!-- Card ringkasan utama -->
            <div
              class="rounded-2xl bg-merchant-primary text-white px-4 py-3 cursor-pointer hover:bg-merchant-primary/90 transition"
              @click="showDetails = !showDetails"
            >
              <p class="text-xs opacity-90 mb-1">Layanan Jasa</p>
              <p class="text-sm font-semibold truncate">
                {{ order.title }}
              </p>
              <p class="text-sm mt-1 font-medium">
                Rp {{ formatIDR(order.price) }}
              </p>
              <p class="text-[11px] mt-2 opacity-90 flex items-center justify-between">
                <span>{{ form.tanggalLabel }} • {{ form.waktu }}</span>
                <span class="underline">
                  {{ showDetails ? 'Sembunyikan detail' : 'Lihat detail' }}
                </span>
              </p>
            </div>

            <!-- Detail pemesanan lengkap -->
            <div
              v-if="showDetails"
              class="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-xs sm:text-sm text-gray-700 whitespace-pre-line"
            >
              {{ summaryText }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
// ===== Data dari query =====
const order = {
  id: route.query.id || null,
  title: route.query.title || 'Nama Jasa',
  image: route.query.image || '',
  price: Number(route.query.price || 0),
  tglISO: route.query.tgl || '',
  waktu: route.query.waktu || '',
  paymentMethods: (route.query.payment_methods || '').split(',').map((m) => m.trim()).filter(Boolean),
}

// ===== Form =====
const form = ref({
  nama: '',
  tel: '',
  alamat:
    route.query.alamat || 'Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyuan…',
  catatan: route.query.catatan || '',
  catatanAlamat: route.query.catatanAlamat || '',
  tanggalISO: order.tglISO,
  tanggalLabel: fmtTanggal(order.tglISO),
  waktu: order.waktu || '—',
})

// ===== Nominal (default mengikuti harga jasa) =====
const amounts = ref({
  jasa: Number(order.price || 0),
  ongkir: 0,
  diskon: 0,
})

const total = computed(() =>
  Math.max(0, amounts.value.jasa + amounts.value.ongkir - amounts.value.diskon)
)
// Default metode: jika jasa hanya punya 1 metode, pakai itu; kalau tidak, COD.
const pay = ref({
  method:
    order.paymentMethods.length === 1 && ['COD', 'cod', 'QRIS', 'qris'].includes(order.paymentMethods[0])
      ? order.paymentMethods[0].toUpperCase()
      : 'COD',
})

// Pesan error / sukses untuk ditampilkan di layar (bukan alert browser)
const errorMessage = ref('')
const successMessage = ref('')

const clearNotification = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// Validasi sederhana form sebelum lanjut pembayaran
const isFormValid = computed(() => {
  return (
    !!form.value.alamat &&
    !!pay.value.method &&
    form.value.tanggalLabel !== '—' &&
    !!form.value.waktu &&
    form.value.waktu !== '—'
  )
})

// Helper validasi nama (huruf dan spasi) & telp (angka saja)
function isValidName(value) {
  if (!value) return false
  const trimmed = value.trim()
  if (!trimmed) return false
  // Huruf (termasuk aksen sederhana), spasi, titik, koma, apostrof, dan tanda hubung
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/.test(trimmed)
}

function isValidPhone(value) {
  if (!value) return false
  const trimmed = String(value).trim()
  // Hanya angka, minimal 8 digit supaya tidak terlalu pendek
  return /^[0-9]{8,}$/.test(trimmed)
}

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

// ===== Promo State =====
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
// ===== Chat integration =====
const showChat = ref(false)
const summaryText = ref('')
const showDetails = ref(false)
const conversationId = ref(null)

const authStore = useAuthStore()
const { startConversation, sendMessage } = useChat()

function buildChatSummary() {
  const lines = [
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
  ]

  if (selectedPromo.value) {
    lines.push(
      '',
      `Kode Promo : ${selectedPromo.value.code} (Diskon Rp ${formatIDR(
        amounts.value.diskon
      )})`
    )
  }

  lines.push(
    '',
    `Perkiraan Total : Rp ${formatIDR(total.value || order.price)}`
  )

  return lines.join('\n')
}

const sendToChat = async () => {
  // reset pesan
  errorMessage.value = ''
  successMessage.value = ''

  // Validasi khusus nama & nomor telepon
  if (!form.value.nama || !isValidName(form.value.nama)) {
    errorMessage.value = 'Nama wajib diisi dan hanya boleh berisi huruf.'
    return
  }

  if (!form.value.tel || !isValidPhone(form.value.tel)) {
    errorMessage.value =
      'Nomor telepon wajib diisi dan hanya boleh berisi angka (min. 8 digit).'
    return
  }

  // Notif awal: pastikan form sudah terisi benar
  if (!isFormValid.value) {
    errorMessage.value =
      'Mohon lengkapi data pemesan, jadwal, alamat, dan metode pembayaran terlebih dahulu.'
    return
  }

  // Cek login, karena chat butuh user terautentikasi
  if (!authStore.user) {
    errorMessage.value =
      'Silakan login terlebih dahulu untuk mengirim pesanan ke chat penjual.'
    return
  }

  const summary = buildChatSummary()
  if (!summary) return

  try {
    // Mulai atau ambil percakapan untuk jasa ini
    const convo = await startConversation(order.id)
    conversationId.value = convo?.id || null

    if (conversationId.value) {
      await sendMessage(conversationId.value, summary)
    }

    successMessage.value =
      'Pembayaran berhasil! Detail pesanan kamu otomatis dikirim ke chat penjual.'

    summaryText.value = summary
    showDetails.value = true
    showChat.value = true
  } catch (e) {
    console.error('Gagal mengirim pesan ke chat', e)
    errorMessage.value =
      'Pesanan berhasil dibuat, namun gagal mengirim ke chat. Silakan coba lagi dari halaman chat.'
  }
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
