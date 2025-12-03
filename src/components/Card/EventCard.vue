<template>
  <div
    class="relative sm:max-w-none max-w-xs bg-white border border-gray-200 rounded-[10px] overflow-hidden box-border w-full aspect-[437/257] sm:w-[437px] sm:h-[257px] sm:aspect-auto transition duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
  >
    <div class="overflow-hidden w-full h-[60%] sm:h-[159px]">
      <img
        src="https://www.shutterstock.com/shutterstock/photos/2260606417/display_1500/stock-vector-editable-text-effect-food-festival-d-traditional-cartoon-template-style-premium-vector-2260606417.jpg"
        alt="Gambar event"
        class="w-full h-full object-cover transition-transform duration-300 motion-safe:hover:scale-105"
      />
    </div>
    <div class="px-2 sm:px-2.5 pt-2 sm:pt-4">
      <h3 class="text-sm sm:text-base font-semibold truncate">
        Event Saat Ini
      </h3>
      <p class="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 line-clamp-2">
        Deskripsi event saat ini
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  event: {
    type: Object,
    default: () => ({
      id: 1,
      image:
        "https://www.shutterstock.com/shutterstock/photos/2260606417/display_1500/stock-vector-editable-text-effect-food-festival-d-traditional-cartoon-template-style-premium-vector-2260606417.jpg",
      title: "Event Saat Ini",
      description: "Deskripsi event saat ini",
    }),
  },
});
</script>
