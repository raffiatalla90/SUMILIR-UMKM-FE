<template>
  <div
    class="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden w-[calc(50%-0.375rem)] sm:w-[calc(25%-1.125rem)]"
  >
    <!-- Skeleton gambar 1:1 -->
    <div class="relative w-full aspect-square bg-gray-200 animate-pulse"></div>

    <!-- Skeleton konten -->
    <div
      class="flex flex-col flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white min-h-[100px] sm:min-h-[120px]"
    >
      <!-- Title skeleton -->
      <div class="h-4 sm:h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>

      <!-- Description skeleton -->
      <div class="mt-2 space-y-1.5">
        <div
          class="h-3 sm:h-3.5 bg-gray-200 rounded animate-pulse w-full"
        ></div>
        <div class="h-3 sm:h-3.5 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>

      <!-- Rating & distance skeleton -->
      <div class="mt-auto pt-2 flex items-center gap-3 sm:gap-4">
        <div class="h-3 sm:h-3.5 bg-gray-200 rounded animate-pulse w-12"></div>
        <div class="h-3 sm:h-3.5 bg-gray-200 rounded animate-pulse w-14"></div>
      </div>
    </div>
  </div>
</template>
