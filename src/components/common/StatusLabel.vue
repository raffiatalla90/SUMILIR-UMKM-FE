<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => {
      const validStatuses = [
        'published', 'draft', 'archived', 'pending', 'approved', 'rejected',
        'active', 'inactive', 'in_review', 'resolved', 'dismissed', 'expired'
      ];
      return validStatuses.includes(value);
    },
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'report', 'event', 'voucher'].includes(value);
    },
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => {
      return ['xs', 'sm', 'md'].includes(value);
    },
  },
});

const statusConfig = computed(() => {
  const configs = {
    default: {
      published: { label: 'Published', class: 'bg-green-100 text-green-700' },
      draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
      archived: { label: 'Archived', class: 'bg-orange-100 text-orange-700' },
      pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
      active: { label: 'Active', class: 'bg-green-100 text-green-700' },
      inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-700' },
    },
    report: {
      pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
      in_review: { label: 'In Review', class: 'bg-blue-100 text-blue-700' },
      resolved: { label: 'Resolved', class: 'bg-green-100 text-green-700' },
      dismissed: { label: 'Dismissed', class: 'bg-gray-100 text-gray-700' },
    },
    event: {
      draft: { label: 'Draft', class: 'bg-gray-100 text-gray-700' },
      published: { label: 'Published', class: 'bg-green-100 text-green-700' },
      archived: { label: 'Archived', class: 'bg-orange-100 text-orange-700' },
    },
    voucher: {
      active: { label: 'Active', class: 'bg-green-100 text-green-700' },
      inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-700' },
      expired: { label: 'Expired', class: 'bg-red-100 text-red-700' },
    },
  };

  const variantConfig = configs[props.variant] || configs.default;
  
  if (!variantConfig[props.status] && import.meta.env.DEV) {
    console.warn(`[StatusLabel] Unknown status: ${props.status} for variant: ${props.variant}`);
  }
  
  return variantConfig[props.status] || { 
    label: props.status, 
    class: 'bg-gray-100 text-gray-700' 
  };
});

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1',
  };
  return sizes[props.size] || sizes.md;
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      statusConfig.class,
      sizeClasses,
    ]"
  >
    {{ statusConfig.label }}
  </span>
</template>