import { ref } from 'vue';
import api from '@/libs/axios';

const cachedEvents = ref(null);
const lastFetchTime = ref(0);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function usePublicEvents() {
    const events = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const fetchPublicEvents = async (forceRefresh = false) => {
        const now = Date.now();
        if (!forceRefresh && cachedEvents.value && (now - lastFetchTime.value) < CACHE_DURATION) {
            events.value = cachedEvents.value;
            return events.value;
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await api.get('/api/public/events');
            const fetchedEvents = response.data.data || [];

            // ✅ Update cache
            cachedEvents.value = fetchedEvents;
            lastFetchTime.value = now;
            events.value = fetchedEvents;

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
