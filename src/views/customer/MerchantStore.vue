<template>
  <div class="min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="w-full">
      <!-- Header Skeleton -->
      <div class="relative">
        <!-- Hero Skeleton -->
        <div
          class="relative w-full overflow-hidden bg-gray-200 animate-pulse aspect-24/9 lg:aspect-4/1"
          aria-hidden="true"
        ></div>

        <!-- Merchant Card Skeleton (Overlay) -->
        <div class="relative w-11/12 max-w-3xl mx-auto -mt-8">
          <div class="p-4 bg-white shadow-lg rounded-2xl">
            <div class="flex items-start gap-4">
              <div
                class="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse shrink-0"
                aria-hidden="true"
              ></div>
              <div class="flex-1 min-w-0 pt-1">
                <div
                  class="w-2/3 h-6 bg-gray-200 rounded animate-pulse"
                  aria-hidden="true"
                ></div>
                <div class="flex items-center gap-2 mt-3">
                  <div
                    class="w-16 h-6 bg-gray-200 rounded-full animate-pulse"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="w-24 h-4 bg-gray-200 rounded animate-pulse"
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Skeleton -->
      <div class="px-4 mx-auto mt-6 max-w-7xl">
        <div
          class="flex gap-1 p-1 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <div class="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div class="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <!-- Content Skeleton (Grid) -->
      <div class="px-4 py-4 mx-auto max-w-7xl">
        <div
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <ProductCardSkeleton v-for="i in 12" :key="'merchant-skel-' + i" />
        </div>
      </div>
    </div>

    <template v-else-if="merchant">
      <!-- Header dengan Hero Image -->
      <div class="relative">
        <!-- Hero Background Image -->
        <div
          class="relative w-full overflow-hidden bg-linear-to-b from-gray-200 to-gray-100 aspect-24/9 lg:aspect-4/1"
        >
          <img
            v-if="merchant.banner_url"
            :src="merchant.banner_url"
            alt="Background"
            class="absolute inset-0 object-cover w-full h-full"
          />
          <div
            v-else
            class="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted-background to-muted-foreground"
            aria-hidden="true"
          >
            <span>
              <svg
                class="w-12 h-12 text-white sm:w-16 sm:h-16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM5 19V5h14v14H5zm8-7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-6 7l3-4 2.5 3 3.5-5 4 6H7z"
                />
              </svg>
            </span>
          </div>

          <!-- Back Button -->
          <button
            @click="$router.back()"
            class="absolute flex items-center justify-center w-10 h-10 transition rounded-full shadow-lg sm:hidden top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <i class="text-gray-700 pi pi-arrow-left"></i>
          </button>
        </div>

        <!-- Card Info Toko (Overlay) -->
        <div class="relative w-11/12 max-w-3xl mx-auto -mt-8">
          <div class="p-4 bg-white shadow-lg rounded-2xl">
            <div class="flex items-start gap-4">
              <!-- Logo Toko -->
              <div
                class="flex items-center justify-center w-20 h-20 overflow-hidden border shadow-inner rounded-2xl bg-white/20 backdrop-blur-sm shrink-0 border-white/30"
              >
                <img
                  v-if="merchant.logo_url"
                  :src="merchant.logo_url"
                  alt="Logo Toko"
                  class="object-cover w-full h-full"
                />
                <span v-else>
                  <svg
                    class="w-20 h-20 p-2 text-gray-300 bg-gray-100 border-4 border-white shadow-lg rounded-2xl"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 6H6v-6h6v6z"
                    />
                  </svg>
                </span>
              </div>

              <!-- Info Toko -->
              <div class="flex-1 min-w-0 pt-1">
                <h1 class="text-xl font-bold text-black">
                  {{ merchant.name }}
                </h1>

                <div class="mt-2.5 flex items-center gap-2">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold shadow-sm',
                      merchant.is_open_now
                        ? 'bg-success-background text-success-foreground'
                        : 'bg-danger-background text-danger-foreground',
                    ]"
                  >
                    {{ merchant.is_open_now ? "Buka" : "Tutup" }}
                  </span>
                  <span class="text-xs font-bold text-merchant-primary">
                    {{ merchant.segmentation?.name || "UMKM" }}
                  </span>

                  <span
                    v-if="formattedDistanceKm"
                    class="flex items-center gap-1 text-xs font-semibold text-gray-500"
                  >
                    <i
                      class="text-sm pi pi-map-marker text-danger-foreground"
                    ></i>
                    {{ formattedDistanceKm }}
                  </span>

                  <button
                    v-else-if="hasMerchantCoordinates"
                    type="button"
                    @click="requestMyLocation"
                    class="text-xs font-semibold text-gray-500 underline hover:text-gray-700"
                  >
                    Aktifkan lokasi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Menu dan Informasi -->
      <div class="px-4 mx-auto mt-6 max-w-7xl">
        <div
          class="flex gap-1 p-1 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <button
            @click="activeTab = 'menu'"
            :class="[
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition',
              activeTab === 'menu'
                ? 'bg-secondary-hover text-white'
                : 'text-gray-600 hover:bg-secondary-hover hover:text-white',
            ]"
          >
            Menu
          </button>
          <button
            @click="activeTab = 'informasi'"
            :class="[
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition',
              activeTab === 'informasi'
                ? 'bg-secondary-hover text-white'
                : 'text-gray-600 hover:bg-secondary-hover hover:text-white',
            ]"
          >
            Informasi
          </button>
        </div>
      </div>

      <!-- Tab Content: Menu -->
      <div v-show="activeTab === 'menu'" class="px-4 py-4 mx-auto max-w-7xl">
        <!-- Empty State -->
        <div
          v-if="
            (menuKind === 'jasa' && jasaList.length === 0) ||
            (menuKind === 'product' && productList.length === 0)
          "
          class="p-8 text-center bg-white shadow-sm rounded-xl"
        >
          <i class="mb-3 text-4xl text-gray-300 pi pi-inbox"></i>
          <p class="text-gray-500">
            {{
              menuKind === "product"
                ? "Belum ada produk yang tersedia"
                : "Belum ada layanan yang tersedia"
            }}
          </p>
        </div>

        <!-- Grid Produk -->
        <div
          v-else-if="menuKind === 'product'"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <ProductCard
            v-for="product in productList"
            :key="product.id"
            :product="product"
            class="transition cursor-pointer hover:shadow-md"
            @click="goToProductDetail(product)"
          />
        </div>

        <!-- Grid Jasa -->
        <div v-else class="grid grid-cols-2 gap-3 sm:gap-4">
          <router-link
            v-for="jasa in jasaList"
            :key="jasa.id"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="block overflow-hidden transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md"
          >
            <!-- Gambar -->
            <div class="overflow-hidden bg-gray-100 h-28 sm:h-32">
              <img
                v-if="resolveJasaImage(jasa)"
                :src="resolveJasaImage(jasa)"
                :alt="jasa.title"
                class="object-cover w-full h-full"
              />
              <div
                v-else
                class="flex items-center justify-center w-full h-full"
              >
                <i class="text-3xl text-gray-300 pi pi-image"></i>
              </div>
            </div>

            <!-- Info -->
            <div class="px-3 py-2.5">
              <h3
                class="text-sm font-semibold leading-tight text-gray-900 line-clamp-2"
              >
                {{ jasa.title }}
              </h3>
              <p class="mt-1 text-sm font-bold text-secondary-hover">
                <template
                  v-if="jasa.fixed_price && Number(jasa.fixed_price) > 0"
                >
                  Rp {{ formatHarga(jasa.fixed_price) }}
                </template>
                <template
                  v-else-if="jasa.base_price && Number(jasa.base_price) > 0"
                >
                  Mulai Rp {{ formatHarga(jasa.base_price) }}
                </template>
                <template v-else>
                  <span class="text-xs font-normal text-gray-400"
                    >Hubungi untuk harga</span
                  >
                </template>
              </p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Tab Content: Informasi -->
      <div
        v-show="activeTab === 'informasi'"
        class="px-4 py-4 mx-auto space-y-4 max-w-7xl"
      >
        <!-- Tentang -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 class="mb-3 text-base font-bold text-gray-900">Tentang</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            {{ merchant.description || "Belum ada deskripsi untuk toko ini." }}
          </p>
        </div>

        <!-- Jam Operasional -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 class="mb-3 text-base font-bold text-gray-900">
            Jam Operasional
          </h3>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              v-for="day in operationalHours"
              :key="day.name"
              class="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl"
            >
              <span class="text-sm font-medium text-gray-700">{{
                day.name
              }}</span>
              <span
                :class="[
                  'text-sm font-bold',
                  day.hours === 'Tutup' ? 'text-red-500' : 'text-gray-900',
                ]"
              >
                {{ day.hours }}
              </span>
            </div>
          </div>
        </div>

        <!-- Hubungi Penjual -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 class="mb-3 text-base font-bold text-gray-900">
            Hubungi Penjual
          </h3>
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full shrink-0"
            >
              <i class="text-green-600 pi pi-phone"></i>
            </div>
            <template v-if="merchant.phone">
              <a
                :href="`https://wa.me/${formatPhoneForWa(merchant.phone)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-green-700 transition hover:underline hover:text-green-800"
                title="Chat via WhatsApp"
              >
                {{ merchant.phone }}
              </a>
            </template>
            <template v-else>
              <span class="text-sm font-medium text-gray-700">-</span>
            </template>
          </div>
        </div>

        <!-- Alamat -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <h3 class="mb-3 text-base font-bold text-gray-900">Alamat</h3>

          <!-- Map Integration -->
          <div
            class="relative w-full h-48 mb-3 overflow-hidden bg-gray-100 rounded-xl"
          >
            <LeafletMap
              v-if="hasCoordinates"
              :lat="latitude"
              :lng="longitude"
              :zoom="12"
              :showMyLocation="true"
              readonly="true"
              class="absolute inset-0"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-gray-200"
            >
              <i class="text-3xl text-gray-400 pi pi-map-marker"></i>
            </div>
          </div>

          <p class="text-sm leading-relaxed text-gray-600">
            {{ merchantInfo.address }}
          </p>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center justify-center h-64 px-4">
      <i class="mb-3 text-4xl text-gray-300 pi pi-exclamation-circle"></i>
      <p class="text-center text-gray-500">Toko tidak ditemukan</p>
      <router-link
        to="/"
        class="mt-4 text-sm text-secondary-hover hover:underline"
      >
        Kembali ke Beranda
      </router-link>
    </div>

    <!-- Chat Modal -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showChat && selectedJasaId"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40"
        @click.self="showChat = false"
      >
        <div
          class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl h-[70vh] sm:h-[520px] flex flex-col"
        >
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full shrink-0"
              >
                <img
                  v-if="merchant?.logo_url"
                  :src="merchant.logo_url"
                  alt="Logo Toko"
                  class="object-cover w-full h-full"
                />
                <i v-else class="text-gray-400 pi pi-shop"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ merchant?.name || "Penjual" }}
                </p>
                <p class="text-xs text-gray-500">Konsultasi Layanan</p>
              </div>
            </div>
            <button
              type="button"
              class="flex items-center justify-center w-8 h-8 text-gray-500 rounded-full hover:bg-gray-100"
              @click="showChat = false"
            >
              <i class="text-sm pi pi-times"></i>
            </button>
          </div>

          <div class="flex-1 p-3">
            <ChatWindow :jasa-id="selectedJasaId" mode="buyer" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import api from "@/libs/axios.js";
