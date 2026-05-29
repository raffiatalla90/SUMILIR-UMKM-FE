<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useToast } from "vue-toastification";
import api from "@/libs/axios";

const props = defineProps({
  resourceType: {
    type: String,
    default: "jasa", // "jasa" or "merchant"
  },
  resourceId: {
    type: [String, Number],
    required: true,
  },
});

const toast = useToast();
const ratings = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

const fetchRatings = async (pageNum = 1) => {
  loading.value = true;
  try {
    let endpoint = "";
    if (props.resourceType === "jasa") {
      endpoint = `/api/public/jasas/${props.resourceId}/ratings?page=${pageNum}`;
    } else if (props.resourceType === "merchant") {
      endpoint = `/api/public/merchants/${props.resourceId}/ratings?page=${pageNum}`;
    }

    const { data } = await api.get(endpoint);
    const newRatings = data?.data || data || [];

    if (pageNum === 1) {
      ratings.value = newRatings;
    } else {
      ratings.value = [...ratings.value, ...newRatings];
    }

    hasMore.value = newRatings.length === 10;
  } catch (error) {
    console.error("Failed to fetch ratings:", error);
    toast.error("Gagal memuat ulasan");
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    page.value++;
    fetchRatings(page.value);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStarClass = (index, rating) => {
  return index < rating ? "text-yellow-400" : "text-gray-300";
};

onMounted(() => {
  fetchRatings();
});

watch(
  () => [props.resourceType, props.resourceId],
  () => {
    page.value = 1;
    fetchRatings();
  }
);
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Ulasan</h3>
      <span class="text-sm text-gray-500">{{ ratings.length }} ulasan</span>
    </div>

    <!-- Loading -->
    <div v-if="loading && ratings.length === 0" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
    </div>

    <!-- Empty State -->
    <div v-else-if="ratings.length === 0 && !loading" class="text-center py-8 bg-gray-50 rounded-xl">
      <i class="pi pi-star text-3xl text-gray-300 mb-2"></i>
      <p class="text-gray-500">Belum ada ulasan</p>
    </div>

    <!-- Ratings List -->
    <div v-else class="space-y-4">
      <div
        v-for="rating in ratings"
        :key="rating.id"
        class="bg-white rounded-xl p-4 border border-gray-100"
      >
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {{ rating.user?.name?.charAt(0).toUpperCase() || "?" }}
          </div>

          <div class="flex-1">
            <!-- Header -->
            <div class="flex items-center justify-between mb-1">
              <p class="font-medium text-gray-800">{{ rating.user?.name || "Anonim" }}</p>
              <span class="text-xs text-gray-400">{{ formatDate(rating.created_at) }}</span>
            </div>

            <!-- Stars -->
            <div class="flex items-center gap-0.5 mb-2">
              <i
                v-for="i in 5"
                :key="i"
                :class="['pi pi-star-fill text-sm', getStarClass(i - 1, rating.rating)]"
              ></i>
            </div>

            <!-- Title -->
            <p v-if="rating.title" class="font-medium text-gray-700 mb-1">
              {{ rating.title }}
            </p>

            <!-- Comment -->
            <p v-if="rating.comment" class="text-sm text-gray-600">
              {{ rating.comment }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <button
        v-if="hasMore"
        @click="loadMore"
        :disabled="loading"
        class="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
      >
        <span v-if="loading">Memuat...</span>
        <span v-else>Lihat lebih banyak</span>
      </button>
    </div>
  </div>
</template>