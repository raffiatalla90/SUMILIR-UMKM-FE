<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/common/MerchantTable.vue
import { computed, useSlots } from "vue";
import Button from "@/components/common/Button.vue";
const slots = useSlots();
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
    default: "Tidak ada daa",
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
const hasSlot = (name) => {
  return !!slots[name];
};
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

              <!-- Dynamic Columns with Slots -->
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-6 py-4"
                :class="column.cellClass"
              >
                <div class="flex items-center">
                  <slot
                    v-if="hasSlot(`cell-${column.key}`)"
                    :name="`cell-${column.key}`"
                    :item="item"
                    :value="getNestedValue(item, column.key)"
                  />

                  <span v-else class="text-sm">
                    {{ getNestedValue(item, column.key) || "-" }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td v-if="actions.length > 0" class="px-6 py-4" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-for="(action, index) in actions"
                    :key="index"
                    @click="action.handler(item)"
                    class="p-2 rounded-lg transition"
                    :class="
                      action.class ||
                      'hover:bg-muted-background text-muted-foreground'
                    "
                    :title="action.label"
                  >
                    <i :class="['pi', action.icon, 'text-sm']"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading" class="border-t border-muted-background px-6 py-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Pagination Info -->
        <div class="text-sm text-muted-foreground">
          Menampilkan
          <span class="font-semibold text-black">
            {{ paginationInfo.per_page }}
          </span>
          items/halaman
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-2">
          <!-- Previous Button -->
          <Button
            @click="prevPage"
            :disabled="currentPage === 1"
            variant="merchant"
            size="sm"
          >
            <i class="pi pi-chevron-left text-xs"></i>
            <span>Prev</span>
          </Button>

          <!-- Page Numbers -->
          <template v-for="(page, index) in visiblePages" :key="index">
            <!-- Ellipsis -->
            <span
              v-if="page === '...'"
              class="px-3 py-2 text-muted-foreground text-sm"
            >
              ...
            </span>

            <!-- Page Button -->
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="px-3 py-1.5 rounded-lg border transition min-w-[40px] text-sm"
              :class="
                currentPage === page
                  ? 'bg-merchant-primary text-white border-merchant-primary font-semibold'
                  : 'border-muted-background hover:bg-muted-background text-muted-foreground'
              "
            >
              {{ page }}
            </button>

          <!-- Next Button -->
          <Button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            variant="merchant"
            size="sm"
          >
            <span>Next</span>
            <i class="pi pi-chevron-right text-xs"></i>
          </Button>
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
