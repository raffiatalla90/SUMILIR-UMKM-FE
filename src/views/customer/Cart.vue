<template>
  <div class="min-h-screen bg-gray-50 pb-32">
    <!-- Mobile Header -->
    <MobileHeader title="Keranjang" @back="goBack" />

    <!-- Empty State -->
    <div
      v-if="cartStores.length === 0"
      class="flex flex-col items-center justify-center py-20 px-4 max-w-7xl mx-auto"
    >
      <div class="w-32 h-32 mb-6 text-gray-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Keranjang Kosong</h2>
      <p class="text-gray-600 text-center mb-6">
        Belum ada produk di keranjang Anda.<br />Yuk, mulai belanja!
      </p>
      <button
        @click="goToHome"
        class="px-6 py-3 bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold rounded-xl transition"
      >
        Mulai Belanja
      </button>
    </div>

    <!-- Cart Content -->
    <main v-else class="px-4 py-4 space-y-4 max-w-7xl mx-auto">
      <!-- Cart Items Grouped by Store -->
      <div
        v-for="store in cartStores"
        :key="store.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <!-- Store Header -->
        <div
          class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="isStoreSelected(store.id)"
              @change="toggleStoreSelection(store.id)"
              class="w-4 h-4 text-[#FFA30E] border-gray-300 rounded focus:ring-[#FFA30E]"
            />
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 rounded-full bg-[#FFA30E] flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4 text-white"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.32.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z"
                    clip-rule="evenodd"
                  />
                  <path
                    d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z"
                  />
                </svg>
              </div>
              <span class="font-semibold text-gray-900">{{ store.name }}</span>
            </div>
          </div>
          <div>
            <button
              @click="confirmRemoveAllByCart(store.id)"
              class="text-sm text-danger-foreground active:scale-95 cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>
        </div>

        <!-- Store Items -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="item in store.items"
            :key="item.id"
            class="px-4 py-3 flex items-start gap-3"
          >
            <!-- Checkbox -->
            <input
              type="checkbox"
              :checked="isItemSelected(item.id)"
              @change="toggleItemSelection(item.id, store.id)"
              class="mt-1 w-4 h-4 text-[#FFA30E] border-gray-300 rounded focus:ring-[#FFA30E]"
            />

            <!-- Product Image -->
            <div
              class="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 group-hover:-translate-y-0.5 duration-200 transition-transform relative"
              @click="goToProductPage(item.slug)"
            >
              <img
                :src="item.image || 'https://via.placeholder.com/80'"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div
                v-if="item.isUnavailable"
                class="absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm text-white text-center pointer-events-none px-1 py-1"
              >
                <p class="text-xs font-medium tracking-wide">
                  {{ item.stock === 0 ? "Habis" : "Diarsipkan" }}
                </p>
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-900 mb-1">
                {{ item.name }}
              </h3>

              <!-- Info Unavailable -->
              <div
                v-if="item.isUnavailable"
                class="text-xs text-red-500 font-semibold mb-1"
              >
                <span v-if="item.stock === 0"
                  >Habis, coba lihat varian lain</span
                >
                <span v-else>Produk ini sedang tidak tersedia</span>
              </div>

              <!-- Variants -->
              <div
                class="text-xs text-gray-600 space-y-0.5 mb-2"
                @click="goToProductPage(item.slug)"
              >
                <div class="font-medium">
                  Rp {{ formatIDR(item.unitPrice) }}
                </div>
                <div v-if="getVariantLabel(item)" class="capitalize">
                  Varian: {{ getVariantLabel(item) }}
                </div>
                <div v-if="item.addons.length" class="space-y-0.5">
                  <div
                    v-for="addon in item.addons"
                    :key="addon.label"
                    class="text-xs text-gray-600 flex justify-between"
                  >
                    <span>+ {{ addon.label }}</span>
                    <span class="font-medium text-gray-700">
                      Rp {{ formatIDR(addon.price) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Edit Variant/Addon Button -->
              <button
                @click="editItemVariant(item.id, store.id)"
                class="text-xs text-[#FFA30E] hover:text-[#e5920d] font-semibold mb-2 flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-3.5 h-3.5"
                >
                  <path
                    d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
                  />
                  <path
                    d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
                  />
                </svg>
                Ubah Varian
              </button>

              <!-- Price & Quantity -->
              <div
                class="flex flex-wrap gap-y-2 gap-x-6 items-center justify-between"
              >
                <div class="text-sm font-bold text-[#FFA30E]">
                  Rp {{ formatIDR(item.unitPrice) }}
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                  <button
                    @click="decreaseQuantity(item.id)"
                    :disabled="item.quantity <= 1"
                    class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>

                  <input
                    type="number"
                    class="text-center border border-gray-300 rounded-md text-sm font-semibold py-1 sm:px-2"
                    :min="1"
                    :max="item.stock"
                    :value="item.quantity"
                    @input="onQuantityInput(item.id, $event.target.value)"
                    @blur="onQuantityBlur(item.id)"
                  />

                  <button
                    @click="increaseQuantity(item.id)"
                    :disabled="item.quantity >= item.stock"
                    class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-4 h-4"
                    >
                      <path
                        d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Stock Warning -->
              <div v-if="item.stock < 10" class="mt-1 text-xs text-amber-600">
                Stok tersisa {{ item.stock }}
              </div>
            </div>

            <!-- Delete Button -->
            <button
              @click="confirmRemove(item.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-5 h-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Store Footer: Subtotal & Checkout -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">
              Subtotal ({{ getStoreSelectedCount(store.id) }} item)
            </span>
            <span class="text-sm font-bold text-gray-900">
              Rp {{ formatIDR(calculateStoreSubtotal(store.id)) }}
            </span>
          </div>

          <!-- Checkout Button per Store -->
          <Button
            @click="checkoutStore(store.id)"
            :disabled="getStoreSelectedCount(store.id) === 0"
            variant="primary"
            customClass="w-full"
          >
            Checkout {{ store.name }}
          </Button>
        </div>
      </div>
    </main>

    <!-- Edit Variant Modal -->
    <ResponsiveModal
      :show="showEditModal"
      @close="closeEditModal"
      title="Ubah Varian Produk"
      :subtitle="editingItem?.name"
    >
      <div v-if="editingItem" class="space-y-4">
        <!-- Size Selection -->
        <div
          v-for="(opt, optIndex) in editOptions"
          :key="opt.option_id"
          class="space-y-2"
        >
          <label class="text-sm font-semibold text-gray-900 block capitalize">
            {{ opt.option_name }}
            <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in availableSizes"
              :key="size"
              @click="tempSize = size"
              :disabled="!isSizeAvailable(size)"
              class="px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                tempSize === size
                  ? 'border-[#FFA30E] bg-orange-50 text-[#FFA30E]'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              "
            >
              <div class="flex flex-col items-center">
                <span>{{ size }}</span>
                <span
                  class="text-xs mt-0.5"
                  :class="
                    getEditSizeStock(size) === 0
                      ? 'text-red-500'
                      : getEditSizeStock(size) <= 10
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  "
                >
                  {{
                    getEditSizeStock(size) === 0
                      ? "Habis"
                      : `Stok: ${getEditSizeStock(size)}`
                  }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Variant Selection -->
        <div v-if="availableVariants.length > 0">
          <label class="text-sm font-semibold text-gray-900 mb-2 block">
            Varian <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="variant in availableVariants"
              :key="variant"
              @click="tempVariant = variant"
              :disabled="!isVariantAvailable(variant)"
              class="px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                tempVariant === variant
                  ? 'border-[#FFA30E] bg-orange-50 text-[#FFA30E]'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              "
            >
              <div class="flex flex-col items-center">
                <span :class="{ 'line-through': !isVariantAvailable(variant) }">
                  {{ variant }}
                </span>
                <span
                  v-if="tempSize"
                  class="text-xs mt-0.5"
                  :class="
                    getEditVariantStock(variant) === 0
                      ? 'text-red-500'
                      : getEditVariantStock(variant) <= 10
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  "
                >
                  {{
                    getEditVariantStock(variant) === 0
                      ? "Habis"
                      : `Stok: ${getEditVariantStock(variant)}`
                  }}
                </span>
              </div>
            </button>
          </div>
          <p v-if="!tempSize" class="text-xs text-gray-500 mt-2">
            Pilih ukuran terlebih dahulu untuk melihat stok varian
          </p>
        </div>

        <!-- Current Stock Info -->
        <div
          v-if="tempSize && tempVariant"
          class="p-3 rounded-lg"
          :class="
            getEditCurrentStock() === 0
              ? 'bg-red-50'
              : getEditCurrentStock() <= 10
              ? 'bg-amber-50'
              : 'bg-green-50'
          "
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-5 h-5"
              :class="
                getEditCurrentStock() === 0
                  ? 'text-red-600'
                  : getEditCurrentStock() <= 10
                  ? 'text-amber-600'
                  : 'text-green-600'
              "
            >
              <path
                fill-rule="evenodd"
                d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19h12.32a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5zM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <p
                class="text-sm font-semibold"
                :class="
                  getEditCurrentStock() === 0
                    ? 'text-red-700'
                    : getEditCurrentStock() <= 10
                    ? 'text-amber-700'
                    : 'text-green-700'
                "
              >
                {{
                  getEditCurrentStock() === 0
                    ? "Stok Habis"
                    : `Stok tersedia: ${getEditCurrentStock()} item`
                }}
              </p>
              <p
                v-if="
                  getEditCurrentStock() > 0 &&
                  editingItem.quantity > getEditCurrentStock()
                "
                class="text-xs text-amber-600 mt-0.5"
              >
                Quantity akan disesuaikan dari
                {{ editingItem.quantity }} menjadi
                {{ getEditCurrentStock() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Addon Selection -->
        <div v-if="addonGroups && addonGroups.length" class="space-y-2">
          <!-- ADDON GROUPS -->
          <div v-for="group in addonGroups" :key="group.id" class="space-y-2">
            <div class="flex items-center justify-between capitalize">
              <label
                class="text-sm font-semibold text-gray-900 block capitalize"
              >
                {{ group.name }}
                <span v-if="group.min_selection === 1" class="text-red-500"
                  >*</span
                >
                <span v-else class="text-xs text-gray-500 font-normal"
                  >(Opsional)</span
                >
              </label>
              <span
                v-if="group.max_selection > 1"
                class="text-xs text-gray-500"
              >
                Maks. {{ group.max_selection }} pilihan
              </span>
              <span
                v-else-if="group.max_selection === 1"
                class="text-xs text-gray-500"
              >
                Pilih 1
              </span>
            </div>

            <!-- SINGLE (RADIO) -->
            <div
              v-if="group.max_selection === 1 && group.min_selection === 1"
              class="space-y-2"
            >
              <label
                v-for="addon in group.options"
                :key="addon.addon_id"
                class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-sm"
                :class="
                  isAddonSelected(addon)
                    ? 'border-[#FFA30E] bg-orange-50'
                    : 'border-gray-200'
                "
              >
                <input
                  type="radio"
                  :name="`addon-group-${group.id}`"
                  :checked="isAddonSelected(addon)"
                  @change="selectSingleAddon(addon, group)"
                  class="w-4 h-4 text-[#FFA30E]"
                />

                <span class="flex-1">{{ addon.name }}</span>
                <span class="font-semibold">
                  +Rp {{ formatIDR(addon.price) }}
                </span>
              </label>
            </div>

            <!-- MULTIPLE (CHECKBOX) -->
            <div v-else class="space-y-2">
              <label
                v-for="addon in group.options"
                :key="addon.addon_id"
                class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-sm"
                :class="
                  isAddonSelected(addon)
                    ? 'border-[#FFA30E] bg-orange-50'
                    : 'border-gray-200'
                "
              >
                <input
                  type="checkbox"
                  :checked="isAddonSelected(addon)"
                  @change="toggleAddon(addon, group)"
                  class="w-4 h-4 text-[#FFA30E]"
                />

                <span class="flex-1">{{ addon.name }}</span>
                <span class="font-semibold">
                  +Rp {{ formatIDR(addon.price) }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Info Note -->
        <div class="p-3 bg-blue-50 rounded-lg">
          <p class="text-xs text-blue-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4 inline mr-1"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clip-rule="evenodd"
              />
            </svg>
            Perubahan varian akan mengupdate harga dan stok produk
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <Button
            @click="closeEditModal"
            variant="muted-outline"
            customClass="flex-1"
          >
            Batal
          </Button>
          <Button
            @click="saveVariantChanges"
            variant="primary"
            customClass="flex-1"
            :disabled="!tempSize || !tempVariant || getEditCurrentStock() === 0"
          >
            Simpan Perubahan
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import Button from "@/components/common/Button.vue";
import MobileHeader from "@/components/customer/MobileHeader.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import { useToast } from "vue-toastification";
import { useCheckoutStore } from "@/stores/checkout";
import debounce from "lodash/debounce";
import { useCart } from "@/composables/useCart";
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();

const {
  cartStores,
  loading,
  fetchCart,
  updateItemQuantity,
  updateItemVariant,
  removeItem,
  clearCartByStore,
} = useCart();
const addonGroups = ref([]);

const quantityDrafts = ref({}); // simpan nilai ketikan sementara
const quantitySnapshots = ref({}); // rollback data
const getVariantStockByOption = (optionName, optionValue) => {
  return editStockCombinations.value
    .filter((c) => c.options[optionName] === optionValue)
    .reduce((max, c) => Math.max(max, c.stock), 0);
};
const shouldShowStockOnOption = (optionIndex) => {
  const totalOptions = editOptions.value.length;

  if (totalOptions === 1) {
    return optionIndex === 0;
  }

  return optionIndex === 1;
};
const getVariantLabel = (item) => {
  if (!item.selectedVariantId || !item.productDetails?.variants) {
    return "";
  }

  const variant = item.productDetails.variants.find(
    (v) => v.id === item.selectedVariantId
  );

  if (!variant || !variant.option_values?.length) {
    return "";
  }

  // contoh hasil: "Ukuran: Large, Level: Pedas"
  return variant.option_values.map((ov) => ov.option_value).join(" - ");
};

const initRequiredAddons = () => {
  const defaults = [];

  addonGroups.value.forEach((group) => {
    if (
      group.selection_type === "single" &&
      group.min_selection === 1 &&
      group.options.length
    ) {
      defaults.push({
        addon_group_id: group.id,
        addon_id: group.options[0].addon_id,
      });
    }
  });

  tempAddons.value = defaults;
};

const updateStockFlags = (item) => {
  item.isOverStock = item.quantity > item.stock;
};

const onQuantityInput = (itemId, value) => {
  const qty = Number(value);

  for (const store of cartStores.value) {
    const item = store.items.find((i) => i.id === itemId);
    if (!item) continue;

    if (!quantitySnapshots.value[itemId]) {
      quantitySnapshots.value[itemId] = item.quantity;
    }

    if (isNaN(qty)) return;

    if (qty < 1) {
      item.quantity = 1;
    } else if (qty > item.stock) {
      item.quantity = item.stock;
    } else {
      item.quantity = qty;
    }

    // 🔥 UPDATE FLAG DI SINI
    updateStockFlags(item);

    quantityDrafts.value[itemId] = item.quantity;
    debounceUpdateQuantity(itemId);
    break;
  }
};

const debounceUpdateQuantity = debounce(async (itemId) => {
  const newQty = quantityDrafts.value[itemId];
  const oldQty = quantitySnapshots.value[itemId];

  try {
    await updateItemQuantity(itemId, { quantity: newQty });

    // sukses → hapus snapshot
    delete quantitySnapshots.value[itemId];
    delete quantityDrafts.value[itemId];
  } catch (error) {
    // rollback
    for (const store of cartStores.value) {
      const item = store.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = oldQty;
        break;
      }
    }

    toast.error("Gagal mengubah jumlah");
  }
}, 1000);
const onQuantityBlur = (itemId) => {
  for (const store of cartStores.value) {
    const item = store.items.find((i) => i.id === itemId);
    if (!item) continue;

    // jika kosong / invalid
    if (!item.quantity || item.quantity < 1) {
      item.quantity = 1;
    }

    if (item.quantity > item.stock) {
      item.quantity = item.stock;
    }

    updateStockFlags(item);

    quantityDrafts.value[itemId] = item.quantity;
    debounceUpdateQuantity(itemId);

    break;
  }
};

const toast = useToast();
const router = useRouter();

// Confirmation Modal
const showConfirmModal = ref(false);
const itemToRemove = ref(null);

// Edit Variant Modal
const showEditModal = ref(false);
const editingItem = ref(null);
const editingStoreId = ref(null);
const tempSize = ref(null);
const tempVariant = ref(null);
const tempAddons = ref([]);

onMounted(async () => {
  await fetchCart();
});

// ✅ Body Scroll Lock for Modals
const isAnyModalOpen = computed(
  () => showConfirmModal.value || showEditModal.value
);
useBodyScrollLock(isAnyModalOpen);

// Available options with stock info (simulasi - nanti dari API)
const availableSizes = ref([]);
const availableVariants = ref([]);
const availableAddons = ref([]);

// Stock combinations for editing item
const editStockCombinations = ref([]);

// Cart Data (nanti akan dari Pinia Store)
const cartStores = ref([
  {
    id: 1,
    name: "Sumber Rejeki",
    phone: "6285764134767",
    address: "Jl. Cendrawasih No 5 Rt 1 Rw 1, Banyumanik, Semarang",
    items: [
      {
        id: "cart-1",
        productId: 1,
        slug: "yakult-original",
        name: "Yakult Original",
        image: "https://picsum.photos/seed/yakult/300/300",
        size: "250 Ml",
        variant: "Original",
        addons: ["Tidak Pedas"],
        unitPrice: 15000,
        quantity: 2,
        stock: 50,
      },
      {
        id: "cart-2",
        productId: 2,
        slug: "yakult-strawberry",
        name: "Yakult Strawberry",
        image: "https://picsum.photos/seed/yakult2/300/300",
        size: "750 Ml",
        variant: "Strawberry",
        addons: ["Sedang", "Topping Meses"],
        unitPrice: 22000,
        quantity: 1,
        stock: 15,
      },
    ],
  },
  {
    id: 2,
    name: "Warung Bahagia",
    phone: "6281234567890",
    address: "Jl. Pemuda No 123, Simpang Lima, Semarang",
    items: [
      {
        id: "cart-3",
        productId: 3,
        slug: "nasi-goreng",
        name: "Nasi Goreng Spesial",
        image: "https://picsum.photos/seed/nasgor/300/300",
        size: null,
        variant: "Pedas",
        addons: ["Extra Telur", "Kerupuk"],
        unitPrice: 18000,
        quantity: 3,
        stock: 100,
      },
    ],
  },
]);

// Selected Items
const selectedItems = ref([]);

// Check if item is selected
const isItemSelected = (itemId) => {
  return selectedItems.value.includes(itemId);
};

// Toggle item selection (with store validation)
const toggleItemSelection = (itemId, storeId) => {
  const index = selectedItems.value.indexOf(itemId);

  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    const selectedStoreId = getSelectedStoreId();

    if (selectedStoreId && selectedStoreId !== storeId) {
      alert(
        `Tidak dapat memilih item dari toko berbeda.\nSilakan checkout toko "${getStoreName(
          selectedStoreId
        )}" terlebih dahulu atau batalkan pilihan.`
      );
      return;
    }

    selectedItems.value.push(itemId);
  }
};

// Get store ID from selected items
const getSelectedStoreId = () => {
  if (selectedItems.value.length === 0) return null;

  for (const store of cartStores.value) {
    const hasItem = store.items.some((item) =>
      selectedItems.value.includes(item.id)
    );
    if (hasItem) return store.id;
  }

  return null;
};

// Get store name by ID
const getStoreName = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  return store ? store.name : "";
};

// Check if store is selected
const isStoreSelected = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  if (!store) return false;

  return (
    store.items.length > 0 &&
    store.items.every((item) => selectedItems.value.includes(item.id))
  );
};

// Toggle store selection
const toggleStoreSelection = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  if (!store) return;

  const allSelected = isStoreSelected(storeId);
  const selectedStoreId = getSelectedStoreId();

  if (allSelected) {
    store.items.forEach((item) => {
      const index = selectedItems.value.indexOf(item.id);
      if (index > -1) {
        selectedItems.value.splice(index, 1);
      }
    });
  } else {
    if (selectedStoreId && selectedStoreId !== storeId) {
      alert(
        `Tidak dapat memilih item dari toko berbeda.\nSilakan checkout toko "${getStoreName(
          selectedStoreId
        )}" terlebih dahulu atau batalkan pilihan.`
      );
      return;
    }

    store.items.forEach((item) => {
      if (!selectedItems.value.includes(item.id)) {
        selectedItems.value.push(item.id);
      }
    });
  }
};

// Get selected item count for a store
const getStoreSelectedCount = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  if (!store) return 0;

  return store.items.filter((item) => selectedItems.value.includes(item.id))
    .length;
};
const isAddonSelected = (addon) =>
  tempAddons.value.some(
    (a) =>
      a.addon_id === addon.addon_id && a.addon_group_id === addon.addon_group_id
  );

const selectSingleAddon = (addon, group) => {
  tempAddons.value = tempAddons.value.filter(
    (a) => a.addon_group_id !== group.id
  );

  tempAddons.value.push({
    addon_group_id: group.id,
    addon_id: addon.addon_id,
  });
};
const toggleAddon = (addon, group) => {
  const idx = tempAddons.value.findIndex(
    (a) => a.addon_id === addon.addon_id && a.addon_group_id === group.id
  );

  if (idx >= 0) {
    tempAddons.value.splice(idx, 1);
  } else {
    tempAddons.value.push({
      addon_group_id: group.id,
      addon_id: addon.addon_id,
    });
  }
};

// Calculate store subtotal
const calculateStoreSubtotal = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  if (!store) return 0;

  return store.items
    .filter((item) => selectedItems.value.includes(item.id))
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

const increaseQuantity = async (itemId) => {
  for (const store of cartStores.value) {
    const item = store.items.find((i) => i.id === itemId);
    if (!item || item.quantity >= item.stock) continue;

    onQuantityInput(itemId, item.quantity + 1);
    await cartStore.fetchCartCount(true);

    break;
  }
};

const decreaseQuantity = async (itemId) => {
  for (const store of cartStores.value) {
    const item = store.items.find((i) => i.id === itemId);
    if (!item || item.quantity <= 1) continue;

    onQuantityInput(itemId, item.quantity - 1);
    await cartStore.fetchCartCount(true);

    break;
  }
};

const confirmRemoveAllByCart = async (cartId) => {
  if (!cartId) return;

  try {
    await clearCartByStore(cartId);

    // update UI cart page
    cartStores.value = cartStores.value.filter((cart) => cart.id !== cartId);

    // 🔥 WAJIB: refresh badge count
    await cartStore.fetchCartCount(true);
  } catch {
    toast.error("Gagal menghapus cart");
  }
};

const confirmRemove = async (itemId) => {
  if (!itemId) return;

  try {
    await removeItem(itemId);
    for (const store of cartStores.value) {
      const index = store.items.findIndex((i) => i.id === itemToRemove.value);
      if (index > -1) {
        store.items.splice(index, 1);
        const selectedIndex = selectedItems.value.indexOf(itemToRemove.value);
        if (selectedIndex > -1) {
          selectedItems.value.splice(selectedIndex, 1);
        }
        break;
      }
    }

    cartStores.value = cartStores.value.filter(
      (store) => store.items.length > 0
    );

    await cartStore.fetchCartCount(true);
  } catch (error) {
    toast.error("Gagal menghapus item");
  } finally {
    showConfirmModal.value = false;
    itemToRemove.value = null;
  }
};

// Get current stock for selected size + variant combination
const getEditCurrentStock = () => {
  if (!tempSize.value || !tempVariant.value) return 0;

  const combination = editStockCombinations.value.find(
    (combo) =>
      combo.size === tempSize.value && combo.variant === tempVariant.value
  );

  return combination ? combination.stock : 0;
};

// Get stock for specific size (total across all variants)
const getEditSizeStock = (sizeName) => {
  const combinations = editStockCombinations.value.filter(
    (combo) => combo.size === sizeName
  );
  return combinations.reduce((total, combo) => total + combo.stock, 0);
};

// Get stock for specific variant with current size
const getEditVariantStock = (variantName) => {
  if (!tempSize.value) return 0;

  const combination = editStockCombinations.value.find(
    (combo) => combo.size === tempSize.value && combo.variant === variantName
  );

  return combo ? combo.price : 0;
});
const hasDeletedVariant = (item) => {
  if (!item.selectedVariantId) return false;

  return !item.productDetails.variants.some(
    (v) => v.id === item.selectedVariantId
  );
};

