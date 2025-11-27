<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <div v-if="loading" class="text-center py-8">Loading...</div>

    <div v-else-if="post">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex gap-4 items-start">
          <img :src="post.author?.profile_picture || '/default-avatar.png'" class="w-14 h-14 rounded-full object-cover" />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500">oleh <span class="font-medium text-gray-800">{{ post.author?.name }}</span></div>
                <div class="text-xs text-gray-400 mt-1">{{ formatDate(post.created_at) }}</div>
              </div>
            </div>

            <h1 class="mt-3 text-2xl font-bold">{{ post.post_title }}</h1>
            <div class="mt-3 text-gray-800 whitespace-pre-line">{{ post.post_content }}</div>
          </div>
        </div>

        <!-- gallery (below content) -->
        <div class="mt-5">
          <div v-if="post.images && post.images.length">
            <div v-if="post.images.length === 1">
              <img :src="imageUrl(post.images[0])" class="w-full h-72 md:h-96 object-cover rounded-lg" @click="openLightbox(post.images, 0)" />
            </div>
            <div v-else-if="post.images.length === 2" class="grid grid-cols-2 gap-2">
              <img v-for="(img,i) in post.images.slice(0,2)" :key="i" :src="imageUrl(img)" class="w-full h-56 md:h-72 object-cover rounded-lg" @click="openLightbox(post.images, i)" />
            </div>
            <div v-else>
              <img :src="imageUrl(post.images[0])" class="w-full h-72 md:h-96 object-cover rounded-lg mb-2" @click="openLightbox(post.images, 0)" />
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(img,i) in post.images.slice(1,4)" :key="i" class="relative">
                  <img :src="imageUrl(img)" class="w-full h-36 md:h-44 object-cover rounded-md cursor-pointer" @click="openLightbox(post.images, i+1)" />
                  <div v-if="i === 2 && post.images.length > 4" class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-lg font-semibold"
                       @click.stop="openLightbox(post.images, i+1)">
                    +{{ post.images.length - 4 }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            Tidak ada gambar
          </div>
        </div>
      </div>

      <!-- Comment section -->
      <section class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Komentar</h2>

        <!-- comment input -->
        <CommentForm :postId="post.id" @added="onCommentAdded" />

        <!-- thread -->
        <div class="mt-6">
          <CommentThread :comments="comments" @replyAdded="fetchComments" />
        </div>

        <!-- show more -->
        <div v-if="hasMore" class="text-center mt-4">
          <button @click="loadMore" class="text-orange-500 text-sm font-medium">Show more ↓</button>
        </div>
      </section>
    </div>

    <div v-else class="text-center py-8 text-gray-500">Post tidak ditemukan.</div>


    <!-- Lightbox -->
    <div v-if="lightbox.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div class="absolute inset-0" @click="closeLightbox"></div>

      <div class="relative z-10 w-full max-w-4xl px-4">
        <button class="absolute top-4 right-4 z-20 text-white bg-black/30 rounded-full p-2" @click="closeLightbox" aria-label="close">✕</button>

        <button v-if="lightbox.index > 0"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-2"
          @click.stop="prevImage" aria-label="previous">‹</button>

        <button v-if="lightbox.index < lightbox.images.length - 1"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 rounded-full p-2"
          @click.stop="nextImage" aria-label="next">›</button>

        <div class="flex items-center justify-center">
          <img :src="imageUrl(lightbox.images[lightbox.index])" class="max-h-[80vh] object-contain rounded-md" @touchstart="onTouchStart" @touchend="onTouchEnd" />
        </div>

        <div class="text-center text-white text-sm mt-3">
          {{ lightbox.index + 1 }} / {{ lightbox.images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

// lightbox
const lightbox = ref({ open: false, images: [], index: 0 })
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

function formatDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
}
function imageUrl(img) {
  if (!img) return '/placeholder.png'
  if (typeof img === 'string') return img
  return img.url || img.path || img.file_path || img.image_url || String(img)
}
function normalizeImages(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(item => {
    if (!item) return null
    if (typeof item === 'string') return item
    return item.url || item.path || item.file_path || item.image_url || item
  }).filter(Boolean)
}

async function fetchPost() {
  loading.value = true
  try {
    const res = await api.get(`/community/posts/${route.params.slug}`)
    post.value = res.data?.data || res.data?.post || res.data
    post.value.images = normalizeImages(post.value.images || post.value.post_images || [])
  } catch (e) {
    console.error(e)
    post.value = null
  } finally {
    loading.value = false
  }
}

async function fetchComments(reset = true) {
  if (!post.value?.id) return 
  if (reset) page.value = 1
  try {
    const res = await api.get(`/community/posts/${post.value.id}/comments`, { params: { page: page.value, per_page: perPage } })
    const payload = res.data?.comments || []
    if (reset) comments.value = normalizeComments(payload)
    else comments.value = comments.value.concat(normalizeComments(payload))
    hasMore.value = (Array.isArray(payload) && payload.length >= perPage)
  } catch (e) {
    console.error(e)
  }
}

function normalizeComments(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(c => ({
    id: c.id,
    content: c.comment_content, 
    created_at: c.created_at,
    user: c.author || { id: c.author_id, name: c.author_name }, 
    replies: Array.isArray(c.replies) ? normalizeComments(c.replies) : []
  }))
}

function onCommentAdded() {
  fetchComments(true)
}

function loadMore() {
  page.value += 1
  fetchComments(false)
}

onMounted(async () => {
  await fetchPost()
  await fetchComments(true)
})
</script>

<style scoped>
/* small adjustments */
</style>
