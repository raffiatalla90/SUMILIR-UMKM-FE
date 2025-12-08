<template>
  <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/30" @click="$emit('close')"></div>

    <div class="relative z-10 w-[320px] sm:w-[360px] rounded-2xl bg-white shadow-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800">{{ monthName }} {{ current.getFullYear() }}</h3>
        <div class="flex gap-2">
          <button class="w-8 h-8 rounded-full hover:bg-gray-100" @click="prevMonth">‹</button>
          <button class="w-8 h-8 rounded-full hover:bg-gray-100" @click="nextMonth">›</button>
        </div>
      </div>

      <div class="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        <span v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-y-1 text-center">
        <div v-for="i in startOffset" :key="'o'+i" class="py-2 text-sm text-gray-300">•</div>
        <button
          v-for="d in daysInMonth" :key="d" @click="pick(d)"
          class="mx-auto my-0.5 w-9 h-9 rounded-full text-sm flex items-center justify-center transition hover:bg-gray-100"
          :class="{
            'ring-2 ring-orange-500': isSelected(d),
            'bg-orange-600 text-white': isToday(d)
          }"
        >{{ d }}</button>
      </div>

      <div class="mt-3 flex justify-end gap-2">
        <button class="px-3 py-1.5 rounded-lg border border-gray-200" @click="$emit('close')">Tutup</button>
        <button class="px-3 py-1.5 rounded-lg bg-orange-600 text-white" @click="confirm">Pilih</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ open: Boolean, modelValue: { type: Date, default: () => new Date() } })
const emit = defineEmits(['update:modelValue', 'close'])

const current = ref(new Date(props.modelValue))
const tempSelected = ref(new Date(props.modelValue))

watch(() => props.open, (v) => { if (v) { current.value = new Date(props.modelValue); tempSelected.value = new Date(props.modelValue) } })

const monthName   = computed(() => current.value.toLocaleString('en-US', { month: 'long' }))
const daysInMonth = computed(() => new Date(current.value.getFullYear(), current.value.getMonth()+1, 0).getDate())
const startOffset = computed(() => new Date(current.value.getFullYear(), current.value.getMonth(), 1).getDay())

const isToday = (d) => { const t = new Date(), c = current.value; return d===t.getDate() && c.getMonth()===t.getMonth() && c.getFullYear()===t.getFullYear() }
const isSelected = (d) => { const s=tempSelected.value, c=current.value; return d===s.getDate() && c.getMonth()===s.getMonth() && c.getFullYear()===s.getFullYear() }

const pick = (d) => { tempSelected.value = new Date(current.value.getFullYear(), current.value.getMonth(), d) }
const confirm = () => { emit('update:modelValue', tempSelected.value); emit('close') }
const prevMonth = () => current.value = new Date(current.value.getFullYear(), current.value.getMonth()-1, 1)
const nextMonth = () => current.value = new Date(current.value.getFullYear(), current.value.getMonth()+1, 1)
</script>
