<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/merchant/MobilePagination.vue
import Button from "@/components/common/Button.vue";
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  showQuickJump: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["prev", "next", "go-to"]);

const quickJumpPages = computed(() => {
  if (props.totalPages <= 5) return [];
  return [1, Math.ceil(props.totalPages / 2), props.totalPages];
});
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex flex-col items-center gap-3">
      <!-- Pagination Controls -->
      <div class="flex items-center gap-2 w-full justify-center">
        <Button
          @click="$emit('prev')"
          :disabled="currentPage === 1"
          size="sm"
          variant="merchant"
        >
          <i class="pi pi-chevron-left text-xs"></i>
          <span>Prev</span>
        </Button>

        <div class="flex items-center gap-1">
          <div
            class="px-4 py-1.5 bg-merchant-primary text-white rounded-lg text-sm font-semibold text-center"
          >
            {{ currentPage }}
          </div>
          <span class="text-xs text-muted-foreground px-1">dari</span>
          <div
            class="px-4 py-1.5 bg-muted-background text-muted-foreground rounded-lg text-sm font-semibold text-center"
          >
            {{ totalPages }}
          </div>
        </div>

        <Button
          @click="$emit('next')"
          :disabled="currentPage === totalPages"
          size="sm"
          variant="merchant"
        >
          <span>Next</span>
          <i class="pi pi-chevron-right text-xs"></i>
        </Button>
      </div>

      <!-- Quick Jump -->
      <div
        v-if="showQuickJump && totalPages > 5"
        class="flex items-center gap-2 text-xs text-muted-foreground"
      >
        <span>Lompat ke halaman:</span>
        <div class="flex gap-1">
          <button
            v-for="page in quickJumpPages"
            :key="page"
            @click="$emit('go-to', page)"
            :disabled="currentPage === page"
            class="px-2 py-1 rounded border border-muted-background hover:bg-muted-background disabled:bg-merchant-primary disabled:text-white disabled:border-merchant-primary transition text-xs font-medium"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