import { getImageUrl } from "@/libs/getImageUrl.js";
import { setMeta, setJsonLd } from "@/router/seo";
import ChatWindow from "@/components/common/ChatWindow.vue";
import LeafletMap from "@/components/LeafletMap.vue";
import ProductCard from "@/components/Card/ProductCard.vue";
import ProductCardSkeleton from "@/components/Card/ProductCardSkeleton.vue";

// Format phone number for wa.me (remove non-digits, add country code if needed)
function formatPhoneForWa(phone) {
  if (!phone) return "";
  let cleaned = String(phone).replace(/[^\d]/g, "");
  // If starts with 0, replace with 62 (Indonesia country code)
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

const route = useRoute();
const router = useRouter();

const merchant = ref(null);
const jasaList = ref([]);
const productList = ref([]);
const loading = ref(true);
const showChat = ref(false);
const selectedJasaId = ref(null);
const activeTab = ref("menu");
const menuKind = ref("jasa"); // 'product' | 'jasa'

// Sync data state
const merchantInfo = ref({
  address: "",
});
const operationalHours = ref([]);
const latitude = ref(null);
const longitude = ref(null);

const myLatitude = ref(null);
const myLongitude = ref(null);

function setMyCoordinates(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  myLatitude.value = Number.isFinite(latNum) ? latNum : null;
  myLongitude.value = Number.isFinite(lngNum) ? lngNum : null;
}

async function loadMyCoordinatesFromProfile() {
  try {
    const res = await api.get("api/profile/address");
    const addr = res?.data?.data;
    setMyCoordinates(addr?.latitude, addr?.longitude);
    return hasMyCoordinates.value;
  } catch (e) {
    setMyCoordinates(null, null);
    return false;
  }
}

async function requestMyLocation() {
  if (hasMyCoordinates.value) return true;
  if (!navigator.geolocation) return false;

  const coords = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos?.coords?.latitude;
        const lng = pos?.coords?.longitude;
        if (typeof lat === "number" && typeof lng === "number") {
          resolve({ lat, lng });
        } else {
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });

  if (!coords) return false;
  setMyCoordinates(coords.lat, coords.lng);
  return hasMyCoordinates.value;
}

