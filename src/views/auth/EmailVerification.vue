<template>
  <div class="max-w-md mx-auto px-4 py-10">
    <div class="bg-white border rounded-2xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <!-- Mail icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.5-.5a.5.5 0 0 0-.5.5v.382l7.59 5.06a1 1 0 0 0 1.12 0L20 6.882V6.5a.5.5 0 0 0-.5-.5h-15Zm15.5 3.382-6.67 4.446a3 3 0 0 1-3.36 0L3 9.382V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V9.382Z"
            />
          </svg>
        </span>
        <h1 class="text-xl font-bold">Verifikasi Email</h1>
      </div>

      <p class="text-sm text-gray-700 mb-4" v-if="status === ''">
        Kami telah mengirim tautan verifikasi ke email Anda. Silakan cek inbox
        atau folder spam.
      </p>

      <div
        v-if="status === 'verified'"
        class="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-700 p-3 text-sm"
      >
        Email Anda berhasil diverifikasi. Silakan masuk untuk melanjutkan.
      </div>
      <div
        v-else-if="status === 'already_verified'"
        class="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 p-3 text-sm"
      >
        Email sudah terverifikasi. Anda dapat langsung masuk.
      </div>
      <div
        v-else-if="status === 'invalid'"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm"
      >
        Link verifikasi tidak valid atau sudah kadaluarsa. Kirim ulang link
        verifikasi.
      </div>

      <div class="flex flex-col sm:flex-row gap-2 mt-6">
        <AppButton
          type="button"
          variant="primary"
          size="md"
          :loading="sending"
          :disabled="!isAuthenticated && !email"
          @click="resend"
          class="w-full sm:w-auto"
        >
          Kirim ulang email verifikasi
        </AppButton>

        <AppButton
          type="button"
          variant="outline"
          size="md"
          class="w-full sm:w-auto"
          @click="goToLogin"
        >
          Ke Halaman Login
        </AppButton>
      </div>

      <div v-if="mailProviderUrl" class="mt-4">
        <a
          :href="mailProviderUrl"
          target="_blank"
          rel="noopener"
          class="text-primary text-sm underline"
        >
          Buka {{ mailDomain }} Mailbox
        </a>
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
const status = computed(() => (route.query.status || "").toString());
const email = ref((route.query.email || "").toString());
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

const mailDomain = computed(() => {
  const match = email.value.match(/@([\w.-]+)/);
  return match ? match[1].toLowerCase() : "";
});
const mailProviderUrl = computed(() => {
  const d = mailDomain.value;
  if (!d) return "";
  if (d.includes("gmail")) return "https://mail.google.com/";
  if (d.includes("yahoo")) return "https://mail.yahoo.com/";
  if (d.includes("outlook") || d.includes("hotmail") || d.includes("live"))
    return "https://outlook.live.com/";
  return `https://${d}`;
});

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
