<script setup>
import { computed } from "vue";
import { getImageUrl } from "@/libs/getImageUrl";

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
  if (props.product.cover_image?.id) {
    return (
      props.product.cover_image.src_url ||
      getImageUrl(props.product.cover_image.id)
    );
  }
  return null;
});
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
    <div class="relative w-full aspect-square bg-gray-200 overflow-hidden">
      <img
        v-if="productImageUrl"
        :src="productImageUrl"
        :alt="product.name"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        @error="(e) => (e.target.style.display = 'none')"
      />
      <div
        v-else
        class="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100"
      >
        <i class="pi pi-image text-4xl text-danger-foreground"></i>
      </div>
    </div>

    <!-- Product Info -->
    <div
      class="flex flex-col flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white min-h-[120px]"
    >
      <!-- Product Name -->
      <h3
        class="text-xs font-semibold text-gray-900 line-clamp-2 mb-1"
        :title="product.name"
      >
        {{ product.name }}
      </h3>

      <!-- Price -->
      <p class="text-xs font-bold text-primary mb-2">
        {{ formattedPrice }}
      </p>

      <!-- Rating & Distance (auto push to bottom) -->
      <div class="mt-auto pt-2 text-[11px] text-xs text-gray-600">
        <span class="flex items-center gap-1 mb-1 truncate">
          <i class="pi pi-shop text-base me-1 text-merchant-primary"></i>
          {{ product.merchant?.name ?? "Nama Toko" }}
        </span>
        <span class="flex items-center gap-1">
          <i class="pi pi-map-marker text-base me-1 text-danger-foreground"></i>
          {{ product.distance ?? "1.5" }} km
        </span>
      </div>
    </div>
  </div>
</template>
