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
    <div v-if="loading || !product" class="max-w-7xl mx-auto sm:px-4 sm:py-6">
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
                class="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all active:scale-95"
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
                class="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all active:scale-95"
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
            <div v-if="productImages.length > 1" class="px-4 sm:px-2 py-2">
              <div class="thumb-strip">
                <button
                  v-for="(image, index) in productImages"
                  :key="index"
                  @click="selectImage(index)"
                  class="thumb-item"
                  :class="currentImageIndex === index ? 'active' : ''"
                >
                  <img
                    :src="image"
                    :alt="`${product?.name} - ${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                </button>
              </div>
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
                Rp {{ formatIDR(getCurrentPrice()) }}
                <!-- ✅ gunakan harga kombinasi -->
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
                  <span
                    v-if="isLowStock()"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
                  >
                    Stok terbatas
                  </span>
                  <span
                    v-if="getCurrentStock() === 0"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700"
                  >
                    Habis
                  </span>
                </div>
              </div>

              <!-- Banner archived -->
              <div
                v-if="isArchived"
                class="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm"
              >
                Produk ini telah diarsipkan dan tidak tersedia untuk dibeli.
              </div>
            </div>

            <!-- Ukuran/Varian (Option 1) -->
            <div v-if="sizes.length > 0" class="py-4 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                {{ option1Label }} <span class="text-red-500">*</span>
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="size in sizes"
                  :key="size.id"
                  @click="
                    selectedSize = size;
                    validateQuantity();
                  "
                  :disabled="!isSizeAvailable(size.name)"
                  class="px-4 py-2 rounded-lg border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    selectedSize?.id === size.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  "
                >
                  <div class="flex flex-col items-center">
                    <!-- 🖼️ Image jika ada -->
                    <div
                      v-if="size.image"
                      class="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center"
                    >
                      <img
                        :src="getVariantImageUrl(size.id)"
                        :alt="size.name"
                        class="w-full h-full object-cover"
                      />
                    </div>

                    <!-- Nama Size -->
                    <span>{{ size.name }}</span>

                    <!-- Indikator stok -->
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
                      {{ getSizeStock(size.name) === 0 ? "Habis" : "" }}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Varian (Option 2) -->
            <div
              v-if="variants.length > 0"
              class="py-4 border-b border-gray-200"
            >
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                {{ option2Label }} <span class="text-red-500">*</span>
                <!-- ✅ label dinamis -->
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variant in variants"
                  :key="variant.id"
                  @click="
                    selectedVariant = variant;
                    validateQuantity();
                  "
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
                  class="text-sm text-primary hover:underline font-medium cursor-pointer"
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
                <h3 class="text-sm font-semibold text-gray-900">
                  Jumlah
                  <span
                    v-if="minPurchase > 1"
                    class="mt-1 text-sm font-normal text-muted-foreground"
                    >(Minimal beli: {{ minPurchase }} item)</span
                  >
                </h3>

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
              <p
                class="text-sm text-gray-700 leading-relaxed transition-all"
                :class="{
                  'line-clamp-4': !showFullDescription,
                  'line-clamp-none': showFullDescription,
                }"
              >
                {{
                  product?.description ||
                  "Minuman susu fermentasi dengan rasa lembut, segar, dan sedikit asam yang menyehatkan. Diproses dari susu murni pilihan dengan kultur bakteri baik Lactobacillus yang membantu menjaga kesehatan pencernaan"
                }}
              </p>
              <button
                v-if="shouldShowSeeMore"
                @click="showFullDescription = !showFullDescription"
                class="mt-2 text-primary text-sm font-semibold focus:outline-none cursor-pointer"
              >
                {{ showFullDescription ? "Sembunyikan" : "Lihat Selengkapnya" }}
              </button>
            </div>

            <!-- Info Toko -->
            <div class="py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"
                  >
                    <img
                      v-if="product?.merchant?.logo"
                      :src="product.merchant.logo"
                      alt="UMKM logo"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="min-w-0">
                    <h4
                      class="text-sm font-semibold text-gray-900 truncate"
                      :title="product?.merchant?.name || 'Sumber Rejeki'"
                    >
                      {{ product?.merchant?.name || "Sumber Rejeki" }}
                    </h4>
                    <span
                      class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 mt-1"
                    >
                      Buka
                    </span>
                  </div>
                </div>
                <Button variant="primary-outline" class="flex-shrink-0"
                  >Kunjungi</Button
                >
              </div>
            </div>

            <!-- Produk Lain dari Toko -->
            <div class="py-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                Produk lain dari toko ini
              </h3>
              <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                <ProductCard
                  v-for="item in relatedProducts"
                  :key="item.id"
                  :product="item"
                  @click="viewProduct(item.slug)"
                  customClass="max-w-40"
                />
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
        :title="getCurrentStock() === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'"
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
          ></path>
        </svg>
      </button>

      <!-- Tombol Beli Sekarang -->
      <Button
        @click="buyNow"
        variant="primary"
        customClass="w-full"
        :disabled="getCurrentStock() === 0"
      >
        {{ getCurrentStock() === 0 ? "Stok Habis" : "Beli Sekarang" }}
      </Button>
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
          <p class="text-sm text-gray-600">Total Harga ({{ quantity }} item)</p>
          <p class="text-2xl font-bold text-gray-900">
            Rp {{ formatIDR(calculateTotalPrice()) }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Tombol Share Desktop (baru) -->
          <Button
            @click="shareProduct"
            variant="muted-outline"
            title="Bagikan Produk"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
              />
            </svg>
            <span class="hidden lg:inline">Bagikan</span>
          </Button>

          <!-- Tombol Keranjang Desktop -->
          <Button
            @click="addToCart"
            variant="primary-outline"
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
          </Button>

          <!-- Tombol Beli Sekarang -->
          <Button
            @click="buyNow"
            :disabled="getCurrentStock() === 0"
            variant="primary"
          >
            {{ getCurrentStock() === 0 ? "Stok Habis" : "Beli Sekarang" }}
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Addon Modal -->
  <ResponsiveModal
    :show="showAddonModal"
    @close="showAddonModal = false"
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
              d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0 .42-.015.63A9.935 9.935 0 0024 4.59z"
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
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
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
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
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  watch,
  onUnmounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/libs/axios.js";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock.js";
import { getImageUrl } from "@/libs/getImageUrl.js";
import { getVariantImageUrl } from "@/libs/getVariantImageUrl.js";
import Button from "@/components/common/Button.vue";
import { useCheckoutStore } from "@/stores/checkout";
import ProductCard from "@/components/Card/ProductCard.vue";
import { useProducts } from "@/composables/useProducts.js";
import { useToast } from "vue-toastification";
import { useCartStore } from "@/stores/cart";

const cartStore = useCartStore();
const toast = useToast();
const loadingCart = ref(false);
async function addToCart() {
  // 1. Validasi Stok
  if (getCurrentStock() <= 0) {
    toast.error("Stok barang ini sedang habis.");
    return;
  }

  // 2. Validasi Pilihan Varian (Wajib pilih jika opsi tersedia)
  // Cek Opsi 1 (Size)
  if (sizes.value.length > 0 && !selectedSize.value) {
    toast.warning(`Mohon pilih ${option1Label.value} terlebih dahulu.`);
    return;
  }
  // Cek Opsi 2 (Variant/Color)
  if (variants.value.length > 0 && !selectedVariant.value) {
    toast.warning(`Mohon pilih ${option2Label.value} terlebih dahulu.`);
    return;
  }

  loadingCart.value = true;

  try {
    // 3. Cari product_variant_id yang sesuai kombinasi
    // Kita ambil ID dari size dan variant yang dipilih (atau 0 jika tidak ada)
    const sizeId = selectedSize.value?.id ?? 0;
    const variantId = selectedVariant.value?.id ?? 0;

    // Cari di stockCombinations
    const matchedCombo = stockCombinations.value.find(
      (c) =>
        Number(c.sizeId) === Number(sizeId) &&
        Number(c.variantId) === Number(variantId)
    );

    // Jika produk punya varian tapi tidak ketemu kombinasinya (seharusnya tidak terjadi jika validasi lolos)
    if (
      (sizes.value.length > 0 || variants.value.length > 0) &&
      !matchedCombo
    ) {
      toast.error("Varian produk tidak ditemukan.");
      return;
    }

    // 4. Susun Payload
    const payload = {
      product_id: product.value.id,
      quantity: quantity.value,
      // Kirim product_variant_id jika ada (hasil kombinasi), jika null backend biasanya handle sebagai single product
      variant_id: matchedCombo ? matchedCombo.product_variant_id : null,
      // Kirim array ID addon
      addons: selectedAddons.value.map((addon) => ({
        group_id: addon.addon_group_id,
        addon_id: addon.id,
      })),
      // Opsional: Kirim note jika ada fitur catatan
    };

    console.log("ADD TO CART PAYLOAD", payload);
    // 5. Panggil API
    const response = await api.post("/cart/items", payload);

    // 6. Handle Sukses
    toast.success("Produk berhasil ditambahkan ke keranjang!");

    // Update jumlah item di keranjang (Badge) dari response terbaru
    if (response.data && response.data.cart_total_items !== undefined) {
      cartItemsCount.value = response.data.cart_total_items;
    } else {
      // Fallback manual increment jika backend tidak balikin total
      if (response.data?.cart_total_items !== undefined) {
        cartStore.setTotal(response.data.cart_total_items);
      } else {
        cartStore.increase(quantity.value);
      }
    }

    // Opsional: Reset addon atau quantity setelah berhasil
    // selectedAddons.value = [];
    // tempSelectedAddons.value = [];
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error.response?.status === 401) {
      toast.error("Silakan login terlebih dahulu.");
      router.push({ name: "Login", query: { redirect: route.fullPath } });
    } else {
      const msg =
        error.response?.data?.message || "Gagal menambahkan ke keranjang.";
      toast.error(msg);
    }
  } finally {
    loadingCart.value = false;
  }
}
const { fetchPublicProductDetail, fetchProductDetail } = useProducts(); // support both if available
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const product = ref(null);
const quantity = ref(1);
const showAddonModal = ref(false);
const showShareModal = ref(false);
const showImageModal = ref(false);

