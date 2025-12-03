<template>
  <div class="space-y-3">
    <template v-if="comments && comments.length">
      <CommentItem
        v-for="c in comments"
        :key="c.id"
        :comment="c"
        :post-id="postId"
        @reply-request="onReplyRequest"
        @reply-added="onReplyAdded"
      />
    </template>

    <div v-else class="text-gray-500 text-[11px] sm:text-sm">
      Belum ada komentar. Jadilah yang pertama!
    </div>
  </div>
</template>

<script setup>
import CommentItem from './CommentItem.vue'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  postId: { type: [String, Number], required: true }
})

const emit = defineEmits(['reply-request', 'reply-added'])

function onReplyRequest(payload) {
  emit('reply-request', payload)
}

function onReplyAdded() {
  emit('reply-added')
}
</script>
