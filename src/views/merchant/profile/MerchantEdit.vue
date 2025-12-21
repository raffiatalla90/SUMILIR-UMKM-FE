<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl"
    >
      <button
        @click="router.push(`/merchant-center/${merchantId}/profile`)"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left text-xl"></i>
      </button>
      <h1 class="text-lg font-semibold">Edit Informasi Toko</h1>
    </div>

    <!-- Desktop Header with Breadcrumb -->
    <div class="hidden sm:block bg-gray-50 py-6">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-y-2 items-center justify-between gap-x-4">
          <div>
            <!-- Breadcrumb Component -->
            <Breadcrumb
              :items="breadcrumbItems"
              :merchantId="merchantId"
            />
            <p class="text-muted-foreground text-xs lg:text-sm mt-1">
              Perbarui informasi toko Anda.
            </p>
          </div>

          <!-- Desktop Save Button -->
          <div class="flex items-center gap-3">
            <button
              @click="handleSave"
              class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile Only -->
    <div class="h-[88px] sm:h-0"></div>
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-4">
        <svg
          class="animate-spin h-10 w-10 text-merchant-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p class="text-sm text-gray-600 font-medium">
          Memuat data UMKM...
        </p>
      </div>
    </div>
    <!-- Container Responsive -->
    <div class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <!-- Mobile: Card with Cover & Logo -->
      <div class="sm:hidden bg-white mx-4 rounded-2xl shadow-sm overflow-hidden mb-4">
        <!-- Cover Image -->
        <div class="relative h-40">
          <img
            :src="form.coverImage"
            alt="Cover"
            class="w-full h-full object-cover"
          />
          <button 
            @click="handleUploadCover"
            class="absolute top-3 right-3 w-10 h-10 bg-merchant-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            <i class="pi pi-camera text-base"></i>
          </button>
        </div>
        
        <!-- Logo - Overlapping -->
        <div class="relative px-4 pt-14 pb-4">
          <div class="absolute -top-12 left-4">
            <div class="relative">
              <img
                :src="form.logo"
                alt="Logo"
                class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button 
                @click="handleUploadLogo"
                class="absolute bottom-0 right-0 w-8 h-8 bg-merchant-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <i class="pi pi-camera text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Cover & Logo -->
      <div class="hidden sm:block relative bg-white mb-4 rounded-xl shadow-sm overflow-visible">
        <div class="overflow-hidden rounded-xl">
          <img
            :src="form.coverImage"
            alt="Cover"
            class="w-full h-64 lg:h-80 object-cover"
          />
        </div>
        <button 
          @click="handleUploadCover"
          class="absolute top-6 right-6 bg-merchant-primary text-white rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <div class="absolute -bottom-12 left-8">
          <div class="relative">
            <img
              :src="form.logo"
              alt="Logo"
              class="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <button 
              @click="handleUploadLogo"
              class="absolute bottom-0 right-0 bg-merchant-primary text-white rounded-full p-2 shadow-lg hover:opacity-90 transition-opacity"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="sm:pt-16">
        <!-- Mobile: Single Card -->
        <div class="sm:hidden bg-white mx-4 rounded-2xl shadow-sm p-4 space-y-5">
          <h2 class="text-lg font-bold text-merchant-primary">Informasi Toko</h2>

          <!-- Nama Toko -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Nama Toko
            </label>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
              placeholder="Masukkan nama toko"
            />
          </div>

          <!-- Kontak -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Kontak
            </label>
            <input
              v-model="form.contact"
              type="tel"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
              placeholder="Masukkan nomor kontak"
            />
          </div>

          <!-- Tentang -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Tentang
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full bg-gray-100 rounded-xl p-3 text-gray-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow resize-none"
              placeholder="Ceritakan tentang toko Anda..."
            ></textarea>
          </div>

          <!-- Lokasi -->
          <div>
            <label class="block text-sm font-semibold text-merchant-primary mb-2">
              Lokasi
            </label>

            <div class="bg-gray-100 rounded-xl h-48 relative overflow-hidden mb-3">
              
              <LeafletMap
                    v-if="googleMapsEmbedUrl"
                    :lat="latitude"
                    :lng="longitude"
                    :zoom="15"
                  />
              <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">
                <div class="text-center">
                  <svg class="w-12 h-12 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <p class="text-sm text-gray-700 font-medium">{{ form.address }}</p>
                </div>
              </div>
            </div>
            <button 
              @click="handleSetLocation"
              class="w-full flex items-center justify-center gap-2 bg-merchant-primary text-white font-semibold 
                     py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <i class="pi pi-map-marker"></i>
              <span>Atur Lokasi</span>
            </button>
          </div>

          <!-- Jam Operasional -->
          <div>
            <h3 class="text-base font-bold text-merchant-primary mb-3">Jam Operasional</h3>
            <div class="space-y-2.5">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <div class="flex items-center gap-3 flex-1">
                  <span class="px-3 py-1.5 bg-merchant-primary text-white rounded-full text-xs font-semibold min-w-[85px] text-center">
                    {{ day.name }}
                  </span>
                  
                  <div class="flex-1">
                    <span v-if="day.isOpen" class="text-gray-700 font-medium text-sm">
                      {{ day.hours }}
                    </span>
                    <span v-else class="text-red-500 font-medium text-sm">
                      Tutup
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    v-if="day.isOpen"
                    @click="handleEditHours(index)"
                    class="text-merchant-primary text-xs font-semibold hover:underline"
                  >
                    Edit
                  </button>
                  
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="day.isOpen"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-merchant-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Original Layout -->
        <div class="hidden sm:block bg-white mb-4 p-6 space-y-8 rounded-xl shadow-sm">
          <h2 class="text-2xl font-bold text-merchant-primary">Informasi Toko</h2>

          <!-- Grid Layout for Desktop -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-6">
            <!-- Nama Toko -->
            <div>
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Nama Toko
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
                placeholder="Masukkan nama toko"
              />
            </div>

            <!-- Kontak -->
            <div>
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Kontak
              </label>
              <input
                v-model="form.contact"
                type="tel"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow"
                placeholder="Masukkan nomor kontak"
              />
            </div>

            <!-- Tentang - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Tentang
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full bg-gray-100 rounded-xl p-4 text-gray-700 text-base
                       focus:outline-none focus:ring-2 focus:ring-merchant-primary transition-shadow resize-none"
                placeholder="Ceritakan tentang toko Anda..."
              ></textarea>
            </div>

            <!-- Lokasi - Full Width -->
            <div class="md:col-span-2">
              <label class="block text-base font-medium text-merchant-primary mb-2">
                Lokasi
              </label>
              <div class="bg-gray-100 rounded-xl p-3 h-64 lg:h-80 relative overflow-hidden mb-3">
                  <LeafletMap
                  v-if="googleMapsEmbedUrl"  
                  :lat="latitude"
                    :lng="longitude"
                    :zoom="15"
                  />
                <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400">
                  <div class="text-center">
                    <svg class="w-16 h-16 text-red-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <p class="text-base text-gray-700 font-medium">{{ form.address }}</p>
                  </div>
                </div>
              </div>
              <button 
                @click="handleSetLocation"
                class="w-full flex items-center justify-center space-x-2 bg-merchant-primary text-white font-semibold 
                       py-4 rounded-full hover:opacity-90 transition-opacity text-base"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Atur Lokasi</span>
              </button>
            </div>
          </div>

          <!-- Jam Operasional -->
          <div class="pt-4">
            <h3 class="text-xl font-bold text-merchant-primary mb-4">Jam Operasional</h3>
            <div class="space-y-4">
              <div
                v-for="(day, index) in form.operationalHours"
                :key="index"
                class="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl p-4"
              >
                <span class="px-4 py-2 bg-merchant-primary text-white rounded-full text-sm font-medium 
                             min-w-[120px] text-center flex-shrink-0">
                  {{ day.name }}
                </span>
                
                <span class="text-gray-700 font-medium text-base flex-grow">
                  {{ day.hours }}
                </span>
                
                <button
                  v-if="day.isOpen"
                  @click="handleEditHours(index)"
                  class="text-merchant-primary text-base font-medium hover:underline flex-shrink-0"
                >
                  Edit
                </button>
                <span
                  v-else
                  class="text-red-500 text-base font-medium flex-shrink-0"
                >
                  Tutup
                </span>
                
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    v-model="day.isOpen"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 
                              rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                              peer-checked:bg-merchant-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Save Button -->
        <div class="hidden sm:flex justify-end mt-6">
          <button
            @click="handleSave"
            class="px-6 py-2.5 bg-merchant-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Simpan
          </button>
        </div>

        <!-- Mobile Action Button - Fixed at Bottom -->
        <div class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <button
            @click="handleSave"
            class="w-full bg-merchant-primary text-white text-center font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- modal location -->
