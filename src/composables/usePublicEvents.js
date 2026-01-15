import { ref } from 'vue';
import api from '@/libs/axios';

export function usePublicEvents() {
    const events = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchPublicEvents = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.get('/api/public/events');
            events.value = response.data.data || [];
            return events.value;
        } catch (err) {
            error.value = err;
            console.error('Failed to fetch public events:', err);
            return [];
        } finally {
            loading.value = false;
        }
    };

    return {
        events,
        loading,
        error,
        fetchPublicEvents,
    };
}
