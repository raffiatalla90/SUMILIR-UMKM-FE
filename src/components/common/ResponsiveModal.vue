<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/common/ResponsiveModal.vue
import { computed } from "vue";

const props = defineProps({
  // Control
  show: {
    type: Boolean,
    required: true,
  },

  // Content
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },

  // Size
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl", "full"].includes(value),
  },

  // Height
  maxHeight: {
    type: String,
    default: "85vh", // Mobile default
    validator: (value) => value.endsWith("vh") || value.endsWith("px"),
  },
  desktopMaxHeight: {
    type: String,
    default: "90vh", // Desktop default
  },

  // Behavior
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  persistent: {
    type: Boolean,
    default: false,
  },

  // Footer
  showFooter: {
    type: Boolean,
    default: false,
  },

  // Style
  backdropClass: {
    type: String,
    default: "bg-black/50",
  },
  headerClass: {
    type: String,
    default: "",
  },
  bodyClass: {
    type: String,
    default: "",
  },
  footerClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "update:show"]);

// Computed
const sizeClasses = computed(() => {
  const sizes = {
    sm: "sm:max-w-md sm:w-full",
    md: "sm:max-w-lg sm:w-full",
    lg: "sm:max-w-2xl sm:w-full",
    xl: "sm:max-w-4xl sm:w-3/4",
    full: "sm:max-w-full sm:w-full",
  };
  return sizes[props.size];
});

// Methods
const handleClose = () => {
  if (!props.persistent) {
    emit("close");
    emit("update:show", false);
  }
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose();
  }
};
</script>

<template>
  <!-- Backdrop -->
  <transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      @click="handleBackdropClick"
      :class="[
        'fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center p-0 sm:p-4',
        backdropClass,
      ]"
    ></div>
  </transition>

  <!-- Modal -->
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="sm:opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
    enter-to-class="sm:opacity-100 sm:scale-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="sm:opacity-100 sm:scale-100 translate-y-0"
    leave-to-class="sm:opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
  >
    <div
      v-if="show"
      @click.stop
      :class="[
        'fixed inset-x-0 bottom-0 sm:fixed sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
        'bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col z-[70]',
        sizeClasses,
      ]"
      :style="{
        maxHeight: maxHeight,
        'sm:max-height': desktopMaxHeight,
      }"
    >
      <!-- Header -->
      <div
        :class="[
          'flex items-center justify-between px-6 py-4 border-b border-muted-background sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10 flex-shrink-0',
          headerClass,
        ]"
      >
        <div class="min-w-0 flex-1 pr-2">
          <h2 class="text-base sm:text-lg font-semibold text-black truncate">
            {{ title }}
          </h2>
          <p
            v-if="subtitle"
            class="text-xs sm:text-sm text-muted-foreground mt-1 truncate"
          >
            {{ subtitle }}
          </p>
        </div>
        <button
          v-if="showCloseButton"
          @click="handleClose"
          type="button"
          class="w-8 h-8 rounded-full hover:bg-muted-background flex items-center justify-center transition flex-shrink-0"
        >
          <i class="pi pi-times text-muted-foreground"></i>
        </button>
      </div>

      <!-- Body - Scrollable -->
      <div :class="['flex-1 overflow-y-auto px-4 sm:px-6 py-4', bodyClass]">
        <slot></slot>
      </div>

      <!-- Footer (Optional) -->
      <div
        v-if="showFooter || $slots.footer"
        :class="[
          'border-t border-muted-background p-4 bg-white sticky bottom-0 rounded-b-3xl sm:rounded-b-2xl flex-shrink-0',
          footerClass,
        ]"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
