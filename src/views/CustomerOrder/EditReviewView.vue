<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
      <div class="flex items-center max-w-4xl mx-auto">
        <button @click="goBack" class="mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Edit Penilaian</h1>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-4xl mx-auto p-4 pb-24">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Product Info -->
        <div class="p-4 flex gap-4 border-b">
          <img :src="review.productImage" 
               :alt="review.productName" 
               class="w-24 h-24 rounded-lg object-cover">
          <div class="flex-1">
            <h3 class="font-bold text-lg">{{ review.productName }}</h3>
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
            <p class="text-sm text-gray-500 mt-1">Terakhir diubah: {{ review.lastEdited }}</p>
          </div>
        </div>

        <!-- Edit Images Section -->
        <div class="p-4 border-b">
          <h4 class="font-semibold mb-3">Edit Gambar</h4>
          <div class="flex gap-3 flex-wrap">
            <!-- Existing Images -->
            <div v-for="(image, index) in images" :key="index" class="relative">
              <img 
                :src="image" 
                alt="Review" 
                class="w-20 h-20 rounded-lg object-cover">
              <button 
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Add More Images Button -->
            <label v-if="images.length < 5" class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <input type="file" class="hidden" accept="image/*" multiple @change="handleFileUpload">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-2">Maksimal 5 gambar</p>
        </div>

        <!-- Opinion Section -->
        <div class="p-4">
          <h4 class="font-semibold mb-3">Edit Pendapat Anda</h4>
          <textarea 
            v-model="reviewText"
            placeholder="Tulis ulasan Anda di sini..."
            class="w-full border border-gray-300 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
          <p class="text-xs text-gray-500 mt-2">{{ reviewText.length }} karakter</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button 
          @click="cancelEdit"
          class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-md">
          Batal
        </button>
        <button 
          @click="saveReview"
          :disabled="rating === 0 || !reviewText.trim()"
          class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md">
          Simpan Perubahan
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Sample review data - in real app, this would come from props or API
const review = ref({
  id: 1,
  productName: 'CemalCemil',
  productImage: 'https://via.placeholder.com/120x120/D2B48C/FFFFFF?text=CemalCemil',
  rating: 5,
  text: 'Pentolnya muanteeeep poll',
  images: [
    'https://via.placeholder.com/100x100/FFA500/FFFFFF?text=Foto+1',
    'https://via.placeholder.com/100x100/FF8C00/FFFFFF?text=Foto+2'
  ],
  lastEdited: '25 Nov 2025'
});

// Initialize form with existing review data
const rating = ref(review.value.rating);
const reviewText = ref(review.value.text);
const images = ref([...review.value.images]);

const goBack = () => {
  router.back();
};

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = 5 - images.value.length;
  
  files.slice(0, remainingSlots).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      images.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  
  // Reset input
  event.target.value = '';
};

const removeImage = (index) => {
  if (confirm('Hapus gambar ini?')) {
    images.value.splice(index, 1);
  }
};

const cancelEdit = () => {
  if (confirm('Batalkan perubahan? Semua perubahan yang belum disimpan akan hilang.')) {
    router.back();
  }
};

const saveReview = () => {
  if (rating.value === 0 || !reviewText.value.trim()) {
    return;
  }
  
  // Handle review update here
  console.log({
    id: review.value.id,
    rating: rating.value,
    text: reviewText.value,
    images: images.value
  });
  
  // Show success message or navigate
  alert('Review berhasil diperbarui!');
  router.back();
};

const deleteReview = () => {
  if (confirm('Apakah Anda yakin ingin menghapus review ini? Tindakan ini tidak dapat dibatalkan.')) {
    // Handle review deletion here
    console.log('Deleting review:', review.value.id);
    
    alert('Review berhasil dihapus!');
    router.push({ name: 'Reviews' }); // Navigate to reviews list
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

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>