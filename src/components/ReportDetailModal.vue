<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Detail Laporan
        </h3>
        <button
          @click="$emit('close')"
          class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X :size="24" class="text-gray-500" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <span :class="getStatusBadgeClass(report.status)">
            {{ getStatusLabel(report.status) }}
          </span>
        </div>

        <!-- Reportable Info -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Konten yang Dilaporkan
          </label>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Tipe: <span class="font-medium">{{ getTypeLabel(report.reportable_type) }}</span>
            </p>
            <p class="font-medium text-gray-900 dark:text-white mt-1">
              {{ report.reportable_name }}
            </p>
          </div>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alasan Laporan
          </label>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="font-medium text-gray-900 dark:text-white">
              {{ report.reason?.reason_title }}
            </p>
            <p v-if="report.reason?.reason_description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ report.reason.reason_description }}
            </p>
          </div>
        </div>

        <!-- Comment -->
        <div v-if="report.report_comment">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keterangan Tambahan
          </label>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ report.report_comment }}
            </p>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Timeline
          </label>
          <div class="space-y-3">
            <!-- Submitted -->
            <div class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check :size="16" class="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Laporan Dikirim</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(report.created_at) }}
                </p>
              </div>
            </div>

            <!-- Reviewed (if applicable) -->
            <div v-if="report.reviewed_at" class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Eye :size="16" class="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">Ditinjau oleh Admin</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(report.reviewed_at) }}
                </p>
                <p v-if="report.reviewed_by || report.reviewer?.name" class="text-sm text-gray-600 dark:text-gray-400">
                  Oleh: {{ report.reviewed_by || report.reviewer?.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Note -->
        <div v-if="report.admin_note">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catatan Admin
          </label>
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ report.admin_note }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, Check, Eye } from 'lucide-vue-next';

defineProps({
  report: {
    type: Object,
    required: true,
  },
});

defineEmits(['close']);

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_review: 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    resolved: 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    dismissed: 'inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return classes[status] || classes.pending;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu Peninjauan',
    in_review: 'Sedang Ditinjau',
    resolved: 'Diselesaikan',
    dismissed: 'Ditolak',
  };
  return labels[status] || status;
};

const normalizeType = (type) => {
  if (!type) return type;
  const raw = type.split('\\').pop();
  const lower = raw.toLowerCase();
  if (lower === 'communitypost') return 'post';
  if (lower === 'postcomment') return 'post_comment';
  if (lower === 'jasa') return 'service';
  return lower;
};

const getTypeLabel = (type) => {
  const labels = {
    product: 'Produk',
    service: 'Jasa',
    merchant: 'Merchant',
    post: 'Postingan',
    post_comment: 'Komentar',
    user: 'Pengguna',
  };
  return labels[normalizeType(type)] || type;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
