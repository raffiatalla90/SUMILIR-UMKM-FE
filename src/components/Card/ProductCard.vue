<script setup>
import { ref, computed, watch } from "vue";

const imageError = ref(false);

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      name: "Nama Produk",
      description: "Deskripsi produk singkat",
      min_price: 0,
      max_price: 0,
      cover_image: null,
      merchant: null,
      rating: 4.4,
      distance: 2,
    }),
  },
  customClass: {
    type: String,
    default: "max-w-xs",
  },
});

// Format harga ke Rupiah
const formatIDR = (v) =>
  Number(v || 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });
// Format harga dengan range
const formattedPrice = computed(() => {
  const minPrice = props.product.min_price;
  const maxPrice = props.product.max_price;

  if (!minPrice && !maxPrice) return "Rp 0";

  const minFormatted = formatIDR(minPrice);
  const maxFormatted = formatIDR(maxPrice);

  // Jika harga sama, tampilkan sekali saja
  if (minPrice === maxPrice) {
    return `Rp ${minFormatted}`;
  }

  // Jika berbeda, tampilkan range
  return `Rp ${minFormatted} - Rp ${maxFormatted}`;
});

// Get image URL
const productImageUrl = computed(() => {
  if (imageError.value) return null;

  if (props.product.cover_image) {
    return props.product.cover_image.src_url || props.product.cover_image;
  }
  return null;
});

const distanceKm = computed(() => {
  const raw =
    props.product?.distance_km ??
    props.product?.distanceKm ??
    props.product?.distance;
  const num = typeof raw === "string" ? parseFloat(raw) : raw;
  return Number.isFinite(num) ? num : null;
});

const formattedDistanceKm = computed(() => {
  if (distanceKm.value == null) return null;
  // tampilkan 1 angka desimal agar stabil di UI
  return `${distanceKm.value.toFixed(1)} km`;
});

watch(
  () => props.product?.id,
  () => {
    imageError.value = false;
  }
);
</script>

<template>
  <div
    :class="`    group
    flex flex-col rounded-2xl
    border border-gray-200
    bg-white
    shadow-sm
    overflow-hidden
    transition-transform duration-300 ease-out
    hover:-translate-y-1 hover:shadow-md
    cursor-pointer
    min-w-[161px]
    ${customClass} `"
  >
    <!-- Product Image (1:1 aspect ratio) -->
    <div
      class="relative w-full overflow-hidden bg-muted-background aspect-square"
    >
      <img
        v-if="productImageUrl"
        :src="productImageUrl"
        :alt="product.name"
        class="absolute inset-0 object-cover w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
        @error="imageError = true"
      />
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center w-full h-full bg-muted-background"
      >
        <i class="text-4xl pi pi-shopping-bag text-primary"></i>
      </div>
    </div>

    <!-- Product Info -->
    <div class="flex flex-col flex-1 px-3 py-3 bg-white sm:px-4 sm:py-3">
      <!-- Product Name -->
      <h3
        class="mb-1 text-xs font-semibold text-gray-900 line-clamp-2"
        :title="product.name"
      >
        {{ product.name }}
      </h3>

      <!-- Price -->
      <p class="mb-2 text-xs font-bold text-primary">
        {{ formattedPrice }}
      </p>

      <!-- Rating & Distance (auto push to bottom) -->
      <div
        v-if="product.merchant"
        class="mt-auto pt-2 text-[11px] text-gray-600"
      >
        <span
          v-if="product.merchant?.name"
          class="flex items-center gap-1 mb-1 truncate"
        >
          <i class="text-base pi pi-shop me-1 text-merchant-primary"></i>
          {{ product.merchant?.name ?? "Nama Toko" }}
        </span>
        <span v-if="formattedDistanceKm" class="flex items-center gap-1">
          <i class="text-base pi pi-map-marker me-1 text-danger-foreground"></i>
          {{ formattedDistanceKm }}
        </span>
      </div>
    </div>
  </div>
</template>
