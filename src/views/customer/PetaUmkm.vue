<template>
  <div class="relative">
    <!-- SEARCH + FILTER (DESKTOP) -->
    <div
      class="fixed justify-center hidden w-full p-3 -translate-x-1/2 sm:flex top-24 left-1/2"
      style="z-index: 1000"
    >
      <div class="flex items-center w-full max-w-2xl gap-3">
        <!-- SEARCH BAR -->
        <div class="relative w-full">
          <TextField
            v-model="query"
            @update:modelValue="search"
            name="search-desktop"
            placeholder="Cari UMKM..."
            hideLabel
          />

          <!-- HASIL PENCARIAN DESKTOP -->
          <ul
            v-if="results.length"
            class="absolute left-0 right-0 mt-1 overflow-y-auto bg-white rounded shadow-md max-h-60"
            style="z-index: 1001"
          >
            <li
              v-for="item in results"
              :key="item.id"
              @click="goTo(item)"
              class="flex items-center gap-3 p-2 border-b cursor-pointer hover:bg-gray-100"
            >
              <!-- IMAGE -->
              <img
                :src="item.logo_url"
                class="object-cover w-12 h-12 bg-gray-200 rounded-lg"
                alt="Foto UMKM"
              />

              <!-- NAME -->
              <span class="font-medium">{{ item.name }}</span>
            </li>
          </ul>
        </div>

        <!-- FILTER BUTTONS DESKTOP -->
        <div class="flex gap-2">
          <button
            @click="setFilter(2)"
            class="px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500 text-white': activeSeg === 2,
              'bg-white text-black': activeSeg !== 2,
            }"
          >
            Kuliner
          </button>
          <button
            @click="setFilter(3)"
            class="px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500 text-white': activeSeg === 3,
              'bg-white text-black': activeSeg !== 3,
            }"
          >
            Jasa
          </button>
          <button
            @click="setFilter(1)"
            class="px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500 text-white': activeSeg === 1,
              'bg-white text-black': activeSeg !== 1,
            }"
          >
            Toko
          </button>
        </div>
      </div>
    </div>

    <!-- SEARCH + FILTER (MOBILE) -->
    <div class="fixed left-0 w-full px-3 sm:hidden top-8" style="z-index: 1000">
      <div class="flex flex-col w-full gap-2 mx-auto">
        <!-- SEARCH BAR -->
        <div class="w-full">
          <TextField
            v-model="query"
            @update:modelValue="search"
            name="search-mobile"
            placeholder="Cari UMKM..."
            hideLabel
          />
        </div>

        <!-- FILTER MOBILE (HORIZONTAL SCROLL) -->
        <div class="flex gap-2 pb-1 overflow-x-auto">
          <button
            @click="setFilter(2)"
            class="w-full px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500 text-white': activeSeg === 2,
              'bg-white text-black': activeSeg !== 2,
            }"
          >
            Kuliner
          </button>
          <button
            @click="setFilter(3)"
            class="w-full px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500  text-white': activeSeg === 3,
              'bg-white text-black': activeSeg !== 3,
            }"
          >
            Jasa
          </button>
          <button
            @click="setFilter(1)"
            class="w-full px-4 py-2 text-sm transition rounded-full shadow"
            :class="{
              'bg-amber-500 text-white': activeSeg === 1,
              'bg-white text-black': activeSeg !== 1,
            }"
          >
            Toko
          </button>
        </div>
      </div>
    </div>

    <!-- HASIL PENCARIAN MOBILE SLIDE-UP -->
    <transition name="slide-up">
      <div
        v-if="results.length"
        class="sm:hidden fixed bottom-0 left-0 w-full max-h-[50vh] overflow-y-auto p-3 space-y-1 bg-white rounded-t-2xl shadow-[0_-4px_15px_rgba(0,0,0,0.2)]"
        style="z-index: 1001"
      >
        <div
          v-for="item in results"
          :key="item.id"
          @click="goTo(item)"
          class="flex gap-3 p-3 bg-white shadow rounded-xl active:bg-gray-100"
        >
          <img
            :src="item.logo_url"
            class="object-cover w-20 h-20 bg-gray-200 rounded-lg"
            alt="Foto UMKM"
          />

          <div class="flex flex-col justify-center">
            <h3 class="text-base font-semibold">{{ item.name }}</h3>
          </div>
        </div>
      </div>
    </transition>

    <!-- MAP FULLSCREEN RESPONSIVE -->
    <div
      id="map"
      class="w-full h-[calc(100vh-75px)] sm:h-[calc(100vh-95px)]"
    ></div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/libs/axios";
import TextField from "@/components/forms/TextField.vue";

