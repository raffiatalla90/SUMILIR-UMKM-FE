<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Banner community -->
    <header
      class="relative w-full h-[120px] sm:h-[300px] md:h-[360px] bg-secondary overflow-hidden flex items-center"
    >
      <div
        class="relative z-10 flex flex-col justify-center pl-4 sm:pl-8 md:pl-12 lg:pl-36 pr-2 h-full w-full"
      >
        <h1
          class="font-bold text-white text-[24px] sm:text-[36px] lg:text-[72px] tracking-widest leading-none font-inter text-left"
        >
          KOMUNITAS
        </h1>
        <div class="flex items-center mt-2">
          <span
            class="block text-white text-[10px] sm:text-[18px] md:text-[28px] font-normal tracking-[0.3em] text-left min-h-6 sm:min-h-8 md:min-h-8 font-inter"
          >
            {{ animatedText }}
          </span>
          <span
            class="ml-2 inline-block w-0.5 mb-2 h-4 sm:h-6 md:h-7 bg-white rounded transition-none"
            :class="
              isTyping
                ? 'opacity-100'
                : caretVisible
                ? 'opacity-100'
                : 'opacity-0'
            "
            aria-hidden="true"
          />
        </div>
      </div>
      <img
        :src="bannerImg"
        alt="Banner Komunitas"
        class="absolute inset-0 w-full h-[100px] md:top-10 md:h-60 lg:h-80 object-cover"
      />
    </header>

    <!-- Main layout -->
    <div class="relative w-full">
      <!-- Mobile/tablet menubar -->
      <div
        class="lg:hidden bg-white border-b pt-4 border-gray-100 px-2 py-2 rounded-lg flex gap-2 items-center justify-between z-30"
        :class="
          isMenubarSticky
            ? 'fixed top-0 left-0 right-0 mx-4 max-w-[calc(100%-2rem)] rounded-full shadow-md'
            : 'relative'
        "
        ref="menubarRef"
      >
        <button
          @click="showCreatePost = true"
          class="flex items-center gap-1 rounded-full bg-secondary text-white px-3 py-2 text-xs font-semibold shadow transition hover:bg-secondary/90"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Buat Post</span>
        </button>
        <div
          class="flex-1 flex items-center bg-gray-50 rounded-full px-2 py-1 shadow border border-gray-200 mx-2"
        >
          <svg
            class="w-4 h-4 text-gray-400 mr-1"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari postingan..."
            v-model="searchQuery"
            class="flex-1 bg-transparent outline-none text-gray-700 text-xs"
          />
        </div>
        <div class="relative">
          <button
            @click="toggleSortPopup"
            class="rounded-full px-2 py-1 bg-secondary text-white border shadow transition text-xs flex items-center gap-1 font-semibold"
            aria-haspopup="true"
            :aria-expanded="String(showSortPopup)"
          >
            <span v-if="sortActive === 'views_count'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
                />
              </svg>
            </span>
            <span v-else-if="sortActive === 'created_at_desc'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="M11 4h10" />
                <path d="M11 8h7" />
                <path d="M11 12h4" />
              </svg>
            </span>
            <span v-else-if="sortActive === 'created_at_asc'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
                <path d="M11 12h10" />
                <path d="M11 16h7" />
                <path d="M11 20h4" />
              </svg>
            </span>
          </button>
          <!-- Sort popup (mobile) -->
          <div
            v-if="showSortPopup"
            class="absolute top-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-32 z-50"
          >
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              :class="
                sortActive === 'views_count'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : ''
              "
              @click="setSort('views_count')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
                />
              </svg>
              Populer
            </button>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              :class="
                sortActive === 'created_at_desc'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : ''
              "
              @click="setSort('created_at_desc')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="M11 4h10" />
                <path d="M11 8h7" />
                <path d="M11 12h4" />
              </svg>
              Terbaru
            </button>
            <button
              class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              :class="
                sortActive === 'created_at_asc'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : ''
              "
              @click="setSort('created_at_asc')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
                <path d="M11 12h10" />
                <path d="M11 16h7" />
                <path d="M11 20h4" />
              </svg>
              Terlama
            </button>
          </div>
        </div>
      </div>

      <!-- Content (centered) -->
      <main
        class="max-w-3xl mx-auto py-4 px-4"
        :class="isMenubarSticky ? 'mt-14' : ''"
      >
        <CreatePostModal
          v-if="showCreatePost"
          @close="showCreatePost = false"
          @created="fetchPosts"
        />

        <div v-if="loading" class="text-center py-8">Loading...</div>

        <div v-else class="space-y-6">
          <div
            v-if="filteredPosts.length === 0"
            class="text-center text-gray-500 py-8"
          >
            Belum ada post.
          </div>

          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="bg-white rounded-2xl shadow-md p-5"
          >
            <!-- header -->
            <div class="flex items-start gap-4 mb-4">
              <img
                :src="
                  post.author?.profile_picture ||
                  '/storage/profilepicdefault.png'
                "
                alt="avatar"
                class="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <router-link
                        :to="`/profile/${post.author?.id}`"
                        class="font-semibold hover:underline"
                      >
                        {{ post.author?.name }}
                      </router-link>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatDateTime(post.created_at) }}
                    </div>
                  </div>

                  <div class="text-gray-400">
                    <button
                      class="p-2 rounded hover:bg-gray-100"
                      aria-label="menu"
                    >
                      <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Title & content -->
            <div class="mb-3">
              <h2
                class="font-bold text-gray-900 text-[16px] sm:text-[18px] md:text-lg"
                v-html="highlightText(post.post_title)"
              ></h2>
            </div>
            <div
              class="mb-4 text-gray-800 whitespace-pre-line text-[12px] sm:text-[14px] md:text-base"
              v-html="highlightText(post.post_content)"
            ></div>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in extractHashtags(post.post_content)"
                :key="tag"
                class="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                >#{{ tag }}</span
              >
            </div>

            <!-- Gallery  -->
            <div class="w-full mb-3">
              <div v-if="post.images && post.images.length" class="w-full">
                <div v-if="post.images.length === 1">
                  <img
                    :src="imageUrl(post.images[0])"
                    alt=""
                    class="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover rounded-lg cursor-pointer"
                    loading="lazy"
                    @click="openLightbox(post.images, 0)"
                  />
                </div>

                <div
                  v-else-if="post.images.length === 2"
                  class="grid grid-cols-2 gap-2"
                >
                  <img
                    v-for="(img, i) in post.images.slice(0, 2)"
                    :key="i"
                    :src="imageUrl(img)"
                    class="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg cursor-pointer"
                    loading="lazy"
                    @click="openLightbox(post.images, i)"
                  />
                </div>

                <div v-else-if="post.images.length === 3">
                  <img
                    :src="imageUrl(post.images[0])"
                    alt="hero"
                    class="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover rounded-lg cursor-pointer mb-2"
                    loading="lazy"
                    @click="openLightbox(post.images, 0)"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <img
                      v-for="(img, i) in post.images.slice(1, 3)"
                      :key="i"
                      :src="imageUrl(img)"
                      class="w-full h-32 sm:h-40 md:h-44 object-cover rounded-md cursor-pointer"
                      loading="lazy"
                      @click="openLightbox(post.images, i + 1)"
                    />
                  </div>
                </div>

                <div v-else>
                  <img
                    :src="imageUrl(post.images[0])"
                    alt="hero"
                    class="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover rounded-lg cursor-pointer mb-2"
                    loading="lazy"
                    @click="openLightbox(post.images, 0)"
                  />
                  <div class="gap-2">
                    <div class="grid grid-cols-3 gap-2 md:hidden">
                      <div
                        v-for="(img, i) in post.images.slice(1, 4)"
                        :key="i"
                        class="relative"
                      >
                        <img
                          :src="imageUrl(img)"
                          class="w-full h-24 object-cover rounded-md cursor-pointer"
                          loading="lazy"
                          @click="openLightbox(post.images, i + 1)"
                        />
                        <div
                          v-if="i === 2 && post.images.length > 4"
                          class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-lg font-semibold cursor-pointer"
                          @click.stop="openLightbox(post.images, i + 1)"
                        >
                          <span>+{{ post.images.length - 4 }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="hidden md:grid md:grid-cols-3 gap-2">
                      <div
                        v-for="(img, i) in post.images.slice(1, 4)"
                        :key="i"
                        class="relative"
                      >
                        <img
                          :src="imageUrl(img)"
                          class="w-full h-40 md:h-44 lg:h-48 object-cover rounded-md cursor-pointer"
                          loading="lazy"
                          @click="openLightbox(post.images, i + 1)"
                        />
                        <div
                          v-if="i === 2 && post.images.length > 4"
                          class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-lg font-semibold cursor-pointer"
                          @click.stop="openLightbox(post.images, i + 1)"
                        >
                          <span>+{{ post.images.length - 4 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- actions -->
            <div class="mt-2 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-4">
                  <router-link
                    :to="`/community/${post.post_slug}`"
                    class="flex items-center gap-2 text-[10px] text-gray-600 hover:text-gray-800"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      />
                    </svg>
                    <span>{{ post.comments_count ?? 0 }} komentar</span>
                  </router-link>
                </div>

                <div class="text-[10px] text-gray-400">
                  {{ post.views_count ?? 0 }} views
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <!-- Desktop sidebar -->
      <aside
        class="hidden md:hidden lg:block w-[210px] xl:w-60 2xl:w-[360px] pt-6 z-30"
        :class="
          isSidebarSticky ? 'fixed top-20 right-4' : 'absolute right-4 top-2'
        "
        ref="sidebarRef"
      >
        <div
          class="bg-white rounded-xl shadow p-3 xl:p-4 2xl:p-6 flex flex-col gap-3 xl:gap-4 2xl:gap-6"
        >
          <!-- Buat Post Button -->
          <button
            @click="showCreatePost = true"
            class="flex items-center justify-center gap-2 rounded-full bg-secondary text-white hover:bg-secondary/90 px-3 xl:px-4 2xl:px-6 py-2 xl:py-2.5 2xl:py-3 font-semibold transition text-xs xl:text-sm 2xl:text-base w-full"
          >
            <svg
              class="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Buat Post
          </button>

          <!-- Search + Sort -->
          <div class="flex items-center gap-2">
            <!-- Search container -->
            <div
              class="flex-1 flex items-center bg-gray-50 rounded-full px-2 py-1.5 xl:py-2 shadow border border-gray-200"
            >
              <svg
                class="w-4 h-4 text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Cari postingan..."
                v-model="searchQuery"
                class="w-full bg-transparent outline-none text-gray-700 text-xs xl:text-sm 2xl:text-base px-0"
              />
            </div>

            <!-- Sort button:-->
            <div class="relative">
              <button
                @click="toggleSortPopup"
                class="flex items-center justify-center rounded-full bg-secondary text-white w-9 h-9 xl:w-10 xl:h-10 2xl:w-11 2xl:h-11 shadow transition text-sm xl:text-base"
                aria-haspopup="true"
                :aria-expanded="String(showSortPopup)"
              >
                <svg
                  class="w-4 h-4 xl:w-5 xl:h-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 18h6M3 6h18M3 12h12" />
                </svg>
              </button>

              <!-- Sort popup -->
              <div
                v-if="showSortPopup"
                class="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-28 xl:w-32 2xl:w-36 z-50"
              >
                <button
                  class="block w-full text-left px-3 xl:px-4 py-2 hover:bg-gray-100 text-xs xl:text-sm 2xl:text-base"
                  :class="
                    sortActive === 'views_count'
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : ''
                  "
                  @click="setSort('views_count')"
                >
                  Populer
                </button>
                <button
                  class="block w-full text-left px-3 xl:px-4 py-2 hover:bg-gray-100 text-xs xl:text-sm 2xl:text-base"
                  :class="
                    sortActive === 'created_at_desc'
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : ''
                  "
                  @click="setSort('created_at_desc')"
                >
                  Terbaru
                </button>
                <button
                  class="block w-full text-left px-3 xl:px-4 py-2 hover:bg-gray-100 text-xs xl:text-sm 2xl:text-base"
                  :class="
                    sortActive === 'created_at_asc'
                      ? 'bg-secondary/10 text-secondary font-bold'
                      : ''
                  "
                  @click="setSort('created_at_asc')"
                >
                  Terlama
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Lightbox -->
    <div
      v-if="lightbox.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div class="absolute inset-0" @click="closeLightbox"></div>

      <div class="relative z-10 w-full max-w-4xl px-4">
        <button
          class="absolute top-4 right-4 z-20 text-white bg-black/30 rounded-full p-2"
          @click="closeLightbox"
          aria-label="close"
        >
          ✕
        </button>

        <button
          v-if="lightbox.index > 0"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-2"
          @click.stop="prevImage"
          aria-label="previous"
        >
          ‹
        </button>

        <button
          v-if="lightbox.index < lightbox.images.length - 1"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-2"
          @click.stop="nextImage"
          aria-label="next"
        >
          ›
        </button>

        <div class="flex items-center justify-center">
          <img
            :src="imageUrl(lightbox.images[lightbox.index])"
            class="max-h-[80vh] object-contain rounded-md"
            @touchstart="onTouchStart"
            @touchend="onTouchEnd"
          />
        </div>

        <div class="text-center text-white text-sm mt-3">
          {{ lightbox.index + 1 }} / {{ lightbox.images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import CreatePostModal from "@/components/community/CreatePostModal.vue";
import api from "@/libs/axios";
import bannerImg from "@/assets/banner-community.png";

/* STATE */
const posts = ref([]);
const loading = ref(false);
const showCreatePost = ref(false);
const searchQuery = ref("");
const showSortPopup = ref(false);
const sortActive = ref("created_at_desc");

/* LIGHTBOX */
const lightbox = ref({ open: false, images: [], index: 0 });
let touchStartX = 0;
let touchEndX = 0;

/* STICKY */
const menubarRef = ref(null);
const isMenubarSticky = ref(false);
const sidebarRef = ref(null);
const isSidebarSticky = ref(false);
let sidebarInitialTop = 0;

/* TYPEWRITER */
const taglines = ["Saling Terhubung", "Saling Terbantu", "Peluang Untuk Semua"];
const animatedText = ref("");
let taglineIdx = 0;
let charIdx = 0;
let typingInterval = null;
let waitingTimeout = null;
const isTyping = ref(false);
const caretVisible = ref(true);
let caretInterval = null;

// ==================== COMPUTED ====================

const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return posts.value;
  const q = searchQuery.value.trim().toLowerCase();
  return posts.value.filter(
    (post) =>
      post.post_title?.toLowerCase().includes(q) ||
      post.post_content?.toLowerCase().includes(q)
  );
});

// ==================== LIGHTBOX ====================

function onTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}
function onTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const dx = touchStartX - touchEndX;
  const threshold = 40;
  if (dx > threshold) nextImage();
  else if (dx < -threshold) prevImage();
}

function openLightbox(imagesArray, startIndex = 0) {
  lightbox.value.images = Array.isArray(imagesArray) ? imagesArray : [];
  lightbox.value.index = Math.max(
    0,
    Math.min(startIndex, lightbox.value.images.length - 1)
  );
  lightbox.value.open = true;
  window.addEventListener("keydown", onKeydown);
}

function closeLightbox() {
  lightbox.value.open = false;
  window.removeEventListener("keydown", onKeydown);
}

function prevImage() {
  if (lightbox.value.index > 0) lightbox.value.index--;
}

function nextImage() {
  if (lightbox.value.index < lightbox.value.images.length - 1)
    lightbox.value.index++;
}

function onKeydown(e) {
  if (!lightbox.value.open) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prevImage();
  if (e.key === "ArrowRight") nextImage();
}

// ==================== HELPERS ====================

function formatDateTime(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return (
      dt.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " " +
      dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return d;
  }
}

function imageUrl(img) {
  if (!img) return "/placeholder.png";
  if (typeof img === "string") return img;
  return img.url || img.path || img.file_path || img.image_url || String(img);
}

function normalizeImages(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      return item.url || item.path || item.file_path || item.image_url || item;
    })
    .filter(Boolean);
}

