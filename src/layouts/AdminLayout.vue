<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

const menuItems = [
  {
    label: "Dashboard",
    icon: "pi pi-th-large",
    path: "/admin/dashboard", 
  },
  {
    label: "Events",
    icon: "pi pi-calendar",
    path: "/admin/events",
  },
  {
    label: "Merchants",
    icon: "pi pi-building",
    path: "/admin/merchants", 
  },
  {
    label: "Reports",
    icon: "pi pi-exclamation-triangle",
    path: "/admin/reports", 
  },
  {
    label: "Vouchers",
    icon: "pi pi-tag",
    path: "/admin/vouchers", 
  },
];

// Use path-based active check (same as MerchantLayout)
const isActive = (path) => {
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push({ name: "Login" });
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b">
        <div class="w-10 h-10 bg-admin-primary rounded-lg flex items-center justify-center">
          <i class="pi pi-shield text-white text-xl"></i>
        </div>
        <div>
          <h1 class="font-bold text-lg text-gray-900">Admin Panel</h1>
          <p class="text-xs text-muted-foreground">SUMILIR</p>
        </div>
      </div>

      <!-- Menu -->
      <nav class="px-3 py-4 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.label"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
            isActive(item.path)
              ? 'bg-admin-primary text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
          @click="isSidebarOpen = false"
        >
          <i :class="item.icon"></i>
          <span class="font-medium">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- User Info & Logout -->
      <div class="absolute bottom-0 left-0 right-0 border-t bg-white">
        <div class="px-4 py-3">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-admin-primary/10 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-admin-primary"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-gray-900 truncate">
                {{ authStore.user?.name || 'Admin' }}
              </p>
              <p class="text-xs text-muted-foreground truncate">
                {{ authStore.user?.email }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay (Mobile) -->
    <div
      v-if="isSidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 lg:ml-64">
      <!-- Mobile Header -->
      <header class="bg-white shadow-sm sticky top-0 z-30">
        <div class="flex items-center justify-between px-4 py-4">
          <!-- Mobile Menu Button -->
          <button
            @click="toggleSidebar"
            class="lg:hidden w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <i class="pi pi-bars text-gray-700"></i>
          </button>

          <!-- Desktop Title -->
          <div class="hidden lg:block">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ route.meta.title || 'Dashboard' }}
            </h2>
          </div>

          <!-- Notification Bell -->
          <button class="relative w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <i class="pi pi-bell text-gray-700"></i>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>