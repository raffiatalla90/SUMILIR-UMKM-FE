<template>
  <div class="border rounded p-3 bg-gray-50">
    <div class="flex items-center gap-2 mb-1">
      <div class="font-semibold">{{ comment.author.name }}</div>
      <div class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</div>
    </div>
    <div class="mb-2">{{ comment.comment_content }}</div>
    <div class="flex gap-2 mb-2">
      <button @click="showReply = !showReply" class="text-blue-600 text-xs hover:underline">Balas</button>
      <button v-if="canDelete" @click="deleteComment" class="text-red-500 text-xs hover:underline">Hapus</button>
    </div>
    <div v-if="showReply" class="ml-4">
      <CommentForm :postId="postId" :parentCommentId="comment.id" @added="onReplyAdded" />
    </div>
    <div v-if="comment.replies && comment.replies.length" class="ml-6 mt-2">
      <CommentThread :comments="comment.replies" :postId="postId" @refresh="$emit('refresh')" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentForm from './CommentForm.vue'
import CommentThread from './CommentThread.vue'
import api from '@/libs/axios'

const props = defineProps({
  comment: Object,
  postId: Number,
})
const emit = defineEmits(['refresh'])

const showReply = ref(false)
const canDelete = ref(true)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function deleteComment() {
  if (!confirm('Hapus komentar ini?')) return
  console.log('[CommentItem] Hapus komentar:', props.comment.id)
  try {
    await api.delete(`/community/posts/${props.postId}/comments/${props.comment.id}`)
    console.log('[CommentItem] Komentar dihapus:', props.comment.id)
    emit('refresh')
  } catch (e) {
    console.error('[CommentItem] Gagal hapus komentar:', e)
    alert(e.message)
  }
}

function onReplyAdded() {
  showReply.value = false
  emit('refresh')
}
</script>