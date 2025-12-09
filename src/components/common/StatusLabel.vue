<script setup>
import { computed } from "vue";

const props = defineProps({
  // Status value
  status: {
    type: String,
    required: true,
  },
  // Variant types: 'product', 'order', 'payment', 'shipment', 'general', 'custom'
  variant: {
    type: String,
    default: "product",
    validator: (value) =>
      ["product", "order", "payment", "shipment", "general", "custom"].includes(
        value
      ),
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
  // General variant untuk warna umum
  general: {
    muted: {
      label: "Default",
      class: "bg-muted-background text-muted-foreground",
      icon: "pi-circle",
    },
    primary: {
      label: "Primary",
      class: "bg-primary/10 text-primary",
      icon: "pi-circle",
    },
    merchant: {
      label: "Merchant",
      class: "bg-merchant-primary/10 text-merchant-primary",
      icon: "pi-circle",
    },
    success: {
      label: "Success",
      class: "bg-success-background text-success-foreground",
      icon: "pi-check-circle",
    },
    warning: {
      label: "Warning",
      class: "bg-warning-background text-warning-foreground",
      icon: "pi-exclamation-triangle",
    },
    danger: {
      label: "Danger",
      class: "bg-danger-background text-danger-foreground",
      icon: "pi-times-circle",
    },
    info: {
      label: "Info",
      class: "bg-blue-100 text-blue-700",
      icon: "pi-info-circle",
    },
  },
  custom: {},
  // Event status variant
  event: {
    draft: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: "pi-file",
      label: "Draft",
    },
    published: {
      bg: "bg-admin-primary/10",
      text: "text-admin-primary",
      icon: "pi-check-circle",
      label: "Published",
    },
    archived: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: "pi-archive",
      label: "Archived",
    },
  },
  // Merchant approval status
  approval: {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "pi-clock",
      label: "Pending",
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "pi-check-circle",
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "pi-times-circle",
      label: "Rejected",
    },
  },
  // Report status
  report: {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "pi-exclamation-triangle",
      label: "Pending",
    },
    in_review: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: "pi-eye",
      label: "In Review",
    },
    resolved: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "pi-check-circle",
      label: "Resolved",
    },
    dismissed: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: "pi-times",
      label: "Dismissed",
    },
  },
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


<StatusLabel status="muted" variant="general" label="Tidak Aktif" />
Result: [● Tidak Aktif] - bg-gray-100 text-gray-700

<!-- Primary (Blue) -->
<StatusLabel status="primary" variant="general" label="Info" />
Result: [● Info] - bg-blue-100 text-blue-700

<!-- Merchant Primary (Green) -->
<StatusLabel status="merchant" variant="general" label="Recommended" />
Result: [● Recommended] - bg-green-100 text-green-700

<!-- Success (Green) -->
<StatusLabel status="success" variant="general" label="Aktif" />
Result: [✓ Aktif] - bg-green-100 text-green-700

<!-- Warning (Yellow) -->
<StatusLabel status="warning" variant="general" label="Perhatian" />
Result: [⚠ Perhatian] - bg-yellow-100 text-yellow-700

<!-- Danger (Red) -->
<StatusLabel status="danger" variant="general" label="Error" />
Result: [✕ Error] - bg-red-100 text-red-700

<!-- Info (Blue) -->
<StatusLabel status="info" variant="general" label="Informasi" />
Result: [ℹ Informasi] - bg-blue-100 text-blue-700
═══════════════════════════════════════════════════════════ REAL-WORLD EXAMPLES
WITH GENERAL VARIANT ═══════════════════════════════════════════════════════════

<!-- Add-on Group Badge - Muted -->
<StatusLabel
  status="muted"
  variant="general"
  :label="`${group.options.length} opsi`"
  size="xs"
  :show-icon="false"
/>

<!-- Featured Product Badge - Merchant -->
<StatusLabel
  status="merchant"
  variant="general"
  label="Recommended"
  size="sm"
/>

<!-- Popular Item - Primary -->
<StatusLabel status="primary" variant="general" label="Populer" size="xs" />

<!-- New Product - Info -->
<StatusLabel status="info" variant="general" label="Baru" size="xs" />

<!-- Limited Stock - Warning -->
<StatusLabel
  status="warning"
  variant="general"
  :label="`${stock} tersisa`"
  size="sm"
/>

<!-- Low Stock Alert - Danger -->
<StatusLabel status="danger" variant="general" label="Stok Menipis" size="sm" />

<!-- Active Status - Success -->
<StatusLabel status="success" variant="general" label="Aktif" size="xs" />

<!-- Inactive Status - Muted -->
<StatusLabel
  status="muted"
  variant="general"
  label="Tidak Aktif"
  size="xs"
  :show-icon="false"
/>

═══════════════════════════════════════════════════════════ COMPARISON: CUSTOM
VS GENERAL ═══════════════════════════════════════════════════════════ ❌ BEFORE
(Custom - Manual class):
<StatusLabel
  status="custom"
  variant="custom"
  label="Recommended"
  custom-class="bg-merchant-primary/10 text-merchant-primary"
/>

(General - Built-in):
<StatusLabel status="merchant" variant="general" label="Recommended" />

═══════════════════════════════════════════════════════════ AVAILABLE GENERAL
STATUS ═══════════════════════════════════════════════════════════ STATUS |
CLASS | ICON
-----------|------------------------------------------|------------------ muted
| bg-gray-100 text-gray-700 | pi-circle primary | bg-blue-100 text-blue-700 |
pi-circle merchant | bg-green-100 text-green-700 | pi-circle success |
bg-green-100 text-green-700 | pi-check-circle warning | bg-yellow-100
text-yellow-700 | pi-exclamation-triangle danger | bg-red-100 text-red-700 |
pi-times-circle info | bg-blue-100 text-blue-700 | pi-info-circle -->
