<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      image: "https://via.placeholder.com/287x287",
      title: "Nama Produk",
      description: "Deskripsi produk singkat",
      rating: 4.4,
      distance: 2,
    }),
  },
});

const formatHarga = (value) => {
  if (!value) return "0";
  return Number(value).toLocaleString("id-ID");
};
</script>

<template>
  <router-link
    :to="{ name: 'JasaDetail', params: { id: product.id } }"
    class="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition w-[calc(50%-0.375rem)] sm:w-[calc(25%-1.125rem)] max-w-72"
  >
    <!-- gambar 1:1 dengan aspect-square -->
    <div class="relative w-full aspect-square bg-gray-200 overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.title"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- isi kartu dengan min-height agar konsisten -->
    <div
      class="flex flex-col flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white min-h-[100px] sm:min-h-[120px]"
    >
      <h3 class="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
        {{ product.title }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-0.5">
        {{ product.description }}
      </p>

      <!-- price (opsional jika ada) -->
      <p v-if="product.fixed_price || product.base_price || product.price" class="text-xs sm:text-sm text-gray-600 mt-1">
        <template v-if="product.fixed_price">
          Rp. {{ formatHarga(product.fixed_price) }}
        </template>
        <template v-else-if="product.base_price">
          Mulai Rp. {{ formatHarga(product.base_price) }}
        </template>
        <template v-else>
          Rp. {{ formatHarga(product.price) }}
        </template>
      </p>
    </div>
  </router-link>
</template>
