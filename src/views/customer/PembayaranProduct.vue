<template>
  <div class="min-h-screen bg-gray-50 pb-28 max-w-7xl mx-auto">
    <!-- AppBar -->
    <header
      class="sm:hidden sticky top-0 z-10 bg-[#FFA30E] text-white px-4 py-6 flex items-center gap-8"
    >
      <button @click="goBack" class="text-xl">←</button>
      <h1 class="font-semibold">Checkout Pesanan</h1>
    </header>

    <main class="px-4 space-y-4 mt-4">
      <!-- Detail Pesanan -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Detail Pesanan</h2>

        <div class="space-y-3">
          <!-- Product Item -->
          <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div
              class="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
            >
              <img
                :src="order.image || 'https://via.placeholder.com/80'"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-800 mb-1">
                {{ order.title }}
              </div>
              <div class="text-xs text-gray-600 space-y-0.5">
                <div v-if="order.size">Ukuran: {{ order.size }}</div>
                <div v-if="order.variant">Varian: {{ order.variant }}</div>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-sm font-semibold text-gray-900">
                  Rp {{ formatIDR(order.price) }}
                </span>
                <span class="text-sm text-gray-600">
                  x{{ order.quantity }}
                </span>
              </div>
            </div>
          </div>

          <!-- Addons jika ada -->
          <div v-if="order.addons && order.addons.length > 0" class="space-y-2">
            <div class="text-xs font-semibold text-gray-700">Tambahan:</div>
            <div
              v-for="(addon, idx) in order.addons"
              :key="idx"
              class="text-xs text-gray-600 flex items-center gap-1"
            >
              <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{{ addon }}</span>
            </div>
          </div>

          <!-- Catatan Produk -->
          <div>
            <label class="text-xs font-semibold text-gray-700 mb-1 block">
              Catatan untuk produk ini (opsional)
            </label>
            <textarea
              v-model="form.catatanProduk"
              rows="2"
              placeholder="Contoh: jangan terlalu pedas"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA30E]"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Metode Pengiriman -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Metode Pengiriman</h2>
        <div class="flex items-center gap-4 text-sm">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="delivery"
              v-model="form.metodePengiriman"
              class="w-4 h-4 text-[#FFA30E] focus:ring-[#FFA30E]"
            />
            <span>Diantar</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="pickup"
              v-model="form.metodePengiriman"
              class="w-4 h-4 text-[#FFA30E] focus:ring-[#FFA30E]"
            />
            <span>Ambil Sendiri</span>
          </label>
        </div>
      </section>

      <!-- Detail Alamat - hanya tampil jika diantar -->
      <section
        v-if="form.metodePengiriman === 'delivery'"
        class="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-800">Alamat Pengiriman</h2>
          <button
            @click="showAlamatModal = true"
            class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 transition"
          >
            {{ selectedAddress ? "Ganti Alamat" : "Pilih Alamat" }}
          </button>
        </div>

        <div v-if="selectedAddress" class="space-y-2">
          <div class="flex items-start gap-2 text-sm">
            <span class="text-lg mt-0.5">📍</span>
            <div class="flex-1">
              <div class="font-semibold text-gray-800">
                {{ selectedAddress.label }}
              </div>
              <p class="text-gray-600 leading-snug mt-1">
                {{ selectedAddress.fullAddress }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                {{ selectedAddress.penerima }} - {{ selectedAddress.telp }}
              </p>
            </div>
          </div>
          <input
            v-model="form.catatanAlamat"
            type="text"
            placeholder="Catatan alamat (mis: rumah cat hijau)"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA30E]"
          />
        </div>

        <div v-else class="text-sm text-gray-500 text-center py-4">
          Belum ada alamat dipilih
        </div>
      </section>

      <!-- Alamat Toko - untuk pickup -->
      <section
        v-if="form.metodePengiriman === 'pickup'"
        class="bg-white rounded-xl border border-gray-200 p-4"
      >
        <h2 class="font-semibold text-gray-800 mb-3">Lokasi Toko</h2>
        <div class="flex items-start gap-2 text-sm">
          <span class="text-lg mt-0.5">🏪</span>
          <div class="flex-1">
            <div class="font-semibold text-gray-800">
              {{ order.store?.name || "Sumber Rejeki" }}
            </div>
            <p class="text-gray-600 leading-snug mt-1">
              {{
                order.store?.address ||
                "Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyumanik, Semarang"
              }}
            </p>
          </div>
        </div>
      </section>

      <!-- Promo -->
      <section
        class="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div class="px-4 py-3 flex items-center justify-between bg-lime-50">
          <div class="text-sm font-semibold text-gray-800">
            {{
              selectedPromo ? selectedPromo.title : "Belum ada promo dipilih"
            }}
          </div>
          <button
            v-if="!selectedPromo"
            class="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFA30E] text-white hover:bg-[#e5920d] transition"
            @click="openPromo = true"
          >
            Pilih
          </button>
          <button
            v-else
            class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition"
            @click="clearPromo"
          >
            Batalkan
          </button>
        </div>

        <button
          class="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition"
          @click="openPromo = true"
        >
          Lihat promo lainnya
          <span>→</span>
        </button>
      </section>

      <!-- Ringkasan Pembayaran -->
      <section class="bg-white rounded-xl border border-gray-200 p-4">
        <h2 class="font-semibold text-gray-800 mb-3">Ringkasan Pembayaran</h2>

        <div class="space-y-3">
          <!-- Metode Pembayaran -->
          <div>
            <div class="text-sm text-gray-600 mb-2">Metode Pembayaran</div>
            <div class="flex items-center gap-6 text-sm">
              <label
                class="flex items-center gap-2"
                :class="
                  form.metodePengiriman === 'delivery'
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer'
                "
              >
                <input
                  type="radio"
                  value="COD"
                  v-model="pay.method"
                  :disabled="form.metodePengiriman === 'delivery'"
                  class="w-4 h-4 text-[#FFA30E] focus:ring-[#FFA30E] disabled:cursor-not-allowed"
                />
                <span>COD (Cash)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="QRIS"
                  v-model="pay.method"
                  class="w-4 h-4 text-[#FFA30E] focus:ring-[#FFA30E]"
                />
                <span>QRIS</span>
              </label>
            </div>

            <!-- Info message untuk delivery -->
            <p
              v-if="form.metodePengiriman === 'delivery'"
              class="text-xs text-amber-600 mt-2 flex items-start gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-4 h-4 flex-shrink-0 mt-0.5"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Untuk pengiriman, pembayaran wajib menggunakan QRIS</span>
            </p>
          </div>

          <!-- Rincian Harga -->
          <div
            class="pt-3 border-t border-gray-200 text-sm text-gray-700 space-y-2"
          >
            <div class="flex justify-between">
              <span> Harga Produk ({{ order.quantity }}x) </span>
              <span>Rp {{ formatIDR(amounts.product) }}</span>
            </div>

            <div
              v-if="form.metodePengiriman === 'delivery'"
              class="flex justify-between"
            >
              <span>Biaya Pengiriman</span>
              <span>Rp {{ formatIDR(amounts.ongkir) }}</span>
            </div>

            <div
              v-if="amounts.diskon > 0"
              class="flex justify-between text-green-600"
            >
              <span>
                Diskon
                <span
                  v-if="selectedPromo"
                  class="text-amber-600 font-semibold text-xs"
                >
                  ({{ selectedPromo.code }})
                </span>
              </span>
              <span>-Rp {{ formatIDR(amounts.diskon) }}</span>
            </div>

            <div class="border-t border-gray-300 my-2"></div>

            <div class="flex justify-between font-bold text-base">
              <span>Total Pembayaran</span>
              <span class="text-[#FFA30E]">Rp {{ formatIDR(total) }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom bar (Total + Pesan button) -->
    <footer
      class="fixed left-0 right-0 bottom-16 z-20 bg-white border-t border-gray-200 shadow-lg"
    >
      <div class="px-4 py-3 space-y-2 max-w-7xl mx-auto">
        <div
          class="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900"
        >
          <span>Total Pembayaran</span>
          <span class="text-[#FFA30E]">Rp {{ formatIDR(total) }}</span>
        </div>

        <button
          class="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold bg-[#FFA30E] hover:bg-[#e5920d] transition disabled:opacity-50 disabled:cursor-not-allowed"
          @click="openWhatsapp"
          :disabled="!isFormValid"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            />
          </svg>
          <span>Pesan via WhatsApp</span>
        </button>
      </div>
    </footer>

    <!-- Modal Pilih Alamat -->
    <ResponsiveModal
      :show="showAlamatModal"
      @close="showAlamatModal = false"
      title="Pilih Alamat Pengiriman"
      subtitle="Pilih alamat untuk pengiriman produk"
    >
      <div class="space-y-3">
        <button
          v-for="addr in addresses"
          :key="addr.id"
          @click="selectAddress(addr)"
          class="w-full text-left p-4 rounded-lg border transition"
          :class="
            selectedAddress?.id === addr.id
              ? 'border-[#FFA30E] bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          "
        >
          <div class="flex items-start gap-3">
            <input
              type="radio"
              :checked="selectedAddress?.id === addr.id"
              class="mt-1 w-4 h-4 text-[#FFA30E] focus:ring-[#FFA30E]"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900">{{
                  addr.label
                }}</span>
                <span
                  v-if="addr.isDefault"
                  class="px-2 py-0.5 text-xs font-medium bg-[#FFA30E] text-white rounded"
                >
                  Utama
                </span>
              </div>
              <p class="text-sm text-gray-600 leading-snug">
                {{ addr.fullAddress }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ addr.penerima }} - {{ addr.telp }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <template #footer>
        <button
          @click="showAlamatModal = false"
          class="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Tutup
        </button>
      </template>
    </ResponsiveModal>

    <!-- Modal Promo List -->
    <ResponsiveModal
      :show="openPromo"
      @close="openPromo = false"
      title="Pilih Promo"
      subtitle="Gunakan promo untuk mendapat potongan harga"
    >
      <div class="space-y-3">
        <div
          v-for="p in promos"
          :key="p.code"
          class="rounded-xl border overflow-hidden"
          :class="
            selectedPromo?.code === p.code
              ? 'border-[#FFA30E] bg-orange-50'
              : 'border-gray-200'
          "
        >
          <div class="px-4 py-3 flex items-center justify-between">
            <div class="flex-1">
              <div class="text-sm font-semibold text-gray-800">
                {{ p.title }}
              </div>
              <div class="text-xs text-gray-600 mt-0.5">{{ p.desc }}</div>
              <div class="text-xs text-gray-500 mt-1">
                Kode: <span class="font-mono font-semibold">{{ p.code }}</span>
              </div>
            </div>
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="
                selectedPromo?.code === p.code
                  ? 'bg-[#FFA30E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              @click="usePromo(p)"
            >
              {{ selectedPromo?.code === p.code ? "Terpilih" : "Gunakan" }}
            </button>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          @click="openPromo = false"
          class="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Tutup
        </button>
      </template>
    </ResponsiveModal>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";

const route = useRoute();
const router = useRouter();

// ===== Data dari query =====
const order = {
  slug: route.query.slug || null,
  title: route.query.title || "Nama Produk",
  image: route.query.image || "",
  price: Number(route.query.price || 0),
  size: route.query.size || "",
  variant: route.query.variant || "",
  addons: route.query.addons ? JSON.parse(route.query.addons) : [],
  quantity: Number(route.query.quantity || 1),
  store: {
    name: "Sumber Rejeki",
    address: "Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyumanik, Semarang",
    phone: "6285764134767", // Nomor WA merchant
  },
};

// ===== Form =====
const form = ref({
  nama: "",
  tel: "",
  metodePengiriman: "delivery", // delivery atau pickup
  catatanProduk: "",
  catatanAlamat: "",
});

// ===== Alamat =====
const showAlamatModal = ref(false);
const selectedAddress = ref(null);

const addresses = ref([
  {
    id: 1,
    label: "Rumah",
    penerima: "John Doe",
    telp: "08123456789",
    fullAddress:
      "Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyumanik, Semarang, Jawa Tengah 50268",
    isDefault: true,
  },
  {
    id: 2,
    label: "Kantor",
    penerima: "John Doe",
    telp: "08123456789",
    fullAddress: "Jl. Pemuda No 123, Simpang Lima, Semarang, Jawa Tengah 50132",
    isDefault: false,
  },
  {
    id: 3,
    label: "Kos",
    penerima: "John Doe",
    telp: "08123456789",
    fullAddress:
      "Jl. Ngesrep Timur V No 10, Banyumanik, Semarang, Jawa Tengah 50261",
    isDefault: false,
  },
]);

// Set default address
if (!selectedAddress.value) {
  selectedAddress.value =
    addresses.value.find((a) => a.isDefault) || addresses.value[0];
}

const selectAddress = (addr) => {
  selectedAddress.value = addr;
  showAlamatModal.value = false;
};

// ===== Nominal =====
const amounts = ref({
  product: order.price, // Total harga produk sudah termasuk quantity dan addon
  ongkir: 10000, // Biaya pengiriman default
  diskon: 0,
});

// ===== Payment Method =====
const pay = ref({ method: "QRIS" }); // Default QRIS karena default delivery

// Watch metode pengiriman dan auto-set payment method
watch(
  () => form.value.metodePengiriman,
  (newVal) => {
    // Update ongkir
    amounts.value.ongkir = newVal === "pickup" ? 0 : 10000;

    // Force QRIS jika delivery, allow COD jika pickup
    if (newVal === "delivery") {
      pay.value.method = "QRIS";
    }
    // Jika pickup, biarkan user pilih (default tetap QRIS atau bisa COD)
  }
);

const total = computed(() =>
  Math.max(
    0,
    amounts.value.product + amounts.value.ongkir - amounts.value.diskon
  )
);

const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");

// ===== Promo Logic =====
const openPromo = ref(false);
const selectedPromo = ref(null);

const promos = ref([
  {
    code: "PROMO5",
    title: "Diskon 5%",
    desc: "Potongan 5% dari harga produk",
    type: "percent",
    value: 5,
  },
  {
    code: "PROMO10",
    title: "Diskon 10%",
    desc: "Potongan 10% dari harga produk",
    type: "percent",
    value: 10,
  },
  {
    code: "HEMAT5K",
    title: "Potongan Rp5.000",
    desc: "Potongan flat 5rb",
    type: "flat",
    value: 5000,
  },
  {
    code: "ONGKIR0",
    title: "Gratis Ongkir",
    desc: "Gratis biaya pengiriman",
    type: "ongkir",
    value: 0,
  },
]);

function computeDiscount(promo) {
  if (promo.type === "ongkir") {
    return amounts.value.ongkir;
  }

  const base = amounts.value.product;
  if (promo.type === "percent") {
    return Math.round((promo.value / 100) * base);
  }
  return Math.max(0, Math.min(promo.value, base));
}

function usePromo(p) {
  selectedPromo.value = p;
  amounts.value.diskon = computeDiscount(p);
  openPromo.value = false;
}

function clearPromo() {
  selectedPromo.value = null;
  amounts.value.diskon = 0;
}

// ===== Validasi Form =====
const isFormValid = computed(() => {
  if (!form.value.nama || !form.value.tel) return false;
  if (form.value.metodePengiriman === "delivery" && !selectedAddress.value)
    return false;
  return true;
});

// ===== Buka WhatsApp ke Merchant =====
const openWhatsapp = () => {
  if (!isFormValid.value) {
    alert("Mohon lengkapi data pemesan dan pilih alamat (jika diantar)");
    return;
  }

  const productDetails = [
    `Produk: ${order.title}`,
    order.size ? `Ukuran: ${order.size}` : "",
    order.variant ? `Varian: ${order.variant}` : "",
    order.addons.length > 0 ? `Tambahan: ${order.addons.join(", ")}` : "",
    `Jumlah: ${order.quantity}x`,
  ]
    .filter(Boolean)
    .join("\n");

  const deliveryInfo =
    form.value.metodePengiriman === "delivery"
      ? [
          "\n*PENGIRIMAN*",
          "Metode: Diantar",
          `Alamat: ${selectedAddress.value.fullAddress}`,
          `Penerima: ${selectedAddress.value.penerima} (${selectedAddress.value.telp})`,
          form.value.catatanAlamat
            ? `Catatan Alamat: ${form.value.catatanAlamat}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : [
          "\n*PENGIRIMAN*",
          "Metode: Ambil Sendiri",
          `Lokasi Toko: ${order.store.address}`,
        ].join("\n");

  const text = [
    "*PESANAN BARU DARI SUMILIR*",
    "",
    "*DATA PEMESAN*",
    `Nama: ${form.value.nama}`,
    `Telp: ${form.value.tel}`,
    "",
    "*DETAIL PESANAN*",
    productDetails,
    form.value.catatanProduk ? `Catatan: ${form.value.catatanProduk}` : "",
    deliveryInfo,
    "",
    "*PEMBAYARAN*",
    `Metode: ${pay.value.method}`,
    "",
    "*RINCIAN HARGA*",
    `Harga Produk: Rp ${formatIDR(amounts.value.product)}`,
    form.value.metodePengiriman === "delivery"
      ? `Ongkir: Rp ${formatIDR(amounts.value.ongkir)}`
      : "",
    amounts.value.diskon > 0
      ? `Diskon (${selectedPromo.value?.code}): -Rp ${formatIDR(
          amounts.value.diskon
        )}`
      : "",
    `*Total: Rp ${formatIDR(total.value)}*`,
  ]
    .filter(Boolean)
    .join("\n");

  const merchantPhone = order.store.phone;
  const url = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* Custom scrollbar untuk modal */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
