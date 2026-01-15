<template>
  <div class="min-h-screen bg-white">
    <!-- Banner -->
    <div
      class="flex items-center justify-center h-48 bg-blue-500 sm:h-56 md:h-64"
    >
      <h1 class="text-2xl font-semibold text-white sm:text-3xl">
        Selamat Datang di Sumilir
      </h1>
    </div>

    <!-- Search -->
    <div class="relative z-10 flex justify-center px-4 -mt-8">
      <div class="w-full max-w-2xl sm:w-3/4 md:w-1/2">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pencarian"
            class="w-full px-4 py-3 text-sm bg-white rounded-md shadow-lg focus:ring-2 focus:ring-blue-300 md:text-base"
          />
          <button
            class="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-blue-600"
          >
            <i class="text-lg bi bi-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-6 py-10 space-y-10 md:px-8">
      <!-- Pilih Kategori -->
      <section>
        <h2 class="mb-4 text-lg font-semibold">Pilih Kategori</h2>
        <div class="grid w-full grid-cols-5 gap-4 justify-items-center">
          <!-- Kategori dari Backend (4 kategori awal atau semua) -->
          <template v-for="(cat, idx) in displayedCategories" :key="cat.id">
            <button
              @click="selectCategory(cat.id)"
              class="flex flex-col items-center gap-2 transition-all duration-200 aspect-square"
              :class="
                selectedCategoryId === cat.id ? 'scale-105' : 'hover:scale-105'
              "
              style="aspect-ratio: 1/1"
            >
              <div
                class="flex items-center justify-center w-12 h-12 transition-all duration-200 border-2 sm:w-14 sm:h-14 rounded-xl aspect-square"
                :class="
                  selectedCategoryId === cat.id
                    ? 'bg-[#FFA30E] border-[#FFA30E] text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-[#FFA30E]'
                "
                style="aspect-ratio: 1/1"
              >
                <i :class="getCategoryIcon(cat)" class="text-xl"></i>
              </div>
              <span
                class="text-xs text-center text-gray-700 sm:text-sm line-clamp-2"
                >{{ cat.name }}</span
              >
            </button>
          </template>
          <!-- Tombol Semua / Tutup di paling kanan, tetap kotak -->
          <button
            @click="toggleShowAllCategories"
            class="flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 aspect-square"
            style="aspect-ratio: 1/1"
          >
            <div
              class="flex items-center justify-center w-12 h-12 transition-all duration-200 border-2 sm:w-14 sm:h-14 rounded-xl aspect-square"
              :class="
                showAllCategories
                  ? 'bg-gray-500 border-gray-500 text-white'
                  : 'bg-[#FFA30E] border-[#FFA30E] text-white'
              "
              style="aspect-ratio: 1/1"
            >
              <i
                :class="showAllCategories ? 'pi pi-times' : 'pi pi-th-large'"
                class="text-xl"
              ></i>
            </div>
            <span
              class="text-xs font-medium text-center text-gray-700 sm:text-sm"
              >{{ showAllCategories ? "Tutup" : "Semua" }}</span
            >
          </button>
        </div>
      </section>

      <!-- Promo Menarik -->
      <section>
        <h2 class="mb-4 text-lg font-semibold">Promo Menarik</h2>
        <div class="relative group">
          <!-- tombol kiri -->
          <button
            @click="scrollPromo(-1)"
            class="absolute z-10 items-center justify-center hidden -translate-y-1/2 rounded-full shadow opacity-0 pointer-events-none sm:flex left-2 top-1/2 w-9 h-9 bg-white/85 group-hover:opacity-100 group-hover:pointer-events-auto"
          >
            ‹
          </button>

          <!-- scroller -->
          <div
            ref="promoScroller"
            :class="[
              'grid grid-flow-col gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 pr-[35%] sm:pr-[25%]',
              '[grid-auto-columns:calc(80%-0.5rem)] sm:[grid-auto-columns:calc(50%-0.5rem)]',
            ]"
            style="scroll-behavior: smooth"
          >
            <div
              v-for="(p, i) in promoList"
              :key="i"
              class="overflow-hidden transition bg-white shadow-lg rounded-2xl hover:shadow-xl snap-start"
            >
              <img
                :src="p.image"
                alt="Promo"
                class="object-contain w-full h-auto rounded-2xl"
              />
            </div>
          </div>

          <!-- tombol kanan -->
          <button
            @click="scrollPromo(1)"
            class="absolute z-10 items-center justify-center hidden -translate-y-1/2 rounded-full shadow opacity-0 pointer-events-none sm:flex right-2 top-1/2 w-9 h-9 bg-white/85 group-hover:opacity-100 group-hover:pointer-events-auto"
          >
            ›
          </button>
        </div>
      </section>

      <!-- Rekomendasi -->
      <section>
        <h2 class="mb-4 text-lg font-semibold">
          {{ selectedCategoryId ? selectedCategoryName : "Rekomendasi" }}
        </h2>

        <!-- Loading -->
        <div v-if="loadingJasa" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFA30E]"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!filteredJasaList || filteredJasaList.length === 0"
          class="py-8 text-center"
        >
          <i class="mb-2 text-4xl text-gray-300 pi pi-inbox"></i>
          <p class="text-gray-500">Belum ada layanan di kategori ini</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-4 sm:gap-6">
          <router-link
            v-for="jasa in filteredJasaList"
            :key="jasa.id"
            :to="{ name: 'JasaDetail', params: { id: jasa.id } }"
            class="block overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl"
          >
            <div class="h-24 overflow-hidden bg-gray-200 sm:h-28">
              <img
                :src="resolveJasaImage(jasa)"
                alt="Jasa"
                class="object-cover w-full h-full"
              />
            </div>

            <div class="px-4 py-3 text-center bg-white">
              <h3 class="text-sm font-semibold text-gray-900 sm:text-base">
                {{ jasa.title }}
              </h3>
              <div class="space-y-0.5">
                <p
                  class="text-xs font-semibold sm:text-sm text-merchant-primary"
                >
                  <template
                    v-if="jasa.fixed_price && Number(jasa.fixed_price) > 0"
                  >
                    Rp {{ formatHarga(jasa.fixed_price) }}
                  </template>
                  <template
                    v-else-if="jasa.base_price && Number(jasa.base_price) > 0"
                  >
                    Rp {{ formatHarga(jasa.base_price) }}
                  </template>
                  <template v-else>
                    <span class="text-xs font-normal text-gray-400"
                      >Hubungi untuk harga</span
                    >
                  </template>
                </p>
                <p
                  v-if="jasa.fixed_price && Number(jasa.fixed_price) > 0"
                  class="text-[10px] text-emerald-600 font-medium uppercase tracking-wide"
                >
                  Harga Tetap
                </p>
                <p
                  v-else-if="jasa.base_price && Number(jasa.base_price) > 0"
                  class="text-[10px] text-gray-600 font-medium uppercase tracking-wide"
                >
                  Mulai dari
                </p>
              </div>
              <!-- Hari Operasional -->
              <p class="mt-1 text-xs text-gray-500">
                <i class="mr-1 text-gray-400 pi pi-calendar"></i>
                {{ formatOperatingDays(jasa.operating_days) }}
              </p>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/libs/axios.js";
