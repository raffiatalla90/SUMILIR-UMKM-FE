<template>
  <div class="relative">

    <!-- SEARCH + FILTER -->
    <div class="p-3 z-[9999] fixed top-24 left-1/2 -translate-x-1/2 w-full flex justify-center">

      <!-- DESKTOP (md+) -->
      <div class="hidden md:flex flex-row items-center gap-3 w-full max-w-2xl">

        <!-- SEARCH BAR -->
        <div class="w-full relative">
          <div class="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full">
            <input
              v-model="query"
              @input="search"
              type="text"
              placeholder="Cari di Map..."
              class="w-full rounded-full outline-none"
            />
          </div>

          <!-- HASIL PENCARIAN DESKTOP -->
            <ul
              v-if="results.length"
              class="hidden md:block absolute left-0 right-0 bg-white mt-1 max-h-60 overflow-y-auto shadow-md rounded z-[99999]"
            >
              <li
                v-for="item in results"
                :key="item.id"
                @click="goTo(item)"
                class="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 border-b"
              >
                <!-- IMAGE -->
                <img
                  :src="item.logo_path"
                  class="w-12 h-12 rounded-lg object-cover bg-gray-200"
                  alt="Foto UMKM"
                />

                <!-- NAME -->
                <span class="font-medium">{{ item.name }}</span>
              </li>
            </ul>

        </div>

        <!-- FILTER BUTTONS DESKTOP -->
        <div class="flex gap-2">
          <button @click="setFilter(2)" class="px-4 py-2 rounded-full shadow text-sm transition" :class="{ 'bg-amber-500 text-white': activeSeg === 2, 'bg-white text-black': activeSeg !== 2}">Kuliner</button>
        <button @click="setFilter(3)" class="px-4 py-2 rounded-full shadow text-sm transition" :class="{'bg-amber-500 text-white': activeSeg === 3,'bg-white text-black': activeSeg !== 3}">Jasa</button>
        <button @click="setFilter(1)" class="px-4 py-2 rounded-full shadow text-sm transition" :class="{'bg-amber-500 text-white': activeSeg === 1,'bg-white text-black': activeSeg !== 1}">Toko</button>
        </div>
      </div>

      <!-- MOBILE (max-md) -->
      <div class="md:hidden w-full max-w-sm flex flex-col gap-2">

        <!-- SEARCH BAR -->
        <div class="w-full">
          <div class="flex items-center bg-white shadow-md rounded-full px-4 py-2 w-full">
            <input
              v-model="query"
              @input="search"
              type="text"
              placeholder="Cari UMKM..."
              class="w-full rounded-full outline-none"
            />
          </div>
        </div>

        <!-- FILTER MOBILE (HORIZONTAL SCROLL) -->
        <div class="flex gap-2 overflow-x-auto pb-1">
        <button @click="setFilter(2)" class="px-4 py-2 rounded-full shadow text-sm transition":class="{ 'bg-amber-500 text-white': activeSeg === 2,'bg-white text-black': activeSeg !== 2}">Kuliner</button>
        <button @click="setFilter(3)"class="px-4 py-2 rounded-full shadow text-sm transition":class="{'bg-amber-500  text-white': activeSeg === 3,'bg-white text-black': activeSeg !== 3}">Jasa</button>
        <button @click="setFilter(1)" class="px-4 py-2 rounded-full shadow text-sm transition" :class="{'bg-amber-500 text-white': activeSeg === 1,'bg-white text-black': activeSeg !== 1}">Toko</button>
        </div>
      </div>
    </div>

    <!-- HASIL PENCARIAN MOBILE SLIDE-UP -->
    <transition name="slide-up">
      <div v-if="results.length" class="md:hidden fixed bottom-0 left-0 w-full max-h-[50vh] overflow-y-auto p-3 space-y-3 bg-white rounded-t-2xl shadow-[0_-4px_15px_rgba(0,0,0,0.2)] z-[99999]">

      <div
            v-for="item in results"
            :key="item.id"
            @click="goTo(item)"
            class="flex gap-3 rounded-xl bg-white p-3 shadow active:bg-gray-100"
          >
            <img
              :src="item.logo_path"
              class="w-20 h-20 rounded-lg object-cover bg-gray-200"
              alt="Foto UMKM"
            />

            <div class="flex flex-col justify-center">
              <h3 class="font-semibold text-base">{{ item.name }}</h3>
            </div>
          </div>

        </div>
    </transition>



    <!-- MAP FULLSCREEN RESPONSIVE -->
   <div id="map"class="w-full h-[calc(100vh-75px)] md:h-[calc(100vh-95px)]"></div>


  </div>
</template>


<script>
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";
    import axios from "axios";

    export default {
    name: "MapComponent",

    data() {
        return {
        map: null,
        markers: [],
        merchants: [],
        filtered: [],
        activeSeg: null,
        query: "",
        results: [],
        };
    },

    mounted() {
        this.map = L.map("map", { zoomControl: false })
        .setView([-7.5420536, 110.8082958], 18);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
        .addTo(this.map);

        this.loadMerchants();
    },

    methods: {
        async loadMerchants() {
        const res = await axios.get("http://localhost:8000/api/merchants");
        this.merchants = res.data;
        this.filtered = this.merchants;
        this.renderMarkers();
        },

        setFilter(segId) {
        this.activeSeg = segId;
        this.filtered = this.merchants.filter(m => m.segmentation_id === segId);
        this.results = this.filtered;
        this.renderMarkers();
        },

        renderMarkers() {
        this.markers.forEach(m => this.map.removeLayer(m));
        this.markers = [];

        this.filtered.forEach(item => {
            const addr = item.addresses?.[0];
            if (!addr) return;

            const marker = L.marker([addr.latitude, addr.longitude]).addTo(this.map);

            const popup = `
            <div class="popup-gmaps">
                <img src="${this.getImageUrl(item.logo_path)}" />
                <div class="title">${item.name}</div>
            </div>`;

            marker.bindPopup(popup);
            this.markers.push(marker);
        });
        },

        getImageUrl(path) {
        return path?.includes("http") ? path : `http://localhost:8000/storage/${path}`;
        },

        search() {
        if (this.query.length < 2) return (this.results = []);
        const key = this.query.toLowerCase();
        this.results = this.filtered.filter(m => m.name.toLowerCase().includes(key));
        },

        goTo(item) {
        const addr = item.addresses?.[0];
        if (!addr) return;

        this.map.setView([addr.latitude, addr.longitude], 18);

        const popup = `
            <img src="${this.getImageUrl(item.logo_path)}" class="w-full h-24 object-cover" />
            <div class="font-semibold mt-2">${item.name}</div>
        `;

        L.marker([addr.latitude, addr.longitude]).addTo(this.map)
            .bindPopup(popup)
            .openPopup();

        this.query = item.name;
        this.results = [];
        },
    },
        };

</script>

<style>

.leaflet-popup-content-wrapper {
  border-radius: 10px !important;
  padding: 0 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.popup-gmaps {
  width: 160px;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
}

.popup-gmaps img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.popup-gmaps .title {
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
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