const isMouseDown = ref(false);
const mouseStartX = ref(0);
const mouseDeltaX = ref(0);
const swipeThreshold = 50;

let abortController = null;
const showFullDescription = ref(false);
const shouldShowSeeMore = computed(
  () => (product.value?.description?.length || 0) > 200
);

// image / gallery state
const productImages = ref([]);
const selectedImage = computed(
  () => productImages.value[currentImageIndex.value] || null
);

// product options/variants state
const sizes = ref([]);
const selectedSize = ref(null);
const variants = ref([]);
const selectedVariant = ref(null);
const stockCombinations = ref([]);

// addons
const selectedAddons = ref([]);
const tempSelectedAddons = ref([]);
const addonGroups = ref([]);

// misc
const showScrollHeader = ref(false);
const lastScrollY = ref(0);
const relatedProducts = ref([]);
const cartItemsCount = computed(() => cartStore.totalItems);

// body scroll lock for modals
const isAnyModalOpen = computed(
  () => showAddonModal.value || showShareModal.value || showImageModal.value
);
const goToCart = () => {
  router.push({ name: "Keranjang" });
};
useBodyScrollLock(isAnyModalOpen);
const goBack = () => {
  router.back();
};
// helper: safe getter for image URL (handles multiple shapes)
function resolveImageUrlFromSource(src) {
  if (!src) return null;
  if (typeof src === "string") return src;
  if (typeof src === "object") {
    if (src.image_url) return src.image_url;
    if (src.url) return src.url;
    if (src.image_path) {
      // if path only, try to use getImageUrl when id absent — but better to return null and rely on getVariantImageUrl
      return null;
    }
    if (src.id) {
      // try id-based endpoint
      try {
        return getImageUrl(src.id); // for product images stored as id => build via getImageUrl
      } catch (e) {
        // fallback to variant endpoint
        return null;
      }
    }
  }
  return null;
}

