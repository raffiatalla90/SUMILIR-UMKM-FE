import { ref } from "vue";
import { getSegmentations } from "@/services/api/segmentation";
import { useToast } from "vue-toastification";

export function useSegmentations() {
  const toast = useToast();

  const segmentations = ref([]);
  const loading = ref(false);

  const normalizeSegmentation = (seg) => {
    if (!seg) return null;

    return {
      id: seg.id,
      name: seg.name,
      key: seg.name,
      label: seg.name,
    };
  };

  const fetchSegmentations = async () => {
    loading.value = true;
    try {
      const data = await getSegmentations();

      segmentations.value = (data || [])
        .map(normalizeSegmentation)
        .filter(Boolean);
    } catch (err) {
      toast.error("Gagal memuat segmentasi UMKM");
      segmentations.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    segmentations,
    loading,
    fetchSegmentations,
  };
}
