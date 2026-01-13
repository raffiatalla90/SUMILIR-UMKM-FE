<script setup>
import { ref, computed, watch, onMounted, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import Button from "@/components/common/Button.vue";

const route = useRoute();
const router = useRouter();
const emit = defineEmits(["toggle-sidebar"]);

// ✅ Create callback ref that child components will populate
const exportModalCallback = ref(null);

// ✅ Provide method to children to register their export function
provide('registerExportModal', (callback) => {
  console.log('Child registered export modal callback');
  exportModalCallback.value = callback;
});

// Tabs: sync with query (?tab=customers|merchants)
const activeTab = computed(() => {
  if (route.name === "Admin - Merchants List") return "merchants";
  return "customers";
});

const isDetailRoute = computed(
  () => route.name === "Admin - Customer Detail" || route.name === "Admin - Merchant Detail"
);

const effectiveTab = computed(() => {
  if (!isDetailRoute.value) return activeTab.value;
  return route.name === "Admin - Merchant Detail" ? "merchants" : "customers";
});

const isCreateRoute = computed(() => 
  route.name === "Admin - Customer Create" || route.name === "Admin - Merchant Create"
);

const breadcrumbItems = computed(() => {
  const items = [
    {
      label: "Users",
      path: { name: "Admin - Users", query: { tab: effectiveTab.value } },
    },
    {
      label: effectiveTab.value === "merchants" ? "Merchants" : "Customers",
      path: !isListRoute.value
        ? { name: "Admin - Users", query: { tab: effectiveTab.value } }
        : undefined,
    },
  ];

  if (isDetailRoute.value) {
    items.push({ label: "Detail" });
  } else if (isCreateRoute.value && effectiveTab.value === "customers") {
    items.push({ label: "Tambah Customer" });
  } else if (isCreateRoute.value && effectiveTab.value === "merchants") {
    items.push({ label: "Tambah Merchant" });
  }

  return items;
});

const headerSubtitle = computed(() => {
  if (isDetailRoute.value) {
    return effectiveTab.value === "merchants" ? "Detail merchant" : "Detail customer";
  }
  return effectiveTab.value === "merchants" ? "Kelola data merchant" : "Kelola data customer";
});

const addLabel = computed(() => 
  effectiveTab.value === "merchants" ? "Tambah Merchant" : "Tambah Customer"
);

const setTab = (tab) => {
  if (tab === "merchants") {
    router.push({ name: "Admin - Merchants List" });
  } else {
    router.push({ name: "Admin - Customers List" });
  }
};

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === "merchants" || tab === "customers") activeTab.value = tab;
  }
);

onMounted(() => {
  const tab = route.query.tab;
  if (tab === "merchants" || tab === "customers") activeTab.value = tab;
});

// ✅ Trigger export using callback
const triggerExport = () => {
  console.log('triggerExport called, tab:', effectiveTab.value);
  console.log('exportModalCallback exists:', !!exportModalCallback.value);
  
  if (typeof exportModalCallback.value === 'function') {
    console.log('Calling export callback');
    exportModalCallback.value();
  } else {
    console.error('Export modal callback not registered');
    toast.error('Export tidak tersedia untuk halaman ini');
  }
};

const triggerCreate = () => {
  goToCreate();
};

const goToCreate = () => {
  if (effectiveTab.value === "merchants") {
    router.push({ name: "Admin - Merchant Create" });
  } else {
    router.push({ name: "Admin - Customer Create" });
  }
};

const goToDetail = (user) => {
  router.push({ name: "Admin - Customer Detail", params: { id: user.id } });
};

const isListRoute = computed(() =>
  route.name === "Admin - Customers List" || route.name === "Admin - Merchants List"
);

// ✅ Clear callback when route changes (to prevent stale references)
watch(() => route.name, () => {
  exportModalCallback.value = null;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div
      class="fixed sm:static top-0 left-0 right-0 flex justify-between items-center py-6 px-4 sm:px-6 bg-white z-10 border-b border-gray-200 shadow-sm"
    >
      <div class="flex items-center gap-3 min-w-0">
        <button
          @click="emit('toggle-sidebar')"
          class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-muted-background transition sm:hidden"
          aria-label="Toggle sidebar"
          type="button"
        >
          <i class="pi pi-bars text-muted-foreground"></i>
        </button>

        <div class="min-w-0">
          <Breadcrumb :items="breadcrumbItems" />
          <p class="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
            {{ headerSubtitle }}
          </p>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2 sm:gap-3">
        <!-- Tambah: hide saat detail -->
        <template v-if="!isDetailRoute">
          <Button @click="triggerCreate" variant="merchant" size="sm" customClass="!hidden sm:!inline">
            <i class="pi pi-plus"></i>
            <span class="hidden sm:inline ml-2">{{ addLabel }}</span>
          </Button>

          <Button @click="triggerCreate" variant="merchant" size="md" customClass="sm:!hidden">
            <i class="pi pi-plus"></i>
          </Button>
        </template>

        <!-- Export Button -->
        <Button 
          @click="triggerExport" 
          variant="merchant-outline" 
          size="sm" 
          customClass="!hidden sm:!inline"
        >
          <i class="pi pi-download"></i>
          <span class="hidden sm:inline ml-2">Export</span>
        </Button>

        <Button 
          @click="triggerExport" 
          variant="merchant-outline" 
          size="md" 
          customClass="sm:!hidden"
        >
          <i class="pi pi-download"></i>
        </Button>
      </div>
    </div>

    <div class="h-[92px] sm:h-0"></div>
    
    <div class="px-4 p-4 sm:px-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Tabs -->
        <template v-if="isListRoute">
          <div class="sm:hidden p-3">
            <select
              v-model="activeTab"
              @change="setTab(activeTab)"
              class="block w-full px-4 py-2.5 bg-white border border-muted-foreground text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-merchant-primary focus:border-merchant-primary shadow-sm"
            >
              <option value="customers">Customers</option>
              <option value="merchants">Merchants</option>
            </select>
          </div>

          <div class="hidden sm:flex border-b border-gray-200">
            <button
              class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-colors"
              :class="
                activeTab === 'customers'
                  ? 'border-merchant-primary text-merchant-primary bg-merchant-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-black hover:border-gray-300'
              "
              @click="setTab('customers')"
              type="button"
            >
              <i class="pi pi-users mr-2"></i>
              Customers
            </button>

            <button
              class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-colors"
              :class="
                activeTab === 'merchants'
                  ? 'border-merchant-primary text-merchant-primary bg-merchant-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-black hover:border-gray-300'
              "
              @click="setTab('merchants')"
              type="button"
            >
              <i class="pi pi-building mr-2"></i>
              Merchants
            </button>
          </div>
        </template>

        <!-- Router View -->
        <router-view @create="goToCreate" />
      </div>
    </div>
  </div>
</template>