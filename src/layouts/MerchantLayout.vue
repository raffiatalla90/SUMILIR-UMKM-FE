<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/layouts/MerchantLayout.vue
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import Button from "@/components/common/Button.vue";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isOpen = ref(false);
const notificationCount = ref(12);
const showLogoutModal = ref(false);

// ✅ Get merchantId dari route params
const currentMerchantId = computed(() => {
  return route.params.merchantId
    ? Number(route.params.merchantId)
    : authStore.merchantId;
});

// ✅ Get merchant data berdasarkan merchantId di route
const currentMerchant = computed(() => {
  const merchantId = currentMerchantId.value;
  if (!merchantId) return null;

  return authStore.getMerchantById(merchantId);
});

// ✅ Display merchant name & type dari current merchant (bukan active merchant)
const merchantName = computed(() => {
  return currentMerchant.value?.name || authStore.user?.name || "Merchant";
});

const merchantType = computed(() => {
  return currentMerchant.value?.segmentation?.name || "UMKM";
});

const merchantsCount = computed(() => authStore.merchantsCount);

const userInitial = computed(() => {
  const name = merchantName.value;
  return name.charAt(0).toUpperCase();
});

const showMerchantSelector = computed(() => merchantsCount.value > 1);

// ✅ Watch route changes untuk update active merchant
watch(
  () => route.params.merchantId,
  (newMerchantId) => {
    if (newMerchantId) {
      authStore.setActiveMerchant(Number(newMerchantId));
      console.log(
        "✅ Merchant changed to ID:",
        newMerchantId,
        "Name:",
        merchantName.value
      );
    }
  },
  { immediate: true }
);

// ✅ Check if current merchant is UMKM Jasa (segmentation_id = 3)
const isJasaMerchant = computed(() => {
  const merchant = currentMerchant.value;
  return merchant?.segmentation_id === 3;
});

// ✅ Menu items dengan dynamic merchantId dan dynamic product/jasa route
const menuItems = computed(() => {
  const isJasa = isJasaMerchant.value;
  const items = [
    {
      label: "Dashboard",
      icon: "pi-chart-bar",
      route: `/merchant-center/${currentMerchantId.value}/dashboard`,
    },
    {
      label: "Pesanan",
      icon: "pi-shopping-bag",
      route: `/merchant-center/${currentMerchantId.value}/orders`,
    },
    {
      label: isJasa ? "Jasa" : "Produk",
      icon: "pi-box",
      route: `/merchant-center/${currentMerchantId.value}/${isJasa ? "jasas" : "products"}`,
    },
    {
      label: "Komunitas",
      icon: "pi-comments",
      route: `/merchant-center/${currentMerchantId.value}/community`,
    },
    {
      label: "Potongan Harga",
      icon: "pi-tag",
      route: `/merchant-center/${currentMerchantId.value}/discounts`,
    },
  ];
  
  return items;
});