import { useToast } from "vue-toastification";
import { getImageUrlJasa } from "@/libs/getImageUrl.js";

const toast = useToast();

const searchQuery = ref("");
const jasaList = ref([]);
const categories = ref([]);
const promoList = ref([]);
const promoScroller = ref(null);
const selectedCategoryId = ref(null);
const loadingJasa = ref(false);
const showAllCategories = ref(false);

// Watch searchQuery to reset category filter if searching
import { watch } from "vue";
watch(searchQuery, (val) => {
  if (val && val.length > 0) {
    selectedCategoryId.value = null;
  }
});

// Tampilkan 4 kategori awal atau semua
const displayedCategories = computed(() => {
  if (showAllCategories.value) {
    return categories.value;
  }
  return categories.value.slice(0, 4);
});

// Toggle show all categories
const toggleShowAllCategories = () => {
  showAllCategories.value = !showAllCategories.value;
  // Reset filter ke semua jika menutup
  if (!showAllCategories.value) {
    selectedCategoryId.value = null;
  }
};

// import semua banner promo
const promoImagesFiles = import.meta.glob("@/assets/banner/*.png", {
  eager: true,
});
const promoImages = Object.values(promoImagesFiles).map((img) => img.default);

// Category icon mapping - prioritas dari database, fallback ke mapping nama
const getCategoryIcon = (cat) => {
  // Jika cat adalah string (nama), buat object
  if (typeof cat === "string") {
    cat = { name: cat };
  }

  // Jika ada icon dari database, gunakan itu
  if (cat?.icon) {
    const iconName = String(cat.icon);
    return "pi " + (iconName.startsWith("pi-") ? iconName : "pi-" + iconName);
  }

  // Fallback: mapping berdasarkan nama
  const name = cat?.name;
  if (!name || typeof name !== "string") return "pi pi-briefcase";

  const lowerName = name.toLowerCase();
  if (lowerName.includes("teknisi") || lowerName.includes("servis"))
    return "pi pi-wrench";
  if (lowerName.includes("kebersihan") || lowerName.includes("cleaning"))
    return "pi pi-sparkles";
  if (lowerName.includes("kecantikan") || lowerName.includes("beauty"))
    return "pi pi-heart";
  if (lowerName.includes("kesehatan") || lowerName.includes("health"))
    return "pi pi-heart-fill";
  if (
    lowerName.includes("pendidikan") ||
    lowerName.includes("les") ||
    lowerName.includes("kursus")
  )
    return "pi pi-book";
  if (
    lowerName.includes("otomotif") ||
    lowerName.includes("mobil") ||
    lowerName.includes("motor")
  )
    return "pi pi-car";
  if (
    lowerName.includes("elektronik") ||
    lowerName.includes("gadget") ||
    lowerName.includes("teknologi")
  )
    return "pi pi-desktop";
  if (
    lowerName.includes("rumah") ||
    lowerName.includes("home") ||
    lowerName.includes("perbaikan")
  )
    return "pi pi-wrench";
  if (
    lowerName.includes("makanan") ||
    lowerName.includes("kuliner") ||
    lowerName.includes("catering")
  )
    return "pi pi-shopping-bag";
  if (lowerName.includes("foto") || lowerName.includes("video"))
    return "pi pi-camera";
  if (lowerName.includes("acara") || lowerName.includes("event"))
    return "pi pi-calendar";
  if (
    lowerName.includes("pengiriman") ||
    lowerName.includes("kurir") ||
    lowerName.includes("transportasi") ||
    lowerName.includes("logistik")
  )
    return "pi pi-truck";
  if (lowerName.includes("konsultasi") || lowerName.includes("profesional"))
    return "pi pi-briefcase";
  return "pi pi-briefcase"; // default icon
};

