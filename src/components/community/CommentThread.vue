<template>
  <div class="space-y-4">
    <template v-if="comments && comments.length">
      <CommentItem v-for="c in comments" :key="c.id" :comment="c" @replyAdded="onReplyAdded" />
    </template>
    <div v-else class="text-gray-500">Belum ada komentar. Jadilah yang pertama!</div>
  </div>
</template>

<script setup>
import CommentItem from './CommentItem.vue'
const props = defineProps({
  comments: { type: Array, default: () => [] }
})
const emit = defineEmits(['replyAdded'])
function onReplyAdded() { emit('replyAdded') }
</script>
