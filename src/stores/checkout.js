import { defineStore } from "pinia";

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    // Info produk
    productSlug: null,
    productTitle: null,
    productImage: null,
    store: { id: null, slug: null, name: null, address: null, phone: null },

    // Pilihan user
    qty: 1,
    selectedSizeId: null,
    selectedSizeName: null,
    selectedVariantId: null,
    selectedVariantName: null,
    selectedAddons: [], // [{ id, name, price }]

    // Harga/stok kombinasi saat ini
    unitPrice: 0, // harga kombinasi (base) tanpa addon
    addonTotal: 0, // total harga addon yang dipilih
    combination: { sizeId: 0, variantId: 0, stock: 0 },

    lastUpdatedAt: null,
  }),
  getters: {
    totalPrice(state) {
      return Math.max(
        0,
        (Number(state.unitPrice) + Number(state.addonTotal)) *
          Number(state.qty || 1)
      );
    },
  },
  actions: {
    setFromProductDetail(payload) {
      // payload: { slug, title, image, store, qty, sizeId, sizeName, variantId, variantName, unitPrice, stock, addons }
      this.productSlug = payload.slug ?? null;
      this.productTitle = payload.title ?? null;
      this.productImage = payload.image ?? null;
      this.store = {
        id: payload.store?.id ?? null,
        slug: payload.store?.slug ?? null,
        name: payload.store?.name ?? null,
        address: payload.store?.address ?? null,
        phone: payload.store?.phone ?? null,
      };

      this.qty = Number(payload.qty || 1);

      this.selectedSizeId = payload.sizeId ?? null;
      this.selectedSizeName = payload.sizeName ?? null;

      this.selectedVariantId = payload.variantId ?? null;
      this.selectedVariantName = payload.variantName ?? null;

      this.unitPrice = Number(payload.unitPrice || 0);
      this.combination = {
        sizeId: Number(payload.sizeId ?? 0),
        variantId: Number(payload.variantId ?? 0),
        stock: Number(payload.stock ?? 0),
      };

      const addons = Array.isArray(payload.addons) ? payload.addons : [];
      this.selectedAddons = addons.map((a) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price || 0),
      }));
      this.addonTotal = this.selectedAddons.reduce(
        (s, a) => s + Number(a.price || 0),
        0
      );

      this.lastUpdatedAt = Date.now();
    },
    updateSelection({
      sizeId,
      sizeName,
      variantId,
      variantName,
      unitPrice,
      stock,
    }) {
      if (sizeId !== undefined) {
        this.selectedSizeId = sizeId;
        this.selectedSizeName = sizeName ?? this.selectedSizeName;
        this.combination.sizeId = Number(sizeId ?? 0);
      }
      if (variantId !== undefined) {
        this.selectedVariantId = variantId;
        this.selectedVariantName = variantName ?? this.selectedVariantName;
        this.combination.variantId = Number(variantId ?? 0);
      }
      if (unitPrice !== undefined) this.unitPrice = Number(unitPrice || 0);
      if (stock !== undefined) this.combination.stock = Number(stock || 0);
      this.lastUpdatedAt = Date.now();
    },
    setAddons(addons) {
      const list = Array.isArray(addons) ? addons : [];
      this.selectedAddons = list.map((a) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price || 0),
      }));
      this.addonTotal = this.selectedAddons.reduce(
        (s, a) => s + Number(a.price || 0),
        0
      );
      this.lastUpdatedAt = Date.now();
    },
    setQty(q) {
      this.qty = Math.max(1, Number(q || 1));
      this.lastUpdatedAt = Date.now();
    },
    clear() {
      this.productSlug = null;
      this.productTitle = null;
      this.productImage = null;
      this.store = {
        id: null,
        slug: null,
        name: null,
        address: null,
        phone: null,
      };
      this.qty = 1;
      this.selectedSizeId = null;
      this.selectedSizeName = null;
      this.selectedVariantId = null;
      this.selectedVariantName = null;
      this.selectedAddons = [];
      this.unitPrice = 0;
      this.addonTotal = 0;
      this.combination = { sizeId: 0, variantId: 0, stock: 0 };
      this.lastUpdatedAt = null;
    },
  },
});
