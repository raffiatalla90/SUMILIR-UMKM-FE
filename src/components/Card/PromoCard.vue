<template>
  <div
    class="w-full aspect-[17/8] sm:max-w-none max-w-xs sm:w-[510px] sm:h-[241px] sm:aspect-auto rounded-[10px] overflow-hidden shadow-lg hover:shadow-xl transition"
  >
    <img
      src="https://png.pngtree.com/png-clipart/20230526/original/pngtree-sale-landing-page-banner-template-promo-shopping-discount-banner-png-image_9170587.png"
      alt="Promo Image"
      class="w-full h-full object-cover"
    />
  </div>
</template>

<script setup>
defineProps({
  promo: {
    type: Object,
    default: () => ({
      id: 1,
      image:
        "https://png.pngtree.com/png-clipart/20230526/original/pngtree-sale-landing-page-banner-template-promo-shopping-discount-banner-png-image_9170587.png",
      title: "Promo Spesial",
    }),
  },
});
</script>
