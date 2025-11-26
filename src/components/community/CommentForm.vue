<template>
  <form @submit.prevent="submit" class="mb-4 flex gap-2">
    <input v-model="content" required placeholder="Tulis komentar..." class="flex-1 border rounded px-3 py-2" />
    <button type="submit" :disabled="loading" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      {{ loading ? 'Mengirim...' : 'Kirim' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/libs/axios'
const props = defineProps({
  postId: Number,
  parentCommentId: Number, // opsional, untuk reply
})
const emit = defineEmits(['added'])

const content = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    let url = `/community/posts/${props.postId}/comments`
    let body = { comment_content: content.value }
    if (props.parentCommentId) {
      url += `/${props.parentCommentId}`
    }
    console.log('[CommentForm] Kirim komentar:', body)
    const res = await api.post(url, body)
    console.log('[CommentForm] Response:', res)
    content.value = ''
    emit('added')
  } catch (e) {
    console.error('[CommentForm] Gagal kirim komentar:', e)
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>