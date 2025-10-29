<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
  lat: { type: [Number, String, null], default: null },
  lng: { type: [Number, String, null], default: null },
  zoom: { type: Number, default: 13 },
  height: { type: String, default: "280px" },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:lat", "update:lng"]);

const mapEl = ref(null);
let map;
let marker;

const tileUrl =
  import.meta.env.VITE_MAP_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution =
  import.meta.env.VITE_MAP_ATTRIBUTION || "&copy; OpenStreetMap contributors";

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
  if (!map || lat == null || lng == null) return;
  const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
  const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;
  const latlng = L.latLng(latNum, lngNum);
  setMarker(latlng);
  if (setView) map.setView(latlng, props.zoom);
}

function locateMe() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      emit("update:lat", +latitude.toFixed(6));
      emit("update:lng", +longitude.toFixed(6));
      updateLatLng(latitude, longitude, true);
    },
    (err) => {
      console.warn("Geolocation error:", err);
      // Bisa tampilkan toast/alert jika perlu
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function resetMarker() {
  if (!map) return;
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
  emit("update:lat", null);
  emit("update:lng", null);
}

onMounted(() => {
  // Perbaiki path icon Leaflet di Vite
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
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const startLat = props.lat ?? -2.5; // tengah Indonesia
  const startLng = props.lng ?? 118.0;

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
});

watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (lat != null && lng != null) updateLatLng(lat, lng, false);
  }
);

onBeforeUnmount(() => {
  if (map) map.remove();
});
</script>

<template>
  <div class="space-y-2">
    <div
      ref="mapEl"
      class="w-full rounded-xl overflow-hidden border border-gray-200"
      :style="{ height }"
    />
    <div class="flex gap-2">
      <button
        type="button"
        @click="locateMe"
        class="px-3 py-2 text-sm font-semibold rounded-lg border border-primary text-primary hover:bg-primary/5"
      >
        Gunakan lokasi saya
      </button>
      <button
        v-if="!readonly"
        type="button"
        @click="resetMarker"
        class="px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  </div>
</template>
