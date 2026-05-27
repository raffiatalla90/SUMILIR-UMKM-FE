<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const bookingData = ref(null);
const loading = ref(true);

onMounted(() => {
  const queryData = route.query;

  if (queryData.booking_id) {
    bookingData.value = {
      id: queryData.booking_id,
      merchant_name: queryData.merchant || "Merchant",
      service_title: queryData.service || "Layanan",
      price: queryData.price || 0,
      date: queryData.date || new Date().toLocaleDateString("id-ID"),
      time: queryData.time || "09:00",
      customer_name: queryData.customer_name || "Customer",
      customer_phone: queryData.customer_phone || "-",
      status: "confirmed"
    };
  } else {
    const stored = sessionStorage.getItem("pending_booking");
    if (stored) {
      bookingData.value = JSON.parse(stored);
    }
  }

  loading.value = false;
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const goToHome = () => {
  router.push("/");
};

const viewBooking = () => {
  if (bookingData.value?.id) {
    router.push(`/bookings/${bookingData.value.id}`);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-4 sm:py-8 px-4">
    <!-- Mobile Layout (default) -->
    <div class="max-w-lg mx-auto lg:hidden">
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-check text-3xl text-green-500"></i>
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Booking Berhasil!</h1>
          <p class="text-green-100">Pesanan Anda telah dikonfirmasi</p>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
          </div>

          <div v-else-if="bookingData" class="space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">Merchant</span>
                <span class="font-medium text-gray-800">{{ bookingData.merchant_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Layanan</span>
                <span class="font-medium text-gray-800">{{ bookingData.service_title }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Tanggal</span>
                <span class="font-medium text-gray-800">{{ bookingData.date }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Jam</span>
                <span class="font-medium text-gray-800">{{ bookingData.time }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Dikonfirmasi
                </span>
              </div>
            </div>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p class="text-sm text-blue-700">
                <i class="pi pi-info-circle mr-2"></i>
                Detail booking telah dikirim ke email Anda.
              </p>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <i class="pi pi-inbox text-4xl mb-3"></i>
            <p>Tidak ada data booking ditemukan</p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="goToHome"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              <i class="pi pi-home mr-2"></i>
              Kembali
            </button>
            <button
              @click="viewBooking"
              class="flex-1 px-4 py-3 bg-merchant-primary text-white rounded-xl font-medium hover:bg-merchant-primary/90 transition"
            >
              <i class="pi pi-calendar mr-2"></i>
              Lihat Booking
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Layout (lg: and above) -->
    <div class="hidden lg:block max-w-4xl mx-auto">
      <div class="grid grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="col-span-2 space-y-6">
          <!-- Success Card -->
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
              <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i class="pi pi-check text-4xl text-green-500"></i>
              </div>
              <h1 class="text-3xl font-bold text-white mb-2">Booking Berhasil!</h1>
              <p class="text-green-100 text-lg">Pesanan Anda telah dikonfirmasi</p>
            </div>

            <div class="p-6">
              <div v-if="loading" class="text-center py-8">
                <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
              </div>

              <div v-else-if="bookingData" class="space-y-4">
                <h3 class="font-semibold text-gray-800 border-b pb-2">Detail Booking</h3>
                <div class="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-500">Merchant</span>
                    <span class="font-medium text-gray-800">{{ bookingData.merchant_name }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-500">Layanan</span>
                    <span class="font-medium text-gray-800">{{ bookingData.service_title }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-500">Tanggal</span>
                    <span class="font-medium text-gray-800">{{ bookingData.date }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-500">Jam</span>
                    <span class="font-medium text-gray-800">{{ bookingData.time }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-500">Status</span>
                    <span class="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Dikonfirmasi
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <i class="pi pi-inbox text-4xl mb-3"></i>
                <p>Tidak ada data booking ditemukan</p>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-info-circle text-blue-600"></i>
              </div>
              <div>
                <h4 class="font-semibold text-blue-800 mb-1">Informasi Penting</h4>
                <p class="text-sm text-blue-700">
                  Detail booking telah dikirim ke email Anda. Anda juga bisa melihatnya di menu "Pesanan Saya" untuk melacak status booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Summary -->
        <div class="col-span-1 space-y-6">
          <!-- Summary Card -->
          <div class="bg-white rounded-2xl shadow-sm p-5 sticky top-6">
            <h3 class="font-semibold text-gray-800 mb-4 pb-3 border-b">Ringkasan Booking</h3>

            <div v-if="bookingData" class="space-y-4">
              <div class="text-center py-4 bg-green-50 rounded-xl">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i class="pi pi-check text-white text-xl"></i>
                </div>
                <p class="text-green-700 font-medium">Berhasil</p>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Layanan</span>
                  <span class="font-medium text-gray-800 text-right">{{ bookingData.service_title }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Tanggal</span>
                  <span class="text-gray-700">{{ bookingData.date }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Waktu</span>
                  <span class="text-gray-700">{{ bookingData.time }}</span>
                </div>
              </div>

              <div class="pt-4 border-t space-y-3">
                <button
                  @click="viewBooking"
                  class="w-full px-4 py-3 bg-merchant-primary text-white rounded-xl font-medium hover:bg-merchant-primary/90 transition flex items-center justify-center gap-2"
                >
                  <i class="pi pi-calendar"></i>
                  Lihat Detail Booking
                </button>
                <button
                  @click="goToHome"
                  class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                >
                  <i class="pi pi-home"></i>
                  Kembali ke Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>