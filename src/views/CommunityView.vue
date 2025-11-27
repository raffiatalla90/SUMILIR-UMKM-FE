<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Komunitas</h1>
      <button @click="showCreatePost = true" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Buat Post
      </button>
    </div>

    <CreatePostModal v-if="showCreatePost" @close="showCreatePost = false" @created="fetchPosts" />

    <div v-if="loading" class="text-center py-8">Loading...</div>

    <div v-else class="space-y-6">
      <div v-if="posts.length === 0" class="text-center text-gray-500 py-8">Belum ada post.</div>

      <article
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-2xl shadow-md p-5"
      >
        <!-- header -->
        <div class="flex items-start gap-4 mb-4">
          <img
            :src="post.author?.profile_picture"
            alt="avatar"
            class="w-12 h-12 rounded-full object-cover"
            loading="lazy"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <router-link :to="`/profile/${post.author?.id}`" class="font-semibold hover:underline">
                    {{ post.author?.name }}
                  </router-link>
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(post.created_at) }}</div>
              </div>

              <div class="text-gray-400">
                <button class="p-2 rounded hover:bg-gray-100" aria-label="menu"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Title & content -->
        <div class="mb-3">
          <h2 class="text-lg font-bold text-gray-900">{{ post.post_title }}</h2>
        </div>

        <div class="mb-4 text-gray-800 whitespace-pre-line">
          {{ post.post_content }}
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in extractHashtags(post.post_content)" :key="tag" class="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">#{{ tag }}</span>
        </div>

        <!-- Gallery -->
        <div class="w-full mb-3">
          <div v-if="post.images && post.images.length" class="w-full">
            <!-- 1 image -->
            <div v-if="post.images.length === 1">
              <img
                :src="imageUrl(post.images[0])"
                alt=""
                class="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover rounded-lg cursor-pointer"
                loading="lazy"
                @click="openLightbox(post.images, 0)"
              />
            </div>

            <!-- 2 images -->
            <div v-else-if="post.images.length === 2" class="grid grid-cols-2 gap-2">
              <img
                v-for="(img,i) in post.images.slice(0,2)"
                :key="i"
                :src="imageUrl(img)"
                class="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg cursor-pointer"
                loading="lazy"
                @click="openLightbox(post.images, i)"
              />
            </div>

            <!-- 3 or more images -->
            <div v-else>
              <img
                :src="imageUrl(post.images[0])"
                alt="hero"
                class="w-full h-48 sm:h-56 md:h-72 lg:h-80 object-cover rounded-lg cursor-pointer mb-2"
                loading="lazy"
                @click="openLightbox(post.images, 0)"
              />

              <!-- thumbnails -->
                <div class="gap-2">
                  <!-- mobile grid -->
                  <div class="grid grid-cols-3 gap-2 md:hidden">
                    <div v-for="(img,i) in post.images.slice(1,4)" :key="i" class="relative">
                      <img
                        :src="imageUrl(img)"
                        class="w-full h-24 object-cover rounded-md cursor-pointer"
                        loading="lazy"
                        @click="openLightbox(post.images, i+1)"
                      />
                      <div v-if="i === 2 && post.images.length > 4"
                        class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-lg font-semibold cursor-pointer"
                        @click.stop="openLightbox(post.images, i+1)">
                        <span>+{{ post.images.length - 4 }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- tablet/desktop: grid -->
                  <div class="hidden md:grid md:grid-cols-3 gap-2">
                    <div v-for="(img,i) in post.images.slice(1,4)" :key="i" class="relative">
                      <img
                        :src="imageUrl(img)"
                        class="w-full h-40 md:h-44 lg:h-48 object-cover rounded-md cursor-pointer"
                        loading="lazy"
                        @click="openLightbox(post.images, i+1)"
                      />
                      <div v-if="i === 2 && post.images.length > 4"
                        class="absolute inset-0 bg-black/45 rounded-md flex items-center justify-center text-white text-lg font-semibold cursor-pointer"
                        @click.stop="openLightbox(post.images, i+1)">
                        <span>+{{ post.images.length - 4 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

            </div>
          </div>

          <!-- no images -->
          <div v-else class="w-full h-40 sm:h-48 md:h-56 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
            Tidak ada gambar
          </div>
        </div>

        <!-- actions -->
        <div class="mt-2 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-4">
              <router-link :to="`/community/${post.post_slug}`" class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{{ post.comments_count ?? 0 }} komentar</span>
              </router-link>
            </div>

            <div class="text-sm text-gray-400">{{ post.views_count ?? 0 }} views</div>
          </div>
        </div>
      </article>
    </div>
  </div>

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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import CreatePostModal from '@/components/community/CreatePostModal.vue'
import api from '@/libs/axios'

const posts = ref([])
const loading = ref(false)
const showCreatePost = ref(false)

const lightbox = ref({ open: false, images: [], index: 0 })

let touchStartX = 0
let touchEndX = 0
function onTouchStart(e) { touchStartX = e.changedTouches[0].screenX }
function onTouchEnd(e) { touchEndX = e.changedTouches[0].screenX; handleSwipe() }
function handleSwipe() {
  const dx = touchStartX - touchEndX
  const threshold = 40
  if (dx > threshold) nextImage()
  else if (dx < -threshold) prevImage()
}

function openLightbox(imagesArray, startIndex = 0) {
  lightbox.value.images = Array.isArray(imagesArray) ? imagesArray : []
  lightbox.value.index = Math.max(0, Math.min(startIndex, lightbox.value.images.length - 1))
  lightbox.value.open = true
  window.addEventListener('keydown', onKeydown)
}
function closeLightbox() {
  lightbox.value.open = false
  window.removeEventListener('keydown', onKeydown)
}
function prevImage() { if (lightbox.value.index > 0) lightbox.value.index-- }
function nextImage() { if (lightbox.value.index < lightbox.value.images.length - 1) lightbox.value.index++ }
function onKeydown(e) {
  if (!lightbox.value.open) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return dateStr }
}
function imageUrl(img) {
  if (!img) return '/placeholder.png'
  if (typeof img === 'string') return img
  return img.url || img.path || img.file_path || img.image_url || String(img)
}
function extractHashtags(text = '') {
  const tags = []; try { const re = /#([a-zA-Z0-9_]+)/g; let m; while ((m = re.exec(text)) !== null) { tags.push(m[1]); if (tags.length >= 6) break } } catch (e) {}
  return tags
}

async function fetchPosts() {
  loading.value = true
  try {
    const res = await api.get('/community/posts')
    if (Array.isArray(res.data)) posts.value = res.data
    else if (Array.isArray(res.data.items)) posts.value = res.data.items
    else if (Array.isArray(res.data.data)) posts.value = res.data.data
    else if (res.data && Array.isArray(res.data.posts)) posts.value = res.data.posts
    else posts.value = res.data ? (res.data.data || res.data.items || []) : []

    posts.value = posts.value.map(p => ({
      ...p,
      user: p.user || {},
      author: p.author || {},
      images: normalizeImages(p.images || []),
      comments_count: p.comments_count ?? p.comments_count ?? 0, 
      views_count: p.views_count ?? (p.views ?? 0)
    }))
  } catch (e) {
    console.error('[CommunityView] Gagal fetch posts:', e)
    posts.value = []
  } finally {
    loading.value = false
  }
}

function normalizeImages(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(item => { if (!item) return null; if (typeof item === 'string') return item; return item.url || item.path || item.file_path || item.image_url || item }).filter(Boolean)
}

onMounted(fetchPosts)
</script>

