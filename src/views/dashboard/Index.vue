<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-3xl font-bold mb-4">Dashboard</h1>

      <div class="mb-6">
        <p class="text-gray-600">
          Welcome, <strong>{{ authStore.user?.name || "User" }}</strong
          >!
        </p>
        <p class="text-sm text-gray-500">Email: {{ authStore.user?.email }}</p>
      </div>

      <button
        @click="handleLogout"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>
