<script setup>
import { computed } from "vue";

const props = defineProps({
  // Data
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // Columns configuration
  columns: {
    type: Array,
    required: true,
  },

  // Selection
  selectedItems: {
    type: Array,
    default: () => [],
  },
  selectAll: {
    type: Boolean,
    default: false,
  },

  // Actions
  actions: {
    type: Array,
    default: () => [],
  },

  // Pagination
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  paginationInfo: {
    type: Object,
    default: () => ({ start: 0, end: 0, total: 0 }),
  },

  // Customization
  emptyMessage: {
    type: String,
    default: "Tidak ada data",
  },
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:selectedItems",
  "update:selectAll",
  "row-click",
  "page-change",
  "next-page",
  "prev-page",
]);

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, "...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...", total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
  }

  return pages;
});

// Methods
const toggleSelectAll = () => {
  emit("update:selectAll", !props.selectAll);
};

const toggleItemSelection = (itemId) => {
  const selected = [...props.selectedItems];
  const index = selected.indexOf(itemId);

  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(itemId);
  }

  emit("update:selectedItems", selected);
};

const isItemSelected = (itemId) => {
  return props.selectedItems.includes(itemId);
};

const handleRowClick = (item) => {
  emit("row-click", item);
};

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== "...") {
    emit("page-change", page);
  }
};

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit("next-page");
  }
};

const prevPage = () => {
  if (props.currentPage > 1) {
    emit("prev-page");
  }
};

// Get nested value from object by key path (e.g., 'user.name')
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-gray-300 border-t-admin-primary rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items || items.length === 0" class="flex flex-col items-center justify-center py-20">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg font-medium">{{ emptyMessage }}</p>
    </div>

    <!-- Table Content (only show when items exist) -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="showCheckbox" class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="toggleSelectAll"
                class="w-4 h-4 text-admin-primary rounded border-gray-300 focus:ring-admin-primary"
              />
            </th>

            <!-- Data Columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="item in items"
            :key="item.id"
            @click="handleRowClick(item)"
            class="hover:bg-gray-50 cursor-pointer transition"
          >
            <!-- Checkbox Cell -->
            <td v-if="showCheckbox" class="px-6 py-4 whitespace-nowrap" @click.stop>
              <input
                type="checkbox"
                :checked="isItemSelected(item.slug)"
                @change="toggleItemSelection(item.slug)"
                class="w-4 h-4 text-admin-primary rounded border-gray-300 focus:ring-admin-primary"
              />
            </td>

            <!-- Data Cells -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <!-- Use slot if provided, otherwise show value -->
              <slot :name="`cell-${column.key}`" :item="item" :row="item">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="showPagination" class="px-6 py-4 border-t bg-gray-50">
        <div class="flex items-center justify-between">
          <!-- Info -->
          <div class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ paginationInfo.start }}</span> to
            <span class="font-medium">{{ paginationInfo.end }}</span> of
            <span class="font-medium">{{ paginationInfo.total }}</span> results
          </div>

          <!-- Buttons -->
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Previous
            </button>

            <!-- Page Numbers -->
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :disabled="page === '...'"
              :class="[
                'px-3 py-2 border rounded-lg text-sm font-medium transition',
                page === currentPage
                  ? 'bg-admin-primary text-white border-admin-primary'
                  : 'hover:bg-gray-100',
                page === '...' ? 'cursor-default' : ''
              ]"
            >
              {{ page }}
            </button>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
