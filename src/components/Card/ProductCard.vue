<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: 1,
      image: 'https://via.placeholder.com/287x127',
      title: 'Nama Produk',
      description: 'Deskripsi produk singkat',
      rating: 4.4,
      distance: 2,
    })
  }
});
</script>

<template>
  <div
    class="group relative bg-white border border-[#D9D9D9] rounded-[10px] overflow-hidden box-border
           w-full h-[149px] tablet:w-full tablet:h-[238px]
           transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]
           focus-within:shadow-[0_10px_25px_rgba(0,0,0,0.06)] focus-within:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    tabindex="0"
  >
    <!-- Image -->
    <div class="overflow-hidden w-full h-[81px] tablet:w-full tablet:h-[127px]">
      <img :src="product.image" :alt="product.title"
           class="w-full h-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
    </div>

    <!-- Title -->
    <h3
      class="absolute truncate
             text-product-title-mobile h-[15px] top-[87px] left-1 right-1
             tablet:text-product-title-desktop tablet:h-[30px]
             tablet:top-[140px] tablet:left-2.5 tablet:right-2.5"
    >
      {{ product.title }}
    </h3>

    <!-- Description -->
    <p
      class="absolute
             text-product-subtitle-mobile w-[106px] top-[105px] left-1
             tablet:text-product-desc-desktop tablet:w-[265px] tablet:h-[22px]
             tablet:top-[173px] tablet:left-2.5"
    >
      {{ product.description }}
    </p>

    <!-- Footer: Rating & Distance -->
    <div
      class="absolute flex items-center justify-between
             left-1 right-1 bottom-1 h-5
             tablet:left-2.5 tablet:right-2.5 tablet:bottom-2.5 tablet:h-[30px]"
    >
      <!-- Rating -->
      <div class="flex items-center gap-[3px] w-[39px] h-5 tablet:w-14 tablet:h-[30px]">
        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7.13406 11.4167L3.67573 13.5C3.52295 13.5972 3.36323 13.6389 3.19656 13.625C3.0299 13.6111 2.88406 13.5556 2.75906 13.4583C2.63406 13.3611 2.53684 13.2397 2.4674 13.0942C2.39795 12.9486 2.38406 12.7853 2.42573 12.6042L3.3424 8.66667L0.279897 6.02083C0.141008 5.89583 0.0543409 5.75333 0.0198965 5.59333C-0.0145479 5.43333 -0.00427022 5.27722 0.0507298 5.125C0.10573 4.97278 0.189063 4.84778 0.30073 4.75C0.412396 4.65222 0.565174 4.58972 0.759063 4.5625L4.80073 4.20833L6.36323 0.5C6.43267 0.333333 6.54045 0.208333 6.68656 0.125C6.83267 0.0416665 6.98184 0 7.13406 0C7.28629 0 7.43545 0.0416665 7.58156 0.125C7.72767 0.208333 7.83545 0.333333 7.9049 0.5L9.4674 4.20833L13.5091 4.5625C13.7035 4.59028 13.8563 4.65278 13.9674 4.75C14.0785 4.84722 14.1618 4.97222 14.2174 5.125C14.273 5.27778 14.2835 5.43417 14.2491 5.59417C14.2146 5.75417 14.1277 5.89639 13.9882 6.02083L10.9257 8.66667L11.8424 12.6042C11.8841 12.7847 11.8702 12.9481 11.8007 13.0942C11.7313 13.2403 11.6341 13.3617 11.5091 13.4583C11.3841 13.555 11.2382 13.6106 11.0716 13.625C10.9049 13.6394 10.7452 13.5978 10.5924 13.5L7.13406 11.4167Z" fill="#FFA30E"/>
        </svg>
        <span class="text-product-subtitle-mobile tablet:text-product-desc-desktop">
          {{ product.rating }}
        </span>
      </div>

      <!-- Distance -->
      <div class="flex items-center gap-1.5 w-[49px] h-5 tablet:w-[71px] tablet:h-[30px]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15.8334 5.83335C15.8334 4.91669 15.0834 4.16669 14.1667 4.16669H11.6667V5.83335H14.1667V8.04169L11.2667 11.6667H8.33335V7.50002H5.00002C3.15835 7.50002 1.66669 8.99169 1.66669 10.8334V13.3334H3.33335C3.33335 14.7167 4.45002 15.8334 5.83335 15.8334C7.21669 15.8334 8.33335 14.7167 8.33335 13.3334H12.0667L15.8334 8.62502V5.83335ZM5.83335 14.1667C5.37502 14.1667 5.00002 13.7917 5.00002 13.3334H6.66669C6.66669 13.7917 6.29169 14.1667 5.83335 14.1667Z" fill="#8AA624"/>
          <path d="M4.16669 5H8.33335V6.66667H4.16669V5ZM15.8334 10.8333C14.45 10.8333 13.3334 11.95 13.3334 13.3333C13.3334 14.7167 14.45 15.8333 15.8334 15.8333C17.2167 15.8333 18.3334 14.7167 18.3334 13.3333C18.3334 11.95 17.2167 10.8333 15.8334 10.8333ZM15.8334 14.1667C15.375 14.1667 15 13.7917 15 13.3333C15 12.875 15.375 12.5 15.8334 12.5C16.2917 12.5 16.6667 12.875 16.6667 13.3333C16.6967 13.7917 16.2917 14.1667 15.8334 14.1667Z" fill="#8AA624"/>
        </svg>
        <span class="text-product-subtitle-mobile tablet:text-product-desc-desktop">
          {{ product.distance }} km
        </span>
      </div>
    </div>
  </div>
</template>