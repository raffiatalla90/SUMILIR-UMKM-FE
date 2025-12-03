<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/common/Breadcrumb.vue
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  items: {
    type: Array,
    required: true,
    // Format: [{ label: 'Home', path: '/home' }, { label: 'Current' }]
  },
  merchantId: {
    type: [Number, String],
    default: null,
  },
});

const route = useRoute();
const router = useRouter();

// ✅ Auto-inject merchantId ke semua paths jika belum ada
const processedItems = computed(() => {
  return props.items.map((item) => {
    if (!item.path) return item;

    // Skip jika path sudah absolute atau sudah punya merchantId
    if (item.path.startsWith("http") || item.path.includes("/:merchantId")) {
      return item;
    }

    // Jika path mengandung /merchant-center dan ada merchantId
    if (
      item.path.includes("/merchant-center") &&
      props.merchantId &&
      !item.path.includes(`/merchant-center/${props.merchantId}`)
    ) {
      // Replace /merchant-center dengan /merchant-center/:merchantId
      const newPath = item.path.replace(
        "/merchant-center",
        `/merchant-center/${props.merchantId}`
      );
      return { ...item, path: newPath };
    }

    return item;
  });
});

const navigateTo = (path) => {
  if (path) {
    router.push(path);
  }
};
</script>

<template>
  <nav class="flex items-center gap-2 text-sm">
    <template v-for="(crumb, index) in processedItems" :key="index">
      <!-- Clickable breadcrumb -->
      <button
        v-if="crumb.path"
        @click="navigateTo(crumb.path)"
        class="text-muted-foreground hover:text-merchant-primary transition flex items-center gap-2 text-base lg:text-2xl font-medium"
        :class="{ 'hover:underline': crumb.path }"
      >
        <i v-if="crumb.icon" :class="crumb.icon" class="text-sm"></i>
        {{ crumb.label }}
      </button>

      <!-- Current breadcrumb (no link) -->
      <span
        v-else
        class="text-merchant-primary font-bold text-base lg:text-2xl whitespace-nowrap"
      >
        <i v-if="crumb.icon" :class="crumb.icon" class="text-sm mr-1"></i>
        {{ crumb.label }}
      </span>

      <!-- Separator -->
      <i
        v-if="index < processedItems.length - 1"
        class="pi pi-chevron-right text-gray-400 text-xs"
      ></i>
    </template>
  </nav>
</template>