// Selected category name
const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return "Rekomendasi";
  const cat = categories.value.find((c) => c.id === selectedCategoryId.value);
  return cat?.name || "Kategori";
});

// Filtered jasa list (hanya jasa yang layak tampil ke customer)
const filteredJasaList = computed(() => {
  // Mulai dari semua jasa lalu batasi hanya yang:
  // - status === 'published' (skema baru)
  // - atau status null/undefined dan is_active === true (skema lama)
  let result = (jasaList.value || []).filter((j) => {
    const status = j.status;
    if (status === "published") return true;
    if ((status === null || status === undefined) && j.is_active === true)
      return true;
    return false;
  });

  // Filter by category
  if (selectedCategoryId.value) {
    result = result.filter(
      (j) => j.jasa_category_id === selectedCategoryId.value
    );
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (j) =>
        j.title?.toLowerCase().includes(query) ||
        j.description?.toLowerCase().includes(query)
    );
  }

  return result || [];
});

// Select category
const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
};

// normalisasi path gambar jasa → URL lengkap dari backend
const resolveJasaImage = (jasa) => {
  // Prioritaskan relasi images (cover image)
  if (jasa.images && jasa.images.length > 0) {
    const coverImage =
      jasa.images.find((img) => img.is_cover) || jasa.images[0];
    const path =
      coverImage.path || coverImage.url || coverImage.image || coverImage.id;
    if (path) return getImageUrlJasa(path);
  }

  // Fallback ke field image tunggal
  if (jasa.image) {
    return getImageUrlJasa(jasa.image);
  }

  return "";
};

// format harga
const formatHarga = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID");
};

// format hari operasional
const dayLabels = {
  1: "Sen",
  2: "Sel",
  3: "Rab",
  4: "Kam",
  5: "Jum",
  6: "Sab",
  7: "Min",
};

const formatOperatingDays = (operatingDays) => {
  if (!operatingDays) return "Buka Setiap Hari";
  const days = operatingDays
    .split(",")
    .map((d) => parseInt(d.trim()))
    .filter((d) => !isNaN(d));
  if (days.length === 0 || days.length === 7) return "Buka Setiap Hari";
  return days.map((d) => dayLabels[d] || d).join(", ");
};

// scroll promo
const scrollPromo = (dir = 1) => {
  const el = promoScroller.value;
  if (!el) return;
  const gap = 16;
  const card = el.querySelector(":scope > *");
  const step = (card?.clientWidth || el.clientWidth * 0.5) + gap;
  el.scrollBy({ left: dir * step, behavior: "smooth" });
};

// fetch data
onMounted(async () => {
  loadingJasa.value = true;
  try {
    const [jasaRes, promoRes, categoryRes] = await Promise.all([
      api.get("/api/public/jasas"),
      api.get("/api/promos"),
      api.get("/api/public/categories/level-1"),
    ]);

    jasaList.value = (jasaRes.data ?? []).map((j) => ({
      ...j,
      image: resolveJasaImage(j),
    }));

    promoList.value = (promoRes.data ?? []).map((p, i) => ({
      ...p,
      image: promoImages[i % promoImages.length],
    }));

    // Ambil data categories dari response { success, message, data }
    categories.value = (categoryRes.data?.data ?? categoryRes.data ?? []).map(
      (c) => ({
        id: c.value ?? c.id,
        name: c.label ?? c.name,
        value: c.value ?? c.id,
        label: c.label ?? c.name,
      })
    );
  } catch (e) {
    console.error("Gagal memuat data:", e);
    toast.error("Gagal memuat data layanan. Silakan coba lagi nanti.");
  } finally {
    loadingJasa.value = false;
  }
});
</script>
