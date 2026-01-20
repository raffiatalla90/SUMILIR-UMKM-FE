import { ref, computed, watch } from "vue";

export function useProductCombinations({
  variants,
  useVariants,
  maxCombinations,
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

  const buildComboKey = (combo) => {
    const parts = (combo?.attributes ?? [])
      .map((a) => {
        const id = a?.option_value_id;
        if (id !== undefined && id !== null && String(id).trim() !== "") {
          return `id:${String(id)}`;
        }
        const n = String(a?.name ?? "")
          .trim()
          .toLowerCase();
        const v = String(a?.value ?? "")
          .trim()
          .toLowerCase();
        return `nv:${n}:${v}`;
      })
      .sort();
    return parts.join("|");
  };

  const buildAllCombinationsFromVariants = () => {
    const valid = variants.value.filter(
      (v) => v.name.trim() && v.options.some((o) => o.name.trim()),
    );

    const result = [];

    const walk = (idx, cur) => {
      if (idx === valid.length) {
        result.push({ ...cur, attributes: [...cur.attributes] });
        return;
      }

      valid[idx].options
        .filter((o) => o.name.trim())
        .forEach((opt) => {
          const nextAttributes = [
            ...cur.attributes,
            {
              option_value_id: opt.id ?? null,
              name: valid[idx].name,
              value: opt.name,
            },
          ];

          walk(idx + 1, {
            combination: cur.combination
              ? `${cur.combination} - ${opt.name}`
              : opt.name,
            sku: "",
            price: 0,
            stock: 0,
            attributes: nextAttributes,
          });
        });
    };

    walk(0, { combination: "", attributes: [] });
    return result;
  };

  const syncCombinations = () => {
    if (!useVariants.value) {
      combinations.value = [];
      selectedCombinations.value.clear();
      return;
    }

    const generated = buildAllCombinationsFromVariants();
    if (generated.length > maxCombinations) {
      toast.error(`Kombinasi maksimal ${maxCombinations}`);
      return;
    }

    const existingByKey = new Map(
      (combinations.value ?? []).map((c) => [buildComboKey(c), c]),
    );

    const merged = generated.map((g) => {
      const key = buildComboKey(g);
      const existing = existingByKey.get(key);

      if (!existing) return g;

      return {
        ...g,
        id: existing.id ?? null,
        sku: existing.sku ?? "",
        price:
          existing.price !== undefined && existing.price !== null
            ? Number(existing.price)
            : Number(g.price),
        stock:
          existing.stock !== undefined && existing.stock !== null
            ? Number(existing.stock)
            : Number(g.stock),
      };
    });

    combinations.value = merged;
    selectedCombinations.value.clear();
  };

  watch([variants, useVariants], syncCombinations, {
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
        "Belum ada kombinasi. Tambahkan varian dan opsi terlebih dahulu.",
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
        combinations.value.map((_, index) => index),
      );
    }
  };

  const setCombinationsFromBackend = (backendVariants) => {
    combinations.value = (backendVariants ?? []).map((v) => {
      const optionValues = v.option_values ?? v.optionValues ?? [];

      return {
        id: v.id,
        combination: optionValues.map((ov) => ov.option_value).join(" - "),
        sku: v.sku || "",
        price: Number(v.price),
        stock: Number(v.stock),
        attributes: optionValues.map((ov) => ({
          option_value_id: ov.id,
          name: ov.option_name,
          value: ov.option_value,
        })),
      };
    });

    isHydratedFromBackend.value = true;
    // After hydration, combinations must still stay in sync with edits to variants/options.
    // The watcher will merge + preserve existing IDs via comboKey.
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
