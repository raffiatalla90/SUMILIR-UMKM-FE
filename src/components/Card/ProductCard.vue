<script setup>
import { computed } from "vue";
import { getImageUrl } from "@/libs/getImageUrl";
import starIcon from "@/assets/icons/Bintang.png";
import lokasiIcon from "@/assets/icons/TitikLokasi.png";

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
});

// Format harga ke Rupiah
const formatHarga = (value) => {
  if (!value) return "0";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID").format(numValue);
};

// Format harga dengan range
const formattedPrice = computed(() => {
  const minPrice = props.product.min_price;
  const maxPrice = props.product.max_price;

  if (!minPrice && !maxPrice) return "Rp 0";

  const minFormatted = formatHarga(minPrice);
  const maxFormatted = formatHarga(maxPrice);

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
    return getImageUrl(props.product.cover_image.id);
  }
  return null;
});
</script>

<template>
  <div
    class="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition w-full max-w-xs cursor-pointer"
  >
    <!-- Product Image (1:1 aspect ratio) -->
    <div class="relative w-full aspect-square bg-gray-200 overflow-hidden">
      <img
        v-if="productImageUrl"
        :src="productImageUrl"
        :alt="product.name"
        class="absolute inset-0 w-full h-full object-cover"
        @error="(e) => (e.target.style.display = 'none')"
      />
      <div
        v-else
        class="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100"
      >
        <i class="pi pi-image text-4xl text-gray-400"></i>
      </div>
    </div>

    <!-- Product Info -->
    <div
      class="flex flex-col flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white min-h-[120px] sm:min-h-[140px]"
    >
      <!-- Product Name -->
      <h3
        class="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-1"
        :title="product.name"
      >
        {{ product.name }}
      </h3>

      <!-- Merchant Name -->
      <p class="text-xs sm:text-sm text-gray-500 line-clamp-1 mb-2">
        {{ product.merchant?.name || "UMKM" }}
      </p>

      <!-- Price -->
      <p class="text-sm sm:text-base font-bold text-primary mb-2">
        {{ formattedPrice }}
      </p>

      <!-- Rating & Distance (auto push to bottom) -->
      <div
        class="mt-auto pt-2 flex items-center justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-gray-600"
      >
        <span class="flex items-center gap-1">
          <img :src="starIcon" alt="rating" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {{ product.rating ?? "4.5" }}
        </span>
        <span class="flex items-center gap-1">
          <img
            :src="lokasiIcon"
            alt="lokasi"
            class="w-3 h-3 sm:w-3.5 sm:h-3.5"
          />
          {{ product.distance ?? "1.5" }} km
        </span>
      </div>
    </div>
  </div>
</template>
