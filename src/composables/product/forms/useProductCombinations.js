import { ref, computed, watch } from "vue";

export function useProductCombinations({
  variants,
  useVariants,
  maxOptions,
  toast,
}) {
  const combinations = ref([]);
  const selectedCombinations = ref(new Set());
  const showCombinationsModal = ref(false);
  const bulkPrice = ref(0);
  const bulkStock = ref(0);
  const isHydratedFromBackend = ref(false);

  const totalCombinations = computed(() => {
    if (!useVariants.value) return 0;
    return variants.value.reduce((t, v) => {
      const count = v.options.filter((o) => o.name.trim()).length;
      return t === 0 ? count : t * count;
    }, 0);
  });

  const generateCombinations = () => {
    if (!useVariants.value) return;

    if (isHydratedFromBackend.value) return;

    const valid = variants.value.filter(
      (v) => v.name.trim() && v.options.some((o) => o.name.trim())
    );

    const result = [];

    const walk = (idx, cur) => {
      if (idx === valid.length) {
        result.push({ ...cur });
        return;
      }
      valid[idx].options
        .filter((o) => o.name.trim())
        .forEach((opt) => {
          walk(idx + 1, {
            combination: cur.combination
              ? `${cur.combination} - ${opt.name}`
              : opt.name,
            sku: "",
            price: 0,
            stock: 0,
            attributes: [
              ...cur.attributes,
              { name: valid[idx].name, value: opt.name },
            ],
          });
        });
    };

    walk(0, { combination: "", attributes: [] });

    if (result.length > maxOptions) {
      toast.error(`Kombinasi maksimal ${maxOptions}`);
      return;
    }

    combinations.value = result;
    selectedCombinations.value.clear();
  };

  watch([variants, useVariants], generateCombinations, {
    deep: true,
  });

  const toggleCombinationSelection = (index) => {
    const next = new Set(selectedCombinations.value);
    next.has(index) ? next.delete(index) : next.add(index);
    selectedCombinations.value = next;
  };

  const applyBulkEdit = () => {
    selectedCombinations.value.forEach((i) => {
      if (bulkPrice.value >= 0) combinations.value[i].price = bulkPrice.value;
      if (bulkStock.value >= 0) combinations.value[i].stock = bulkStock.value;
    });
  };
  const openCombinationsModal = () => {
    if (totalCombinations.value === 0) {
      toast.warning(
        "Belum ada kombinasi. Tambahkan varian dan opsi terlebih dahulu."
      );
      return;
    }
    showCombinationsModal.value = true;
  };

  const closeCombinationsModal = () => {
    showCombinationsModal.value = false;
    bulkPrice.value = 0;
    bulkStock.value = 0;
    selectedCombinations.value.clear();
  };

  const toggleAllCombinations = () => {
    if (selectedCombinations.value.size === combinations.value.length) {
      // Unselect all
      selectedCombinations.value = new Set();
    } else {
      // Select all
      selectedCombinations.value = new Set(
        combinations.value.map((_, index) => index)
      );
    }
  };

  const setCombinationsFromBackend = (backendVariants) => {
    combinations.value = backendVariants.map((v) => ({
      id: v.id,
      combination: v.option_values.map((ov) => ov.option_value).join(" - "),
      sku: v.sku || "",
      price: Number(v.price),
      stock: Number(v.stock),
      attributes: v.option_values.map((ov) => ({
        option_value_id: ov.id,
        name: ov.option_name,
        value: ov.option_value,
      })),
    }));

    isHydratedFromBackend.value = true;
  };

  return {
    combinations,
    selectedCombinations,
    showCombinationsModal,
    bulkPrice,
    bulkStock,
    totalCombinations,
    toggleCombinationSelection,
    applyBulkEdit,
    openCombinationsModal,
    closeCombinationsModal,
    toggleAllCombinations,
    setCombinationsFromBackend,
  };
}