// map productImages in robust way:
// - if mapped.productImages is array of string => use directly
// - if array of objects with id/image_url => convert
function normalizeProductImages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((it) => {
      const url = resolveImageUrlFromSource(it);
      if (url) return url;
      // fallback: if item has "image_path" and product has base URL build absolute
      if (it && it.image_path && typeof it.image_path === "string") {
        // try to build from getImageUrl? getImageUrl expects image id, so we can't use it here.
        // leave as `/storage/${it.image_path}` as last resort (assuming backend serves)
        // but better to return null so UI hides broken images.
        return null;
      }
      return null;
    })
    .filter(Boolean);
}

// -------------- stock/price helpers (kept dari kode Anda, sedikit disesuaikan) --------------
function getSizeIdByName(name) {
  const found = sizes.value.find((s) => String(s.name) === String(name));
  return found?.id ?? null;
}

function getCurrentStock() {
  if (
    !Array.isArray(stockCombinations.value) ||
    stockCombinations.value.length === 0
  )
    return 0;
  const sizeKey = selectedSize.value?.id ?? selectedSize.value?.value?.id ?? 0;
  const variantKey =
    selectedVariant.value?.id ?? selectedVariant.value?.value?.id ?? 0;
  const found = stockCombinations.value.find(
    (c) =>
      Number(c.sizeId) === Number(sizeKey) &&
      Number(c.variantId) === Number(variantKey)
  );
  return Number(found?.stock ?? 0);
}
function getVariantStock(variantId) {
  if (!Array.isArray(stockCombinations.value)) return 0;
  const sizeKey = selectedSize.value?.id ?? selectedSize.value?.value?.id ?? 0;
  const found = stockCombinations.value.find(
    (c) =>
      Number(c.sizeId) === Number(sizeKey) &&
      Number(c.variantId) === Number(variantId)
  );
  return Number(found?.stock ?? 0);
}
function getSizeStock(sizeNameOrId) {
  const sizeId =
    typeof sizeNameOrId === "string"
      ? getSizeIdByName(sizeNameOrId)
      : sizeNameOrId;
  if (!Array.isArray(stockCombinations.value) || sizeId == null) return 0;
  return stockCombinations.value
    .filter((c) => Number(c.sizeId) === Number(sizeId))
    .reduce((sum, c) => sum + Number(c.stock || 0), 0);
}
function isSizeAvailable(sizeNameOrId) {
  return getSizeStock(sizeNameOrId) > 0;
}
function isVariantAvailable(variantId) {
  return getVariantStock(variantId) > 0;
}
function getCurrentPrice() {
  if (
    !Array.isArray(stockCombinations.value) ||
    stockCombinations.value.length === 0
  ) {
    return Number(product.value?.price || 0);
  }
  const sizeKey = selectedSize.value?.id ?? selectedSize.value?.value?.id ?? 0;
  const variantKey =
    selectedVariant.value?.id ?? selectedVariant.value?.value?.id ?? 0;

  let found =
    stockCombinations.value.find(
      (c) =>
        Number(c.sizeId) === Number(sizeKey) &&
        Number(c.variantId) === Number(variantKey) &&
        Number(c.stock) > 0
    ) ||
    stockCombinations.value.find(
      (c) =>
        Number(c.sizeId) === Number(sizeKey) &&
        Number(c.variantId) === Number(variantKey)
    );

  if (!found) {
    const min = Number(product.value?.price || 0);
    return min;
  }
  return Number(found.price ?? product.value?.price ?? 0);
}

