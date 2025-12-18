<template>
  <div
    class="sm:bg-gray-50 bg-primary flex items-center flex-col sm:justify-center justify-end sm:pb-8"
  >
    <!-- Mobile header -->
    <div
      class="sm:hidden flex flex-col flex-1/3 justify-end sm:px-0 px-4 py-2 sm:pt-0 pt-8"
    >
      <h2
        class="sm:hidden inline text-2xl sm:text-3xl font-bold text-center sm:text-left mb-2 text-white"
      >
        Verifikasi Email
      </h2>
      <p
        class="sm:hidden inline text-[10px] sm:text-sm text-center sm:text-left mb-6 text-white"
      >
        Cek inbox Anda dan verifikasi email untuk melanjutkan
      </p>
    </div>

    <div
      class="flex flex-col justify-center sm:flex-0 flex-2/3 p-8 sm:p-12 sm:max-w-xl w-full bg-white sm:rounded-4xl rounded-t-4xl sm:shadow-lg shadow-none"
    >
      <!-- Desktop header -->
      <div class="hidden sm:flex items-center gap-3 mb-2">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <i class="pi pi-envelope"></i>
        </span>
        <h1 class="text-xl font-bold text-black">Verifikasi Email</h1>
      </div>

      <p
        class="hidden sm:block text-xs sm:text-sm text-center sm:text-left mb-6 text-gray-600"
        v-if="status === ''"
      >
        Kami telah mengirim tautan verifikasi ke email Anda. Silakan cek inbox
        atau folder spam.
      </p>

      <div
        v-if="status === 'verified'"
        class="sm:mb-4 mb-0 rounded-lg border border-green-200 bg-green-50 text-green-700 p-3 text-sm"
      >
        Email Anda berhasil diverifikasi. Silakan masuk untuk melanjutkan.
      </div>
      <div
        v-else-if="status === 'already_verified'"
        class="sm:mb-4 mb-0 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 p-3 text-sm"
      >
        Email sudah terverifikasi. Anda dapat langsung masuk.
      </div>
      <div
        v-else-if="status === 'invalid'"
        class="sm:mb-4 mb-0 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm"
      >
        Link verifikasi tidak valid atau sudah kadaluarsa. Kirim ulang link
        verifikasi.
      </div>

      <div class="flex flex-col gap-2 mt-6">
        <!-- Jika ingin menampilkan tombol resend, tinggal uncomment blok di bawah -->
        <!--
        <AppButton
          type="button"
          variant="primary"
          size="md"
          :loading="sending"
          :disabled="!isAuthenticated && !email"
          @click="resend"
          block
        >
          Kirim ulang email verifikasi
        </AppButton>
        -->

        <AppButton
          type="button"
          variant="primary-outline"
          size="md"
          @click="goToLogin"
          block
        >
          Ke Halaman Login
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";
import AppButton from "@/components/common/Button.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();

let auth = null;
try {
  auth = useAuthStore();
} catch {}

const isAuthenticated = computed(() => !!auth?.isAuthenticated?.value);
const status = computed(() => (route?.query?.status || "").toString());
const email = ref((route?.query?.email || "").toString());
const sending = ref(false);

// Tampilkan toast sekali per perubahan status
const lastStatusToast = ref("");
watch(
  () => status.value,
  (val) => {
    if (!val || val === lastStatusToast.value) return;
    if (val === "verified") toast.success("Email berhasil diverifikasi.");
    else if (val === "already_verified")
      toast.info("Email sudah terverifikasi.");
    else if (val === "invalid")
      toast.error("Link verifikasi tidak valid atau kadaluarsa.");
    lastStatusToast.value = val;
  },
  { immediate: true }
);

async function resend() {
  sending.value = true;
  try {
    if (isAuthenticated.value) {
      await api.post("/auth/email/verification-notification");
    } else {
      if (!email.value) {
        toast.error("Email wajib diisi");
        return;
      }
      await api.post("/auth/resend-verification", { email: email.value });
    }
    toast.success("Tautan verifikasi telah dikirim. Periksa inbox Anda.");
  } catch (e) {
    const msg = e.response?.data?.message || "Gagal mengirim email verifikasi.";
    toast.error(msg);
  } finally {
    sending.value = false;
  }
}

function goToLogin() {
  router.push({ name: "Login" }).catch(() => router.push("/login"));
}
</script>
