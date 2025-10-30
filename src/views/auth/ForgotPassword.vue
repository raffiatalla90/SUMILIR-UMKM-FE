<template>
  <div class="max-w-md mx-auto px-4 py-10">
    <div class="bg-white border rounded-2xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 3a6 6 0 1 0 3.917 10.566l2.258 2.258A2 2 0 0 0 20.586 17H21a1 1 0 1 0 0-2h-.586l-.707-.707.293-.293H21a1 1 0 1 0 0-2h-2a1 1 0 0 0-.707.293l-.293.293-1.758-1.758A6 6 0 0 0 12 3Zm-4 6a4 4 0 1 1 8.001.001A4 4 0 0 1 8 9Z"
            />
          </svg>
        </span>
        <h1 class="text-xl font-bold">Lupa Password</h1>
      </div>

      <p class="text-sm text-gray-700 mb-6">
        Masukkan email Anda. Kami akan mengirim tautan untuk mengatur ulang
        password.
      </p>

      <Form @submit="handleSubmit" :validation-schema="schema">
        <div class="space-y-4">
          <TextField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <AppButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading || cooldown > 0"
            variant="primary"
            size="md"
            block
          >
            <span v-if="cooldown > 0">Kirim Ulang ({{ cooldown }}s)</span>
            <span v-else>Kirim Link Reset</span>
          </AppButton>

          <p v-if="cooldown > 0" class="text-xs text-gray-500 text-center">
            Anda dapat meminta ulang dalam {{ cooldown }} detik.
          </p>

          <AppButton
            type="button"
            variant="outline"
            size="md"
            block
            @click="goToLogin"
          >
            Kembali ke Login
          </AppButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Form } from "vee-validate";
import * as yup from "yup";
import api from "@/libs/axios";
import { useToast } from "vue-toastification";
import TextField from "@/components/forms/TextField.vue";
import AppButton from "@/components/common/Button.vue";

const router = useRouter();
const toast = useToast();
const isLoading = ref(false);
const cooldown = ref(0);
let cooldownTimer = null;

const COOLDOWN_KEY = "fp_cooldown_until";

const schema = yup.object({
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
});

function persistCooldownUntil(seconds) {
  const until = Date.now() + seconds * 1000;
  localStorage.setItem(COOLDOWN_KEY, String(until));
}

function readPersistedCooldown() {
  const untilStr = localStorage.getItem(COOLDOWN_KEY);
  if (!untilStr) return 0;
  const until = Number(untilStr);
  const remainMs = until - Date.now();
  return remainMs > 0 ? Math.ceil(remainMs / 1000) : 0;
}

function clearPersistedCooldown() {
  localStorage.removeItem(COOLDOWN_KEY);
}

function startCooldown(seconds) {
  cooldown.value = seconds;
  persistCooldownUntil(seconds);
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    const remain = readPersistedCooldown();
    cooldown.value = remain;
    if (remain <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      clearPersistedCooldown();
      cooldown.value = 0;
    }
  }, 1000);
}

onMounted(() => {
  const remain = readPersistedCooldown();
  if (remain > 0) startCooldown(remain);
});

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

async function handleSubmit(values) {
  if (cooldown.value > 0) return;
  isLoading.value = true;
  try {
    const res = await api.post("/auth/forgot-password", {
      email: values.email,
    });
    // Ambil durasi dari header Retry-After (detik); fallback ke DEFAULT_COOLDOWN
    const seconds = Number(res.headers?.["retry-after"]);

    toast.success("Tautan reset telah dikirim.", { timeout: 4000 });
    startCooldown(seconds); // mulai countdown langsung setelah sukses
  } catch (e) {
    const status = e.response?.status;
    if (status === 429) {
      const seconds =
        Number(e.response?.data?.retry_after) ||
        Number(e.response?.headers?.["retry-after"]);
      startCooldown(seconds);
      toast.error(
        `Terlalu banyak permintaan. Coba lagi dalam ${seconds} detik.`,
        { timeout: 4000 }
      );
    } else {
      const msg =
        e.response?.data?.message || "Gagal mengirim tautan reset. Coba lagi.";
      toast.error(msg, { timeout: 4000 });
    }
  } finally {
    isLoading.value = false;
  }
}

function goToLogin() {
  router.push({ name: "Login" }).catch(() => router.push("/login"));
}
</script>