const DAYS = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
];

const hasCoordinates = computed(() => {
  const latNum = parseFloat(latitude.value);
  const lngNum = parseFloat(longitude.value);
  return Number.isFinite(latNum) && Number.isFinite(lngNum);
});

const hasMerchantCoordinates = computed(() => hasCoordinates.value);

const hasMyCoordinates = computed(() => {
  return (
    Number.isFinite(myLatitude.value) && Number.isFinite(myLongitude.value)
  );
});

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const distanceKm = computed(() => {
  if (!hasMyCoordinates.value) return null;
  if (!hasMerchantCoordinates.value) return null;

  const mLat = parseFloat(latitude.value);
  const mLng = parseFloat(longitude.value);
  if (!Number.isFinite(mLat) || !Number.isFinite(mLng)) return null;

  return haversineKm(myLatitude.value, myLongitude.value, mLat, mLng);
});

const formattedDistanceKm = computed(() => {
  if (distanceKm.value == null) return null;
  return `${distanceKm.value.toFixed(1)} km`;
});

// Format harga
const formatHarga = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID");
};

function formatFullAddress(addr) {
  if (!addr) return "-";
  const detail = addr?.detail?.trim?.() || "";
  const village = addr?.village?.name || "";
  const district = addr?.district?.name || "";
  const city = addr?.city?.name || "";
  const province = addr?.province?.name || "";
  const parts = [detail, village, district, city, province].filter(
    (p) => typeof p === "string" && p.trim() !== ""
  );
  return parts.length ? parts.join(", ") : "-";
}

