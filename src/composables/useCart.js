import { ref, computed } from "vue";
import * as cartService from "@/services/api/cart";
import { useToast } from "vue-toastification";

export function useCart() {
  const toast = useToast();

  // =====================
  // STATE
  // =====================
  const cartStores = ref([]);
  const loading = ref(false);

  // =====================
  // COMPUTED
  // =====================
  const isEmpty = computed(() => cartStores.value.length === 0);

  const totalItems = computed(() =>
    cartStores.value.reduce(
      (sum, store) =>
        sum + store.items.reduce((s, item) => s + item.quantity, 0),
      0
    )
  );

  // =====================
  // ACTIONS
  // =====================
  async function fetchCart() {
    loading.value = true;
    try {
      const { data } = await cartService.fetchCart();

      cartStores.value = (data.data || []).map((cart) => ({
        id: cart.cart_id,
        name: cart.merchant.name,
        phone: cart.merchant.phone,
        address: cart.merchant.address,

        items: (cart.items || []).map((item) => ({
          id: item.cart_item_id,
          quantity: item.quantity,
          stock: item.live.max_stock,

          slug: item.product_details.slug,
          name: item.snapshot.name,

          image:
            item.snapshot.image ??
            item.product_details.cover_image?.src_url ??
            "",

          unitPrice: item.changes?.price_changed
            ? Number(item.live.unit_price)
            : Number(item.snapshot.unit_price),

          addonTotalPrice: Number(item.snapshot.addon_total_price || 0),
          addons: item.snapshot.addons || [],

          selectedVariantId: item.selected_configuration.variant_id,
          selectedAddons: item.selected_configuration.addon_ids || [],

          isOverStock: item.changes?.is_over_stock ?? false,
          isUnavailable:
            item.product_details.status !== "published" ||
            item.live.max_stock === 0,

          productDetails: item.product_details,
        })),
      }));
    } catch (e) {
      toast.error("Gagal memuat keranjang");
      cartStores.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchCartCount() {
    try {
      const res = await cartService.fetchCartCount();
      return Number(res.data?.count || 0);
    } catch (e) {
      console.warn("Gagal fetch cart count");
      return 0;
    }
  }

  async function addToCart(payload) {
    await cartService.addToCart(payload);
  }

  async function updateItemQuantity(id, payload) {
    await cartService.updateCartItemQuantity(id, payload);
  }

  async function updateItemVariant(id, payload) {
    await cartService.updateCartItemVariant(id, payload);
  }

  async function removeItem(id) {
    await cartService.removeCartItem(id);

    // optimistic update
    cartStores.value.forEach((store) => {
      store.items = store.items.filter((i) => i.id !== id);
    });
    cartStores.value = cartStores.value.filter(
      (store) => store.items.length > 0
    );
  }

  async function clearCartByStore(cartId) {
    await cartService.clearCart(cartId);
    cartStores.value = cartStores.value.filter((s) => s.id !== cartId);
  }

  return {
    cartStores,
    loading,
    isEmpty,
    totalItems,

    fetchCart,
    fetchCartCount,
    addToCart,
    updateItemQuantity,
    updateItemVariant,
    removeItem,
    clearCartByStore,
  };
}
