<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  duration: {
    type: Number,
    default: 1000,
  },
  suffix: {
    type: String,
    default: '',
  },

  // 👉 Tambahan: trigger untuk replay animasi
  replayKey: {
    type: Number,
    default: 0,
  },

  // optional: apakah replay dimulai dari 0 atau dari displayValue saat ini
  replayFromZero: {
    type: Boolean,
    default: true,
  },
});

const displayValue = ref(0);
const direction = ref('');
let timer = null;

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const animateValue = (start, end, duration) => {
  stopTimer();

  if (start === end) {
    displayValue.value = end;
    return;
  }

  direction.value = end > start ? 'up' : 'down';

  const range = end - start;
  const steps = Math.max(1, Math.floor(duration / 16)); // ~60fps
  const increment = range / steps;

  let current = start;
  let step = 0;

  timer = setInterval(() => {
    step++;
    current += increment;

    if (step >= steps) {
      displayValue.value = end;
      stopTimer();

      setTimeout(() => {
        direction.value = '';
      }, 250);
    } else {
      displayValue.value = Math.round(current);
    }
  }, 16);
};

watch(
  () => props.value,
  (newVal, oldVal) => {
    // animasi saat value berubah
    animateValue(oldVal ?? 0, newVal ?? 0, props.duration);
  }
);

// ✅ saat replayKey berubah → replay
watch(
  () => props.replayKey,
  () => {
    const start = props.replayFromZero ? 0 : displayValue.value;
    animateValue(start, props.value, props.duration);
  }
);

onMounted(() => {
  animateValue(0, props.value, props.duration);
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<template>
  <span
    class="inline-block transition-transform duration-300"
    :class="{
      'animate-count-up': direction === 'up',
      'animate-count-down': direction === 'down',
    }"
  >
    {{ displayValue.toLocaleString('id-ID') }}{{ suffix }}
  </span>
</template>

<style scoped>
@keyframes countUp {
  0% { transform: translateY(10px); opacity: 0.5; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes countDown {
  0% { transform: translateY(-10px); opacity: 0.5; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-count-up { animation: countUp 0.45s ease-out; }
.animate-count-down { animation: countDown 0.45s ease-out; }
</style>