// quantity helpers
function validateQuantity() {
  const stock = getCurrentStock();
  let q = Number(quantity.value || 0);
  if (stock <= 0) {
    quantity.value = 0;
    return;
  }
  const min = Math.max(1, Number(product.value?.min_purchase ?? 1));
  if (isNaN(q) || q < min) q = min;
  if (q > stock) q = stock;
  quantity.value = q;
}
function increaseQuantity() {
  const stock = getCurrentStock();
  if (stock <= 0) return;
  const next = Number(quantity.value || 0) + 1;
  quantity.value = Math.min(next, stock);
}
function decreaseQuantity() {
  const stock = getCurrentStock();
  if (stock <= 0) {
    quantity.value = 0;
    return;
  }
  const min = Math.max(1, Number(product.value?.min_purchase ?? 1));
  const next = Number(quantity.value || 0) - 1;
  quantity.value = Math.max(next, min);
}

// -------------- fetching & normalization --------------
function resetStateBeforeFetch() {
  product.value = null;
  productImages.value = [];
  sizes.value = [];
  variants.value = [];
  stockCombinations.value = [];
  selectedSize.value = null;
  selectedVariant.value = null;
  addonGroups.value = [];
  selectedAddons.value = [];
  tempSelectedAddons.value = [];
  relatedProducts.value = [];
}

const shareProduct = () => {
  showShareModal.value = true;
};

