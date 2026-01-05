<script setup>
import { computed } from "vue";

const props = defineProps({
  // Status value
  status: {
    type: String,
    required: true,
  },

  // Variants
  variant: {
    type: String,
    default: "product",
    validator: (value) =>
      [
        "product",
        "order",
        "payment",
        "shipment",
        "general",
        "custom",
        "report",
        "event",
        "voucher",
      ].includes(value),
  },

  // Override label
  label: {
    type: String,
    default: null,
  },

  // Custom class (only for custom variant)
  customClass: {
    type: String,
    default: null,
  },

  // Size
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


// =======================
// STATUS CONFIG
// =======================
const statusConfigs = {
  product: {
    published: { label: "Dipublish", class: "bg-success-background text-success-foreground", icon: "pi-check-circle" },
    draft: { label: "Draft", class: "bg-warning-background text-warning-foreground", icon: "pi-clock" },
    archived: { label: "Diarsipkan", class: "bg-danger-background text-danger-foreground", icon: "pi-archive" },
    out_of_stock: { label: "Stok Habis", class: "bg-muted-background text-muted-foreground", icon: "pi-times-circle" },
  },

  order: {
    pending: { label: "Menunggu", class: "bg-warning-background text-warning-foreground", icon: "pi-clock" },
    processing: { label: "Diproses", class: "bg-blue-100 text-blue-700", icon: "pi-sync" },
    ready: { label: "Siap Diambil", class: "bg-purple-100 text-purple-700", icon: "pi-check" },
    completed: { label: "Selesai", class: "bg-success-background text-success-foreground", icon: "pi-check-circle" },
    cancelled: { label: "Dibatalkan", class: "bg-danger-background text-danger-foreground", icon: "pi-times-circle" },
    refunded: { label: "Refund", class: "bg-gray-100 text-gray-700", icon: "pi-replay" },
  },

  payment: {
    unpaid: { label: "Belum Dibayar", class: "bg-danger-background text-danger-foreground", icon: "pi-exclamation-triangle" },
    pending: { label: "Menunggu", class: "bg-warning-background text-warning-foreground", icon: "pi-clock" },
    paid: { label: "Dibayar", class: "bg-success-background text-success-foreground", icon: "pi-check-circle" },
    failed: { label: "Gagal", class: "bg-danger-background text-danger-foreground", icon: "pi-times-circle" },
    refunded: { label: "Refund", class: "bg-gray-100 text-gray-700", icon: "pi-replay" },
  },

  shipment: {
    pending: { label: "Menunggu", class: "bg-warning-background text-warning-foreground", icon: "pi-clock" },
    packed: { label: "Dikemas", class: "bg-blue-100 text-blue-700", icon: "pi-box" },
    shipped: { label: "Dikirim", class: "bg-purple-100 text-purple-700", icon: "pi-send" },
    delivered: { label: "Terkirim", class: "bg-success-background text-success-foreground", icon: "pi-check-circle" },
    returned: { label: "Dikembalikan", class: "bg-danger-background text-danger-foreground", icon: "pi-replay" },
  },

  general: {
    muted: { label: "Default", class: "bg-muted-background text-muted-foreground", icon: "pi-circle" },
    primary: { label: "Primary", class: "bg-primary/10 text-primary", icon: "pi-circle" },
    merchant: { label: "Merchant", class: "bg-merchant-primary/10 text-merchant-primary", icon: "pi-circle" },
    success: { label: "Success", class: "bg-success-background text-success-foreground", icon: "pi-check-circle" },
    warning: { label: "Warning", class: "bg-warning-background text-warning-foreground", icon: "pi-exclamation-triangle" },
    danger: { label: "Danger", class: "bg-danger-background text-danger-foreground", icon: "pi-times-circle" },
    info: { label: "Info", class: "bg-blue-100 text-blue-700", icon: "pi-info-circle" },
  },

  report: {
    pending: { label: "Pending", class: "bg-yellow-100 text-yellow-700" },
    in_review: { label: "In Review", class: "bg-blue-100 text-blue-700" },
    resolved: { label: "Resolved", class: "bg-green-100 text-green-700" },
    dismissed: { label: "Dismissed", class: "bg-gray-100 text-gray-700" },
  },

  event: {
    draft: { label: "Draft", class: "bg-gray-100 text-gray-700" },
    published: { label: "Published", class: "bg-green-100 text-green-700" },
    archived: { label: "Archived", class: "bg-orange-100 text-orange-700" },
  },

  voucher: {
    active: { label: "Active", class: "bg-green-100 text-green-700" },
    inactive: { label: "Inactive", class: "bg-gray-100 text-gray-700" },
    expired: { label: "Expired", class: "bg-red-100 text-red-700" },
  },
  
  merchant: {
    approved: { label: "Approved", class: "bg-green-100 text-green-700" },
    pending: { label: "Pending", class: "bg-gray-100 text-gray-700" },
    rejected: { label: "Rejected", class: "bg-red-100 text-red-700" },
  },

  segmentation: {
    umkm_toko: { label: "UMKM Toko", class: "bg-[#e6f7fa] text-[#007c91]"},
    umkm_kuliner: { label: "UMKM Kuliner", class: "bg-[#eaf1f8] text-[#194a7a]"},
    umkm_jasa: { label: "UMKM Jasa", class: "bg-[#fff0f0] text-[#ff5e5e]"},
  },

  custom: {},
};


// =======================
// COMPUTED CONFIG
// =======================
const config = computed(() => {
  // custom override
  if (props.customClass) {
    return {
      label: props.label || props.status,
      class: props.customClass,
      icon: "pi-circle",
    };
  }

  const variantConfig = statusConfigs[props.variant] || {};
  const status = props.status?.toLowerCase() ?? "";

  const found = variantConfig[status] || {
    label: props.label || props.status,
    class: "bg-muted-background text-muted-foreground",
    icon: "pi-circle",
  };

  return {
    label: props.label || found.label,
    class: found.class,
    icon: found.icon,
  };
});


// =======================
// SIZE STYLES
// =======================
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
    <i v-if="showIcon" :class="['pi', config.icon, iconSizeClasses]" />
    <span>{{ config.label }}</span>
  </span>
</template>