const logout = async () => {
  try {
    await authStore.logout();
    showLogoutModal.value = false;
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    showLogoutModal.value = false;
  }
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const closeSidebar = () => {
  isOpen.value = false;
};

const navigateTo = (routePath) => {
  router.push(routePath);
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
};

const isActive = (routePath) => {
  if (route.path === routePath) {
    return true;
  }

  const currentPath = route.path;
  const menuPath = routePath;

  if (currentPath.startsWith(menuPath)) {
    return true;
  }

  return false;
};

defineExpose({
  toggleSidebar,
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Backdrop for Mobile Only -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        @click="closeSidebar"
        class="fixed inset-0 bg-black/50 z-40 sm:hidden"
      ></div>
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white shadow-sm z-40 transition-all duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'sm:translate-x-0',
        isOpen ? 'w-64' : 'w-64 sm:w-16',
      ]"
    >
      <!-- Header -->
      <div
        :class="[
          'flex items-center transition-all duration-300 h-20 shadow-sm',
          isOpen
            ? 'justify-between px-4'
            : 'justify-between px-4 sm:justify-center sm:px-4',
        ]"
      >
        <h2
          :class="[
            'text-lg font-bold text-gray-800 transition-all duration-300',
            isOpen
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:w-0 sm:hidden',
          ]"
        >
          Sumilir Logo
        </h2>

        <!-- Hamburger Button -->
        <button
          @click="toggleSidebar"
          class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
        >
          <i
            :class="[
              'pi text-gray-600 transition-transform duration-300',
              isOpen ? 'pi-times' : 'pi-bars',
            ]"
          ></i>
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 overflow-y-auto px-3 py-2">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.route">
            <button
              @click="navigateTo(item.route)"
              :class="[
                'w-full flex items-center rounded-lg text-sm font-medium transition-all',
                isOpen
                  ? 'px-4 py-3 gap-3'
                  : 'px-4 py-3 gap-3 sm:px-3 sm:justify-center sm:gap-0',
                isActive(item.route)
                  ? 'bg-merchant-primary/10 text-merchant-primary'
                  : 'text-gray-700 hover:bg-gray-50',
              ]"
              :title="!isOpen ? item.label : ''"
            >
              <i
                :class="[
                  'pi text-lg flex-shrink-0',
                  item.icon,
                  isActive(item.route)
                    ? 'text-merchant-primary'
                    : 'text-gray-600',
                ]"
              ></i>
              <span
                :class="[
                  'transition-all duration-300',
                  isOpen
                    ? 'opacity-100 w-auto'
                    : 'opacity-100 w-auto sm:opacity-0 sm:w-0 sm:overflow-hidden',
                ]"
              >
                {{ item.label }}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-gray-200 p-3 space-y-2">
        <!-- Notification -->
        <button
          :class="[
            'w-full flex items-center rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition',
            isOpen
              ? 'justify-between px-4 py-3'
              : 'justify-between px-4 py-3 sm:justify-center sm:px-3 sm:relative',
          ]"
          :title="!isOpen ? 'Notifikasi' : ''"
        >
          <div
            :class="[
              'flex items-center',
              isOpen ? 'gap-3' : 'gap-3 sm:gap-0 sm:relative',
            ]"
          >
            <i class="pi pi-bell text-lg text-gray-600 flex-shrink-0"></i>
            <span
              :class="[
                'transition-all duration-300',
                isOpen
                  ? 'opacity-100 w-auto'
                  : 'opacity-100 w-auto sm:opacity-0 sm:w-0 sm:overflow-hidden',
              ]"
            >
              Notifikasi
            </span>
          </div>
          <span
            v-if="notificationCount > 0"
            :class="[
              'bg-merchant-primary text-white text-xs font-bold rounded-full text-center transition-all duration-300',
              isOpen
                ? 'px-2 py-0.5 min-w-[24px]'
                : 'px-2 py-0.5 min-w-[24px] sm:absolute sm:-top-1 sm:-right-1 sm:w-5 sm:h-5 sm:p-0 sm:flex sm:items-center sm:justify-center',
            ]"
          >
            {{ notificationCount }}
          </span>
        </button>

        <!-- Logout -->
        <button
          @click="logout"
          :class="[
            'w-full flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition',
            isOpen
              ? 'px-4 py-3 gap-3'
              : 'px-4 py-3 gap-3 sm:justify-center sm:px-3 sm:gap-0',
          ]"
          :title="!isOpen ? 'Log Out' : ''"
        >
          <i class="pi pi-sign-out text-lg flex-shrink-0"></i>
          <span
            :class="[
              'transition-all duration-300',
              isOpen
                ? 'opacity-100 w-auto'
                : 'opacity-100 w-auto sm:opacity-0 sm:w-0 sm:overflow-hidden',
            ]"
          >
            Log Out
          </span>
        </button>

        <!-- ✅ Profile Card - Display current merchant based on route -->
        <div
          v-if="isOpen"
          class="bg-gradient-to-r from-merchant-primary to-merchant-primary/80 text-white rounded-xl p-4 mt-2 sm:block"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg"
            >
              {{ userInitial }}
            </div>

            <div class="flex-1 min-w-0">
              <!-- ✅ Merchant Name dari route ID -->
              <p class="text-sm font-semibold truncate" :title="merchantName">
                {{ merchantName }}
              </p>
              <!-- ✅ Merchant Type dari route ID -->
              <p class="text-xs opacity-90 truncate" :title="merchantType">
                {{ merchantType }}
              </p>
              <!-- Badge multiple merchants -->
              <span
                v-if="showMerchantSelector"
                class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1"
              >
                {{ merchantsCount }} Merchant
              </span>
            </div>

            <button
              class="w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center transition flex-shrink-0"
              title="Pengaturan"
            >
              <i class="pi pi-ellipsis-v text-sm"></i>
            </button>
          </div>

          <!-- ✅ Debug info (remove after testing) -->
          <div
            v-if="false"
            class="mt-2 pt-2 border-t border-white/20 text-xs opacity-75"
          >
            <div>Route Merchant ID: {{ currentMerchantId }}</div>
            <div>Merchant Name: {{ merchantName }}</div>
            <div>Merchant Type: {{ merchantType }}</div>
          </div>
        </div>

        <!-- Collapsed State -->
        <button
          v-else
          class="hidden sm:flex w-full justify-center items-center p-3 bg-merchant-primary/10 rounded-lg hover:bg-merchant-primary/20 transition"
          :title="`${merchantName} - ${merchantType}`"
        >
          <span class="text-lg font-bold text-merchant-primary">
            {{ userInitial }}
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      :class="[
        'flex-1 w-full min-h-screen overflow-x-hidden transition-all duration-300',
        !isOpen ? 'sm:ml-16' : 'sm:ml-64',
      ]"
    >
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component :is="Component" @toggle-sidebar="toggleSidebar" />
        </transition>
      </router-view>
    </div>

    <ResponsiveModal
      v-model:show="showLogoutModal"
      title="Konfirmasi Logout"
    >
      <div class="text-center py-4">
        <i
          class="pi pi-exclamation-triangle text-5xl text-warning-foreground mb-4"
        ></i>
        <p class="text-base text-gray-700 mb-2">
          Apakah Anda yakin ingin keluar?
        </p>
        <p class="text-sm text-muted-foreground">
          Anda akan diarahkan ke halaman login
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <Button
            @click="showLogoutModal = false"
            variant="muted-outline"
            block
          >
            Batal
          </Button>
          <Button @click="logout" variant="danger" block> Ya, Logout </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>

<style scoped>
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