async function doFetchProduct(slug) {
  if (!slug) return;

  if (abortController) {
    try {
      abortController.abort();
    } catch (e) {}
  }
  abortController = new AbortController();

  loading.value = true;
  resetStateBeforeFetch();

  // small helpers (local)
  function normalizeProductImages(images) {
    // images bisa berupa: string URL, object { id, image_path, image_url }, atau hasil buildImageUrl sebelumnya
    return images
      .map((img) => {
        if (!img) return null;
        if (typeof img === "string") return img;
        if (typeof img === "object") {
          // jika sudah berupa absolute url
          if (img.image_url) return img.image_url;
          // jika id tersedia — gunakan getImageUrl helper (yang kamu import)
          if (img.id) return getImageUrl(img.id);
          // jika image_path tersedia, coba resolve
          if (img.image_path) {
            return typeof absoluteImagePath === "function"
              ? absoluteImagePath(img.image_path)
              : _absoluteImagePath
              ? _absoluteImagePath(img.image_path)
              : `${
                  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
                }/storage/${img.image_path}`;
          }
        }
        return null;
      })
      .filter(Boolean);
  }

  function resolveImageUrlFromSource(src) {
    if (!src) return null;
    if (typeof src === "string") return src;
    if (typeof src === "object") {
      if (src.image_url) return src.image_url;
      if (src.id) return getImageUrl(src.id);
      if (src.image_path) {
        return typeof absoluteImagePath === "function"
          ? absoluteImagePath(src.image_path)
          : _absoluteImagePath
          ? _absoluteImagePath(src.image_path)
          : `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
            }/storage/${src.image_path}`;
      }
    }
    return null;
  }

  try {
    const fetcher =
      typeof fetchPublicProductDetail === "function"
        ? fetchPublicProductDetail
        : fetchProductDetail;
    const mapped = await fetcher(slug, { signal: abortController.signal });

    // fallback: jika endpoint mengembalikan raw product tanpa mapping
    if (!mapped || !mapped.product) {
      const maybeProduct = mapped?.product ?? mapped;
      if (!maybeProduct) {
        router.replace({ name: "Beranda" });
        return;
      }

      const fallbackMapped = {
        product: maybeProduct,
        productImages: (maybeProduct.images || []).map((img) =>
          img?.id ? getImageUrl(img.id) : img.image_url || img
        ),
        sizes: (maybeProduct.options?.[0]?.values || []).map((v) => ({
          id: v.id,
          name: v.option_value ?? v.name,
          image: v.image_url || v.image_path || null,
        })),
        variants: (maybeProduct.options?.[1]?.values || []).map((v) => ({
          id: v.id,
          name: v.option_value ?? v.name,
          image: v.image_url || v.image_path || null,
        })),
        stockCombinations: (mapped?.combinations || []).map((c) => ({
          ...c,
          sizeId: Number(c.sizeId || 0),
          variantId: Number(c.variantId || 0),
          stock: Number(c.stock || 0),
          price: Number(c.price || 0),
        })),
        addonGroups:
          maybeProduct.addon_groups || maybeProduct.addonGroups || [],
        selectedSize: null,
        selectedVariant: null,
        related_products: mapped.related_products || [],
        min_purchase: maybeProduct.min_purchase ?? 1,
        optionDefinitions: (maybeProduct.options || []).map((o) => ({
          id: o.id,
          option_name: o.option_name || o.name,
          uses_image: !!o.uses_image,
          values: (o.values || []).map((v) => ({
            id: v.id,
            dbId: v.id,
            product_option_id: v.product_option_id,
            option_value: v.option_value,
            image_url: v.image_url || null,
            image_path: v.image_path || null,
            preview:
              v.image_url ||
              (v.image_path
                ? typeof absoluteImagePath === "function"
                  ? absoluteImagePath(v.image_path)
                  : `${
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://localhost:8000"
                    }/storage/${v.image_path}`
                : null) ||
              getVariantImageUrl(v.id) ||
              null,
          })),
        })),
      };

      Object.assign(mapped, fallbackMapped);
    }

    // assign core product info
    product.value = {
      ...mapped.product,
      price: Number(mapped.price_range?.min ?? mapped.product?.price ?? 0),
      min_purchase: Number(
        mapped.min_purchase ?? mapped.product?.min_purchase ?? 1
      ),
    };

    // IMAGES: normalisasi dari berbagai sumber
    if (Array.isArray(mapped.productImages) && mapped.productImages.length) {
      productImages.value = normalizeProductImages(mapped.productImages);
    } else if (
      Array.isArray(mapped.product?.images) &&
      mapped.product.images.length
    ) {
      productImages.value = normalizeProductImages(mapped.product.images);
    } else if (mapped.product?.cover_image) {
      const u = resolveImageUrlFromSource(mapped.product.cover_image);
      if (u) productImages.value.push(u);
    }

    // optionDefinitions adalah sumber kebenaran (normalisasi dari composable)
    const optionDefs =
      mapped.optionDefinitions ?? mapped.product?.options ?? [];
    // buat juga convenience arrays option1Values / option2Values di state kompatibel
    const option1Vals = Array.isArray(optionDefs[0]?.values)
      ? optionDefs[0].values
      : [];
    const option2Vals = Array.isArray(optionDefs[1]?.values)
      ? optionDefs[1].values
      : [];

    // sizes & variants untuk kompatibilitas komponen lama (tetap isi tapi jangan pakai sebagai sumber label)
    sizes.value = option1Vals.map((v) => ({
      id: v.id,
      name: v.option_value ?? v.name,
      image: v.image_url || null,
    }));
    variants.value = option2Vals.map((v) => ({
      id: v.id,
      name: v.option_value ?? v.name,
      image: v.image_url || null,
    }));

    // stockCombinations (pastikan format konsisten)
    stockCombinations.value = Array.isArray(mapped.stockCombinations)
      ? mapped.stockCombinations.map((c) => ({
          product_variant_id: c.product_variant_id ?? c.id ?? null,
          sizeId: Number(c.sizeId ?? c.size_id ?? 0),
          variantId: Number(c.variantId ?? c.variant_id ?? 0),
          price: Number(c.price ?? mapped.product?.price ?? 0),
          stock: Number(c.stock ?? 0),
          sku: c.sku ?? null,
        }))
      : [];

    // optionDefinitions kept for template direct access
    // assign to product.value so template / other computed dapat mengakses product.optionDefinitions
    product.value.optionDefinitions = optionDefs;

    // addon groups / related products
    addonGroups.value = Array.isArray(mapped.addonGroups)
      ? mapped.addonGroups
      : mapped.product?.addon_groups ?? [];
    relatedProducts.value = Array.isArray(mapped.related_products)
      ? mapped.related_products
      : mapped.relatedProducts ?? [];

    // defaults selected (mapped may already provide selectedSize/selectedVariant with id/name)
    selectedSize.value =
      mapped.selectedSize ?? (sizes.value.length ? sizes.value[0] : null);
    selectedVariant.value =
      mapped.selectedVariant ??
      (variants.value.length ? variants.value[0] : null);

    selectedAddons.value = Array.isArray(mapped.selectedAddons)
      ? mapped.selectedAddons
      : [];
    tempSelectedAddons.value = [...selectedAddons.value];

    cartItemsCount.value = Number(
      mapped.cart_count ?? mapped.cartItemsCount ?? (cartItemsCount.value || 0)
    );

    // fallback: kalau tidak ada productImages tapi variant memiliki display_image gunakan itu
    if (
      (!productImages.value || productImages.value.length === 0) &&
      Array.isArray(variants.value) &&
      variants.value.length
    ) {
      const imgFromVariant =
        variants.value.find((v) => v.display_image || v.image)?.display_image ??
        variants.value.find((v) => v.image)?.image;
      if (imgFromVariant) productImages.value.push(imgFromVariant);
    }
  } catch (e) {
    if (e?.name === "AbortError") return;
    console.error("Gagal memuat produk:", e);
    if (e?.response?.status === 404) {
      router.replace({ name: "Beranda" });
      return;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  cartStore.fetchCartCount();
  const initialSlug = route.params.slug;
  if (initialSlug) doFetchProduct(String(initialSlug));
});

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) doFetchProduct(String(newSlug));
  }
);

