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
        <span v-for="d in ['Min','Sen','Sel','Rab','Kam','Jum','Sab']" :key="d">{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-y-1 text-center">
        <div v-for="i in startOffset" :key="'o'+i" class="py-2 text-sm text-gray-300">•</div>
        <button
          v-for="d in daysInMonth" :key="d" 
          @click="isDayAvailable(d) && !isPastDay(d) ? pick(d) : null"
          class="mx-auto my-0.5 w-9 h-9 rounded-full text-sm flex items-center justify-center transition"
          :class="getDayClass(d)"
          :disabled="!isDayAvailable(d) || isPastDay(d)"
        >{{ d }}</button>
      </div>

      <!-- Legend -->
      <div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span>
          <span>Libur</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>Hari Ini</span>
        </div>
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

const props = defineProps({ 
  open: Boolean, 
  modelValue: { type: Date, default: () => new Date() },
  operatingDays: { type: String, default: '' } // Format: "1,2,3,4,5,6,7" (1=Senin...7=Minggu)
})
const emit = defineEmits(['update:modelValue', 'close'])

const current = ref(new Date(props.modelValue))
const tempSelected = ref(new Date(props.modelValue))

watch(() => props.open, (v) => { if (v) { current.value = new Date(props.modelValue); tempSelected.value = new Date(props.modelValue) } })

const monthName   = computed(() => current.value.toLocaleString('id-ID', { month: 'long' }))
const daysInMonth = computed(() => new Date(current.value.getFullYear(), current.value.getMonth()+1, 0).getDate())
const startOffset = computed(() => new Date(current.value.getFullYear(), current.value.getMonth(), 1).getDay())

// Konversi hari JS (0=Minggu, 1=Senin...) ke format database (1=Senin...7=Minggu)
const jsToDbDay = (jsDay) => (jsDay === 0 ? 7 : jsDay)

// Parse operating days
const parsedOperatingDays = computed(() => {
  if (!props.operatingDays) return []
  return props.operatingDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
})

// Cek apakah hari tersedia
const isDayAvailable = (d) => {
  if (parsedOperatingDays.value.length === 0) return true // Jika tidak ada data, semua tersedia
  const date = new Date(current.value.getFullYear(), current.value.getMonth(), d)
  const dbDay = jsToDbDay(date.getDay())
  return parsedOperatingDays.value.includes(dbDay)
}

// Cek apakah hari sudah lewat
const isPastDay = (d) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(current.value.getFullYear(), current.value.getMonth(), d)
  return checkDate < today
}

const isToday = (d) => { const t = new Date(), c = current.value; return d===t.getDate() && c.getMonth()===t.getMonth() && c.getFullYear()===t.getFullYear() }
const isSelected = (d) => { const s=tempSelected.value, c=current.value; return d===s.getDate() && c.getMonth()===s.getMonth() && c.getFullYear()===s.getFullYear() }

// Get class untuk tiap hari
const getDayClass = (d) => {
  const available = isDayAvailable(d)
  const past = isPastDay(d)
  const today = isToday(d)
  const selected = isSelected(d)
  
  if (!available) {
    return 'bg-red-50 text-red-300 cursor-not-allowed'
  }
  if (past) {
    return 'text-gray-300 cursor-not-allowed'
  }
  if (selected) {
    return 'ring-2 ring-orange-500 hover:bg-gray-100'
  }
  if (today) {
    return 'bg-orange-600 text-white'
  }
  return 'hover:bg-gray-100'
}

const pick = (d) => { tempSelected.value = new Date(current.value.getFullYear(), current.value.getMonth(), d) }
const confirm = () => { emit('update:modelValue', tempSelected.value); emit('close') }
const prevMonth = () => current.value = new Date(current.value.getFullYear(), current.value.getMonth()-1, 1)
const nextMonth = () => current.value = new Date(current.value.getFullYear(), current.value.getMonth()+1, 1)
</script>
