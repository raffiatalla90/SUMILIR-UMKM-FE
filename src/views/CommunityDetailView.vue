<template>
  <div class="max-w-2xl mx-auto py-8">
    <div v-if="loading" class="text-center py-8">Loading...</div>
    <div v-else-if="post">
      <div class="bg-white rounded shadow p-6 mb-6">
        <div class="flex gap-4">
          <img v-if="post.thumbnail_url" :src="post.thumbnail_url" class="w-32 h-32 object-cover rounded" />
          <div>
            <h1 class="text-2xl font-bold mb-2">{{ post.post_title }}</h1>
            <div class="text-gray-600 text-sm mb-2">
              oleh <span class="font-medium">{{ post.author.name }}</span> • {{ formatDate(post.created_at) }}
            </div>
            <div class="mb-2">{{ post.post_content }}</div>
          </div>
        </div>
      </div>

      <!-- Komentar -->
      <div class="mb-4">
        <h2 class="text-lg font-bold mb-2">Komentar</h2>
        <CommentForm :postId="post.id" @added="fetchComments" />
        <CommentThread :comments="comments" :postId="post.id" @refresh="fetchComments" />
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">Post tidak ditemukan.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CommentForm from '@/components/community/CommentForm.vue'
import CommentThread from '@/components/community/CommentThread.vue'
import api from '@/libs/axios'

const route = useRoute()
const post = ref(null)
const comments = ref([])
const loading = ref(false)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchPost() {
  loading.value = true
  console.log('[CommunityDetailView] Mulai fetch post:', route.params.slug)
  try {
    const res = await api.get(`/community/posts/${route.params.slug}`)
    post.value = res.data
    console.log('[CommunityDetailView] Data post:', post.value)
  } catch (e) {
    console.error('[CommunityDetailView] Gagal fetch post:', e)
    post.value = null
  } finally {
    loading.value = false
    console.log('[CommunityDetailView] Selesai fetch post')
  }
}

async function fetchComments() {
  if (!post.value) return
  console.log('[CommunityDetailView] Mulai fetch comments untuk post:', post.value.id)
  try {
    const res = await api.get(`/community/posts/${post.value.id}/comments`)
    comments.value = res.data.comments || res.data.data || []
    console.log('[CommunityDetailView] Data comments:', comments.value)
  } catch (e) {
    console.error('[CommunityDetailView] Gagal fetch comments:', e)
    comments.value = []
  }
}

onMounted(async () => {
  await fetchPost()
  await fetchComments()
})

watch(() => route.params.slug, async () => {
  await fetchPost()
  await fetchComments()
})
</script>