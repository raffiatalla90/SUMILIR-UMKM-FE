<template>
  <div>
    <div v-for="comment in comments" :key="comment.id" class="mb-4">
      <CommentItem
        :comment="comment"
        :postId="postId"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup>
import CommentItem from './CommentItem.vue'
const props = defineProps({
  comments: Array,
  postId: Number,
})
</script>