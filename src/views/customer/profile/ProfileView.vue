<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "@/stores/profile";
import { useAuthStore } from "@/stores/auth";
import { getMyMerchants } from "@/services/api/merchant";
import MobileHeader from "@/components/customer/MobileHeader.vue";

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const myMerchants = ref([]);
const merchantsLoading = ref(false);

const isInitialProfileLoading = computed(
  () => profileStore.loading && !profileStore.user
);

const imgLoaded = ref(!!profileStore.user?.profile_picture);
const imgError = ref(false);

// Menggunakan computed property untuk user dengan fallback
const user = computed(
  () =>
    profileStore.user || {
      name: "Guest",
      email: "",
      phone: "",
      nik: "",
      address: "",
      profile_picture: "https://via.placeholder.com/150", // Placeholder image
    }
);

watch(
  () => user.value?.profile_picture,
  () => {
    // Only show image skeleton when we actually have a URL to load.
    imgLoaded.value = false;
    imgError.value = false;
  }
);

const handleLogout = async () => {
  await authStore.logout();
  router.push("/auth/login");
};
const goBack = () => {
  router.back();
};

onMounted(async () => {
  // Ensure profile data is loaded
  if (!profileStore.user) {
    await profileStore.fetchProfile();
  }

  try {
    merchantsLoading.value = true;
    const res = await getMyMerchants();
    myMerchants.value = Array.isArray(res?.data) ? res.data : [];

    // Refresh auth store so route guards recognize the merchant
    if (myMerchants.value.length) {
      try {
        await authStore.initAuth();
      } catch {
        // ignore
      }
    }
  } catch {
    myMerchants.value = [];
  } finally {
    merchantsLoading.value = false;
  }
});

const menuItems = computed(() => [
  {
    icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    label: "Edit Profile",
    action: () => router.push("/profile/edit"),
  },
  {
    icon: "M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z",
    label: "Alamat Saya",
    action: () => router.push("/profile/address"),
  },
  {
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    label: "Ubah Kata Sandi",
    action: () => router.push("/profile/change-password"),
  },
]);

const merchantAccordionOpen = ref(false);

const addressText = computed(() => {
  const a = profileStore.user?.full_address ?? profileStore.user?.address;
  return a && String(a).trim() ? String(a).trim() : "-";
});
</script>

