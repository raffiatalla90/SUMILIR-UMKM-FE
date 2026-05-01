<template>
  <div class="relative">
    <!-- 3-dots button -->
    <button
      @click="toggleMenu"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :aria-label="`Report ${reportableName}`"
    >
      <MoreVertical :size="20" class="text-gray-600 dark:text-gray-400" />
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isMenuOpen"
      v-click-outside="closeMenu"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <button
        @click="openReportModal"
        class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
      >
        <Flag :size="16" />
        Laporkan
      </button>
    </div>

    <!-- Report Modal -->
    <ReportModal
      v-if="showReportModal"
      :reportable-type="reportableType"
      :reportable-id="reportableId"
      :reportable-name="reportableName"
      @close="closeReportModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MoreVertical, Flag } from 'lucide-vue-next';
import ReportModal from './ReportModal.vue';

defineProps({
  reportableType: {
    type: String,
    required: true,
    validator: (value) => ['product', 'merchant', 'post', 'post_comment', 'user'].includes(value),
  },
  reportableId: {
    type: Number,
    required: true,
  },
  reportableName: {
    type: String,
    required: true,
  },
});

const isMenuOpen = ref(false);
const showReportModal = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const openReportModal = () => {
  showReportModal.value = true;
  closeMenu();
};

const closeReportModal = () => {
  showReportModal.value = false;
};

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>