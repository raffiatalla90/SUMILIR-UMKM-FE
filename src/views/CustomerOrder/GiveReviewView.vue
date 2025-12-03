<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
      <div class="flex items-center max-w-4xl mx-auto">
        <button @click="goBack" class="mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Beri Nilai</h1>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl mx-auto p-4 pb-24">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Product Info -->
        <div class="p-4 flex gap-4 border-b">
          <img src="https://via.placeholder.com/120x120/D2B48C/FFFFFF?text=CemalCemil" 
               alt="CemalCemil" 
               class="w-24 h-24 rounded-lg object-cover">
          <div class="flex-1">
            <h3 class="font-bold text-lg">CemalCemil</h3>
            <p class="text-blue-600 font-semibold text-lg mt-1">Rp 21.000</p>
            <div class="flex gap-1 my-2">
              <button 
                v-for="star in 5" 
                :key="star"
                @click="rating = star"
                class="focus:outline-none transition-transform hover:scale-110">
                <svg 
                  class="w-7 h-7 transition-colors"
                  :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                  fill="currentColor" 
                  viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add Images Section -->
        <div class="p-4 border-b">
          <h4 class="font-semibold mb-3">Tambahkan Gambar</h4>
          <div class="flex gap-3">
            <!-- Existing Image -->
            <div class="relative">
              <img 
                src="https://via.placeholder.com/80x80/FFA500/FFFFFF?text=Foto" 
                alt="Review" 
                class="w-20 h-20 rounded-lg object-cover">
              <button 
                @click="removeImage(0)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Add Image Button -->
            <label class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input type="file" class="hidden" accept="image/*" multiple @change="handleFileUpload">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </label>
          </div>
        </div>

        <!-- Opinion Section -->
        <div class="p-4">
          <h4 class="font-semibold mb-3">Bagikan Pendapat Anda</h4>
          <textarea 
            v-model="reviewText"
            placeholder="Pentolnya muanteeeep poll"
            class="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        @click="submitReview"
        :disabled="rating === 0 || !reviewText.trim()"
        class="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md">
        Kirim
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const rating = ref(0);
const reviewText = ref('');
const images = ref([]);

const goBack = () => {
  router.back();
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};

const submitReview = () => {
  if (rating.value === 0 || !reviewText.value.trim()) {
    return;
  }
  
  // Handle review submission here
  console.log({
    rating: rating.value,
    text: reviewText.value,
    images: images.value
  });
  
  // Show success message or navigate
  alert('Review berhasil dikirim!');
  router.back();
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