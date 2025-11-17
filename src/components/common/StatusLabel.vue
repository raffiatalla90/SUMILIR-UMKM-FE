<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/common/StatusLabel.vue
import { computed } from "vue";

const props = defineProps({
  // Status value
  status: {
    type: String,
    required: true,
  },
  // Variant types: 'product', 'order', 'payment', 'custom'
  variant: {
    type: String,
    default: "product",
    validator: (value) =>
      ["product", "order", "payment", "shipment", "custom"].includes(value),
  },
  // Custom label (override default)
  label: {
    type: String,
    default: null,
  },
  // Custom color classes
  customClass: {
    type: String,
    default: null,
  },
  // Size: 'xs', 'sm', 'md', 'lg'
  size: {
    type: String,
    default: "sm",
    validator: (value) => ["xs", "sm", "md", "lg"].includes(value),
  },
  // Show icon
  showIcon: {
    type: Boolean,
    default: true,
  },
});

// Status configurations per variant
const statusConfigs = {
  product: {
    published: {
      label: "Dipublish",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    draft: {
      label: "Draft",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-clock",
    },
    archived: {
      label: "Diarsipkan",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-archive",
    },
    out_of_stock: {
      label: "Stok Habis",
      class: "bg-muted-background text-muted-foreground",
      icon: "pi-times-circle",
    },
  },
  order: {
    pending: {
      label: "Menunggu",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-clock",
    },
    processing: {
      label: "Diproses",
      class: "bg-blue-100 text-blue-700",
      icon: "pi-sync",
    },
    ready: {
      label: "Siap Diambil",
      class: "bg-purple-100 text-purple-700",
      icon: "pi-check",
    },
    completed: {
      label: "Selesai",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    cancelled: {
      label: "Dibatalkan",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-times-circle",
    },
    refunded: {
      label: "Refund",
      class: "bg-gray-100 text-gray-700",
      icon: "pi-replay",
    },
  },
  payment: {
    unpaid: {
      label: "Belum Dibayar",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-exclamation-triangle",
    },
    pending: {
      label: "Menunggu",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-clock",
    },
    paid: {
      label: "Dibayar",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    failed: {
      label: "Gagal",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-times-circle",
    },
    refunded: {
      label: "Refund",
      class: "bg-gray-100 text-gray-700",
      icon: "pi-replay",
    },
  },
  shipment: {
    pending: {
      label: "Menunggu",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-clock",
    },
    packed: {
      label: "Dikemas",
      class: "bg-blue-100 text-blue-700",
      icon: "pi-box",
    },
    shipped: {
      label: "Dikirim",
      class: "bg-purple-100 text-purple-700",
      icon: "pi-send",
    },
    delivered: {
      label: "Terkirim",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    returned: {
      label: "Dikembalikan",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-replay",
    },
  },
  custom: {},
};

// Computed properties
const config = computed(() => {
  if (props.customClass) {
    return {
      label: props.label || props.status,
      class: props.customClass,
      icon: "pi-circle",
    };
  }

  const variantConfig = statusConfigs[props.variant] || {};
  const statusConfig = variantConfig[props.status.toLowerCase()] || {
    label: props.status,
    class: "bg-muted-background text-muted-foreground",
    icon: "pi-circle",
  };

  return {
    label: props.label || statusConfig.label,
    class: statusConfig.class,
    icon: statusConfig.icon,
  };
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };
  return sizes[props.size] || sizes.sm;
});

const iconSizeClasses = computed(() => {
  const sizes = {
    xs: "text-[8px]",
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };
  return sizes[props.size] || sizes.sm;
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 sm:gap-1.5 rounded-full font-medium whitespace-nowrap',
      sizeClasses,
      config.class,
    ]"
  >
    <i v-if="showIcon" :class="['pi', config.icon, iconSizeClasses]"></i>
    <span>{{ config.label }}</span>
  </span>
</template>