export default {
  name: "MapComponent",
  components: { TextField },

  data() {
    return {
      map: null,
      markers: [],
      merchants: [],
      filtered: [],
      myMarker: null,
      myLocation: null,
      activeSeg: null,
      query: "",
      results: [],
    };
  },

  mounted() {
    this.map = L.map("map", { zoomControl: false }).setView(
      [-7.5420536, 110.8082958],
      15
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      this.map
    );

    this.loadMerchants();
    this.loadMyLocationMarker();
  },

  methods: {
    async loadMyLocationMarker() {
      const coords = await this.getMyCoordinates();
      if (!coords) return;

      this.myLocation = coords;

      const icon = L.divIcon({
        className: "my-location-icon",
        html: '<div class="w-4 h-4 border-2 border-white rounded-full shadow-md bg-primary"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      if (this.myMarker) {
        this.myMarker.setLatLng([coords.lat, coords.lng]);
        return;
      }

      const popup = `
        <div class="popup-card popup-card--me">
          <div class="popup-card__body">
            <div class="popup-me__badge">Anda</div>
            <div class="popup-me__title">Alamat Anda</div>
          </div>
        </div>`;
      this.myMarker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(this.map)
        .bindPopup(popup);
    },

    async getMyCoordinates() {
      // 1) Prefer saved address from profile if user is logged in.
      try {
        const res = await api.get("api/profile/address");
        const addr = res?.data?.data;

        const lat = parseFloat(addr?.latitude);
        const lng = parseFloat(addr?.longitude);
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      } catch (e) {
        // ignore (likely 401 if not logged in)
      }

      // 2) Fallback: browser geolocation
      if (!navigator.geolocation) return null;

      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos?.coords?.latitude;
            const lng = pos?.coords?.longitude;
            if (typeof lat === "number" && typeof lng === "number") {
              resolve({ lat, lng });
            } else {
              resolve(null);
            }
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
      });
    },

    async loadMerchants() {
      const res = await api.get("api/public/merchants/map");
      this.merchants = res.data;
      this.filtered = this.merchants;
      this.renderMarkers();
    },

    setFilter(segId) {
      // Toggle filter: jika sudah aktif, unselect
      if (this.activeSeg === segId) {
        this.activeSeg = null;
        this.filtered = this.merchants;
      } else {
        this.activeSeg = segId;
        this.filtered = this.merchants.filter(
          (m) => m.segmentation?.id === segId
        );
      }
      this.results = [];
      this.renderMarkers();
    },

    renderMarkers() {
      this.markers.forEach((m) => this.map.removeLayer(m));
      this.markers = [];

      this.filtered.forEach((item) => {
        // Validasi koordinat sebelum membuat marker
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        const marker = L.marker([lat, lng]).addTo(this.map);

        const logoTag = item.logo_url
          ? `<div class="popup-gmaps__img"><img src="${item.logo_url}" alt="${item.name}" /></div>`
          : "";
        const popup = `
          <div class="popup-card">
            <div class="popup-card__body">
              ${logoTag}
              <div class="popup-gmaps__title">${item.name}</div>
            </div>
          </div>`;

        marker.bindPopup(popup);

        // Klik di dalam popup => navigasi ke detail merchant
        marker.on("popupopen", () => {
          const popupEl = marker.getPopup()?.getElement();
          const card = popupEl?.querySelector(".popup-card");
          if (!card) return;

          const slugOrId = item.slug || item.id;
          card.onclick = () => {
            this.$router.push(`/merchant/${slugOrId}`);
          };
        });

        this.markers.push(marker);
      });
    },

    search() {
      if (this.query.length < 2) return (this.results = []);
      const key = this.query.toLowerCase();
      this.results = this.filtered.filter((m) =>
        m.name.toLowerCase().includes(key)
      );
    },

    goTo(item) {
      // Validasi koordinat sebelum setView dan marker
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      this.map.setView([lat, lng], 18);

      // Cari marker yang sudah ada berdasarkan koordinat
      const existingMarker = this.markers.find((marker) => {
        const markerLatLng = marker.getLatLng();
        return (
          Math.abs(markerLatLng.lat - lat) < 0.0001 &&
          Math.abs(markerLatLng.lng - lng) < 0.0001
        );
      });

      // Buka popup marker yang sudah ada
      if (existingMarker) {
        existingMarker.openPopup();
      }

      this.query = item.name;
      this.results = [];
    },
  },
};
</script>

<style>
.leaflet-popup-content {
  margin: 0 !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 16px !important;
  padding: 0 !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.leaflet-popup-tip {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

/* Custom close (x) button for Leaflet popup */
.leaflet-popup-close-button {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  width: 30px !important;
  height: 30px !important;
  line-height: 30px !important;
  font-size: 22px !important;
  background: rgba(255, 255, 255, 0.92) !important;
  border-radius: 9999px !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: rgba(0, 0, 0, 0.6) !important;
  opacity: 1 !important;
  z-index: 10 !important;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.leaflet-popup-close-button:hover {
  background: var(--color-primary) !important;
  color: #fff !important;
  transform: scale(1.04);
}

/* Popup card base */
.popup-card {
  width: 220px;
  max-width: 240px;
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.popup-card:hover {
  transform: translateY(-1px);
}

.popup-card__body {
  padding: 14px 14px 12px 14px;
  text-align: center;
}

/* Merchant popup */
.popup-gmaps__img {
  width: 72px;
  height: 72px;
  margin: 2px auto 10px auto;
  border-radius: 9999px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.popup-gmaps__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.popup-gmaps__title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.25;
  word-break: break-word;
}

/* My location popup */
.popup-card--me .popup-card__body {
  padding-top: 12px;
}

.popup-me__badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.popup-me__title {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primary);
}
/* Mobile slide-up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
