<template>
  <div
    class="w-full aspect-[17/8] lg:max-w-none max-w-xs lg:w-[510px] lg:h-[241px] lg:aspect-auto rounded-[10px] overflow-hidden shadow-lg hover:shadow-xl transition"
  >
    <img
      :src="promo.image || defaultImage"
      alt="Promo Image"
      class="w-full h-full object-cover"
      @error="handleImageError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const defaultImage = 'https://placehold.co/510x241/FFA30E/white?text=Promo';

const props = defineProps({
  promo: {
    type: Object,
    default: () => ({
      id: 1,
      image: '',
      title: "Promo Spesial",
    }),
  },
});

const handleImageError = (e) => {
  e.target.src = defaultImage;
};
</script>
