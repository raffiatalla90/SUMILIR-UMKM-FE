<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const menus = [
  { key: "home", label: "Beranda", to: "/" },
  { key: "pesanan", label: "Pesanan", to: "#" },
  { key: "peta", label: "Peta UMKM", to: "#" },
  { key: "chat", label: "Chat", to: "#" },
];

// Simpan active utk menu statis
const activeKey = ref(null);

function isMenuActive(m) {
  if (m.to !== "#") return route.path === m.to;
  return activeKey.value === m.key;
}

function onMenuClick(m, e) {
  if (m.to === "#") {
    e.preventDefault();
    activeKey.value = m.key;
  } else {
    activeKey.value = null;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-50 w-full bg-white h-[70px] sm:h-[91px] border-b border-[#D9D9D9]"
    >
      <div class="max-w-[1440px] mx-auto h-full px-4">
        <div class="h-full flex items-center">
          <!-- Brand -->
          <RouterLink
            to="/"
            class="text-xl sm:text-[30px] font-bold leading-[100%] tracking-[0] text-black"
          >
            SUMILIR
          </RouterLink>

          <!-- Menu (hidden on mobile, shown on sm+) -->
          <ul
            class="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 sm:gap-8"
          >
            <li v-for="m in menus" :key="m.key">
              <RouterLink
                :to="m.to"
                @click="(e) => onMenuClick(m, e)"
                class="group relative inline-block text-lg sm:text-[30px] font-semibold leading-[100%] tracking-[0]"
                :aria-current="isMenuActive(m) ? 'page' : null"
              >
                <span class="relative inline-block">
                  <span class="block text-black select-none">
                    {{ m.label }}
                  </span>
                  <!-- Overlay label (primary) yang membuka dari kiri ke kanan -->
                  <span
                    aria-hidden="true"
                    class="absolute inset-0 overflow-hidden transition-all duration-300"
                    :class="
                      isMenuActive(m) ? 'w-full' : 'w-0 group-hover:w-full'
                    "
                  >
                    <span class="block text-primary">
                      {{ m.label }}
                    </span>
                  </span>
                </span>
                <!-- Underline -->
                <span
                  class="pointer-events-none absolute left-0 -bottom-1 h-[2px] sm:h-[3px] w-full bg-primary origin-left transition-transform duration-300"
                  :class="
                    isMenuActive(m)
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  "
                ></span>
              </RouterLink>
            </li>
          </ul>

          <!-- Right side -->
          <div class="ml-auto flex items-center gap-2 sm:gap-4">
            <template v-if="isAuthenticated">
              <span
                class="hidden sm:block text-lg sm:text-[30px] font-bold leading-[100%] tracking-[0] text-black"
              >
                {{ user?.name || "Profil" }}
              </span>
              <img
                :src="
                  user?.avatar ||
                  'https://png.pngtree.com/png-vector/20240529/ourmid/pngtree-the-logo-of-an-avatar-profile-outlines-in-an-icon-circle-vector-png-image_6959193.png'
                "
                alt="Foto Profil"
                class="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-full object-cover"
              />
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="px-3 py-2 sm:px-5 sm:py-2.5 rounded-md bg-secondary hover:bg-secondary-hover text-base sm:text-[30px] font-bold leading-[100%] tracking-[0] text-white"
              >
                Login
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content (router-view) -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer (opsional) -->
    <footer class="bg-gray-100 py-6 text-center text-sm text-gray-600">
      <p>&copy; {{ new Date().getFullYear() }} SUMILIR. All rights reserved.</p>
    </footer>
  </div>
</template>
