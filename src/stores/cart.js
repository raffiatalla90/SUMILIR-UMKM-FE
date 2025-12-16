import { defineStore } from "pinia";
import api from "@/libs/axios";

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
    /** Ambil jumlah item di cart */
    async fetchCartCount(force = false) {
      if (!localStorage.getItem("user")) {
        this.reset();
        return;
      }
      if (this.loading) return;

      // cache ringan (hindari spam request)
      if (
        !force &&
        this.lastFetchedAt &&
        Date.now() - this.lastFetchedAt < 10_000
      ) {
        return;
      }

      this.loading = true;
      try {
        const res = await api.get("/cart/count");
        this.totalItems = Number(res.data?.count || 0);
        this.lastFetchedAt = Date.now();
      } catch (e) {
        if (e.response?.status === 401) {
          this.reset();
        }
        console.warn("Gagal fetch cart count");
      } finally {
        this.loading = false;
      }
    },

    /** Tambah manual (fallback jika backend tidak balikin count) */
    increase(count = 1) {
      this.totalItems += Number(count || 1);
    },

    /** Set langsung (jika backend balikin total terbaru) */
    setTotal(count) {
      this.totalItems = Number(count || 0);
    },

    reset() {
      this.totalItems = 0;
      this.lastFetchedAt = null;
    },
  },
});