onBeforeUnmount(() => {
  if (abortController) {
    try {
      abortController.abort();
    } catch (e) {}
    abortController = null;
  }
  window.removeEventListener("scroll", handleScroll);
});
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
const currentImageIndex = ref(0);
// simple scroll handler (as in your original)
function handleScroll() {
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  showScrollHeader.value = y > 80;
  lastScrollY.value = y;
}

// buyNow: keep your existing behavior, but use safe fields
function buyNow() {
  const qty = Number(quantity.value || 1);
  const unitPrice =
    Number(getCurrentPrice()) || Number(product.value?.price || 0);
  const sizeId = selectedSize.value?.id ?? null;
  const sizeName = selectedSize.value?.name ?? selectedSize.value?.value ?? "";
  const variantId = selectedVariant.value?.id ?? null;
  const variantName =
    selectedVariant.value?.name ?? selectedVariant.value?.value ?? "";
  const stock = getCurrentStock();
  const store = product.value?.merchant || product.value?.store || {};
  const checkout = useCheckoutStore();
  checkout.setFromProductDetail({
    slug: product.value?.slug,
    title: product.value?.name,
    image: selectedImage.value || productImages.value?.[0] || "",
    store: {
      id: store.id ?? null,
      slug: store.slug ?? null,
      name: store.name ?? "",
      address: store.address ?? "",
      phone: store.phone ?? "",
    },
    qty,
    sizeId,
    sizeName,
    variantId,
    variantName,
    unitPrice,
    stock,
    addons: selectedAddons.value,
  });

  router.push({
    path: "/product-payment",
    query: {
      slug: product.value?.slug || "",
      storeId: store.id ? String(store.id) : "",
      storeSlug: store.slug || "",
    },
  });
}

