<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <header class="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
      <div class="flex items-center max-w-6xl mx-auto">
        <button @click="goBack" class="mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Lihat Penilaian</h1>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      <!-- Review 1 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Product Info -->
        <div class="p-4 flex gap-4">
          <img src="https://via.placeholder.com/120x120/D2B48C/FFFFFF?text=CemalCemil" 
               alt="CemalCemil" 
               class="w-24 h-24 rounded-lg object-cover">
          <div class="flex-1">
            <h3 class="font-bold text-lg">CemalCemil</h3>
            <div class="flex gap-1 my-2">
              <svg v-for="i in 5" :key="i" class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Review Text -->
        <div class="px-4 pb-4">
          <p class="text-gray-700">Pentolnya muanteeeep poll</p>
        </div>

        <!-- Review Images -->
        <div class="px-4 pb-4 flex gap-2">
          <img src="https://via.placeholder.com/100x100/FFA500/FFFFFF?text=Foto+1" 
               alt="Review 1" 
               class="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity">
          <img src="https://via.placeholder.com/100x100/FF8C00/FFFFFF?text=Foto+2" 
               alt="Review 2" 
               class="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity">
        </div>

        <!-- Action Buttons -->
        <div class="px-4 pb-4 flex gap-3 justify-end border-t pt-3">
          <button @click="router.push('/my-order/review/edit-review')"
                  class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <span>Edit</span>
          </button>
          <button @click="router.push('/my-order/review/edit-review')"
                  class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div class="flex justify-around max-w-6xl mx-auto">
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span class="text-xs mt-1">Home</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Orders</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Favorites</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Messages</span>
        </button>
        
        <button class="flex flex-col items-center p-3 text-gray-500 hover:text-blue-500 transition-colors">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

const editReview = (reviewId) => {
  console.log('Edit review:', reviewId);
  // Tambahkan logika untuk edit review
  // router.push({ name: 'EditReview', params: { id: reviewId } });
};

const deleteReview = (reviewId) => {
  const confirmed = confirm('Apakah Anda yakin ingin menghapus review ini?');
  if (confirmed) {
    console.log('Delete review:', reviewId);
    // Tambahkan logika untuk hapus review
  }
};
</script>

<style scoped>
/* Responsive adjustments */
@media (min-width: 768px) {
  .max-w-4xl {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>