const hasDeletedAddon = (item) => {
  if (!item.selectedAddons?.length) return false;

  const validAddonIds = item.productDetails.addon_groups.flatMap((g) =>
    g.options.map((o) => o.addon_id)
  );

  return item.selectedAddons.some((a) => !validAddonIds.includes(a.addon_id));
};

const hasConfigurationIssue = (item) =>
  hasDeletedVariant(item) || hasDeletedAddon(item);

const editAddonTotal = computed(() => {
  let total = 0;

  tempAddons.value.forEach((selected) => {
    const group = addonGroups.value.find(
      (g) => g.id === selected.addon_group_id
    );

    if (!group) return;

    const addon = group.options.find((o) => o.addon_id === selected.addon_id);

    if (addon) {
      total += Number(addon.price || 0);
    }
  });

  return total;
});

const editTotalPrice = computed(() => {
  return editVariantPrice.value + editAddonTotal.value;
});
// Edit Item Variant
const editItemVariant = async (itemId, storeId) => {
  for (const store of cartStores.value) {
    const item = store.items.find((i) => i.id === itemId);
    if (item) {
      editingItem.value = item;
      editingStoreId.value = storeId;

  const product = item.productDetails;

  /* ===============================
   * 1. OPTIONS (Size / Variant)
   * =============================== */
  editOptions.value = product.options.map((opt) => ({
    option_id: opt.id,
    option_name: opt.option_name,
    uses_image: opt.uses_image,
    values: opt.values.map((v) => ({
      value: v.option_value,
      image_url: v.src_url,
      available: true, // nanti bisa dikunci via stok
    })),
  }));

  /* ===============================
   * 2. STOCK COMBINATIONS
   * =============================== */
  editStockCombinations.value = product.variants.map((v) => {
    const options = {};

    v.option_values.forEach((ov) => {
      options[ov.option_name] = ov.option_value;
    });

    return {
      options,
      stock: v.stock,
      price: Number(v.price),
      variantId: v.id,
    };
  });

  /* ===============================
   * 3. SET CURRENT SELECTION
   * =============================== */
  tempSelections.value = {};

  const currentVariant = product.variants.find(
    (v) => v.id === item.selectedVariantId
  );

  if (currentVariant) {
    currentVariant.option_values.forEach((ov) => {
      tempSelections.value[ov.option_name] = ov.option_value;
    });
  }

  /* ===============================
   * 4. ADDONS
   * =============================== */
  addonGroups.value = product.addon_groups.map((group) => ({
    id: group.id,
    name: group.addon_group_name,
    selection_type: group.selection_type, // single | multiple
    min_selection: Number(group.min_selection),
    max_selection: Number(group.max_selection),
    options: group.options.map((opt) => ({
      addon_group_id: group.id,
      addon_id: opt.addon_id,
      name: opt.addon.addon_name,
      price: Number(opt.addon_price),
    })),
  }));

  tempAddons.value = item.selectedAddons?.length
    ? item.selectedAddons.map((a) => ({
        addon_group_id: a.addon_group_id,
        addon_id: a.addon_id,
      }))
    : [];

  if (!tempAddons.value.length) {
    initRequiredAddons();
  }

  showEditModal.value = true;
};

// Close Edit Modal
const closeEditModal = () => {
  showEditModal.value = false;
  editingItem.value = null;
  editingStoreId.value = null;
  tempSize.value = null;
  tempVariant.value = null;
  tempAddons.value = [];
  availableSizes.value = [];
  availableVariants.value = [];
  availableAddons.value = [];
  editStockCombinations.value = [];
};

// Save Variant Changes with stock validation
const saveVariantChanges = async () => {
  const combo = editStockCombinations.value.find((c) =>
    Object.entries(tempSelections.value).every(
      ([optName, optValue]) => c.options[optName] === optValue
    )
  );

  if (!combo) {
    toast.error("Varian tidak ditemukan");
    return;
  }

  if (combo.stock === 0) {
    toast.error("Stok habis");
    return;
  }
  saveLoading.value = true;
  try {
    await updateItemVariant(editingItem.value.id, {
      product_variant_id: combo.variantId,
      addons: tempAddons.value,
    });

    await fetchCart();
    closeEditModal();
  } catch (e) {
    toast.error("Gagal update varian");
  } finally {
    saveLoading.value = false;
  }
};

// Format IDR
const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

// Navigation
const goBack = () => {
  router.back();
};

const goToHome = () => {
  router.push({ name: "Home" });
};

// Checkout per Store
const checkoutStore = (storeId) => {
  const store = cartStores.value.find((s) => s.id === storeId);
  if (!store) return;

  const selectedStoreItems = store.items.filter((item) =>
    selectedItems.value.includes(item.id)
  );

  if (selectedStoreItems.length === 0) {
    alert("Pilih minimal 1 item untuk checkout");
    return;
  }

  checkoutStore.setFromCart({
    store: {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
    },
    items: selectedStoreItems.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      addonTotalPrice: item.addonTotalPrice,
      size: item.size ?? "",
      variant: getVariantLabel(item),
      addons: item.addons ?? [],
    })),
  });
};
</script>

<style scoped>
/* ...existing styles... */
</style>
