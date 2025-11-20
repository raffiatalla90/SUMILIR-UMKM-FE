<!-- filepath: c:\laragon\www\KMI-SIMSLIFE-FE\src\components\common\StatusLabel.vue -->
<script setup>
/**
 * StatusLabel Component
 *
 * Komponen untuk menampilkan label status dengan styling konsisten.
 * Support berbagai variant (product, order, payment, shipment, general) dan custom styling.
 *
 * @component StatusLabel
 * @example
 * // Basic Usage - Product Status
 * <StatusLabel status="published" variant="product" />
 * // Output: [✓ Dipublish] dengan warna hijau
 *
 * @example
 * // Order Status
 * <StatusLabel status="processing" variant="order" />
 * // Output: [↻ Diproses] dengan warna biru
 *
 * @example
 * // General Status - Muted
 * <StatusLabel status="muted" variant="general" label="Tidak Aktif" />
 * // Output: [● Tidak Aktif] dengan warna abu-abu
 *
 * @example
 * // General Status - Primary
 * <StatusLabel status="primary" variant="general" label="Info" />
 * // Output: [● Info] dengan warna biru primary
 *
 * @example
 * // General Status - Merchant Primary
 * <StatusLabel status="merchant" variant="general" label="Recommended" />
 * // Output: [● Recommended] dengan warna hijau merchant
 *
 * @example
 * // Custom Styling
 * <StatusLabel
 *   status="any"
 *   variant="custom"
 *   label="VIP"
 *   custom-class="bg-purple-100 text-purple-700"
 *   size="md"
 * />
 * // Output: [● VIP] dengan warna custom purple
 *
 * @example
 * // Tanpa Icon
 * <StatusLabel
 *   status="published"
 *   variant="product"
 *   :show-icon="false"
 * />
 * // Output: [Dipublish] tanpa icon
 *
 * @example
 * // Ukuran Extra Small
 * <StatusLabel
 *   status="published"
 *   variant="product"
 *   size="xs"
 * />
 * // Output: Label dengan ukuran sangat kecil
 *
 * @props
 * @param {String} status - Status value (required)
 *   Product: 'published', 'draft', 'archived', 'out_of_stock'
 *   Order: 'pending', 'processing', 'ready', 'completed', 'cancelled', 'refunded'
 *   Payment: 'unpaid', 'pending', 'paid', 'failed', 'refunded'
 *   Shipment: 'pending', 'packed', 'shipped', 'delivered', 'returned'
 *   General: 'muted', 'primary', 'merchant', 'success', 'warning', 'danger', 'info'
 *
 * @param {String} variant - Tipe variant status (default: 'product')
 *   Options: 'product', 'order', 'payment', 'shipment', 'general', 'custom'
 *
 * @param {String} label - Custom label text (optional, override default)
 *   Default: Akan menggunakan label bawaan sesuai status & variant
 *
 * @param {String} customClass - Custom Tailwind CSS classes (optional)
 *   Contoh: "bg-purple-100 text-purple-700"
 *   Note: Hanya berlaku jika variant="custom"
 *
 * @param {String} size - Ukuran badge (default: 'sm')
 *   Options: 'xs', 'sm', 'md', 'lg'
 *
 * @param {Boolean} showIcon - Tampilkan icon atau tidak (default: true)
 */

// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/components/common/StatusLabel.vue
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
  // TAMBAHKAN: General variant untuk warna umum
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

<!-- 
═══════════════════════════════════════════════════════════
GENERAL VARIANT - NEW USAGE EXAMPLES
═══════════════════════════════════════════════════════════

<!-- Muted (Gray) -->
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

✅ AFTER (General - Built-in):
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
