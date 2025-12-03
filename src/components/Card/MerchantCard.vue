<template>
  <router-link
    :to="{
      name: 'Merchant Detail',
      params: { slug: merchant.slug || merchant.id },
    }"
    class="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 sm:max-w-xs"
  >
    <!-- Logo/Image -->
    <div class="aspect-square bg-gray-100 relative">
      <img
        v-if="merchant.logo_url"
        :src="merchant.logo_url"
        :alt="merchant.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-12 h-12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
          />
        </svg>
      </div>

      <!-- Badge Segmentation -->
      <div
        v-if="merchant.segmentation"
        class="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700"
      >
        {{ merchant.segmentation.name }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4">
      <!-- Name -->
      <h3
        class="font-semibold text-sm sm:text-base text-gray-900 line-clamp-1 mb-1"
      >
        {{ merchant.name }}
      </h3>

      <!-- Location -->
      <div
        v-if="merchant.primary_address"
        class="flex items-center gap-1 text-xs text-gray-500 mb-2"
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
