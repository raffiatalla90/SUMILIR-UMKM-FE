<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isOpen = ref(false); // Mobile default: closed, Desktop default: open
const notificationCount = ref(12);

const menuItems = [
  {
    label: "Dashboard",
    icon: "pi-chart-bar",
    route: "/merchant-center/dashboard",
  },
  {
    label: "Pesanan",
    icon: "pi-shopping-bag",
    route: "/merchant-center/orders",
  },
  {
    label: "Produk",
    icon: "pi-box",
    route: "/merchant-center/products",
  },
  {
    label: "Komunitas",
    icon: "pi-comments",
    route: "/merchant-center/community",
  },
  {
    label: "Potongan Harga",
    icon: "pi-tag",
    route: "/merchant-center/discounts",
  },
];

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

const closeSidebar = () => {
  isOpen.value = false;
};

const navigateTo = (routePath) => {
  router.push(routePath);
  // Mobile only: close sidebar after navigation
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
};

const isActive = (routePath) => {
  return route.path === routePath;
};

const logout = () => {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    router.push("/login");
  }
};

// Expose toggle function
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
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      ></div>
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 flex flex-col',
        // Mobile: Hidden or visible with animation
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: Collapsed or expanded
        'lg:translate-x-0',
        // Width
        isOpen ? 'w-64' : 'w-64 lg:w-16',
      ]"
    >
      <!-- Header -->
      <div
        :class="[
          'flex items-center border-b border-gray-200 transition-all duration-300 py-6',
          isOpen
            ? 'justify-between px-4 '
            : 'justify-between px-4 lg:justify-center lg:px-4',
        ]"
      >
        <h2
          :class="[
            'text-lg font-bold text-gray-800 transition-all duration-300',
            isOpen
              ? 'opacity-100'
              : 'opacity-100 lg:opacity-0 lg:w-0 lg:hidden',
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
                  : 'px-4 py-3 gap-3 lg:px-3 lg:justify-center lg:gap-0',
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
                    : 'opacity-100 w-auto lg:opacity-0 lg:w-0 lg:overflow-hidden',
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
              : 'justify-between px-4 py-3 lg:justify-center lg:px-3 lg:relative',
          ]"
          :title="!isOpen ? 'Notifikasi' : ''"
        >
          <div
            :class="[
              'flex items-center',
              isOpen ? 'gap-3' : 'gap-3 lg:gap-0 lg:relative',
            ]"
          >
            <i class="pi pi-bell text-lg text-gray-600 flex-shrink-0"></i>
            <span
              :class="[
                'transition-all duration-300',
                isOpen
                  ? 'opacity-100 w-auto'
                  : 'opacity-100 w-auto lg:opacity-0 lg:w-0 lg:overflow-hidden',
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
                : 'px-2 py-0.5 min-w-[24px] lg:absolute lg:-top-1 lg:-right-1 lg:w-5 lg:h-5 lg:p-0 lg:flex lg:items-center lg:justify-center',
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
              : 'px-4 py-3 gap-3 lg:justify-center lg:px-3 lg:gap-0',
          ]"
          :title="!isOpen ? 'Log Out' : ''"
        >
          <i class="pi pi-sign-out text-lg flex-shrink-0"></i>
          <span
            :class="[
              'transition-all duration-300',
              isOpen
                ? 'opacity-100 w-auto'
                : 'opacity-100 w-auto lg:opacity-0 lg:w-0 lg:overflow-hidden',
            ]"
          >
            Log Out
          </span>
        </button>

        <!-- Profile Card (Full) -->
        <div
          v-if="isOpen"
          class="bg-gradient-to-r from-merchant-primary to-merchant-primary/80 text-white rounded-xl p-4 mt-2 lg:block"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-user text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">Sembako Sari Alam</p>
              <p class="text-xs opacity-90 truncate">UKM Toko</p>
            </div>
            <button
              class="w-6 h-6 hover:bg-white/20 rounded-full flex items-center justify-center transition flex-shrink-0"
            >
              <i class="pi pi-ellipsis-v text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Profile Icon (Collapsed - Desktop Only) -->
        <button
          v-else
          class="hidden lg:flex w-full justify-center items-center p-3 bg-merchant-primary/10 rounded-lg hover:bg-merchant-primary/20 transition"
          title="Profile"
        >
          <i class="pi pi-user text-lg text-merchant-primary"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div
      :class="[
        'flex-1 w-full min-h-screen overflow-x-hidden transition-all duration-300',
        '',
        !isOpen ? 'lg:ml-16' : 'lg:ml-64',
      ]"
    >
      <!-- Router View -->
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
  </div>
</template>

<style scoped>
/* Custom scrollbar */
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

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
