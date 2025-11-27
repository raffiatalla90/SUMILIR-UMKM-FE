<template>
  <div class="flex gap-3">
    <img :src="comment.user?.profile_picture" class="w-10 h-10 rounded-full object-cover mt-1" />

    <div class="flex-1">
      <div class="bg-gray-50 rounded-xl p-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <div class="font-medium text-gray-800">{{ comment.user?.name || 'User' }}</div>
              <div class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</div>
            </div>
            <div class="mt-2 text-gray-800 whitespace-pre-line">{{ comment.content }}</div>
          </div>

          <!-- small actions -->
          <div class="text-sm text-gray-400">
            <button @click="toggleReply" class="text-sm px-2 py-1 rounded hover:bg-gray-100">Balas</button>
          </div>
        </div>
      </div>

      <!-- nested replies -->
      <div v-if="comment.replies && comment.replies.length" class="mt-3 ml-4 space-y-3">
        <CommentItem v-for="r in visibleReplies" :key="r.id" :comment="r" @replyAdded="onReplyAdded" />
        <div v-if="comment.replies.length > visibleReplies.length" class="mt-1 ml-2">
          <button @click="showAllReplies = true" class="text-xs text-orange-500">Show more replies</button>
        </div>
      </div>

      <!-- reply form -->
      <div v-if="showReply" class="mt-3 ml-4">
        <CommentForm :postId="postId" :parentId="comment.id" parentLabel="Reply" @added="onReplySubmit" @cancel="toggleReply" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
const props = defineProps({
  comment: { type: Object, required: true },
  postId: { type: [String, Number], default: null } 
})
const emit = defineEmits(['replyAdded'])

const showReply = ref(false)
const showAllReplies = ref(false)
const visibleReplies = computed(() => showAllReplies.value ? (props.comment.replies || []) : (props.comment.replies || []).slice(0, 2))

function toggleReply() { showReply.value = !showReply.value }
function onReplySubmit() {
  showReply.value = false
  emit('replyAdded')
}
function onReplyAdded() { emit('replyAdded') }

function formatDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d }
}
</script>
