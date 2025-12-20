// src/stores/cart.js
import { defineStore } from "pinia";
import { useCart } from "@/composables/useCart";

export const useCartStore = defineStore("cart", {
  state: () => ({
    totalItems: 0,
    loading: false,
    lastFetchedAt: null,
  }),

  getters: {
    hasItems: (state) => state.totalItems > 0,
  },

  actions: {
    async fetchCartCount(force = false) {
      if (!localStorage.getItem("user")) {
        this.reset();
        return;
      }

      if (
        !force &&
        this.lastFetchedAt &&
        Date.now() - this.lastFetchedAt < 10_000
      ) {
        return;
      }

      this.loading = true;

      try {
        const { fetchCartCount } = useCart(); // ✅ panggil DI DALAM ACTION
        const count = await fetchCartCount();

        this.totalItems = count; // ✅ INI YANG SEBELUMNYA HILANG
        this.lastFetchedAt = Date.now();
      } catch (e) {
        if (e.response?.status === 401) {
          this.reset();
        }
      } finally {
        this.loading = false;
      }
    },

    setTotal(count) {
      this.totalItems = Number(count || 0);
    },

    increase(count = 1) {
      this.totalItems += Number(count || 1);
    },

    reset() {
      this.totalItems = 0;
      this.lastFetchedAt = null;
    },
  },
});
