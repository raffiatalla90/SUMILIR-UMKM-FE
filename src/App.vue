<script setup>
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// ✅ Initialize authentication SYNCHRONOUSLY from localStorage before app renders
// This runs before route guards are evaluated
authStore.initializeFromStorage();
console.log("[App] Authentication initialized, user:", authStore.user?.email);
</script>

<template>
  <RouterView />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