function isAddonSelected(addon) {
  return tempSelectedAddons.value.some(
    (a) => Number(a.id) === Number(addon.id)
  );
}

// Toggle untuk group multiple (checkbox)
function toggleAddon(addon, group) {
  const idx = tempSelectedAddons.value.findIndex(
    (a) => Number(a.id) === Number(addon.id)
  );
  if (idx >= 0) {
    // hapus
    tempSelectedAddons.value.splice(idx, 1);
  } else {
    // tambahkan jika belum mencapai maxSelection
    const currentCountInGroup = tempSelectedAddons.value.filter((a) =>
      group.items.some((gi) => Number(gi.id) === Number(a.id))
    ).length;
    if (currentCountInGroup < Number(group.maxSelection || 1)) {
      tempSelectedAddons.value.push({
        ...addon,
        addon_group_id: group.id,
      });
    }
  }
}

// Pilih single untuk group maxSelection === 1 (radio)
function selectSingleAddon(addon, group) {
  // hapus semua addon dari group ini
  tempSelectedAddons.value = tempSelectedAddons.value.filter(
    (a) => !group.items.some((gi) => Number(gi.id) === Number(a.id))
  );
  // tambahkan addon terpilih jika tersedia
  if (addon.available !== false) {
    tempSelectedAddons.value.push({
      ...addon,
      addon_group_id: group.id,
    });
  }
}

// Cek apakah group sudah mencapai batas pilihan (dipakai di template disable checkbox)
function isGroupMaxed(group, addon) {
  const count = tempSelectedAddons.value.filter((a) =>
    group.items.some((gi) => Number(gi.id) === Number(a.id))
  ).length;
  const maxSel = Number(group.maxSelection || 1);
  // jika addon belum dipilih dan count sudah max, maka group maxed
  const alreadySelected = isAddonSelected(addon);
  return !alreadySelected && count >= maxSel;
}

// Harga total sementara di modal
function calculateTempAddonPrice() {
  return tempSelectedAddons.value.reduce(
    (sum, a) => sum + Number(a.price || 0),
    0
  );
}

// Reset pilihan di modal (kosongkan semua atau kembalikan default wajib)
function resetAddons() {
  // kosongkan sementara
  tempSelectedAddons.value = [];
  // jika ada group wajib (min_selection > 0) dengan single pilihan, pilih item pertama yang available
  addonGroups.value.forEach((group) => {
    const minSel = Number(group.required ? 1 : group.minSelection ?? 0);
    const maxSel = Number(group.maxSelection || 1);
    if (
      minSel > 0 &&
      maxSel === 1 &&
      Array.isArray(group.items) &&
      group.items.length
    ) {
      const firstAvailable = group.items.find(
        (item) => item.available !== false
      );
      if (firstAvailable) {
        tempSelectedAddons.value.push({
          ...firstAvailable,
          addon_group_id: group.id,
        });
      }
    }
  });
}

// Terapkan pilihan modal ke pilihan final
function applyAddons() {
  selectedAddons.value = [...tempSelectedAddons.value];
  showAddonModal.value = false;
}

function handleMouseDown(e) {
  // hanya tombol kiri mouse
  if (e.button !== 0) return;
  isMouseDown.value = true;
  mouseStartX.value = e.clientX;
  mouseDeltaX.value = 0;
}

function handleMouseMove(e) {
  if (!isMouseDown.value) return;
  mouseDeltaX.value = e.clientX - mouseStartX.value;
}

function handleMouseUp() {
  if (!isMouseDown.value) return;
  // Tentukan arah berdasarkan deltaX
  if (mouseDeltaX.value > swipeThreshold) {
    prevImage();
  } else if (mouseDeltaX.value < -swipeThreshold) {
    nextImage();
  }
  // reset
  isMouseDown.value = false;
  mouseStartX.value = 0;
  mouseDeltaX.value = 0;
}

function handleMouseLeave() {
  // Jika keluar area saat drag, anggap mouse up
  if (!isMouseDown.value) return;
  handleMouseUp();
}

function selectImage(index) {
  if (!Array.isArray(productImages.value) || productImages.value.length === 0)
    return;
  const max = productImages.value.length - 1;
  currentImageIndex.value = Math.min(Math.max(Number(index) || 0, 0), max);
}

