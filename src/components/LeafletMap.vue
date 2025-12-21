<script setup>
/**
 * LeafletMap / MapPicker
 * - v-model:lat, v-model:lng
 * - Marker draggable
 * - Klik map set lokasi
 * - Geolocation (HTTPS / localhost)
 * - Placeholder overlay (saat belum ada lokasi)
 */

import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= PROPS & EMITS ================= */
const props = defineProps({
  lat: { type: [Number, String, null], default: null },
  lng: { type: [Number, String, null], default: null },
  zoom: { type: Number, default: 14 },
  height: { type: String, default: "280px" },
  readonly: { type: Boolean, default: false },
  variant: { type: String, default: "primary" }, // primary | merchant
});

const emit = defineEmits(["update:lat", "update:lng"]);

/* ================= STATE ================= */
const mapEl = ref(null);
let map = null;
let marker = null;

const geoError = ref("");
const isLocating = ref(false);

const isSecure = window.isSecureContext === true;
const isGeoSupported = "geolocation" in navigator;
const canUseGeo = computed(
  () => isSecure && isGeoSupported && !props.readonly
);

/* ================= STYLE COMPUTED ================= */
const borderColorClass = computed(() =>
  props.variant === "merchant"
    ? "border-merchant-primary"
    : "border-primary"
);

const buttonTextClass = computed(() =>
  props.variant === "merchant"
    ? "text-merchant-primary hover:bg-merchant-primary/5"
    : "text-primary hover:bg-primary/5"
);

const buttonBorderClass = computed(() =>
  props.variant === "merchant"
    ? "border-merchant-primary"
    : "border-primary"
);

/* ================= TILE CONFIG ================= */
const tileUrl =
  import.meta.env.VITE_MAP_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const attribution =
  import.meta.env.VITE_MAP_ATTRIBUTION ||
  "&copy; OpenStreetMap contributors";

/* ================= HELPERS ================= */
function normalize(val) {
  if (val === null || val === undefined) return null;
  return typeof val === "string" ? parseFloat(val) : val;
}

function setMarker(latlng) {
  if (!map) return;

  if (!marker) {
    marker = L.marker(latlng, { draggable: !props.readonly }).addTo(map);

    if (!props.readonly) {
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        emit("update:lat", +lat.toFixed(6));
        emit("update:lng", +lng.toFixed(6));
      });
    }
  } else {
    marker.setLatLng(latlng);
  }
}

function updateLatLng(lat, lng, setView = false) {
  const latNum = normalize(lat);
  const lngNum = normalize(lng);
  if (latNum == null || lngNum == null || !map) return;

  const latlng = L.latLng(latNum, lngNum);
  setMarker(latlng);
  if (setView) map.setView(latlng, props.zoom);
}

function resetMarker() {
  if (marker && map) {
    map.removeLayer(marker);
    marker = null;
  }
  emit("update:lat", null);
  emit("update:lng", null);
}

/* ================= GEOLOCATION ================= */
function locateMe() {
  geoError.value = "";

  if (!canUseGeo.value) {
    geoError.value = isSecure
      ? "Geolocation tidak didukung browser."
      : "Geolocation memerlukan HTTPS atau localhost.";
    return;
  }

  isLocating.value = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      emit("update:lat", +latitude.toFixed(6));
      emit("update:lng", +longitude.toFixed(6));
      updateLatLng(latitude, longitude, true);
      isLocating.value = false;
    },
    (err) => {
      geoError.value =
        err.code === 1
          ? "Akses lokasi ditolak."
          : err.code === 2
          ? "Lokasi tidak tersedia."
          : "Gagal mengambil lokasi.";
      isLocating.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ================= LIFECYCLE ================= */
onMounted(async () => {
  await nextTick();

  // FIX ICON PATH (Vite)
  const iconRetinaUrl = new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).toString();
  const iconUrl = new URL(
    "leaflet/dist/images/marker-icon.png",
    import.meta.url
  ).toString();
  const shadowUrl = new URL(
    "leaflet/dist/images/marker-shadow.png",
    import.meta.url
  ).toString();

  L.Marker.prototype.options.icon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const startLat = normalize(props.lat) ?? -2.5;
  const startLng = normalize(props.lng) ?? 118.0;

  map = L.map(mapEl.value).setView([startLat, startLng], props.zoom);
  L.tileLayer(tileUrl, { attribution }).addTo(map);

  if (props.lat != null && props.lng != null) {
    setMarker([props.lat, props.lng]);
  }

  if (!props.readonly) {
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      emit("update:lat", +lat.toFixed(6));
      emit("update:lng", +lng.toFixed(6));
      setMarker(e.latlng);
    });
  }

  // 🔥 FIX BUG MAP KOSONG / GESER
  setTimeout(() => {
    map.invalidateSize(true);
  }, 300);
});

watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (lat != null && lng != null) updateLatLng(lat, lng, false);
  }
);

onBeforeUnmount(() => {
  map?.remove();
});
</script>

<template>
  <div class="h-full">
    <!-- MAP WRAPPER -->
    <div
      class="relative w-full h-full rounded-xl overflow-hidden border"
      :class="borderColorClass"
    >
      <!-- MAP -->
      <div ref="mapEl" class="absolute inset-0 z-0"></div>

      <!-- PLACEHOLDER OVERLAY -->
      <div
        v-if="lat == null || lng == null"
        class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        :class="
          variant === 'merchant'
            ? 'bg-gradient-to-br from-green-200 to-green-400'
            : 'bg-gray-100'
        "
      >
        <div class="text-center">
          <svg
            class="w-12 h-12 md:w-16 md:h-16 text-red-600 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
          <p class="text-sm font-medium text-gray-700">
            Pilih lokasi di peta
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
