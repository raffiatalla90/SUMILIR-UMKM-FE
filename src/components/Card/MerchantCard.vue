<template>
  <router-link
    :to="{
      name: 'Merchant Detail',
      params: { slug: merchant.slug || merchant.id },
    }"
    class="block overflow-hidden transition-shadow duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-lg sm:max-w-xs"
  >
    <!-- Logo/Image -->
    <div class="relative bg-muted-background aspect-square">
      <img
        v-if="merchantLogoUrl"
        :src="merchantLogoUrl"
        :alt="merchant.name"
        class="object-cover w-full h-full"
      />
      <div
        v-else
        class="flex items-center justify-center w-full h-full text-merchant-primary"
      >
        <i class="text-4xl pi pi-shop text-merchant-primary"></i>
      </div>

      <!-- Badge Segmentation -->
      <div
        v-if="merchant.segmentation"
        class="absolute px-2 py-1 text-xs font-medium rounded-full text-merchant-primary top-2 left-2 bg-white/90 backdrop-blur-sm"
      >
        {{ merchant.segmentation.name }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4 sm:py-3">
      <!-- Name -->
      <h3
        class="mb-1 text-sm font-bold text-black line-clamp-1"
        :title="merchant.name"
      >
        {{ merchant.name }}
      </h3>

      <!-- Products Count -->

      <div class="flex items-center gap-1 mb-1 text-[11px] text-gray-500 mt-2">
        <i class="text-base me-1 pi pi-shopping-bag text-primary"></i>

        <span class="line-clamp-1">
          {{ displayCount }}
          {{ displayLabel }}
        </span>
      </div>

      <!-- Location -->
      <div
        v-if="formattedDistanceKm"
        class="flex items-center gap-1 mb-1 text-[11px] text-gray-500"
      >
        <i class="text-base pi pi-map-marker me-1 text-danger-foreground"></i>
        <div>
          <span v-if="formattedDistanceKm">
            {{ formattedDistanceKm }}
          </span>
        </div>
      </div>

      <div
        v-if="merchant.primary_address"
        class="flex items-center gap-1 mb-1 text-[11px] text-gray-500"
      >
        <span class="line-clamp-1" :title="primaryAddressString">
          {{ primaryAddressString }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from "vue";
import { getImageUrl, getMerchantLogoUrl } from "@/libs/getImageUrl";

const props = defineProps({
  merchant: {
    type: Object,
    required: true,
  },
});

const distanceKm = computed(() => {
  const raw =
    props.merchant?.distance_km ??
    props.merchant?.distanceKm ??
    props.merchant?.distance;
  const num = typeof raw === "string" ? parseFloat(raw) : raw;
  return Number.isFinite(num) ? num : null;
});

const formattedDistanceKm = computed(() => {
  if (distanceKm.value == null) return null;
  return `${distanceKm.value.toFixed(1)} km`;
});

const primaryAddressString = computed(() => {
  const addr = props.merchant?.primary_address;
  if (!addr) return "";

  const parts = [];
  const detail = addr.detail ? String(addr.detail).trim() : "";
  if (detail) parts.push(detail);
  if (addr.village?.name) parts.push(String(addr.village.name));
  if (addr.district?.name) parts.push(String(addr.district.name));
  if (addr.city?.name) parts.push(String(addr.city.name));
  if (addr.province?.name) parts.push(String(addr.province.name));

  return parts.join(", ");
});

const merchantLogoUrl = computed(() => {
  const merchant = props.merchant;

  if (!merchant) return "";

  if (merchant.logo_url) {
    return merchant.logo_url;
  }

  if (merchant.id && merchant.logo_path) {
    return getMerchantLogoUrl(merchant);
  }

  if (merchant.logo_path) {
    return getImageUrl(merchant.logo_path);
  }

  return "";
});

// Tentukan apakah merchant ini tipe Jasa berdasarkan segmentation
const isMerchantJasa = computed(() => {
  const segmentName = String(props.merchant?.segmentation?.name || "").toLowerCase();
  const jasasCount = Number(
    props.merchant?.jasas_count ??
      props.merchant?.services_count ??
      props.merchant?.jasa_count ??
      0,
  );
  const productsCount = Number(props.merchant?.products_count ?? 0);

  return segmentName.includes("jasa") || (jasasCount > 0 && productsCount === 0);
});

// Tampilkan counter yang sesuai
const displayCount = computed(() => {
  const productsCount = Number(props.merchant?.products_count ?? 0);
  const jasasCount = Number(
    props.merchant?.jasas_count ??
      props.merchant?.services_count ??
      props.merchant?.jasa_count ??
      (isMerchantJasa.value ? productsCount : 0),
  );

  if (isMerchantJasa.value) {
    return jasasCount;
  }
  return productsCount;
});

// Tampilkan label yang sesuai
const displayLabel = computed(() => {
  return isMerchantJasa.value ? "Layanan Jasa" : "Produk";
});
</script>