function prevImage() {
  if (!Array.isArray(productImages.value) || productImages.value.length === 0)
    return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + productImages.value.length) %
    productImages.value.length;
}

function nextImage() {
  if (!Array.isArray(productImages.value) || productImages.value.length === 0)
    return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % productImages.value.length;
}

// ✅ ADDED: Use body scroll lock for modals
useBodyScrollLock(isAnyModalOpen);

// Helper: format currency
const formatIDR = (v) => Number(v || 0).toLocaleString("id-ID");

// ✅ Reset qty saat pilihan size/variant berubah agar tidak melebihi stok baru
watch(
  [selectedSize, selectedVariant, stockCombinations],
  () => {
    // Jika stok baru < qty, sesuaikan
    validateQuantity();
  },
  { immediate: true }
);

// ✅ Restore: total price calculator (base + addons) × quantity
const calculateAddonOnlyPrice = () =>
  selectedAddons.value.reduce((sum, a) => sum + Number(a.price), 0);

const calculateTotalPrice = () => {
  const base = getCurrentPrice();
  const addons = calculateAddonOnlyPrice();
  return Math.max(0, (base + addons) * Number(quantity.value || 1));
};

// ✅ Restore: archived flag (used by banner)
const isArchived = computed(() => product.value?.status === "archived");

// ✅ Low stock helper (threshold 10 seperti UI)
function isLowStock() {
  const s = getCurrentStock();
  return s > 0 && s <= 10;
}

// ✅ Color class untuk stok saat ini (dipakai di template)
function getStockColorClass() {
  const s = getCurrentStock();
  if (s === 0) return "text-red-600";
  if (s <= 10) return "text-amber-700";
  return "text-gray-900";
}

// ✅ Helper: ambil slug dari route
function getProductSlug() {
  return route.params.slug;
}

// onMounted: pasang scroll listener & fetch initial product
onMounted(() => {
  window.addEventListener("scroll", handleScroll);

  // prefer route param, fallback ke method getProductSlug() jika kamu masih pakai
  const initialSlug =
    route.params.slug ??
    (typeof getProductSlug === "function" ? getProductSlug() : null);
  if (initialSlug) {
    doFetchProduct(String(initialSlug));
  }
});

// watch route.params.slug supaya ketika Vue Router reuse komponen dan params berubah kita refetch
watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      doFetchProduct(String(newSlug));
    }
  }
);

// bersihkan saat unmount: cancel request & remove event listener
onBeforeUnmount(() => {
  if (abortController) {
    try {
      abortController.abort();
    } catch (e) {}
    abortController = null;
  }
  window.removeEventListener("scroll", handleScroll);
});

// Cleanup scroll listener
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// ✅ Gunakan label opsi dari product.options agar tidak hardcode
const option1Label = computed(
  () => product.value?.options?.[0]?.option_name || "Opsi 1"
);
const option2Label = computed(
  () => product.value?.options?.[1]?.option_name || "Opsi 2"
);

// ✅ Min pembelian (dipakai di template)
const minPurchase = computed(() => Number(product.value?.min_purchase ?? 1));

// Helper stok & harga (tetap, sudah pakai ID)
// getCurrentStock(), getSizeStock(), getVariantStock(), getCurrentPrice() tetap bekerja,
// karena stockCombinations kini berasal dari payload.combinations dan variantId bisa 0 untuk produk 1 opsi.

// Navigasi ke detail produk lain
function viewProduct(slug) {
  if (!slug) return;
  router.push({ name: "Product Detail", params: { slug } });
}
</script>

<style scoped>
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

/* ✅ Strip horizontal scroll */
.thumb-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  padding-top: 4px;
  padding-left: 4px;
  -webkit-overflow-scrolling: touch; /* smooth on iOS */
  scroll-behavior: smooth;
}

/* Hide scrollbar (Chrome/Edge) */
.thumb-strip::-webkit-scrollbar {
  height: 0;
}

/* Hide scrollbar (Firefox) */
.thumb-strip {
  scrollbar-width: none;
}

/* Item gaya konsisten */
.thumb-item {
  flex: 0 0 auto;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e5e7eb; /* gray-200 */
  transition: all 0.2s ease;
}
.thumb-item:hover {
  transform: scale(1.05);
  border-color: #d1d5db; /* gray-300 */
}
.thumb-item.active {
  border-color: var(--color-primary, #ffa30e);
  box-shadow: 0 0 0 4px rgba(255, 163, 14, 0.15);
  transform: scale(1.05);
}
</style>