<div v-if="showLocationModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
  <div class="bg-white rounded-xl p-4 w-full max-w-xl">
    <h3 class="font-bold mb-3">Pilih Lokasi</h3>
    <div class="grid grid-cols-3 gap-2">
      <SelectField
        name="form.province_id"
        label="Provinsi"
        v-model="form.province_id"
        :loading="provincesLoading"
        :options="provinces.map(p => ({ value: p.id, label: p.name }))"
      />

      <SelectField
        name="form.city_id"
        label="Kabupaten/Kota"
        v-model="form.city_id"
        :loading="citiesLoading"
        :disabled="!form.province_id"
        :options="cities.map(c => ({ value: c.id, label: c.name }))"
      />

      <SelectField
        name="form.district_id"
        label="Kecamatan"
        v-model="form.district_id"
        :loading="districtsLoading"
        :disabled="!form.city_id"
        :options="districts.map(d => ({ value: d.id, label: d.name }))"
      />

      <SelectField
        name="form.village_id"
        label="Desa"
        v-model="form.village_id"
        :loading="villagesLoading"
        :disabled="!form.district_id"
        :options="villages.map(v => ({ value: v.id, label: v.name }))"
      />

            <!-- Koordinat (nested di address.*) -->
            <TextField
              name="form.latitude"
              label="Latitude"
              v-model="latitude"
              :readonly="true"
              placeholder="-6.200000"
            />
            <TextField
              name="form.longitude"
              label="Longitude"
              v-model="longitude"
              :readonly="true"
              placeholder="106.816666"
            />

            <!-- Detail alamat (nested di address.detail) -->
            <TextField
              name="form.address"
              v-model="form.address"
              label="Alamat Lengkap"
              placeholder="Nama jalan, RT/RW, patokan, dsb (opsional)"
              class="sm:col-span-2"
            />

            <div class="sm:col-span-2 mt-5">
              <MapPicker
                v-model:lat="tempLat"
                v-model:lng="tempLng"
                :zoom="15"
              />
            </div>


    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button @click="showLocationModal=false">Batal</button>
      <button @click="saveLocation" class="bg-merchant-primary text-white px-4 py-2 rounded">
        Simpan
      </button>
    </div>
  </div>