<template>
  <div class="sm:pb-0">
    <!-- Header -->
    <!-- <MobileHeader title="Profil" @back="goBack()" /> -->

    <!-- Content Container -->
    <div class="px-4 py-6 mx-auto max-w-7xl sm:px-8 sm:py-12">
      <!-- DESKTOP LAYOUT -->
      <div class="hidden gap-8 lg:grid lg:grid-cols-12">
        <!-- Left: Profile Card -->
        <div class="lg:col-span-4">
          <div
            class="sticky p-8 bg-white border border-gray-100 shadow-sm rounded-2xl top-24"
          >
            <div class="flex flex-col items-center">
              <div class="relative w-40 h-40">
                <div
                  v-if="isInitialProfileLoading || (!imgLoaded && !imgError)"
                  class="w-40 h-40 bg-gray-200 border-4 border-white rounded-full shadow-lg animate-pulse"
                />
                <img
                  v-if="
                    !isInitialProfileLoading &&
                    !imgError &&
                    typeof user.profile_picture === 'string'
                  "
                  :src="user.profile_picture"
                  :alt="user.name"
                  loading="lazy"
                  class="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
                  :class="imgLoaded ? '' : 'opacity-0'"
                  @load="imgLoaded = true"
                  @error="
                    imgError = true;
                    imgLoaded = true;
                  "
                />
                <span v-else>
                  <svg
                    class="w-40 h-40 p-8 text-gray-300 bg-gray-100 border-4 border-white rounded-full shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    />
                  </svg>
                </span>
              </div>

              <div
                v-if="isInitialProfileLoading"
                class="w-48 mt-6 bg-gray-200 rounded h-7 animate-pulse"
              />
              <h2 v-else class="mt-6 text-2xl font-bold text-gray-900">
                {{ user.name }}
              </h2>

              <!-- Quick Info -->
              <div class="w-full mt-8 space-y-4">
                <div
                  class="flex items-center min-w-0 gap-3 text-gray-600 flex-nowrap"
                >
                  <svg
                    class="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div
                    v-if="isInitialProfileLoading"
                    class="w-40 h-4 bg-gray-200 rounded animate-pulse"
                  />
                  <span v-else class="min-w-0 text-sm truncate">{{
                    user.email
                  }}</span>
                </div>
                <div
                  class="flex items-center min-w-0 gap-3 text-gray-600 flex-nowrap"
                >
                  <svg
                    class="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div
                    v-if="isInitialProfileLoading"
                    class="h-4 bg-gray-200 rounded w-28 animate-pulse"
                  />
                  <span v-else class="min-w-0 text-sm">{{ user.phone }}</span>
                </div>
                <div
                  class="flex items-start min-w-0 gap-3 text-gray-600 flex-nowrap"
                >
                  <svg
                    class="w-5 h-5 mt-0.5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 10c0 6-7 12-7 12S5 16 5 10a7 7 0 1114 0z"
                    />
                  </svg>
                  <div
                    v-if="isInitialProfileLoading"
                    class="w-full h-4 bg-gray-200 rounded animate-pulse"
                  />
                  <span v-else class="min-w-0 text-sm wrap-break-word">{{
                    addressText
                  }}</span>
                </div>
              </div>
            </div>

            <button
              @click="handleLogout"
              class="w-full py-3 mt-8 font-semibold text-white transition-all shadow-md rounded-xl bg-primary hover:bg-orange-600 hover:shadow-lg"
            >
              Keluar
            </button>
          </div>
        </div>

        <!-- Right: Menu List -->
        <div class="lg:col-span-8">
          <div
            class="p-8 bg-white border border-gray-100 shadow-sm rounded-2xl"
          >
            <h3 class="mb-6 text-xl font-bold text-gray-900">
              Pengaturan Akun
            </h3>
            <div class="space-y-3">
              <button
                v-for="item in menuItems"
                :key="item.label"
                @click="item.action"
                class="flex items-center w-full gap-4 p-5 text-left transition-all bg-gray-50 rounded-xl hover:bg-gray-100 group hover:shadow-md"
              >
                <div
                  class="p-3 transition-colors bg-white rounded-lg group-hover:bg-primary/10"
                >
                  <svg
                    class="w-6 h-6 text-gray-500 transition-colors group-hover:text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="item.icon"
                    />
                  </svg>
                </div>
                <span
                  class="flex-1 font-semibold text-gray-700 group-hover:text-gray-900"
                  >{{ item.label }}</span
                >
                <svg
                  class="w-5 h-5 text-gray-400 transition-colors group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <!-- Accordion for merchant access -->
              <div class="border border-gray-200 rounded-xl bg-gray-50">
                <button
                  class="flex items-center justify-between w-full px-5 py-4 text-left rounded-xl focus:outline-none"
                  @click="merchantAccordionOpen = !merchantAccordionOpen"
                >
                  <span class="font-semibold text-gray-700"
                    >Akses & Kelola Toko</span
                  >
                  <svg
                    :class="merchantAccordionOpen ? 'rotate-180' : ''"
                    class="w-5 h-5 text-gray-400 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  v-show="merchantAccordionOpen"
                  class="px-5 pt-2 pb-4 space-y-2"
                >
                  <template v-if="merchantsLoading">
                    <div class="space-y-2">
                      <div
                        class="w-full h-12 bg-gray-200 rounded-lg animate-pulse"
                      />
                      <div
                        class="w-full h-12 bg-gray-200 rounded-lg animate-pulse"
                      />
                    </div>
                  </template>
                  <template v-if="myMerchants.length">
                    <div
                      v-for="m in myMerchants.filter(
                        (m) => m && m.id && m.status === 'approved'
                      )"
                      :key="m.id"
                    >
                      <button
                        class="flex items-center w-full gap-3 px-4 py-3 mb-1 text-left transition-all bg-white rounded-lg hover:bg-primary/10 group hover:shadow"
                        @click="router.push(`/merchant-center/${m.slug}`)"
                      >
                        <svg
                          class="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span class="flex-1 font-medium text-gray-700"
                          >Akses Toko ({{ m.name || m.id }})</span
                        >
                        <svg
                          class="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </template>
                  <button
                    class="flex items-center w-full gap-3 px-4 py-3 mt-2 text-left transition-all bg-white rounded-lg hover:bg-primary/10 group hover:shadow"
                    @click="router.push('/merchant-register')"
                  >
                    <svg
                      class="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span class="flex-1 font-medium text-gray-700"
                      >Buka Toko Baru</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE LAYOUT -->
      <div class="lg:hidden">
        <div class="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div class="flex items-center gap-4">
            <div class="relative w-20 h-20">
              <div
                v-if="isInitialProfileLoading || (!imgLoaded && !imgError)"
                class="w-20 h-20 bg-gray-200 border-4 border-white rounded-full shadow animate-pulse"
              />
              <img
                v-if="
                  !isInitialProfileLoading &&
                  !imgError &&
                  typeof user.profile_picture === 'string'
                "
                :src="user.profile_picture"
                :alt="user.name"
                loading="lazy"
                class="object-cover w-20 h-20 border-4 border-white rounded-full shadow-lg"
                :class="imgLoaded ? '' : 'opacity-0'"
                @load="imgLoaded = true"
                @error="
                  imgError = true;
                  imgLoaded = true;
                "
              />
              <span v-else>
                <svg
                  class="w-20 h-20 p-4 text-gray-300 bg-gray-100 border-4 border-white rounded-full shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </span>
            </div>
            <div class="min-w-0">
              <div
                v-if="isInitialProfileLoading"
                class="w-40 h-5 bg-gray-200 rounded animate-pulse"
              />
              <h2 v-else class="text-lg font-semibold text-gray-900">
                {{ user.name }}
              </h2>
              <div class="mt-1 space-y-1">
                <div v-if="isInitialProfileLoading" class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-44 animate-pulse" />
                  <div class="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 bg-gray-200 rounded w-52 animate-pulse" />
                </div>
                <template v-else>
                  <p class="text-sm text-gray-600">{{ user.email }}</p>
                  <p class="text-sm text-gray-600">{{ user.phone }}</p>
                  <p class="text-sm text-gray-600">{{ addressText }}</p>
                </template>
              </div>
            </div>
          </div>

          <button
            @click="handleLogout"
            class="w-full py-3 mt-5 font-semibold text-white transition-all shadow-md rounded-xl bg-primary hover:bg-orange-600 hover:shadow-lg"
          >
            Keluar
          </button>
        </div>

        <div
          class="p-5 mt-5 bg-white border border-gray-100 shadow-sm rounded-2xl"
        >
          <h3 class="mb-4 text-lg font-bold text-gray-900">Pengaturan Akun</h3>

          <div class="space-y-3">
            <button
              v-for="item in menuItems"
              :key="item.label"
              @click="item.action"
              class="flex items-center w-full gap-4 p-4 text-left transition-colors bg-gray-50 rounded-xl hover:bg-gray-100 group"
            >
              <div
                class="p-2 transition-colors bg-white rounded-lg group-hover:bg-primary/10"
              >
                <svg
                  class="w-5 h-5 text-gray-500 transition-colors group-hover:text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="item.icon"
                  />
                </svg>
              </div>
              <span
                class="flex-1 font-medium text-gray-700 group-hover:text-gray-900"
                >{{ item.label }}</span
              >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <!-- Accordion for merchant access (mobile) -->
            <div class="border border-gray-200 rounded-xl bg-gray-50">
              <button
                class="flex items-center justify-between w-full px-4 py-4 text-left rounded-xl focus:outline-none"
                @click="merchantAccordionOpen = !merchantAccordionOpen"
              >
                <span class="font-semibold text-gray-700"
                  >Akses & Kelola Toko</span
                >
                <svg
                  :class="merchantAccordionOpen ? 'rotate-180' : ''"
                  class="w-5 h-5 text-gray-400 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                v-show="merchantAccordionOpen"
                class="px-4 pt-1 pb-4 space-y-2"
              >
                <template v-if="myMerchants.length">
                  <div
                    v-for="m in myMerchants.filter(
                      (m) => m && m.id && m.status === 'approved'
                    )"
                    :key="m.id"
                  >
                    <button
                      class="flex items-center w-full gap-3 px-4 py-3 text-left transition-all bg-white rounded-lg hover:bg-primary/10 group"
                      @click="router.push(`/merchant-center/${m.slug}`)"
                    >
                      <svg
                        class="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span class="flex-1 font-medium text-gray-700 truncate"
                        >Akses Toko ({{ m.name || m.id }})</span
                      >
                      <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </template>

                <button
                  class="flex items-center w-full gap-3 px-4 py-3 mt-2 text-left transition-all bg-white rounded-lg hover:bg-primary/10 group"
                  @click="router.push('/merchant-register')"
                >
                  <svg
                    class="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span class="flex-1 font-medium text-gray-700"
                    >Buka Toko Baru +</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