function pickSeoImage(m) {
  return m?.banner_url || m?.logo_url || "https://sumilir.web.id/og-image.png";
}

function applyMerchantSeo(merchantData, merchantSlug) {
  const name = merchantData?.name || "Toko";
  const segmentation = merchantData?.segmentation?.name || "UMKM";
  const descRaw = merchantData?.description || "";
  const addrText = merchantInfo.value?.address || "";

  const description =
    descRaw?.trim() ||
    [
      `${segmentation} di Sumilir.`,
      addrText ? `Alamat: ${addrText}.` : "",
      "Lihat menu, informasi toko, dan jam operasional.",
    ]
      .filter(Boolean)
      .join(" ");

  const pageUrl = `${window.location.origin}/merchant/${merchantSlug}`;

  setMeta({
    title: `${name} | SUMILIR`,
    description,
    image: pickSeoImage(merchantData),
    url: pageUrl,
    type: "business.business",
  });

  const latNum = parseFloat(latitude.value);
  const lngNum = parseFloat(longitude.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: pageUrl,
    image: [pickSeoImage(merchantData)],
    telephone: merchantData?.phone || undefined,
    address: addrText
      ? { "@type": "PostalAddress", streetAddress: addrText }
      : undefined,
    geo:
      Number.isFinite(latNum) && Number.isFinite(lngNum)
        ? { "@type": "GeoCoordinates", latitude: latNum, longitude: lngNum }
        : undefined,
  };

  // Remove undefined keys so JSON-LD is clean
  for (const k of Object.keys(jsonLd)) {
    if (jsonLd[k] === undefined) delete jsonLd[k];
  }
  setJsonLd("jsonld-merchant", jsonLd);
}

