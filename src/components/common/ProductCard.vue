<script setup>
import { computed } from "vue";
import StatusLabel from "@/components/common/StatusLabel.vue";
import { getImageUrl } from "@/libs/getImageUrl.js";
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "toggle-select",
  "view-detail",
  "edit",
  "delete",
  "toggle-visibility",
]);

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "jt";
  if (num >= 1000) return (num / 1000).toFixed(1) + "rb";
  return num.toString();
};

const formatPrice = (min, max) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formatCompact = (num) => {
    if (num >= 1000000000) return "Rp " + (num / 1000000000).toFixed(1) + "M";
    if (num >= 1000000) return "Rp " + (num / 1000000).toFixed(1) + "jt";
    return formatter.format(num);
  };

  if (min === max) return formatCompact(min);
  return `${formatCompact(min)} - ${formatCompact(max)}`;
};
</script>

<template>
  <div
    class="flex flex-col gap-2 p-4 bg-white shadow hover:shadow-md transition"
  >
    <!-- Header -->
    <div class="flex gap-3 items-center">
      <div class="flex-shrink-0 pt-1">
        <label class="cursor-pointer inline-block">
          <input
            type="checkbox"
            :checked="selected"
            @change="emit('toggle-select', product.id)"
            class="appearance-none w-4.5 h-4.5 border-1 border-muted-foreground rounded-sm bg-transparent cursor-pointer transition-all duration-200 checked:bg-merchant-primary checked:border-merchant-primary focus:outline-none focus:ring-2 focus:ring-merchant-primary focus:ring-offset-2 relative before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDQuNUw0LjUgOEwxMSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-center before:bg-no-repeat before:opacity-0 checked:before:opacity-100"
          />
        </label>
      </div>

      <div
        @click="emit('view-detail', product)"
        class="w-16 h-16 rounded-lg overflow-hidden bg-muted-background cursor-pointer flex-shrink-0"
      >
        <img
          v-if="product.cover_image?.id"
          :src="getImageUrl(product.cover_image.id)"
          :alt="product.name"
          class="w-full h-full object-cover"
          @error="(e) => (e.target.style.display = 'none')"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-200"
        >
          <i class="pi pi-image text-gray-400"></i>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <h3
          @click="emit('view-detail', product)"
          class="text-sm font-semibold text-merchant-primary truncate cursor-pointer hover:text-merchant-primary/80 transition"
          :title="product.name"
        >
          {{ product.name }}
        </h3>
        <p
          class="text-xs text-muted-foreground font-medium truncate mt-0.5"
          :title="product.sku"
        >
          {{ product.sku }}
        </p>
        <div class="flex items-center gap-2 mt-2">
          <span
            class="inline-flex items-center px-2 py-1 bg-merchant-primary/10 text-merchant-primary rounded-md text-xs font-medium"
          >
            <i class="pi pi-box mr-1"></i>
            Stok: {{ formatNumber(product.total_stock) }}
          </span>
        </div>
      </div>
    </div>

    <div class="border-t border-muted-background"></div>

    <!-- Details -->
    <div class="space-y-3">
      <div class="flex justify-between items-center text-xs">
        <span class="text-muted-foreground flex-shrink-0">Kategori</span>
        <span
          class="font-medium text-right truncate ml-2"
          :title="product.categories?.[0]?.category_name"
        >
          {{ product.categories?.[0]?.name || "-" }}
        </span>
      </div>

      <div class="flex justify-between items-center text-xs">
        <span class="text-muted-foreground flex-shrink-0">Harga</span>
        <span
          class="text-merchant-primary font-semibold text-right truncate ml-2"
          :title="formatPrice(product.min_price, product.max_price)"
        >
          {{ formatPrice(product.min_price, product.max_price) }}
        </span>
      </div>

      <div class="flex flex-row justify-between items-center gap-2">
        <span class="text-xs text-muted-foreground flex-shrink-0">
          Status Produk
        </span>
        <div class="flex flex-col items-end gap-1">
          <StatusLabel :status="product.status" variant="product" size="sm" />
          <StatusLabel
            v-if="product.variant_count > 0"
            status="out_of_stock"
            variant="product"
            size="xs"
            :label="`${product.variant_count} varian habis`"
          />
        </div>
      </div>
    </div>

    <div class="border-t border-muted-background"></div>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-2">
      <button
        @click="emit('delete', product)"
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-danger-background text-danger-foreground transition text-sm font-medium"
        title="Hapus Produk"
      >
        <i class="pi pi-trash"></i>
      </button>

      <div class="flex gap-2">
        <button
          @click="emit('view-detail', product)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted-background text-muted-foreground transition text-sm font-medium"
          title="Lihat Detail"
        >
          <i class="pi pi-eye"></i>
        </button>

        <button
          @click="emit('edit', product)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-merchant-primary/10 text-merchant-primary hover:bg-merchant-primary/20 transition text-sm font-medium"
          title="Edit Produk"
        >
          <i class="pi pi-pencil"></i>
        </button>

        <button
          @click="emit('toggle-visibility', product)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium hover:bg-warning-background text-warning-foreground"
          title="Ubah Status"
        >
          <i class="pi pi-cog"></i>
        </button>
      </div>
    </div>
  </div>
</template>
