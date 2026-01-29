<script setup>
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

  rowKey: {
    type: String,
    default: "id",
  },

  // Actions
  // actions: {
  //   type: Array,
  //   default: () => [],
  // },

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
const hasSlot = (name) => {
  return !!slots[name];
};
const emit = defineEmits([
  "update:selectedItems",
  "row-click",
  "page-change",
  "next-page",
  "prev-page",
]);
const isAllSelected = computed(() => {
  if (!props.items.length) return false;

  return props.items.every((item) =>
    props.selectedItems.includes(getItemKey(item)),
  );
});

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
  if (isAllSelected.value) {
    // unselect all
    emit("update:selectedItems", []);
  } else {
    // select all
    const allKeys = props.items.map((item) => getItemKey(item));
    emit("update:selectedItems", allKeys);
  }
};

const getItemKey = (item) => item[props.rowKey];
const toggleItemSelection = (item) => {
  const key = getItemKey(item);
  const selected = [...props.selectedItems];
  const index = selected.indexOf(key);

  if (index > -1) selected.splice(index, 1);
  else selected.push(key);

  emit("update:selectedItems", selected);
};

const isItemSelected = (item) => {
  return props.selectedItems.includes(getItemKey(item));
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
  <div class="overflow-hidden bg-white rounded-lg shadow">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div
        class="w-10 h-10 border-4 rounded-full border-muted-foreground border-t-merchant-primary animate-spin"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!items || items.length === 0"
      class="flex flex-col items-center justify-center py-20"
    >
      <i class="mb-4 text-5xl pi pi-inbox text-muted-foreground"></i>
      <p class="mb-4 text-muted-foreground">
        {{ emptyMessage }}
      </p>
    </div>

    <!-- Table Content (only show when items exist) -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="showCheckbox" class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="appearance-none w-4.5 h-4.5 border-1 border-muted-foreground rounded-sm bg-transparent cursor-pointer transition-all duration-100 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
              />
            </th>

            <!-- Data Columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
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
            class="transition cursor-pointer hover:bg-gray-50"
          >
            <!-- Checkbox Cell -->
            <td
              v-if="showCheckbox"
              class="px-6 py-4 whitespace-nowrap"
              @click.stop
            >
              <input
                type="checkbox"
                :checked="isItemSelected(item)"
                @change="toggleItemSelection(item)"
                class="appearance-none w-4.5 h-4.5 border-1 border-muted-foreground rounded-sm bg-transparent cursor-pointer transition-all duration-100 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <div v-if="!loading" class="px-6 py-4 border-t border-muted-background">
    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
          <i class="text-xs pi pi-chevron-left"></i>
          <span>Prev</span>
        </Button>

        <!-- Page Numbers -->
        <template v-for="(page, index) in visiblePages" :key="index">
          <span
            v-if="page === '...'"
            class="px-3 py-2 text-sm text-muted-foreground"
          >
            ...
          </span>
          <button
            v-else
            @click="goToPage(page)"
            class="px-3 py-1.5 rounded-lg border transition min-w-10 text-sm"
            :class="
              currentPage === page
                ? 'bg-merchant-primary text-white border-merchant-primary font-semibold'
                : 'border-muted-background hover:bg-muted-background text-muted-foreground'
            "
          >
            {{ page }}
          </button>
        </template>

        <!-- Next Button -->
        <Button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          variant="merchant"
          size="sm"
        >
          <span>Next</span>
          <i class="text-xs pi pi-chevron-right"></i>
        </Button>
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