</div>

    <!-- modal jam -->
<div v-if="showHoursModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
  <div class="bg-white rounded-xl p-4 w-full max-w-sm">
    <h3 class="font-bold mb-4">Atur Jam Operasional</h3>

    <div class="flex gap-3">
      <input type="time" v-model="tempOpen" class="border rounded p-2 w-full" />
      <input type="time" v-model="tempClose" class="border rounded p-2 w-full" />
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button @click="showHoursModal=false">Batal</button>
      <button @click="saveHours" class="bg-merchant-primary text-white px-4 py-2 rounded">
        Simpan
      </button>
    </div>
  </div>
</div>

    <input
    ref="coverInput"
    type="file"
    accept="image/*"
    class="hidden"
    @change="onCoverSelected"
  />
  
  <input
    ref="logoInput"
    type="file"
    accept="image/*"
    class="hidden"
    @change="onLogoSelected"
  />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import { onMounted, watch } from 'vue';
import merchantProfile from '@/services/api/merchantProfile';
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
} from "@/services/api/location";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import ErrorAlert from "@/components/forms/ErrorAlert.vue";
import MapPicker from "@/components/forms/MapPicker.vue";
import LeafletMap from '@/components/LeafletMap.vue';
import { useToast } from "vue-toastification";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const merchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : 1;
});

const breadcrumbItems = computed(() => [
  {
    label: "Profil UMKM",
    path: `/merchant-center/${merchantId.value}/profile`,
  },
  {
    label: "Edit Profil UMKM",
  },
]);

const form = ref({
  name: 'Sembako Sari Alam',
  contact: '08xxxxxxxx',
  description: 'Toko Sembako Rojolele menyediakan beragam kebutuhan pokok harian — beras, gula, minyak, dan produk lokal lainnya.',
  address: 'Jl. Pasar Rojolele No. 123',
  logo: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=SEMBAKO',
  coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop',
  city_id: null,
  district_id: null,
  province_id: null,
  operationalHours: [
    { name: 'Monday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Tuesday', hours: '[06:00 - 18:00]', isOpen: false },
    { name: 'Wednesday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Thursday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Friday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Saturday', hours: '[06:00 - 18:00]', isOpen: true },
    { name: 'Sunday', hours: '[06:00 - 18:00]', isOpen: true }
  ]
});

