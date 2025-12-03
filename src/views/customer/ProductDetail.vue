<template>
  <div class="min-h-screen bg-gray-50 pb-24 sm:pb-8">
    <!-- Header dengan tombol close (Hidden - replaced by floating button) -->
    <div
      class="sticky top-0 z-50 bg-white border-b border-gray-200 sm:hidden hidden"
    >
      <div class="flex items-center justify-end px-4 py-3">
        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Sticky Header saat Scroll (Mobile only) -->
    <div
      class="sm:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      :class="showScrollHeader ? 'translate-y-0' : '-translate-y-full'"
    >
      <div
        class="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
      >
        <div class="px-4 py-3 flex items-center gap-3">
          <button
            @click="goBack"
            class="p-1.5 hover:bg-gray-100 rounded-full transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-5 h-5 text-gray-800"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <div class="flex-1 min-w-0">
            <h1 class="text-sm font-semibold text-gray-900 truncate">
              {{ product?.name || "Nama Produk" }}
            </h1>
            <p class="text-xs text-gray-600">
              Rp {{ formatIDR(calculateTotalPrice()) }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="shareProduct"
              class="p-1.5 hover:bg-gray-100 rounded-full transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5 text-gray-800"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            </button>

            <button
              @click="goToCart"
              class="relative p-1.5 hover:bg-gray-100 rounded-full transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5 text-gray-800"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <span
                v-if="cartItemsCount > 0"
                class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {{ cartItemsCount > 9 ? "9+" : cartItemsCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Buttons (Mobile only) -->
    <div
      class="sm:hidden fixed left-0 right-0 z-50 px-4 flex items-center justify-between pointer-events-none transition-all duration-300"
      :class="showScrollHeader ? 'top-20' : 'top-4'"
    >
      <!-- Back Button (Left) - Hidden saat scroll header muncul -->
      <button
        v-show="!showScrollHeader"
        @click="goBack"
        class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95 pointer-events-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-5 h-5 text-gray-800"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      <!-- Right Actions (Share & Cart) - Hidden saat scroll header muncul -->
      <div
        v-show="!showScrollHeader"
        class="flex items-center gap-2 pointer-events-auto"
      >
        <!-- Share Button -->
        <button
          @click="shareProduct"
          class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-gray-800"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        </button>

        <!-- Cart Button with Badge -->
        <button
          @click="goToCart"
          class="relative w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-gray-800"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <!-- Cart Badge -->
          <span
            v-if="cartItemsCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ cartItemsCount > 9 ? "9+" : cartItemsCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="max-w-7xl mx-auto sm:px-4 sm:py-6">
      <div class="bg-white sm:rounded-2xl sm:shadow-lg overflow-hidden">
        <div class="sm:grid sm:grid-cols-2 sm:gap-8 sm:p-8">
          <!-- Skeleton Gambar -->
          <div class="sm:sticky sm:top-8 sm:self-start">
            <div
              class="w-full aspect-square bg-gray-200 animate-pulse sm:rounded-xl"
            ></div>
          </div>

          <!-- Skeleton Info Produk -->
          <div class="px-4 sm:px-0 py-4 sm:py-0 space-y-4">
            <!-- Nama & Harga -->
            <div class="pb-4 border-b border-gray-200 space-y-3">
              <div class="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div class="h-7 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div class="flex items-center gap-2">
                <div class="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                <div
                  class="h-6 bg-gray-200 rounded-full animate-pulse w-20"
                ></div>
              </div>
            </div>

            <!-- Ukuran -->
            <div class="py-4 border-b border-gray-200">
              <div
                class="h-5 bg-gray-200 rounded animate-pulse w-20 mb-3"
              ></div>
              <div class="flex gap-2">
                <div
                  class="h-16 w-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-16 w-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-16 w-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              </div>
            </div>

            <!-- Varian -->
            <div class="py-4 border-b border-gray-200">
              <div
                class="h-5 bg-gray-200 rounded animate-pulse w-16 mb-3"
              ></div>
              <div class="flex gap-2">
                <div
                  class="h-16 w-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-16 w-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-16 w-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              </div>
            </div>

            <!-- Tambahan -->
            <div class="py-4 border-b border-gray-200">
              <div class="flex justify-between mb-3">
                <div class="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                <div class="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
              </div>
              <div class="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            <!-- Jumlah -->
            <div class="py-4 border-b border-gray-200">
              <div
                class="h-5 bg-gray-200 rounded animate-pulse w-16 mb-3"
              ></div>
              <div class="flex gap-3">
                <div
                  class="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-10 w-16 bg-gray-200 rounded-lg animate-pulse"
                ></div>
                <div
                  class="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              </div>
            </div>

            <!-- Deskripsi -->
            <div class="py-4 border-b border-gray-200 space-y-2">
              <div
                class="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"
              ></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>

            <!-- Info Toko -->
            <div class="py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"
                  ></div>
                  <div class="space-y-2">
                    <div
                      class="h-4 bg-gray-200 rounded animate-pulse w-32"
                    ></div>
                    <div
                      class="h-5 bg-gray-200 rounded-full animate-pulse w-16"
                    ></div>
                  </div>
                </div>
                <div
                  class="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              </div>
            </div>

            <!-- Produk Lain -->
            <div class="py-4">
              <div
                class="h-5 bg-gray-200 rounded animate-pulse w-40 mb-3"
              ></div>
              <div class="flex gap-3">
                <div class="min-w-[120px] sm:min-w-[140px]">
                  <div
                    class="aspect-square bg-gray-200 rounded-xl animate-pulse mb-2"
                  ></div>
                  <div
                    class="h-4 bg-gray-200 rounded animate-pulse w-full mb-1"
                  ></div>
                  <div
                    class="h-3 bg-gray-200 rounded animate-pulse w-2/3"
                  ></div>
                </div>
                <div class="min-w-[120px] sm:min-w-[140px]">
                  <div
                    class="aspect-square bg-gray-200 rounded-xl animate-pulse mb-2"
                  ></div>
                  <div
                    class="h-4 bg-gray-200 rounded animate-pulse w-full mb-1"
                  ></div>
                  <div
                    class="h-3 bg-gray-200 rounded animate-pulse w-2/3"
                  ></div>
                </div>
                <div class="min-w-[120px] sm:min-w-[140px]">
                  <div
                    class="aspect-square bg-gray-200 rounded-xl animate-pulse mb-2"
                  ></div>
                  <div
                    class="h-4 bg-gray-200 rounded animate-pulse w-full mb-1"
                  ></div>
                  <div
                    class="h-3 bg-gray-200 rounded animate-pulse w-2/3"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content (existing template) -->
    <div v-else class="max-w-7xl mx-auto sm:px-4 sm:py-6">
      <div class="bg-white sm:rounded-2xl sm:shadow-lg overflow-hidden">
        <!-- Layout Desktop: Grid 2 kolom -->
        <div class="sm:grid sm:grid-cols-2 sm:gap-8 sm:p-8">
          <!-- Kolom Kiri: Image Gallery -->
          <div class="sm:sticky sm:top-8 sm:self-start">
            <!-- Main Image Display with Swipe Support -->
            <div
              class="w-full aspect-square flex items-center justify-center sm:rounded-2xl overflow-hidden mb-4 relative group"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <img
                v-if="selectedImage"
                :src="selectedImage"
                :alt="product?.name"
                class="w-full h-full object-contain sm:rounded-2xl transition-transform duration-300 group-hover:scale-105 select-none"
                draggable="false"
              />
              <div v-else class="text-gray-400">No Image</div>

              <!-- ✅ UPDATED: Navigation Arrows - DESKTOP ONLY (hidden on mobile) -->
              <button
                v-if="productImages.length > 1"
                @click.stop="prevImage"
                class="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg
                  class="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                v-if="productImages.length > 1"
                @click.stop="nextImage"
                class="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <svg
                  class="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <!-- ✅ Image Counter - DESKTOP ONLY (simple version without swipe hint) -->
              <div
                v-if="productImages.length > 1"
                class="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium"
              >
                {{ currentImageIndex + 1 }} / {{ productImages.length }}
              </div>
            </div>
            <!-- Dot indicators (alternative) - MOBILE ONLY -->
            <div
              v-if="productImages.length > 1 && productImages.length <= 5"
              class="flex justify-center gap-1.5 my-3"
            >
              <button
                v-for="(_, index) in productImages"
                :key="index"
                @click="selectImage(index)"
                class="transition-all rounded-full"
                :class="
                  currentImageIndex === index
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                "
              ></button>
            </div>
            <!-- Thumbnail Gallery -->
            <div
              v-if="productImages.length > 1"
              class="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-2 py-2"
            >
              <button
                v-for="(image, index) in productImages"
                :key="index"
                @click="selectImage(index)"
                class="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all relative group/thumb"
                :class="
                  currentImageIndex === index
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                "
              >
                <img
                  :src="image"
                  :alt="`${product?.name} - ${index + 1}`"
                  class="w-full h-full object-cover"
                />

                <!-- Active indicator overlay -->
                <div
                  v-if="currentImageIndex === index"
                  class="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-xs rounded-lg backdrop-opacity-80"
                ></div>

                <!-- Hover effect for non-active thumbnails -->
                <div
                  v-else
                  class="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors"
                ></div>
              </button>
            </div>
          </div>

          <!-- Kolom Kanan: Info Produk -->
          <div class="px-4 sm:px-0 py-4 sm:py-0">
            <!-- Nama & Harga -->
            <div class="pb-4 border-b border-gray-200">
              <h1 class="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
                {{ product?.name || "Nama Produk" }}
              </h1>
              <p class="text-lg sm:text-2xl font-semibold text-gray-900">
                Rp {{ formatIDR(calculateTotalPrice()) }}
              </p>

              <!-- Stok Info -->
              <div class="mt-3 flex items-center gap-2">
                <span class="text-sm text-gray-600">Stok:</span>
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-sm font-semibold"
                    :class="getStockColorClass()"
                  >
                    {{ getCurrentStock() }} tersisa
                  </span>
                  <!-- Badge untuk low stock -->
                  <span
                    v-if="isLowStock()"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
                  >
                    Stok terbatas
                  </span>
                  <!-- Badge untuk out of stock -->
                  <span
                    v-if="getCurrentStock() === 0"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700"
                  >
                    Habis
                  </span>
                </div>
              </div>
            </div>

            <!-- Ukuran/Varian -->
            <div class="py-4 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                Ukuran <span class="text-red-500">*</span>
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="size in sizes"
                  :key="size.name"
                  @click="selectedSize = size"
                  :disabled="!isSizeAvailable(size.name)"
                  class="px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    selectedSize.name === size.name
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  "
                >
                  <div class="flex flex-col items-center">
                    <span>{{ size.name }}</span>
                    <span
                      class="text-xs mt-0.5"
                      :class="
                        getSizeStock(size.name) === 0
                          ? 'text-red-500'
                          : getSizeStock(size.name) <= 10
                          ? 'text-amber-600'
                          : 'text-gray-500'
                      "
                    >
                      {{
                        getSizeStock(size.name) === 0
                          ? "Habis"
                          : `Total: ${getSizeStock(size.name)}`
                      }}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Varian (Warna/Rasa) -->
            <div
              v-if="variants.length > 0"
              class="py-4 border-b border-gray-200"
            >
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                Varian <span class="text-red-500">*</span>
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variant in variants"
                  :key="variant.id"
                  @click="selectedVariant = variant"
                  :disabled="!isVariantAvailable(variant.id)"
                  class="px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    selectedVariant?.id === variant.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  "
                >
                  <div class="flex flex-col items-center">
                    <span
                      :class="{
                        'line-through text-gray-400': !isVariantAvailable(
                          variant.id
                        ),
                      }"
                    >
                      {{ variant.name }}
                    </span>
                    <span
                      class="text-xs mt-0.5"
                      :class="
                        getVariantStock(variant.id) === 0
                          ? 'text-red-500'
                          : getVariantStock(variant.id) <= 10
                          ? 'text-amber-600'
                          : 'text-gray-500'
                      "
                    >
                      {{
                        getVariantStock(variant.id) === 0
                          ? "Habis"
                          : `Stok: ${getVariantStock(variant.id)}`
                      }}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Addon/Tambahan - Button to open modal -->
            <div
              v-if="addonGroups.length > 0"
              class="py-4 border-b border-gray-200"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-gray-900">Tambahan</h3>
                <button
                  @click="showAddonModal = true"
                  class="text-sm text-primary hover:underline font-medium"
                >
                  {{
                    selectedAddons.length > 0
                      ? "Ubah Pilihan"
                      : "Pilih Tambahan"
                  }}
                </button>
              </div>

              <!-- Selected Addons Summary -->
              <div v-if="selectedAddons.length > 0" class="space-y-2">
                <div
                  v-for="addon in selectedAddons"
                  :key="addon.id"
                  class="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                >
                  <span class="text-gray-700">{{ addon.name }}</span>
                  <span class="font-semibold text-gray-900">
                    +Rp {{ formatIDR(addon.price) }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 pt-1">
                  Total tambahan: Rp {{ formatIDR(calculateAddonOnlyPrice()) }}
                </p>
              </div>

              <div v-else class="text-sm text-gray-500">
                Belum ada tambahan dipilih
              </div>
            </div>

            <!-- Jumlah -->
            <div class="py-4 border-b border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900">Jumlah</h3>
                <span
                  v-if="getCurrentStock() > 0"
                  class="text-xs text-gray-500"
                >
                  Maks. {{ getCurrentStock() }} item
                </span>
              </div>
              <div
                class="flex items-center justify-center sm:justify-end gap-3"
              >
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 12h14"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  :max="getCurrentStock()"
                  @input="validateQuantity"
                  class="w-16 text-center border border-gray-300 rounded-lg py-2 text-sm font-semibold"
                />
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= getCurrentStock()"
                  class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Deskripsi Produk -->
            <div class="py-4 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">
                Deskripsi Produk
              </h3>
              <p class="text-sm sm:text-base text-gray-700 leading-relaxed">
                {{
                  product?.description ||
                  "Minuman susu fermentasi dengan rasa lembut, segar, dan sedikit asam yang menyehatkan. Diproses dari susu murni pilihan dengan kultur bakteri baik Lactobacillus yang membantu menjaga kesehatan pencernaan"
                }}
              </p>
            </div>

            <!-- Info Toko -->
            <div class="py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden"
                  >
                    <img
                      v-if="product?.store?.logo"
                      :src="product.store.logo"
                      alt="Store logo"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900">
                      {{ product?.store?.name || "Sumber Rejeki" }}
                    </h4>
                    <span
                      class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 mt-1"
                    >
                      Buka
                    </span>
                  </div>
                </div>
                <button
                  class="px-4 py-2 rounded-lg bg-[#FFA30E] hover:bg-[#e5920d] text-white text-sm font-semibold transition"
                >
                  Kunjungi
                </button>
              </div>
            </div>

            <!-- Produk Lain dari Toko -->
            <div class="py-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                Produk lain dari toko ini
              </h3>
              <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                <div
                  v-for="item in relatedProducts"
                  :key="item.id"
                  class="min-w-[120px] sm:min-w-[140px] flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                  @click="viewProduct(item.id)"
                >
                  <div class="aspect-square bg-gray-100">
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="p-2">
                    <p
                      class="text-xs sm:text-sm font-semibold text-gray-900 truncate"
                    >
                      Rp {{ formatIDR(item.price) }}
                    </p>
                    <p class="text-[11px] sm:text-xs text-gray-600 truncate">
                      {{ item.name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar (Mobile) -->
    <div
      class="sm:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3"
    >
      <div v-if="loading" class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        <div class="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
      <div v-else class="flex items-center gap-3">
        <!-- Tombol Keranjang -->
        <button
          @click="addToCart"
          class="w-12 h-12 rounded-xl border-2 border-[#FFA30E] text-[#FFA30E] hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          :disabled="getCurrentStock() === 0"
          :title="
            getCurrentStock() === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </button>

        <!-- Tombol Beli Sekarang -->
        <button
          @click="buyNow"
          class="flex-1 h-12 rounded-xl bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="getCurrentStock() === 0"
        >
          {{ getCurrentStock() === 0 ? "Stok Habis" : "Beli Sekarang" }}
        </button>
      </div>
    </div>

    <!-- Bottom Action Bar (Desktop) -->
    <div
      class="hidden sm:block fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg"
    >
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div v-if="loading" class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="flex gap-3">
            <div class="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div class="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            <div class="h-12 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div v-else class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">
              Total Harga ({{ quantity }} item)
            </p>
            <p class="text-2xl font-bold text-gray-900">
              Rp {{ formatIDR(calculateTotalPrice()) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Tombol Keranjang Desktop -->
            <button
              @click="addToCart"
              class="px-4 py-3 rounded-xl border-2 border-[#FFA30E] text-[#FFA30E] font-semibold hover:bg-orange-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="getCurrentStock() === 0"
              :title="
                getCurrentStock() === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <span class="hidden lg:inline">Keranjang</span>
            </button>

            <!-- Tombol Beli Sekarang -->
            <button
              @click="buyNow"
              class="px-6 py-3 rounded-xl bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="getCurrentStock() === 0"
            >
              {{ getCurrentStock() === 0 ? "Stok Habis" : "Beli Sekarang" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Addon Modal -->
    <ResponsiveModal
      :show="showAddonModal"
      @close="closeAddonModal"
      title="Pilih Tambahan"
      subtitle="Pilih tambahan sesuai keinginan Anda"
      :show-footer="true"
    >
      <!-- Addon Groups -->
      <div class="space-y-6">
        <div
          v-for="group in addonGroups"
          :key="group.id"
          class="border-b border-gray-200 pb-4 last:border-0"
        >
          <!-- Group Header -->
          <div class="mb-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-900">
                {{ group.name }}
                <span v-if="group.required" class="text-red-500 ml-1">*</span>
              </h4>
              <span v-if="group.maxSelection > 1" class="text-xs text-gray-500">
                Maks. {{ group.maxSelection }} pilihan
              </span>
              <span
                v-else-if="group.maxSelection === 1"
                class="text-xs text-gray-500"
              >
                Pilih 1
              </span>
            </div>
            <p v-if="group.description" class="text-xs text-gray-600 mt-1">
              {{ group.description }}
            </p>
          </div>

          <!-- Group Items -->
          <div class="space-y-2">
            <div
              v-for="addon in group.items"
              :key="addon.id"
              class="flex items-start justify-between p-3 rounded-lg border transition"
              :class="
                isAddonSelected(addon)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <div class="flex items-start gap-3 flex-1">
                <!-- Checkbox for multiple, Radio for single -->
                <input
                  v-if="group.maxSelection !== 1"
                  type="checkbox"
                  :id="'addon-' + addon.id"
                  :value="addon"
                  :checked="isAddonSelected(addon)"
                  @change="toggleAddon(addon, group)"
                  :disabled="!addon.available || isGroupMaxed(group, addon)"
                  class="mt-0.5 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
                />
                <input
                  v-else
                  type="radio"
                  :name="'group-' + group.id"
                  :id="'addon-' + addon.id"
                  :value="addon"
                  :checked="isAddonSelected(addon)"
                  @change="selectSingleAddon(addon, group)"
                  :disabled="!addon.available"
                  class="mt-0.5 w-4 h-4 text-primary border-gray-300 focus:ring-primary disabled:opacity-50"
                />

                <!-- Addon Info -->
                <label
                  :for="'addon-' + addon.id"
                  class="flex-1 cursor-pointer"
                  :class="{ 'cursor-not-allowed opacity-50': !addon.available }"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium text-gray-900"
                        :class="{
                          'line-through text-gray-400': !addon.available,
                        }"
                      >
                        {{ addon.name }}
                      </p>
                      <p
                        v-if="addon.description"
                        class="text-xs text-gray-600 mt-0.5"
                      >
                        {{ addon.description }}
                      </p>
                      <p
                        v-if="!addon.available"
                        class="text-xs text-red-500 mt-0.5"
                      >
                        Tidak tersedia
                      </p>
                    </div>
                    <span
                      class="text-sm font-semibold text-gray-900 whitespace-nowrap ml-2"
                    >
                      +Rp {{ formatIDR(addon.price) }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex flex-col gap-3">
          <!-- Summary -->
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">
              {{ tempSelectedAddons.length }} tambahan dipilih
            </span>
            <span class="font-semibold text-gray-900">
              +Rp {{ formatIDR(calculateTempAddonPrice()) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="resetAddons"
              type="button"
              class="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              @click="applyAddons"
              type="button"
              class="flex-1 px-4 py-3 rounded-xl bg-[#FFA30E] hover:bg-[#e5920d] text-white font-semibold transition"
            >
              Terapkan
            </button>
          </div>
        </div>
      </template>
    </ResponsiveModal>

    <!-- Share Modal -->
    <ResponsiveModal
      :show="showShareModal"
      @close="showShareModal = false"
      title="Bagikan Produk"
      subtitle="Pilih platform untuk membagikan produk ini"
    >
      <div class="space-y-3">
        <!-- WhatsApp -->
        <button
          @click="shareVia('whatsapp')"
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition"
        >
          <div
            class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
              />
            </svg>
          </div>
          <div class="flex-1 text-left">
            <div class="font-semibold text-gray-900">WhatsApp</div>
            <div class="text-xs text-gray-600">Bagikan via WhatsApp</div>
          </div>
        </button>

        <!-- Facebook -->
        <button
          @click="shareVia('facebook')"
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </div>
          <div class="flex-1 text-left">
            <div class="font-semibold text-gray-900">Facebook</div>
            <div class="text-xs text-gray-600">Bagikan ke Facebook</div>
          </div>
        </button>

        <!-- Twitter -->
        <button
          @click="shareVia('twitter')"
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <div
            class="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </div>
          <div class="flex-1 text-left">
            <div class="font-semibold text-gray-900">Twitter</div>
            <div class="text-xs text-gray-600">Tweet produk ini</div>
          </div>
        </button>

        <!-- Copy Link -->
        <button
          @click="copyLink"
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <div
            class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div class="flex-1 text-left">
            <div class="font-semibold text-gray-900">Salin Link</div>
            <div class="text-xs text-gray-600">Salin link produk</div>
          </div>
        </button>
      </div>

      <template #footer>
        <button
          @click="showShareModal = false"
          class="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Tutup
        </button>
      </template>
    </ResponsiveModal>

    <!-- Image Modal (Full Screen) -->
    <ResponsiveModal
      :show="showImageModal"
      @close="showImageModal = false"
      :show-header="false"
      :show-footer="false"
      max-width="max-w-6xl"
    >
      <div
        class="relative"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Close Button -->
        <button
          @click="showImageModal = false"
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition"
        >
          <svg
            class="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Large Image -->
        <div
          class="w-full aspect-square bg-gray-100 flex items-center justify-center"
        >
          <img
            :src="selectedImage"
            :alt="product?.name"
            class="w-full h-full object-contain select-none"
            draggable="false"
          />
        </div>

        <!-- ✅ Navigation - ALWAYS VISIBLE IN MODAL (both mobile & desktop) -->
        <button
          v-if="productImages.length > 1"
          @click="prevImage"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition active:scale-95"
        >
          <svg
            class="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          v-if="productImages.length > 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition active:scale-95"
        >
          <svg
            class="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Image Counter -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium"
        >
          {{ currentImageIndex + 1 }} / {{ productImages.length }}
        </div>

        <!-- Clickable Dot Indicators -->
        <div
          v-if="productImages.length > 1"
          class="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 px-4"
        >
          <button
            v-for="(image, index) in productImages"
            :key="index"
            @click="selectImage(index)"
            class="transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
            :class="
              currentImageIndex === index
                ? 'bg-white w-8 h-2'
                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
            "
            :title="`Gambar ${index + 1}`"
          ></button>
        </div>

        <!-- Thumbnail strip at bottom (for many images) -->
        <div
          v-if="productImages.length > 5"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
        >
          <div
            class="flex gap-2 overflow-x-auto no-scrollbar bg-black/40 backdrop-blur-sm rounded-lg p-2"
          >
            <button
              v-for="(image, index) in productImages"
              :key="index"
              @click="selectImage(index)"
              class="flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all"
              :class="
                currentImageIndex === index
                  ? 'border-white scale-110'
                  : 'border-transparent hover:border-white/50'
              "
            >
              <img
                :src="image"
                :alt="`Thumbnail ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/libs/axios.js";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock.js";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const product = ref(null);
const quantity = ref(1);
const showAddonModal = ref(false);
const showShareModal = ref(false);
const showImageModal = ref(false); // ✅ NEW

// ✅ NEW: Image Gallery State
const productImages = ref([]);
const currentImageIndex = ref(0);
const selectedImage = computed(
  () => productImages.value[currentImageIndex.value]
);

// Scroll state
const showScrollHeader = ref(false);
const lastScrollY = ref(0);

// Simulasi jumlah item di keranjang (nanti bisa pakai Pinia store)
const cartItemsCount = ref(3);

// ✅ ADDED: Track if any modal is open
const isAnyModalOpen = computed(
  () => showAddonModal.value || showShareModal.value || showImageModal.value
);

// ✅ ADDED: Use body scroll lock for modals
useBodyScrollLock(isAnyModalOpen);

// Ukuran dengan harga tambahan - TANPA stock di sini
const sizes = ref([
  { name: "250 Ml", priceAdd: 0 },
  { name: "750 Ml", priceAdd: 5000 },
  { name: "1 L", priceAdd: 10000 },
]);
const selectedSize = ref(sizes.value[0]);

// Varian (warna/rasa) dengan harga tambahan - TANPA stock di sini
const variants = ref([
  { id: 1, name: "Original", priceAdd: 0 },
  { id: 2, name: "Strawberry", priceAdd: 2000 },
  { id: 3, name: "Coklat", priceAdd: 2000 },
  { id: 4, name: "Vanilla", priceAdd: 2000 },
]);
const selectedVariant = ref(variants.value[0]);

// Stock Combinations - Kombinasi size + variant
const stockCombinations = ref([
  // 250 Ml combinations
  { sizeId: "250 Ml", variantId: 1, stock: 150 },
  { sizeId: "250 Ml", variantId: 2, stock: 8 }, // Low stock
  { sizeId: "250 Ml", variantId: 3, stock: 25 },
  { sizeId: "250 Ml", variantId: 4, stock: 0 }, // Out of stock

  // 750 Ml combinations
  { sizeId: "750 Ml", variantId: 1, stock: 50 },
  { sizeId: "750 Ml", variantId: 2, stock: 0 }, // Out of stock
  { sizeId: "750 Ml", variantId: 3, stock: 15 },
  { sizeId: "750 Ml", variantId: 4, stock: 5 }, // Low stock

  // 1 L combinations
  { sizeId: "1 L", variantId: 1, stock: 0 }, // Out of stock
  { sizeId: "1 L", variantId: 2, stock: 12 },
  { sizeId: "1 L", variantId: 3, stock: 0 }, // Out of stock
  { sizeId: "1 L", variantId: 4, stock: 8 }, // Low stock
]);

// Addon Groups dengan berbagai tipe
const selectedAddons = ref([]);
const tempSelectedAddons = ref([]);

const addonGroups = ref([
  {
    id: 1,
    name: "Tingkat Kepedasan",
    description: "Wajib pilih salah satu",
    required: true,
    maxSelection: 1,
    items: [
      {
        id: 101,
        name: "Tidak Pedas",
        price: 0,
        description: null,
        available: true,
      },
      {
        id: 102,
        name: "Sedang",
        price: 0,
        description: "Level kepedasan sedang",
        available: true,
      },
      {
        id: 103,
        name: "Pedas",
        price: 1000,
        description: "Untuk pecinta pedas",
        available: true,
      },
      {
        id: 104,
        name: "Extra Pedas",
        price: 2000,
        description: "Sangat pedas!",
        available: true,
      },
    ],
  },
  {
    id: 2,
    name: "Topping",
    description: "Pilih hingga 3 topping",
    required: false,
    maxSelection: 3,
    items: [
      {
        id: 201,
        name: "Topping Meses",
        price: 3000,
        description: "Taburan meses coklat premium",
        available: true,
      },
      {
        id: 202,
        name: "Keju Parut",
        price: 4000,
        description: "Keju cheddar parut segar",
        available: true,
      },
      {
        id: 203,
        name: "Whipped Cream",
        price: 6000,
        description: "Krim kocok segar",
        available: false,
      },
      {
        id: 204,
        name: "Oreo Crumble",
        price: 5000,
        description: "Remahan oreo",
        available: true,
      },
    ],
  },
  {
    id: 3,
    name: "Extra",
    description: "Tambahan opsional lainnya",
    required: false,
    maxSelection: 999,
    items: [
      {
        id: 301,
        name: "Extra Susu",
        price: 5000,
        description: "Tambahan susu full cream",
        available: true,
      },
      {
        id: 302,
        name: "Extra Es Batu",
        price: 1000,
        description: null,
        available: true,
      },
      {
        id: 303,
        name: "Cup Besar",
        price: 3000,
        description: "Upgrade ke cup size L",
        available: true,
      },
    ],
  },
]);

const relatedProducts = ref([
  {
    id: 1,
    name: "Beras Wangliku",
    price: 70000,
    image: "https://picsum.photos/seed/product1/300/300",
  },
  {
    id: 2,
    name: "MinyakKita",
    price: 15000,
    image: "https://picsum.photos/seed/product2/300/300",
  },
  {
    id: 3,
    name: "Beras Wangliku",
    price: 70000,
    image: "https://picsum.photos/seed/product3/300/300",
  },
]);

const goBack = () => {
  router.back();
};

const goToCart = () => {
  router.push({ name: "Keranjang" });
};

const formatIDR = (value) => {
  return Number(value || 0).toLocaleString("id-ID");
};

const getBasePrice = () => {
  return product.value?.price || 15000;
};

// Get current stock based on COMBINATION of selected size AND variant
const getCurrentStock = () => {
  if (!selectedSize.value || !selectedVariant.value) return 0;

  const combination = stockCombinations.value.find(
    (combo) =>
      combo.sizeId === selectedSize.value.name &&
      combo.variantId === selectedVariant.value.id
  );

  return combination ? combination.stock : 0;
};

// Get stock for specific size (total across all variants)
const getSizeStock = (sizeName) => {
  const combinations = stockCombinations.value.filter(
    (combo) => combo.sizeId === sizeName
  );
  return combinations.reduce((total, combo) => total + combo.stock, 0);
};

// Get stock for specific variant with current size
const getVariantStock = (variantId) => {
  if (!selectedSize.value) return 0;

  const combination = stockCombinations.value.find(
    (combo) =>
      combo.sizeId === selectedSize.value.name && combo.variantId === variantId
  );

  return combination ? combination.stock : 0;
};

// Check if variant is available for current size
const isVariantAvailable = (variantId) => {
  return getVariantStock(variantId) > 0;
};

// Check if size has any stock across all variants
const isSizeAvailable = (sizeName) => {
  return getSizeStock(sizeName) > 0;
};

// Check if stock is low (less than or equal to 10)
const isLowStock = () => {
  const stock = getCurrentStock();
  return stock > 0 && stock <= 10;
};

// Get color class based on stock level
const getStockColorClass = () => {
  const stock = getCurrentStock();
  if (stock === 0) return "text-red-600";
  if (stock <= 10) return "text-amber-600";
  return "text-green-600";
};

// Validate quantity doesn't exceed stock
const validateQuantity = () => {
  const maxStock = getCurrentStock();
  if (quantity.value > maxStock) {
    quantity.value = maxStock;
  }
  if (quantity.value < 1) {
    quantity.value = 1;
  }
};

// Watch for size/variant changes and reset quantity if needed
watch([selectedSize, selectedVariant], () => {
  const maxStock = getCurrentStock();
  if (quantity.value > maxStock) {
    quantity.value = Math.max(1, maxStock);
  }
});

const calculateAddonOnlyPrice = () => {
  return selectedAddons.value.reduce((sum, addon) => sum + addon.price, 0);
};

const calculateAddonPrice = () => {
  let sizePrice = selectedSize.value?.priceAdd || 0;
  let variantPrice = selectedVariant.value?.priceAdd || 0;
  let addonsPrice = calculateAddonOnlyPrice();

  return sizePrice + variantPrice + addonsPrice;
};

const calculateTotalPrice = () => {
  const basePrice = getBasePrice();
  const addonPrice = calculateAddonPrice();

  return (basePrice + addonPrice) * quantity.value;
};

const calculateTempAddonPrice = () => {
  return tempSelectedAddons.value.reduce((sum, addon) => sum + addon.price, 0);
};

const increaseQuantity = () => {
  const maxStock = getCurrentStock();
  if (quantity.value < maxStock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Addon Modal Functions
const isAddonSelected = (addon) => {
  return tempSelectedAddons.value.some((a) => a.id === addon.id);
};

const isGroupMaxed = (group, excludeAddon) => {
  if (group.maxSelection === 999) return false;

  const groupAddons = tempSelectedAddons.value.filter((a) =>
    group.items.some((item) => item.id === a.id)
  );

  return (
    groupAddons.length >= group.maxSelection &&
    !groupAddons.some((a) => a.id === excludeAddon.id)
  );
};

const toggleAddon = (addon, group) => {
  const index = tempSelectedAddons.value.findIndex((a) => a.id === addon.id);

  if (index > -1) {
    tempSelectedAddons.value.splice(index, 1);
  } else {
    const groupAddons = tempSelectedAddons.value.filter((a) =>
      group.items.some((item) => item.id === a.id)
    );

    if (groupAddons.length < group.maxSelection) {
      tempSelectedAddons.value.push(addon);
    }
  }
};

const selectSingleAddon = (addon, group) => {
  tempSelectedAddons.value = tempSelectedAddons.value.filter(
    (a) => !group.items.some((item) => item.id === a.id)
  );
  tempSelectedAddons.value.push(addon);
};

const resetAddons = () => {
  tempSelectedAddons.value = [];
};

const applyAddons = () => {
  for (const group of addonGroups.value) {
    if (group.required) {
      const hasSelection = tempSelectedAddons.value.some((a) =>
        group.items.some((item) => item.id === a.id)
      );

      if (!hasSelection) {
        alert(`Harap pilih ${group.name}`);
        return;
      }
    }
  }

  selectedAddons.value = [...tempSelectedAddons.value];
  showAddonModal.value = false;
};

const closeAddonModal = () => {
  tempSelectedAddons.value = [...selectedAddons.value];
  showAddonModal.value = false;
};

const validateSelection = () => {
  if (!selectedSize.value) {
    alert("Silakan pilih ukuran terlebih dahulu");
    return false;
  }

  if (variants.value.length > 0 && !selectedVariant.value) {
    alert("Silakan pilih varian terlebih dahulu");
    return false;
  }

  if (getCurrentStock() === 0) {
    alert(
      `Maaf, kombinasi ${selectedSize.value.name} - ${selectedVariant.value.name} sedang habis`
    );
    return false;
  }

  if (quantity.value > getCurrentStock()) {
    alert(`Maaf, stok hanya tersisa ${getCurrentStock()} item`);
    return false;
  }

  for (const group of addonGroups.value) {
    if (group.required) {
      const hasSelection = selectedAddons.value.some((a) =>
        group.items.some((item) => item.id === a.id)
      );

      if (!hasSelection) {
        alert(`Harap pilih ${group.name}`);
        return false;
      }
    }
  }

  return true;
};

const addToCart = () => {
  if (!validateSelection()) return;

  const cartItem = {
    productSlug: getProductSlug(),
    productId: product.value?.id,
    name: product.value?.name,
    image: product.value?.image,
    basePrice: getBasePrice(),
    size: selectedSize.value,
    variant: selectedVariant.value,
    addons: selectedAddons.value,
    quantity: quantity.value,
    unitPrice: calculateTotalPrice() / quantity.value,
    totalPrice: calculateTotalPrice(),
  };

  // TODO: Implement cart store dengan Pinia
  console.log("Add to cart:", cartItem);

  // Simulasi success
  alert(`${product.value?.name} berhasil ditambahkan ke keranjang!`);

  // Update cart count (nanti pakai Pinia store)
  cartItemsCount.value++;
};

const getProductSlug = () => {
  return route.params.slug;
};

const buyNow = () => {
  if (!validateSelection()) return;

  router.push({
    name: "Pembayaran Produk",
    query: {
      slug: getProductSlug(),
      type: "product",
      title: product.value?.name || "Nama Produk",
      price: calculateTotalPrice(),
      size: selectedSize.value?.name,
      variant: selectedVariant.value?.name,
      addons: JSON.stringify(selectedAddons.value.map((a) => a.name)),
      quantity: quantity.value,
    },
  });
};

const viewProduct = (slug) => {
  router.push({ name: "Product Detail", params: { slug } });
};

// Handle scroll event
const handleScroll = () => {
  const currentScrollY = window.scrollY;

  // Show header saat scroll lebih dari 200px
  if (currentScrollY > 200) {
    showScrollHeader.value = true;
  } else {
    showScrollHeader.value = false;
  }

  lastScrollY.value = currentScrollY;
};

// Share Functions
const shareProduct = () => {
  showShareModal.value = true;
};

const getShareUrl = () => {
  return window.location.href;
};

const getShareText = () => {
  const productName = product.value?.name || "Produk Menarik";
  const productPrice = formatIDR(getBasePrice());
  return `Lihat ${productName} seharga Rp ${productPrice} di Sumilir! ${getShareUrl()}`;
};

const shareVia = (platform) => {
  const url = encodeURIComponent(getShareUrl());
  const text = encodeURIComponent(getShareText());

  let shareUrl = "";

  switch (platform) {
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${text}`;
      break;
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank", "width=600,height=400");
    showShareModal.value = false;
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(getShareUrl());
    alert("Link berhasil disalin!");
    showShareModal.value = false;
  } catch (err) {
    console.error("Failed to copy:", err);
    alert("Gagal menyalin link");
  }
};

// ✅ NEW: Touch/Swipe handling
const touchStartX = ref(0);
const touchEndX = ref(0);
const isDragging = ref(false);

// ✅ NEW: Image Gallery Functions
const selectImage = (index) => {
  currentImageIndex.value = index;
};

const nextImage = () => {
  if (currentImageIndex.value < productImages.value.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0; // Loop back to first
  }
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = productImages.value.length - 1; // Loop to last
  }
};

const openImageModal = () => {
  showImageModal.value = true;
};

// ✅ NEW: Touch/Swipe handlers
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
  isDragging.value = false;
};

const handleTouchMove = (e) => {
  if (Math.abs(e.touches[0].clientX - touchStartX.value) > 10) {
    isDragging.value = true;
  }
};

const handleTouchEnd = (e) => {
  if (!isDragging.value) return;

  touchEndX.value = e.changedTouches[0].clientX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50; // Minimum swipe distance
  const diff = touchStartX.value - touchEndX.value;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next image
      nextImage();
    } else {
      // Swipe right - previous image
      prevImage();
    }
  }
};

onMounted(async () => {
  loading.value = true;
  window.addEventListener("scroll", handleScroll);

  addonGroups.value.forEach((group) => {
    if (group.required && group.maxSelection === 1 && group.items.length > 0) {
      const firstAvailable = group.items.find((item) => item.available);
      if (firstAvailable) {
        selectedAddons.value.push(firstAvailable);
      }
    }
  });

  tempSelectedAddons.value = [...selectedAddons.value];

  try {
    const productSlug = getProductSlug();
    const { data } = await api.get(`/public/products/${productSlug}`);
    product.value = data;

    // ✅ NEW: Initialize images array
    if (data.images && data.images.length > 0) {
      productImages.value = data.images.map((img) => img.url || img.path);
    } else if (data.image) {
      // Fallback to single image
      productImages.value = [data.image];
    } else {
      // Default placeholder
      productImages.value = [
        "https://picsum.photos/seed/mainproduct/600/600",
        "https://picsum.photos/seed/product2/600/600",
        "https://picsum.photos/seed/product3/600/600",
      ];
    }

    if (data.sizes && data.sizes.length > 0) {
      sizes.value = data.sizes;
      const availableSize = data.sizes.find((s) => isSizeAvailable(s.name));
      selectedSize.value = availableSize || data.sizes[0];
    }

    if (data.variants && data.variants.length > 0) {
      variants.value = data.variants;
      const availableVariant = data.variants.find((v) =>
        isVariantAvailable(v.id)
      );
      selectedVariant.value = availableVariant || data.variants[0];
    }

    if (data.stockCombinations) {
      stockCombinations.value = data.stockCombinations;
    }

    if (data.addonGroups) {
      addonGroups.value = data.addonGroups;
    }
  } catch (e) {
    // ✅ NEW: Fallback with multiple images
    product.value = {
      id: 1,
      name: "Nama Produk",
      price: 15000,
      description: "Deskripsi produk...",
      store: {
        name: "Sumber Rejeki",
        logo: "https://picsum.photos/seed/store/100/100",
      },
    };

    productImages.value = [
      "https://picsum.photos/seed/mainproduct/600/600",
      "https://picsum.photos/seed/product2/600/600",
      "https://picsum.photos/seed/product3/600/600",
      "https://picsum.photos/seed/product4/600/600",
    ];

    console.warn("API produk belum tersedia, menggunakan data fallback.");
  } finally {
    loading.value = false;
  }
});

// Cleanup scroll listener
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Smooth transitions for image changes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.group img {
  animation: fadeIn 0.3s ease-out;
}

/* Prevent text selection during swipe */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
