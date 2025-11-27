<template>
  <!-- container fixed bottom -->
  <div class="fixed left-1/2 -translate-x-1/2 bottom-4 z-50 w-full max-w-2xl px-4">
    <div class="bg-white/95 backdrop-blur-sm shadow-lg rounded-full p-2 flex items-center gap-3">
      <!-- textarea -->
      <div class="flex-1">
        <textarea
          ref="ta"
          v-model="text"
          :placeholder="placeholderText"
          rows="1"
          @keydown.enter.prevent="onEnter"
          @input="autoResize"
          class="min-h-10 max-h-40 w-full resize-none bg-transparent outline-none px-2 py-2 text-sm rounded focus:ring-0"
        ></textarea>
        <div class="text-xs text-gray-400 mt-1 ml-1" v-if="isReply">Replying to <span class="font-medium text-gray-700">{{ parentLabel }}</span></div>
      </div>

      <!-- send button -->
      <button
        @click="submit"
        :disabled="loading || !text.trim()"
        class=" text-white px-4 py-2 rounded-full text-sm disabled:opacity-60 flex items-center gap-2"
        :aria-disabled="loading || !text.trim()"
      >
        <template v-if="loading">
          <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
          Mengirim...
        </template>
        <template v-else>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.4 20.4L20.85 12.92C21.0304 12.8432 21.1842 12.715 21.2923 12.5514C21.4004 12.3879 21.4581 12.1961 21.4581 12C21.4581 11.804 21.4004 11.6122 21.2923 11.4486C21.1842 11.2851 21.0304 11.1569 20.85 11.08L3.4 3.60003C3.2489 3.53412 3.08377 3.50687 2.91951 3.52073C2.75525 3.53459 2.59702 3.58912 2.4591 3.67942C2.32118 3.76971 2.20791 3.89292 2.1295 4.03793C2.0511 4.18293 2.01003 4.34518 2.01 4.51003L2 9.12003C2 9.62003 2.37 10.05 2.87 10.11L17 12L2.87 13.88C2.37 13.95 2 14.38 2 14.88L2.01 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z" fill="#757575"/>
          </svg>
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import api from '@/libs/axios'

const props = defineProps({
  postId: { type: [String, Number], required: true },
  parentId: { type: [String, Number], default: null },
  parentLabel: { type: String, default: '' }, 
  userAvatarUrl: { type: String, default: null } 
})
const emit = defineEmits(['added'])

// state
const text = ref('')
const loading = ref(false)
const isReply = ref(!!props.parentId)
const ta = ref(null)

// placeholder logic
const placeholderText = computed(() => {
  if (isReply.value && props.parentLabel) return `Balas ke ${props.parentLabel}...`
  if (isReply.value) return `Balas...`
  return 'Tulis komentar...'
})

// avatar: prefer provided url, else fallback to public default
const userAvatar = computed(() => {
  if (props.userAvatarUrl) return props.userAvatarUrl
  // fallback default path in public/storage
  return '/storage/profilepicdefault.png'
})

// watch parentId changes (when parent set/unset externally)
watch(() => props.parentId, (v) => {
  isReply.value = !!v
  // focus textarea when reply mode enabled
  if (isReply.value) {
    nextTick(() => ta.value?.focus())
  }
})

onMounted(() => {
  // make sure textarea auto-resizes initially
  nextTick(() => autoResize())
})

// helper: auto-resize textarea height
function autoResize() {
  const el = ta.value
  if (!el) return
  el.style.height = 'auto'
  const max = 160 // px
  el.style.height = Math.min(el.scrollHeight, max) + 'px'
}

// keyboard enter: submit on Ctrl/Meta+Enter or plain Enter? We use Enter to submit (prevent newline).
function onEnter(e) {
  // if Shift+Enter -> insert newline
  if (e.shiftKey) {
    // allow newline
    text.value += '\n'
    nextTick(autoResize)
    return
  }
  submit()
}

async function submit() {
  if (!text.value.trim()) return
  loading.value = true
  try {
    await api.post(`/community/posts/${props.postId}/comments`, {
      comment_content: text.value.trim(),
      parent_id: props.parentId || undefined
    })
    text.value = ''
    autoResize()
    // emit event so parent refresh comments
    emit('added')
    // if was reply, parentId handling (clearing) should be done by parent when it receives added event
  } catch (err) {
    console.error(err)
    // show a small toast or alert; keep simple for now
    alert('Gagal mengirim komentar. Coba lagi.')
  } finally {
    loading.value = false
  }
}
</script>