// Resolve gambar jasa
const resolveJasaImage = (jasa) => {
  if (jasa.images && jasa.images.length > 0) {
    const coverImage =
      jasa.images.find((img) => img.is_cover) || jasa.images[0];
    const path = coverImage.path || coverImage.url || coverImage.image;
    if (path) {
      return getImageUrl(path);
    }
  }
  if (jasa.image) {
    return getImageUrl(jasa.image);
  }
  return null;
};

// Buka chat dengan jasa pertama dari merchant
const openChat = () => {
  if (jasaList.value.length > 0) {
    selectedJasaId.value = jasaList.value[0].id;
    showChat.value = true;
  }
};

const goToProductDetail = (product) => {
  if (!product?.slug) return;
  router.push({ name: "Product Detail", params: { slug: product.slug } });
};

function getSegmentationId(data) {
  const raw = data?.segmentation_id ?? data?.segmentation?.id ?? null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

async function fetchMerchantMenu(merchantData, merchantSlug) {
  const segId = getSegmentationId(merchantData);

  // Reset lists to avoid stale UI when navigating between merchants
  jasaList.value = [];
  productList.value = [];

  // 1/2 => toko/kuliner (produk)
  if (segId === 1 || segId === 2) {
    menuKind.value = "product";

    const { data } = await api.get(
      `/api/public/merchants/${merchantSlug}/products`,
      {
        params: { per_page: 50 },
      }
    );

    const paginator = data?.products ?? data?.data ?? data;
    productList.value =
      paginator?.data ?? (Array.isArray(paginator) ? paginator : []);
    return;
  }

  // 3 => jasa
  if (segId === 3) {
    menuKind.value = "jasa";
    const { data } = await api.get("/api/public/jasas");
    jasaList.value = Array.isArray(data) ? data : data?.data ?? [];
    return;
  }

  // Fallback: treat as product merchant
  menuKind.value = "product";
  const { data } = await api.get(
    `/api/public/merchants/${merchantSlug}/products`,
    {
      params: { per_page: 50 },
    }
  );
  const paginator = data?.products ?? data?.data ?? data;
  productList.value =
    paginator?.data ?? (Array.isArray(paginator) ? paginator : []);
}

// Fetch data merchant dan jasa-jasanya
const fetchMerchantData = async () => {
  loading.value = true;
  try {
    const merchantSlug = route.params.slug;

    // Fetch merchant detail (Standardized URL)
    const { data: merchantData } = await api.get(
      `/api/public/merchants/${merchantSlug}`
    );
    const data = merchantData.data || merchantData;
    merchant.value = data;

    // Sync data similar to MerchantInfo.vue
    const primaryAddress =
      data?.primary_address ?? data?.primaryAddress ?? null;
    merchantInfo.value.address = formatFullAddress(primaryAddress);

    latitude.value = primaryAddress?.latitude ?? data?.latitude ?? null;
    longitude.value = primaryAddress?.longitude ?? data?.longitude ?? null;

    const hours = data.operational_hours ?? {};
    operationalHours.value = DAYS.map((day) => {
      const item = hours[day.key];
      if (!item || item.is_open === false) {
        return { name: day.label, hours: "Tutup" };
      }
      return { name: day.label, hours: `${item.open} - ${item.close}` };
    });

    // Dynamic SEO based on merchant data
    applyMerchantSeo(data, merchantSlug);

    // Fetch menu berdasarkan segmentation
    await fetchMerchantMenu(data, merchantSlug);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    merchant.value = null;
    jasaList.value = [];
    productList.value = [];

    setMeta({
      title: "Toko tidak ditemukan | SUMILIR",
      description: "Toko tidak ditemukan atau sudah tidak tersedia.",
      url: window.location.origin + window.location.pathname,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Preload profile coordinates (no geolocation prompt).
  loadMyCoordinatesFromProfile();
});

watch(() => route.params.slug, fetchMerchantData, { immediate: true });
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
