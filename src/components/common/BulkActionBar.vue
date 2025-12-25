<!-- filepath: c:\laragon\www\KMI-SIMSLIFE-FE\src\components\common\BulkActionBar.vue -->
<script setup>
import Button from "@/components/common/Button.vue";

const props = defineProps({
  selectedCount: {
    type: Number,
    required: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["cancel", "delete", "change-status"]);

const handleCancel = () => {
  emit("cancel");
};

const handleDelete = () => {
  emit("delete");
};

const handleChangeStatus = () => {
  emit("change-status");
};
</script>

<template>
  <!-- Floating Bulk Action Bar -->
  <transition
    enter-active-class="transition-all duration-300"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="show"
      class="fixed z-30"
      :class="[
        // Mobile: Bottom sticky (full width)
        'bottom-0 left-0 right-0 bg-white border-t border-muted-background shadow-2xl',
        // Desktop: Floating centered
        'sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:min-w-xl sm:rounded-2xl sm:shadow-lg sm:border',
      ]"
    >
      <div class="px-6 py-4">
        <div class="flex items-center justify-between gap-3">
          <!-- Selected Count -->
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 bg-merchant-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span class="text-merchant-primary font-bold text-sm">
                {{ selectedCount }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-black truncate">
                {{ selectedCount }} Produk dipilih
              </p>
              <button
                @click="handleCancel"
                class="text-xs text-muted-foreground hover:text-merchant-primary transition whitespace-nowrap"
              >
                Batalkan Pilihan
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Delete Button -->
            <Button @click="handleDelete" variant="danger-outline">
              <i class="pi pi-trash"></i>
              <span class="hidden sm:inline text-sm ml-2">Hapus</span>
            </Button>

            <!-- Status Action Button -->
            <Button @click="handleChangeStatus" variant="merchant">
              <i class="pi pi-pencil"></i>
              <span class="hidden sm:inline text-sm ml-2">Ubah Status</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