function extractHashtags(text = "") {
  const tags = [];
  try {
    const re = /#([a-zA-Z0-9_]+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      tags.push(m[1]);
      if (tags.length >= 6) break;
    }
  } catch (e) {
    // silently fail
  }
  return tags;
}

// ==================== API ====================

async function fetchPosts() {
  loading.value = true;
  try {
    const res = await api.get("/api/community/posts");
    if (Array.isArray(res.data)) posts.value = res.data;
    else if (Array.isArray(res.data?.items)) posts.value = res.data.items;
    else if (Array.isArray(res.data?.data)) posts.value = res.data.data;
    else if (Array.isArray(res.data?.posts)) posts.value = res.data.posts;
    else posts.value = [];

    posts.value = posts.value.map((p) => ({
      ...p,
      user: p.user || {},
      author: p.author || {},
      images: normalizeImages(p.images || []),
      comments_count: p.comments_count ?? 0,
      views_count: p.views_count ?? p.views ?? 0,
    }));
  } catch (e) {
    console.error("[CommunityView] Failed to fetch posts:", e.message);
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

// ==================== SORT ====================

function toggleSortPopup() {
  showSortPopup.value = !showSortPopup.value;
}

function setSort(type) {
  sortActive.value = type;
  showSortPopup.value = false;
  sortBy(type);
}

function sortBy(type, order = "desc") {
  if (type === "views_count") {
    posts.value = [...posts.value].sort(
      (a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)
    );
  } else if (type === "created_at_desc") {
    posts.value = [...posts.value].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } else if (type === "created_at_asc") {
    posts.value = [...posts.value].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }
}

// ==================== SEARCH HIGHLIGHT ====================

function highlightText(text) {
  if (!searchQuery.value.trim()) return text;
  const q = searchQuery.value.trim();
  const re = new RegExp(`(${q})`, "gi");
  return text.replace(
    re,
    '<span class="bg-secondary/20 text-secondary font-bold px-1 rounded">' +
      "$1" +
      "</span>"
  );
}

// ==================== STICKY LOGIC ====================

function handleMenubarScroll() {
  if (!menubarRef.value) return;
  const bannerHeight =
    window.innerWidth < 640 ? 120 : window.innerWidth < 768 ? 300 : 360;
  isMenubarSticky.value = window.scrollY >= bannerHeight;
}

function handleSidebarScroll() {
  if (!sidebarRef.value) return;

  if (sidebarInitialTop === 0 && sidebarRef.value) {
    const rect = sidebarRef.value.getBoundingClientRect();
    sidebarInitialTop = rect.top + window.scrollY;
  }

  const currentScroll = window.scrollY;
  const navbarHeight = 80;
  isSidebarSticky.value = currentScroll >= sidebarInitialTop - navbarHeight;
}

function handleScroll() {
  handleMenubarScroll();
  handleSidebarScroll();
}

// ==================== TYPEWRITER ====================

function startCaretBlink(intervalMs = 500) {
  if (caretInterval) clearInterval(caretInterval);
  caretInterval = setInterval(() => {
    caretVisible.value = !caretVisible.value;
  }, intervalMs);
}

function stopCaretBlink() {
  if (caretInterval) {
    clearInterval(caretInterval);
    caretInterval = null;
  }
  caretVisible.value = true;
}

function clearTimers() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  if (waitingTimeout) {
    clearTimeout(waitingTimeout);
    waitingTimeout = null;
  }
  stopCaretBlink();
}

function typeTagline() {
  isTyping.value = true;
  stopCaretBlink();
  animatedText.value = "";
  charIdx = 0;

  typingInterval = setInterval(() => {
    if (charIdx < taglines[taglineIdx].length) {
      animatedText.value += taglines[taglineIdx][charIdx];
      charIdx++;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      isTyping.value = false;
      waitingTimeout = setTimeout(() => {
        startCaretBlink(500);
        waitingTimeout = setTimeout(() => eraseTagline(), 3000);
      }, 300);
    }
  }, 60);
}

function eraseTagline() {
  stopCaretBlink();
  typingInterval = setInterval(() => {
    if (animatedText.value.length > 0) {
      animatedText.value = animatedText.value.slice(0, -1);
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      taglineIdx = (taglineIdx + 1) % taglines.length;
      waitingTimeout = setTimeout(() => typeTagline(), 300);
    }
  }, 30);
}

function startTypingCycle() {
  clearTimers();
  typeTagline();
}

// ==================== EVENT HANDLERS ====================

function onDocumentClick(e) {
  if (!showSortPopup.value) return;
  const btn = e.target.closest('[aria-haspopup="true"]');
  if (!btn) showSortPopup.value = false;
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await nextTick();
  fetchPosts();
  startTypingCycle();

  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", onDocumentClick);

  nextTick(() => {
    if (sidebarRef.value) {
      const rect = sidebarRef.value.getBoundingClientRect();
      sidebarInitialTop = rect.top + window.scrollY;
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", onDocumentClick);
  clearTimers();
});
</script>
