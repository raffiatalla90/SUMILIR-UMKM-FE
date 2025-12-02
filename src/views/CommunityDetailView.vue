<template>
  <div class="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-6 md:px-8">
    <!-- back button -->
    <router-link
      to="/community"
      class="absolute left-8 top-8 z-20 flex items-center gap-2 bg-white/80 hover:bg-white px-3 py-2 rounded-full shadow transition"
    >
      <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      <span class="font-semibold text-primary text-sm"></span>
    </router-link>

    <div v-if="loading" class="text-center py-8">Loading...</div>

    <div v-else-if="post">
      <!-- Post card -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-5 md:p-6 mb-5 sm:mb-6">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
          <!-- avatar -->
          <img
            :src="post.author?.profile_picture || '/storage/profilepicdefault.png'"
            alt="avatar"
            class="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full object-cover shrink-0"
            loading="lazy"
          />

          <div class="flex-1">
            <!-- author + date -->
            <div class="flex flex-col gap-0.5">
              <div class="text-[10px] sm:text-xs text-gray-500">
                oleh
                <span class="font-medium text-gray-800 ml-1">
                  {{ post.author?.name }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDateTime(post.created_at) }}
              </div>
            </div>

            <!-- title -->
            <h1
              class="mt-2 sm:mt-3 font-semibold text-base sm:text-xl md:text-2xl leading-snug text-gray-900"
            >
              {{ post.post_title }}
            </h1>

            <!-- content -->
            <div
              class="mt-2 sm:mt-3 text-[11px] sm:text-sm md:text-base text-gray-800 whitespace-pre-line"
            >
              {{ post.post_content }}
            </div>
          </div>
        </div>

        <!-- gallery -->
        <div class="mt-4 sm:mt-5">
          <div v-if="post.images && post.images.length">
            <!-- single image -->
            <div v-if="post.images.length === 1">
              <img
                :src="imageUrl(post.images[0])"
                class="w-full h-40 sm:h-52 md:h-72 lg:h-96 object-cover rounded-lg cursor-pointer"
                @click="openLightbox(post.images, 0)"
              />
            </div>

            <!-- two images -->
            <div
              v-else-if="post.images.length === 2"
              class="grid grid-cols-2 gap-2"
            >
              <img
                v-for="(img,i) in post.images.slice(0,2)"
                :key="i"
                :src="imageUrl(img)"
                class="w-full h-32 sm:h-40 md:h-56 object-cover rounded-lg cursor-pointer"
                @click="openLightbox(post.images, i)"
              />
            </div>

            <!-- 3+ images: hero + thumbnails -->
            <div v-else>
              <img
                :src="imageUrl(post.images[0])"
                class="w-full h-40 sm:h-52 md:h-72 lg:h-96 object-cover rounded-lg mb-2 cursor-pointer"
                @click="openLightbox(post.images, 0)"
              />

              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(img,i) in post.images.slice(1,4)"
                  :key="i"
                  class="relative"
                >
                  <img
                    :src="imageUrl(img)"
                    class="w-full h-18 sm:h-24 md:h-32 object-cover rounded-md cursor-pointer"
                    @click="openLightbox(post.images, i+1)"
                  />
                  <div
                    v-if="i === 2 && post.images.length > 4"
                    class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-semibold cursor-pointer"
                    @click.stop="openLightbox(post.images, i+1)"
                  >
                    +{{ post.images.length - 4 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comment section -->
      <section class="bg-white rounded-lg shadow p-3 mb-15 sm:p-5 md:p-6">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <h2 class="text-sm sm:text-base font-semibold">
            Komentar ({{ totalCommentsCount }})
          </h2>
          
          <!-- Sort komentar -->
          <div class="relative">
            <button
              @click="toggleCommentSort"
              class="flex items-center justify-center rounded-full bg-primary text-white w-9 h-9 sm:w-10 sm:h-10 shadow transition hover:bg-primary/90"
              aria-haspopup="true"
              :aria-expanded="String(showCommentSort)"
            >
              <span v-if="commentSort === 'newest'">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/>
                </svg>
              </span>
              <span v-else>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h10"/><path d="M11 16h7"/><path d="M11 20h4"/>
                </svg>
              </span>
            </button
            
            <!-- Sort dropdown -->
            <div v-if="showCommentSort" class="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-28 sm:w-32 z-50">
              <button
                class="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-xs sm:text-sm transition"
                :class="commentSort === 'newest' ? 'bg-primary/10 text-primary font-bold' : ''"
                @click="setCommentSort('newest')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/>
                </svg>
                Terbaru
              </button>
              <button
                class="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-xs sm:text-sm transition"
                :class="commentSort === 'oldest' ? 'bg-primary/10 text-primary font-bold' : ''"
                @click="setCommentSort('oldest')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h10"/><path d="M11 16h7"/><path d="M11 20h4"/>
                </svg>
                Terlama
              </button>
            </div>
          </div>
        </div>

        <!-- comment input -->
        <div class="mb-3 sm:mb-4">
          <CommentForm
            :postId="post.id"
            :parentId="replyState.parentId"
            :parentLabel="replyState.parentLabel"
            @added="onCommentAdded"
            @clearReply="clearReply"
          />
        </div>

        <!-- thread -->
        <div class="mt-2 sm:mt-3 space-y-3 sm:space-y-4">
          <CommentThread
            :comments="sortedComments"
            :postId="post.id"
            @replyRequest="onReplyRequest"
            @replyAdded="fetchComments"
          />
        </div>

        <!-- show more -->
        <div v-if="hasMore" class="text-center mt-3 sm:mt-4">
          <button
            @click="loadMore"
            class="text-primary text-xs sm:text-sm font-medium hover:underline"
          >
            Show more ↓
          </button>
        </div>
      </section>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      Post tidak ditemukan.
    </div>

    <!-- Lightbox -->
    <div
      v-if="lightbox.open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4"
    >
      <div class="absolute inset-0" @click="closeLightbox"></div>

      <div class="relative z-10 w-full max-w-4xl">
        <button
          class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 text-white bg-black/30 rounded-full p-1.5 sm:p-2 text-xs sm:text-sm"
          @click="closeLightbox"
          aria-label="close"
        >
          ✕
        </button>

        <button
          v-if="lightbox.index > 0"
          class="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-1.5 sm:p-2 text-xs sm:text-sm"
          @click.stop="prevImage"
          aria-label="previous"
        >
          ‹
        </button>

        <button
          v-if="lightbox.index < lightbox.images.length - 1"
          class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-1.5 sm:p-2 text-xs sm:text-sm"
          @click.stop="nextImage"
          aria-label="next"
        >
          ›
        </button>

        <div class="flex items-center justify-center">
          <img
            :src="imageUrl(lightbox.images[lightbox.index])"
            class="max-h-[65vh] sm:max-h-[75vh] object-contain rounded-md"
            @touchstart="onTouchStart"
            @touchend="onTouchEnd"
          />
        </div>

        <div class="text-center text-[10px] sm:text-xs text-white mt-3">
          {{ lightbox.index + 1 }} / {{ lightbox.images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/libs/axios'
import CommentForm from '@/components/community/CommentForm.vue'
import CommentThread from '@/components/community/CommentThread.vue'

const route = useRoute()
const post = ref(null)
const comments = ref([])
const loading = ref(false)
const page = ref(1)
const perPage = 10
const hasMore = ref(false)

// Comment sort
const showCommentSort = ref(false)
const commentSort = ref('newest')
const commentSortLabel = computed(() => commentSort.value === 'newest' ? 'Terbaru' : 'Terlama')

// Lightbox
const lightbox = ref({ open: false, images: [], index: 0 })

// Reply state
const replyState = ref({ parentId: null, parentLabel: '' })

// Total comments count
let postsCommentCount = ref(0)

const totalCommentsCount = computed(() => postsCommentCount.value)

const sortedComments = computed(() => {
  const sorted = [...comments.value]
  if (commentSort.value === 'newest') {
    return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else {
    return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }
})

// ==================== COMMENT SORT ====================

function toggleCommentSort() {
  showCommentSort.value = !showCommentSort.value
}

function setCommentSort(type) {
  commentSort.value = type
  showCommentSort.value = false
  localStorage.setItem('commentSort', type)
}

function sortComments() {
  if (commentSort.value === 'newest') {
    comments.value = [...comments.value].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
  } else {
    comments.value = [...comments.value].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    )
  }
}

// ==================== LIGHTBOX ====================

let touchStartX = 0
let touchEndX = 0

function onTouchStart(e) { touchStartX = e.changedTouches[0].screenX }
function onTouchEnd(e) { 
  touchEndX = e.changedTouches[0].screenX
  handleSwipe() 
}

function handleSwipe() {
  const dx = touchStartX - touchEndX
  const threshold = 40
  if (dx > threshold) nextImage()
  else if (dx < -threshold) prevImage()
}

function openLightbox(images, idx = 0) {
  lightbox.value.images = images || []
  lightbox.value.index = idx
  lightbox.value.open = true
  window.addEventListener('keydown', onKey)
}

function closeLightbox() {
  lightbox.value.open = false
  window.removeEventListener('keydown', onKey)
}

function prevImage() {
  if (lightbox.value.index > 0) lightbox.value.index--
}

function nextImage() {
  if (lightbox.value.index < lightbox.value.images.length - 1) lightbox.value.index++
}

function onKey(e) {
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

// ==================== HELPERS ====================

function formatDateTime(d) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' + dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch { return d }
}

function imageUrl(img) {
  if (!img) return '/placeholder.png'
  if (typeof img === 'string') return img
  return img.url || img.path || img.file_path || img.image_url || String(img)
}

function normalizeImages(arr) {
  if (!Array.isArray(arr)) return []
  return arr
    .map(item => {
      if (!item) return null
      if (typeof item === 'string') return item
      return item.url || item.path || item.file_path || item.image_url || item
    })
    .filter(Boolean)
}

// ==================== API ====================

async function fetchPost() {
  loading.value = true
  try {
    const res = await api.get(`/community/posts/${route.params.slug}`)
    post.value = res.data?.data || res.data?.post || res.data
    post.value.images = normalizeImages(
      post.value.images || post.value.post_images || []
    )
  } catch (e) {
    console.error('[CommunityDetailView] Failed to fetch post:', e.message)
    post.value = null
  } finally {
    loading.value = false
  }
}

async function fetchComments(reset = true) {
  if (!post.value?.id) return
  if (reset) page.value = 1
  try {
    const res = await api.get(
      `/community/posts/${post.value.id}/comments`,
      { params: { page: page.value, per_page: perPage } }
    )
    const payload = res.data?.comments || []
    if (reset) comments.value = normalizeComments(payload)
    else comments.value = comments.value.concat(normalizeComments(payload))
    hasMore.value = Array.isArray(payload) && payload.length >= perPage

    postsCommentCount.value = res.data?.post?.comments_count || 0
    
    sortComments()
  } catch (e) {
    console.error('[CommunityDetailView] Failed to fetch comments:', e.message)
  }
}

// ==================== NORMALIZATION ====================

function normalizeComments(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(c => ({
    id: c.id,
    content: c.comment_content,
    created_at: c.created_at,
    user: c.author || { id: c.author_id, name: c.author_name },
    replies: Array.isArray(c.replies) ? normalizeComments(c.replies) : [],
    replying_to: c.replying_to ? {
      user_id: c.replying_to.user_id,
      username: c.replying_to.username
    } : null
  }))
}

// ==================== COMMENT HANDLERS ====================

function onCommentAdded() {
  fetchComments(true)
}

function loadMore() {
  page.value += 1
  fetchComments(false)
}

function onReplyRequest({ parentId, parentLabel }) {
  replyState.value = { parentId, parentLabel }
}

function clearReply() {
  replyState.value = { parentId: null, parentLabel: '' }
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  const savedSort = localStorage.getItem('commentSort')
  if (savedSort) commentSort.value = savedSort
  
  await fetchPost()
  await fetchComments(true)
  
  document.addEventListener('click', (e) => {
    if (showCommentSort.value && !e.target.closest('[aria-haspopup="true"]')) {
      showCommentSort.value = false
    }
  })
})
</script>
