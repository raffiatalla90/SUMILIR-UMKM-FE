<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const goBack = () => {
  router.back();
};

// ADD: emit untuk toggle sidebar
const emit = defineEmits(["toggle-sidebar"]);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header - mobile hamburger -->
    <div
      class="fixed sm:static top-0 left-0 right-0 flex justify-between items-center py-6 px-4 sm:px-6 bg-white z-10"
    >
      <div class="flex items-center gap-3">
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-muted-background transition sm:hidden"
        >
          <i class="pi pi-bars text-muted-foreground"></i>
        </button>
        <div>
          <h1 class="text-base sm:text-2xl font-semibold text-merchant-primary">
            Community
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Sedang Dalam Pengembangan
          </p>
        </div>
      </div>
    </div>

    <!-- Spacer untuk kompensasi fixed header -->
    <div class="h-24 sm:h-0"></div>

    <!-- Main Content -->
    <div class="flex items-center justify-center p-4">
      <div class="max-w-2xl w-full text-center">
        <!-- Icon -->
        <div
          class="w-32 h-32 mx-auto mb-6 bg-merchant-primary/10 rounded-full flex items-center justify-center"
        >
          <i class="pi pi-wrench text-6xl text-merchant-primary"></i>
        </div>

        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Sedang Dalam Pengembangan
        </h1>

        <!-- Description -->
        <p class="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Fitur Community sedang kami kembangkan untuk memberikan pengalaman
          terbaik bagi Anda.
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="goBack"
            class="px-6 py-3 bg-merchant-primary text-white rounded-xl hover:bg-merchant-primary/90 transition font-semibold flex items-center justify-center gap-2"
          >
            <i class="pi pi-arrow-left"></i>
            Kembali
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
