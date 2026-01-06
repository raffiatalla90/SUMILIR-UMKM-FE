<template>
  <router-link
    :to="{
      name: 'Merchant Detail',
      params: { slug: merchant.slug || merchant.id },
    }"
    class="block overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-lg sm:max-w-xs"
  >
    <!-- Logo/Image -->
    <div class="relative bg-muted-background aspect-square">
      <img
        v-if="merchant.logo_url"
        :src="merchant.logo_url"
        :alt="merchant.name"
        class="object-cover w-full h-full"
      />
      <div
        v-else
        class="flex items-center justify-center w-full h-full text-merchant-primary"
      >
        <i class="text-4xl pi pi-shop text-merchant-primary"></i>
      </div>

      <!-- Badge Segmentation -->
      <div
        v-if="merchant.segmentation"
        class="absolute px-2 py-1 text-xs font-medium text-black rounded-full top-2 left-2 bg-white/90 backdrop-blur-sm"
      >
        {{ merchant.segmentation.name }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4">
      <!-- Name -->
      <h3
        class="mb-1 text-sm font-semibold text-black sm:text-base line-clamp-1"
      >
        {{ merchant.name }}
      </h3>

      <!-- Location -->
      <div
        v-if="merchant.primary_address"
        class="flex items-center gap-1 mb-2 text-xs text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-3.5 h-3.5 flex-shrink-0"
        >
          <path
            fill-rule="evenodd"
            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="line-clamp-1">
          {{ merchant.primary_address.city?.name }},
          {{ merchant.primary_address.province?.name }}
        </span>
      </div>

      <!-- Products Count -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">
          {{ merchant.products_count || 0 }} Produk
        </span>

        <!-- Rating (opsional, jika ada) -->
        <!-- <div class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="text-xs text-gray-600">4.8</span>
        </div> -->
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  merchant: {
    type: Object,
    required: true,
  },
});
</script>