const isLoading = ref(true);
const latitude = ref(null);
const longitude = ref(null);
const coverInput = ref(null);
const logoInput = ref(null);

const showHoursModal = ref(false);
const editingDayIndex = ref(null);

const tempOpen = ref('06:00');
const tempClose = ref('18:00');

const showLocationModal = ref(false);
const tempLat = ref(null);
const tempLng = ref(null);

const provincesLoading = ref(false);
const citiesLoading = ref(false);
const districtsLoading = ref(false);
const villagesLoading = ref(false);

const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const villages = ref([]);

watch(
  () => form.value.province_id,
  async (pid) => {
    form.value.city_id = null;
    form.value.district_id = null;
    form.value.village_id = null;

    cities.value = [];
    districts.value = [];
    villages.value = [];

    if (pid) {
      await loadCities(pid);
    }
  }
);

watch(
  () => form.value.city_id,
  async (cid) => {
    form.value.district_id = null;
    form.value.village_id = null;

    districts.value = [];
    villages.value = [];

    if (cid) {
      await loadDistricts(cid);
    }
  }
);

watch(
  () => form.value.district_id,
  async (did) => {
    form.value.village_id = null;
    villages.value = [];

    if (did) {
      await loadVillages(did);
    }
  }
);


// Ambil data wilayah dari service
async function loadProvinces() {
  provincesLoading.value = true;
  try {
    provinces.value = await getProvinces();
  } catch (e) {
    console.error("Gagal memuat provinsi:", e);
    provinces.value = [];
  } finally {
    provincesLoading.value = false;
  }
}

async function loadCities(pid) {
  citiesLoading.value = true;
  if (!pid) {
    cities.value = [];
    citiesLoading.value = false;
    return;
  }
  try {
    cities.value = await getCities(pid);
  } catch (e) {
    console.error("Gagal memuat kota/kabupaten:", e);
    cities.value = [];
  } finally {
    citiesLoading.value = false;
  }
}

async function loadDistricts(cid) {
  districtsLoading.value = true;
  if (!cid) {
    districts.value = [];
    districtsLoading.value = false;
    return;
  }
  try {
    districts.value = await getDistricts(cid);
  } catch (e) {
    console.error("Gagal memuat kecamatan:", e);
    districts.value = [];
  } finally {
    districtsLoading.value = false;
  }
}

async function loadVillages(did) {
  villagesLoading.value = true;
  if (!did) {
    villages.value = [];
    villagesLoading.value = false;
    return;
  }
  try {
    villages.value = await getVillages(did);
  } catch (e) {
    console.error("Gagal memuat kelurahan/desa:", e);
    villages.value = [];
  } finally {
    villagesLoading.value = false;
  }
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

onMounted(async () => {
  isLoading.value = true;
  await loadProvinces();

  // Kalau edit data lama (prefill)

  try {
    const res = await merchantProfile.getMerchantProfile(merchantId.value);
    const data = res.data;
  
    latitude.value = data.primary_address?.latitude ?? null;
    longitude.value = data.primary_address?.longitude ?? null;
    console.log(latitude.value, longitude.value);

    form.value.name = data.name;
    form.value.contact = data.phone;
    form.value.description = data.description;
    form.value.address = data.primary_address?.detail ?? '';
    form.value.province_id = data.primary_address?.province_id ?? null;
    
    if (form.value.province_id) {
      await loadCities(form.value.province_id);
    }
    
    form.value.city_id = data.primary_address?.city_id ?? null;
    if (form.value.city_id) {
      await loadDistricts(form.value.city_id);
    }
    
    form.value.district_id = data.primary_address?.district_id ?? null;
    if (form.value.district_id) {
      await loadVillages(form.value.district_id);
    }
    form.value.village_id = data.primary_address?.village_id ?? null;
    
    form.value.logo = data.logo_path
      ? import.meta.env.VITE_STORAGE_URL + data.logo_path
      : form.value.logo;
  
    form.value.coverImage = data.cover_path
      ? import.meta.env.VITE_STORAGE_URL + data.cover_path
      : form.value.coverImage;
  
    const hours = data.operational_hours ?? {};
  
    form.value.operationalHours = DAYS.map(day => {
      const item = hours[day.key];
  
      if (!item || item.is_open === false) {
        return {
          key: day.key,
          name: day.label,
          isOpen: false,
          open: null,
          close: null,
          hours: 'Tutup',
        };
      }
  
      return {
        key: day.key,
        name: day.label,
        isOpen: true,
        open: item.open,
        close: item.close,
        hours: `[${item.open} - ${item.close}]`,
      };
    });
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  } 
});

const googleMapsEmbedUrl = computed(() => {
  if (!latitude.value || !longitude.value) return null;

  return `https://www.google.com/maps?q=${latitude.value},${longitude.value}&z=15&output=embed`;
});

const onCoverSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  form.value.coverFile = file;
  form.value.coverImage = URL.createObjectURL(file);

  console.log('Cover file:', file);
};

const onLogoSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  form.value.logoFile = file;
  form.value.logo = URL.createObjectURL(file);

  console.log('Logo file:', file);
};

const handleUploadCover = () => {
  coverInput.value.click();
};

const handleUploadLogo = () => {
  logoInput.value.click();
};


const handleSetLocation = () => {
  tempLat.value = latitude.value;
  tempLng.value = longitude.value;
  showLocationModal.value = true;
};


const handleEditHours = (index) => {
  const day = form.value.operationalHours[index];

  editingDayIndex.value = index;
  tempOpen.value = day.open || '06:00';
  tempClose.value = day.close || '18:00';

  showHoursModal.value = true;
  console.log('Edit hours for day:', index);
};

const saveHours = () => {
  const day = form.value.operationalHours[editingDayIndex.value];

  day.open = tempOpen.value;
  day.close = tempClose.value;
  day.hours = `[${tempOpen.value} - ${tempClose.value}]`;
  day.isOpen = true;

  showHoursModal.value = false;
};

const saveLocation = () => {
  latitude.value = tempLat.value;
  longitude.value = tempLng.value;

  showLocationModal.value = false;

  console.log('Location saved:', latitude.value, longitude.value);
};

const buildOperationalHoursPayload = () => {
  const result = {};

  form.value.operationalHours.forEach(day => {
    result[day.key] = day.isOpen
      ? {
          is_open: true,
          open: day.open,
          close: day.close,
        }
      : {
          is_open: false,
        };
  });

  return result;
};


const handleSave = async () => {
  console.log('Saving changes...', form.value);

  try {
      isLoading.value = true;

      const fd = new FormData();

      // Basic info
      fd.append('name', form.value.name || '');
      fd.append('phone', form.value.contact || '');
      fd.append('description', form.value.description || '');

      // Address - only append if value exists (don't send empty strings for integers)
      if (form.value.province_id) {
        fd.append('province_id', form.value.province_id);
      }
      if (form.value.city_id) {
        fd.append('city_id', form.value.city_id);
      }
      if (form.value.district_id) {
        fd.append('district_id', form.value.district_id);
      }
      if (form.value.village_id) {
        fd.append('village_id', form.value.village_id);
      }
      if (form.value.address) {
        fd.append('address_detail', form.value.address);
      }

      // Coordinates - only append if value exists
      if (latitude.value != null && latitude.value !== '') {
        fd.append('latitude', latitude.value);
      }
      if (longitude.value != null && longitude.value !== '') {
        fd.append('longitude', longitude.value);
      }

      // Operational hours
      fd.append(
        'operational_hours',
        JSON.stringify(buildOperationalHoursPayload())
      );

      // Images (optional)
      if (form.value.logoFile) {
        fd.append('logo', form.value.logoFile);
      }

      if (form.value.coverFile) {
        fd.append('cover', form.value.coverFile);
      }

      await merchantProfile.updateMerchantProfile(merchantId.value, fd);

      toast.success('Profil UMKM berhasil diperbarui');
      // router.push(`/merchants/${merchantId.value}/profile`);
    } catch (error) {
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Show specific validation errors if available
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
      }
    } finally {
      isLoading.value = false;
    }
  // router.push(`/merchant-center/${merchantId.value}/profile`);
};
</script>

<style scoped>
@media (min-width: 640px) {
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #0891b2;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #047280;
  }
}

.fixed.z-40 {
  z-index: 40;
}
</style>