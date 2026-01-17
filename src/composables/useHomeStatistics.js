import { ref, onMounted, onBeforeUnmount } from 'vue';
import api from '@/libs/axios';

export function useHomeStatistics() {
    const statistics = ref({
        total_merchants: 0,
        total_products: 0,
        total_categories: 0,
    });

    const loading = ref(false);
    const error = ref(null);
    let refreshInterval = null;

    const fetchStatistics = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.get('/api/public/home/statistics');
            statistics.value = response.data;
        } catch (err) {
            error.value = err;
            console.error('Failed to fetch statistics:', err);
        } finally {
            loading.value = false;
        }
    };

    // Auto-refresh every 30 seconds
    const startAutoRefresh = () => {
        refreshInterval = setInterval(() => {
            fetchStatistics();
        }, 30000); // 30 seconds
    };

    const stopAutoRefresh = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    };

    // Auto-fetch on mount
    onMounted(() => {
        fetchStatistics();
        startAutoRefresh();
    });

    onBeforeUnmount(() => {
        stopAutoRefresh();
    });

    return {
        statistics,
        loading,
        error,
        fetchStatistics,
        stopAutoRefresh,
    };
}
