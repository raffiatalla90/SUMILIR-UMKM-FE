<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/products/Create.vue
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth"; // ✅ ADD: Import auth store
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import { Form, Field, useForm } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import api from "@/libs/axios";
import { useCategories } from "@/composables/useCategories";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore(); // ✅ ADD: Get auth store
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_COMBINATIONS = 50;

// ✅ FIXED: Get merchantId from route params
const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

// ✅ ADD: Validate merchant ownership
const isValidMerchant = computed(() => {
  if (!currentMerchantId.value) return false;

  // Check if user owns this merchant
  const merchant = authStore.getMerchantById(currentMerchantId.value);
  return !!merchant;
});

// ✅ Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "Produk",
    path: `/merchant-center/${currentMerchantId.value}/products`,
  },
  {
    label: "Tambah Produk",
  },
]);

// ✅ Use categories composable
const {
  categoriesLevel1,
  categoriesLevel2,
  loadingLevel1,
  loadingLevel2,
  fetchLevel1Categories,
  fetchSubCategories,
} = useCategories();

// ============================================================
// STATE MANAGEMENT
// ============================================================
const loading = ref(false);
const useVariants = ref(false);
const variantUsesImages = ref({});

// ✅ REMOVED: Hardcoded merchantId
// const merchantId = ref(1); // ❌ DELETE THIS

const name = ref("");
const description = ref("");

// Images
const productImages = ref([]);
const fileInput = ref(null);
const coverImageIndex = ref(0);
const draggedImageIndex = ref(null);

// Categories
const selectedCategory = ref(null);
const selectedSubCategories = ref([]);

// Variants
const variants = ref([]);
const variantNames = ref({});
const maxVariants = 2;
const maxOptions = 50;

// Combinations
const combinations = ref([]);
const showCombinationsModal = ref(false);
const bulkPrice = ref(0);
const bulkStock = ref(0);
const selectedCombinations = ref(new Set());
useBodyScrollLock(showCombinationsModal);

// Add-on Groups
const addOnGroups = ref([]);
const maxAddOnGroups = 10;
const maxAddOnOptions = 10;

// Accordion States
const expandedVariants = ref(new Set());
const expandedAddOnGroups = ref(new Set());

// ✅ ADD: Deklarasi reactive values untuk form binding
const formPrice = ref(0);
const formStock = ref(0);
const formMinPurchase = ref(1);
const formSku = ref("");

// ============================================================
// VALIDATION SCHEMA
// ============================================================
const schema = yup.object({
  name: yup.string().required("Nama produk wajib diisi"),
  description: yup.string().required("Deskripsi wajib diisi"),
  category_id: yup.number().required("Kategori utama wajib dipilih"),
  sku: yup
    .string()
    .max(100, "SKU maksimal 100 karakter")
    .when([], {
      is: () => !useVariants.value,
      then: (schema) => schema.nullable(),
    }),
  price: yup
    .number()
    .min(0, "Harga minimal 0")
    .when([], {
      is: () => !useVariants.value,
      then: (schema) => schema.required("Harga wajib diisi"),
    }),
  stock: yup
    .number()
    .integer("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
    .max(9999, "Stok maksimal 9999")
    .when([], {
      is: () => !useVariants.value,
      then: (schema) => schema.required("Stok wajib diisi"),
    }),
  min_purchase: yup
    .number()
    .integer("Minimal pembelian harus bilangan bulat")
    .min(1, "Minimal pembelian minimal 1")
    .required("Minimal pembelian wajib diisi"),
});

// ============================================================
// VEE-VALIDATE SETUP
// ============================================================
const {
  handleSubmit: veeHandleSubmit,
  errors,
  values,
  setFieldValue,
  validate,
} = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    description: "",
    category_id: null,
    min_purchase: 1,
    sku: "",
    price: 0,
    stock: 0,
  },
});

// ============================================================
// LIFECYCLE HOOKS
// ============================================================
onMounted(async () => {

  // ✅ ADD: Validate merchantId on mount
  if (!currentMerchantId.value) {
    toast.error("Merchant ID tidak valid");
    router.push("/merchant-center");
    return;
  }

  // ✅ ADD: Validate merchant ownership
  if (!isValidMerchant.value) {
    toast.error("Anda tidak memiliki akses ke merchant ini");
    router.push("/merchant-center");
    return;
  }

  await fetchLevel1Categories();
});

// ============================================================
// WATCHERS
// ============================================================
// ✅ Sync selectedCategory dengan form
watch(name, (newName) => {
  setFieldValue("name", newName);
});
watch(description, (newDesc) => {
  setFieldValue("description", newDesc);
});

watch(selectedCategory, async (newCat) => {
  setFieldValue("category_id", newCat);

  if (newCat) {
    await fetchSubCategories(newCat);
  } else {
    categoriesLevel2.value = [];
  }
  selectedSubCategories.value = [];
});

watch(
  () => [useVariants.value, variants.value],
  () => {
    if (useVariants.value && variants.value.length > 0) {
      generateCombinations();
    } else {
      combinations.value = [];
      selectedCombinations.value.clear();
    }
  },
  { deep: true }
);
watch(
  () => values.sku,
  (newVal) => {
    formSku.value = newVal || "";
  }
);
// ✅ Sync form values dengan reactive variables (untuk v-model)
watch(
  () => values.price,
  (newVal) => {
    formPrice.value = newVal || 0;
  }
);

watch(
  () => values.stock,
  (newVal) => {
    formStock.value = newVal || 0;
  }
);

watch(
  () => values.min_purchase,
  (newVal) => {
    formMinPurchase.value = newVal || 1;
  }
);

watch(formSku, (newVal) => {
  setFieldValue("sku", newVal);
});
// ✅ Sync reactive variables kembali ke form (two-way binding)
watch(formPrice, (newVal) => {
  setFieldValue("price", newVal);
});

watch(formStock, (newVal) => {
  setFieldValue("stock", newVal);
});

watch(formMinPurchase, (newVal) => {
  setFieldValue("min_purchase", newVal);
});

// ============================================================
// COMPUTED PROPERTIES
// ============================================================
const canAddSubCategory = computed(
  () => selectedSubCategories.value.length < 4
);
const canAddVariant = computed(() => variants.value.length < maxVariants);
const canAddAddOnGroup = computed(
  () => addOnGroups.value.length < maxAddOnGroups
);

const totalCombinations = computed(() => {
  if (!useVariants.value || variants.value.length === 0) return 0;

  return variants.value.reduce((total, variant) => {
    const optionsCount = variant.options.filter((opt) =>
      opt.name.trim()
    ).length;
    return total === 0 ? optionsCount : total * optionsCount;
  }, 0);
});

const combinationsExceedLimit = computed(
  () => totalCombinations.value > maxOptions
);

const allCombinationsSelected = computed(() => {
  return (
    combinations.value.length > 0 &&
    selectedCombinations.value.size === combinations.value.length
  );
});

// ============================================================
// IMAGE METHODS
// ============================================================
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  const remainingSlots = MAX_IMAGES - productImages.value.length;

  if (remainingSlots <= 0) {
    toast.warning("Maksimal 6 foto produk");
    event.target.value = "";
    return;
  }

  const allowedFiles = files.slice(0, remainingSlots);

  if (files.length > remainingSlots) {
    toast.warning(
      `Hanya ${remainingSlots} foto yang dapat ditambahkan (maksimal 6)`
    );
  }

  allowedFiles.forEach((file) => {
    // ✅ Validasi type
    if (!file.type.startsWith("image/")) {
      toast.error(`File ${file.name} bukan gambar`);
      return;
    }

    // ✅ Validasi size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(
        `Gambar "${file.name}" terlalu besar. Maksimal ${MAX_IMAGE_SIZE_MB} MB`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      productImages.value.push({
        id: Date.now() + Math.random(),
        file,
        preview: e.target.result,
      });

      // Pastikan cover valid
      if (productImages.value.length === 1) {
        coverImageIndex.value = 0;
      }
    };
    reader.readAsDataURL(file);
  });

  // Reset input supaya bisa upload ulang file yang sama
  event.target.value = "";
};

const removeImage = (index) => {
  productImages.value.splice(index, 1);

  // ✅ PASTIKAN COVER SELALU INDEX 0
  coverImageIndex.value = productImages.value.length > 0 ? 0 : null;
};

const onDragStart = (event, index) => {
  draggedImageIndex.value = index;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/html", event.target);
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
};

const onDrop = (event, index) => {
  event.preventDefault();
  if (draggedImageIndex.value === null || draggedImageIndex.value === index)
    return;

  const draggedItem = productImages.value[draggedImageIndex.value];

  productImages.value.splice(draggedImageIndex.value, 1);
  productImages.value.splice(index, 0, draggedItem);

  // ✅ COVER SELALU GAMBAR PERTAMA
  coverImageIndex.value = 0;

  draggedImageIndex.value = null;
};

const onDragEnd = () => {
  draggedImageIndex.value = null;
};

// ============================================================
// VARIANT METHODS
// ============================================================
const canAddVariantOption = (variantIndex) => {
  const tempVariants = JSON.parse(JSON.stringify(variants.value));
  tempVariants[variantIndex].options.push({ name: "__temp__" });

  const total = tempVariants.reduce((t, v) => {
    const count = v.options.filter((o) => o.name?.trim()).length;
    return t === 0 ? count : t * count;
  }, 0);

  return total <= maxOptions;
};

const addVariant = () => {
  if (canAddVariant.value) {
    const variantId = Date.now() + Math.random();
    variants.value.push({
      id: variantId,
      name: "",
      options: [{ id: Date.now(), name: "", images: [] }],
    });
    variantNames.value[variantId] = "";
    // ✅ FIXED: Set ke 0 (false) by default
    variantUsesImages.value[variantId] = 0;
    expandedVariants.value.add(variantId);
  }
};

const removeVariant = (index) => {
  const variantId = variants.value[index].id;
  delete variantNames.value[variantId];
  delete variantUsesImages.value[variantId];
  variants.value.splice(index, 1);
};

const addOption = (variantIndex) => {
  const variant = variants.value[variantIndex];

  // hitung kombinasi jika opsi ditambah 1
  const projectedCombinations = variants.value.reduce((total, v, idx) => {
    let count = v.options.filter((o) => o.name.trim()).length;

    if (idx === variantIndex) count += 1;

    return total === 0 ? count : total * count;
  }, 0);

  if (projectedCombinations > MAX_COMBINATIONS) {
    toast.error(`Kombinasi maksimal ${MAX_COMBINATIONS}`);
    return;
  }
  variants.value[variantIndex].options.push({
    id: Date.now() + Math.random(),
    name: "",
    images: [],
  });
};

const removeOption = (variantIndex, optionIndex) => {
  variants.value[variantIndex].options.splice(optionIndex, 1);
};

// ✅ FIXED: Toggle antara 0 dan 1
const toggleVariantImages = (variantId) => {
  // Toggle: 0 -> 1, 1 -> 0
  variantUsesImages.value[variantId] = variantUsesImages.value[variantId]
    ? 0
    : 1;

  // Jika disabled (0), hapus semua images dari options
  if (variantUsesImages.value[variantId] === 0) {
    const variant = variants.value.find((v) => v.id === variantId);
    if (variant) {
      variant.options.forEach((opt) => (opt.images = []));
    }
  }
};

const handleOptionImageUpload = (variantIndex, optionIndex, event) => {
  const files = Array.from(event.target.files);
  const option = variants.value[variantIndex].options[optionIndex];

  if (option.images.length >= 1) {
    toast.warning("Maksimal 1 foto per opsi");
    event.target.value = "";
    return;
  }

  const file = files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      option.images = [
        {
          id: Date.now(),
          file,
          preview: e.target.result,
        },
      ];
    };
    reader.readAsDataURL(file);
  }
  event.target.value = "";
};

const removeOptionImage = (variantIndex, optionIndex, imageIndex) => {
  variants.value[variantIndex].options[optionIndex].images.splice(
    imageIndex,
    1
  );
};

const toggleVariantExpand = (variantId) => {
  if (expandedVariants.value.has(variantId)) {
    expandedVariants.value.delete(variantId);
  } else {
    expandedVariants.value.add(variantId);
  }
};

const isVariantExpanded = (variantId) => {
  return expandedVariants.value.has(variantId);
};

// ============================================================
// COMBINATION METHODS
// ============================================================
const generateCombinations = () => {
  const validVariants = variants.value
    .filter((v) => v.name.trim() && v.options.some((opt) => opt.name.trim()))
    .map((v) => ({
      name: v.name.trim(),
      options: v.options
        .filter((opt) => opt.name.trim())
        .map((opt) => ({
          id: opt.id,
          name: opt.name.trim(),
          images: opt.images,
        })),
    }));

  if (validVariants.length === 0) {
    combinations.value = [];
    selectedCombinations.value.clear();
    return;
  }

  const newCombinations = [];
  const generateRecursive = (variantIndex, current) => {
    if (variantIndex === validVariants.length) {
      const existingCombo = combinations.value.find(
        (c) => c.combination === current.combination
      );

      newCombinations.push({
        combination: current.combination,
        sku: existingCombo?.sku || "",
        price: existingCombo?.price || 0,
        stock: existingCombo?.stock || 0,
        attributes: [...current.attributes],
      });
      return;
    }

    const variant = validVariants[variantIndex];
    variant.options.forEach((option) => {
      generateRecursive(variantIndex + 1, {
        combination: current.combination
          ? `${current.combination} - ${option.name}`
          : option.name,
        attributes: [
          ...current.attributes,
          { name: variant.name, value: option.name },
        ],
      });
    });
  };

  generateRecursive(0, { combination: "", attributes: [] });

  if (newCombinations.length > maxOptions) {
    toast.error(`Maksimal ${maxOptions} kombinasi`);
    return;
  } else {
    combinations.value = newCombinations;
  }

  selectedCombinations.value.clear();
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

const toggleCombinationSelection = (index) => {
  if (selectedCombinations.value.has(index)) {
    selectedCombinations.value.delete(index);
  } else {
    selectedCombinations.value.add(index);
  }
};

const toggleAllCombinations = () => {
  if (allCombinationsSelected.value) {
    selectedCombinations.value.clear();
  } else {
    combinations.value.forEach((_, index) => {
      selectedCombinations.value.add(index);
    });
  }
};

const applyBulkEdit = () => {
  if (selectedCombinations.value.size === 0) {
    toast.warning("Pilih minimal 1 kombinasi");
    return;
  }

  let updated = false;
  let hasError = false;

  if (bulkPrice.value !== null && bulkPrice.value !== "") {
    if (bulkPrice.value < 0) {
      toast.error("Harga tidak boleh kurang dari 0");
      hasError = true;
    } else {
      selectedCombinations.value.forEach((index) => {
        combinations.value[index].price = bulkPrice.value;
      });
      updated = true;
    }
  }

  if (!hasError && bulkStock.value !== null && bulkStock.value !== "") {
    if (bulkStock.value < 0) {
      toast.error("Stok tidak boleh kurang dari 0");
      hasError = true;
    } else if (bulkStock.value > 9999) {
      toast.error("Stok tidak boleh lebih dari 9999");
      hasError = true;
    } else {
      selectedCombinations.value.forEach((index) => {
        combinations.value[index].stock = bulkStock.value;
      });
      updated = true;
    }
  }

  if (hasError) {
    return;
  }

  if (updated) {
    toast.success(
      `Perubahan diterapkan ke ${selectedCombinations.value.size} kombinasi`
    );
    bulkPrice.value = 0;
    bulkStock.value = 0;
  } else {
    toast.warning("Masukkan minimal harga atau stok");
  }
};

// ============================================================
// ADDON GROUP METHODS
// ============================================================

const addAddOnGroup = () => {
  if (addOnGroups.value.length >= maxAddOnGroups) {
    toast.warning("Maksimal 10 grup add-on");
    return;
  }
  if (canAddAddOnGroup.value) {
    const groupId = Date.now() + Math.random();
    addOnGroups.value.push({
      id: groupId,
      name: "",
      is_required: false,
      min_selection: 0,
      max_selection: 1,
      options: [
        {
          id: Date.now(),
          name: "",
          price: 0,
        },
      ],
    });
    expandedAddOnGroups.value.add(groupId);
  }
};

const removeAddOnGroup = (index) => {
  addOnGroups.value.splice(index, 1);
};

const addAddOnOption = (groupIndex) => {
  const group = addOnGroups.value[groupIndex];

  if (group.options.length >= maxAddOnOptions) {
    toast.warning("Maksimal 10 opsi per grup");
    return;
  }
  if (group.options.length < maxAddOnOptions) {
    group.options.push({
      id: Date.now() + Math.random(),
      name: "",
      price: 0,
    });
  }
};

const removeAddOnOption = (groupIndex, optionIndex) => {
  const group = addOnGroups.value[groupIndex];
  if (group.options.length > 1) {
    group.options.splice(optionIndex, 1);
  }
};

const toggleAddOnGroupExpand = (groupId) => {
  if (expandedAddOnGroups.value.has(groupId)) {
    expandedAddOnGroups.value.delete(groupId);
  } else {
    expandedAddOnGroups.value.add(groupId);
  }
};

const isAddOnGroupExpanded = (groupId) => {
  return expandedAddOnGroups.value.has(groupId);
};

// ============================================================
// SUBMIT HANDLER
// ============================================================
const onSubmit = veeHandleSubmit(
  async (values) => {

    const oversizedImage = productImages.value.find(
      (img) => img.file.size > MAX_IMAGE_SIZE_BYTES
    );

    if (oversizedImage) {
      toast.error(
        `Ukuran gambar tidak boleh lebih dari ${MAX_IMAGE_SIZE_MB} MB`
      );
      return;
    }

    if (productImages.value.length > MAX_IMAGES) {
      toast.error("Maksimal upload 6 foto produk");
      return;
    }
    // ✅ ADD: Validate merchantId before submission
    if (!currentMerchantId.value) {
      toast.error("Merchant ID tidak ditemukan");
      return;
    }

    // ✅ ADD: Validate merchant ownership before submission
    if (!isValidMerchant.value) {
      toast.error("Anda tidak memiliki akses ke merchant ini");
      return;
    }

    if (!useVariants.value && values.stock > 9999) {
      toast.error("Stok maksimal 9999");
      return;
    }

    // Kombinasi
    if (useVariants.value && totalCombinations.value > maxOptions) {
      toast.error(`Kombinasi maksimal ${maxOptions}`);
      return;
    }

    // Add-on groups
    if (addOnGroups.value.length > maxAddOnGroups) {
      toast.error(`Maksimal ${maxAddOnGroups} grup add-on`);
      return;
    }

    // Add-on options
    const invalidAddonOption = addOnGroups.value.some(
      (g) => g.options.length > maxAddOnOptions
    );
    if (invalidAddonOption) {
      toast.error(`Maksimal ${maxAddOnOptions} opsi per grup add-on`);
      return;
    }

    // === 1) Validasi dengan Yup ===
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (yupError) {
      const messages = (yupError.inner || [])
        .map((e) => e.message)
        .filter(Boolean);

      if (messages.length === 0 && yupError.message) {
        messages.push(yupError.message);
      }

      const firstMsg = String(
        messages[0] || "Mohon lengkapi semua field yang wajib diisi"
      );
      toast.error(firstMsg);
      return;
    }

    // === 2) Validasi kustom ===
    if (productImages.value.length === 0) {
      toast.error("Minimal tambahkan 1 foto produk");
      return;
    }

    if (useVariants.value) {
      if (variants.value.length === 0) {
        toast.error("Minimal tambahkan 1 varian");
        return;
      }

      const hasEmptyVariantName = variants.value.some((v) => !v.name.trim());
      if (hasEmptyVariantName) {
        toast.error("Semua nama varian harus diisi");
        return;
      }

      const hasEmptyOptions = variants.value.some(
        (v) => v.options.filter((opt) => opt.name.trim()).length === 0
      );
      if (hasEmptyOptions) {
        toast.error("Setiap varian harus memiliki minimal 1 opsi");
        return;
      }

      if (combinationsExceedLimit.value) {
        toast.error(`Kombinasi maksimal ${maxOptions}`);
        return;
      }

      const hasInvalidCombo = combinations.value.some(
        (c) => c.price < 0 || c.stock < 0
      );
      if (hasInvalidCombo) {
        toast.error("Harga dan stok tidak boleh negatif");
        return;
      }
    }

    if (addOnGroups.value.length > 0) {
      const hasInvalidGroup = addOnGroups.value.some((group) => {
        if (!group.name.trim()) return true;

        const validOptions = group.options.filter(
          (opt) => opt.name.trim() && opt.price >= 0
        );
        if (validOptions.length === 0) return true;

        if (group.min_selection < 0 || group.max_selection < 1) return true;
        if (group.min_selection > group.max_selection) return true;
        if (group.max_selection > validOptions.length) return true;

        return false;
      });

      if (hasInvalidGroup) {
        toast.error(
          "Pastikan setiap grup add-on memiliki nama, minimal 1 opsi valid, dan pengaturan min/max yang benar"
        );
        return;
      }
    }

    loading.value = true;

    try {
      const formData = new FormData();

      // ✅ FIXED: Use merchantId from route params
      formData.append("merchant_id", currentMerchantId.value);
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category_id", values.category_id);
      formData.append("min_purchase", values.min_purchase);
      formData.append("status", "draft");

      // Sub Categories
      selectedSubCategories.value.forEach((subCat, index) => {
        formData.append(`sub_categories[${index}]`, subCat);
      });

      // Product Images
      productImages.value.forEach((img, index) => {
        formData.append(`images[${index}][file]`, img.file);
        formData.append(`images[${index}][order]`, index);
      });
      formData.append("cover_image_index", coverImageIndex.value);

      // Variants or Direct Pricing
      if (useVariants.value) {
        variants.value.forEach((variant, vIndex) => {
          formData.append(`variants[${vIndex}][name]`, variant.name);
          formData.append(
            `variants[${vIndex}][uses_images]`,
            variantUsesImages.value[variant.id] || 0
          );

          variant.options.forEach((opt, oIndex) => {
            if (opt.name.trim()) {
              formData.append(
                `variants[${vIndex}][options][${oIndex}][name]`,
                opt.name.trim()
              );

              if (
                variantUsesImages.value[variant.id] === 1 &&
                opt.images.length > 0
              ) {
                opt.images.forEach((img, iIndex) => {
                  formData.append(
                    `variants[${vIndex}][options][${oIndex}][images][${iIndex}][file]`,
                    img.file
                  );
                });
              }
            }
          });
        });

        combinations.value.forEach((combo, cIndex) => {
          formData.append(
            `combinations[${cIndex}][combination]`,
            combo.combination
          );
          formData.append(`combinations[${cIndex}][sku]`, combo.sku || "");
          formData.append(`combinations[${cIndex}][price]`, combo.price);
          formData.append(`combinations[${cIndex}][stock]`, combo.stock);

          combo.attributes.forEach((attr, aIndex) => {
            formData.append(
              `combinations[${cIndex}][attributes][${aIndex}][name]`,
              attr.name
            );
            formData.append(
              `combinations[${cIndex}][attributes][${aIndex}][value]`,
              attr.value
            );
          });
        });
      } else {
        if (values.sku) {
          formData.append("sku", values.sku);
        }
        formData.append("price", values.price);
        formData.append("stock", values.stock);
      }

      // Add-on Groups
      addOnGroups.value.forEach((group, gIndex) => {
        if (group.name.trim()) {
          formData.append(`add_on_groups[${gIndex}][name]`, group.name.trim());
          formData.append(
            `add_on_groups[${gIndex}][min_selection]`,
            group.min_selection
          );
          formData.append(
            `add_on_groups[${gIndex}][max_selection]`,
            group.max_selection
          );

          group.options.forEach((opt, oIndex) => {
            if (opt.name.trim()) {
              formData.append(
                `add_on_groups[${gIndex}][options][${oIndex}][name]`,
                opt.name.trim()
              );
              formData.append(
                `add_on_groups[${gIndex}][options][${oIndex}][price]`,
                opt.price
              );
            }
          });
        }
      });

      // API Call
      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      toast.success("Produk berhasil ditambahkan");

      // ✅ FIXED: Redirect dengan merchantId yang benar
      router.push(`/merchant-center/${currentMerchantId.value}/products`);
    } catch (error) {

      if (error.response?.status === 422) {
        const data = error.response.data;

        // 1️⃣ Prioritaskan message dari backend
        if (data?.message) {
          toast.error(data.message);
          return;
        }

        // 2️⃣ Fallback: Laravel validation errors
        if (data?.errors && typeof data.errors === "object") {
          const firstError = Object.values(data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            toast.error(firstError[0]);
            return;
          }
        }

        // 3️⃣ Fallback terakhir
        toast.error("Validasi gagal");
      } else if (error.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke merchant ini");
      } else {
        toast.error(
          error.response?.data?.message || "Gagal menambahkan produk"
        );
      }
    } finally {
      loading.value = false;
    }
  },
  (errorsFromVee) => {

    function getFirstErrorMessage(errObj) {
      if (!errObj) return null;
      if (typeof errObj === "string") return errObj;

      if (errObj.errors && typeof errObj.errors === "object") {
        const vals = Object.values(errObj.errors);
        for (const v of vals) {
          if (typeof v === "string") return v;
          if (Array.isArray(v) && v.length) return String(v[0]);
          if (v && v.message) return String(v.message);
        }
      }

      if (errObj.results && typeof errObj.results === "object") {
        const vals = Object.values(errObj.results);
        for (const r of vals) {
          if (r && r.errors && Array.isArray(r.errors) && r.errors.length)
            return String(r.errors[0]);
          if (r && r.message) return String(r.message);
        }
      }

      if (typeof errObj === "object") {
        const vals = Object.values(errObj);
        for (const v of vals) {
          if (typeof v === "string") return v;
          if (Array.isArray(v) && v.length && typeof v[0] === "string")
            return v[0];
          if (v && typeof v === "object") {
            const inner = Object.values(v).find(
              (iv) => typeof iv === "string" || (Array.isArray(iv) && iv.length)
            );
            if (typeof inner === "string") return inner;
            if (Array.isArray(inner)) return String(inner[0]);
          }
        }
      }

      return null;
    }

    const firstMsg =
      getFirstErrorMessage(errorsFromVee) ||
      "Mohon lengkapi semua field yang wajib diisi";

    toast.error(String(firstMsg));
  }
);

// ============================================================
// UTILITY METHODS
// ============================================================
const goBack = () => {
  router.back();
};
</script>

<!-- Template unchanged, just ensure mobile header back button uses dynamic route -->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl"
    >
      <!-- ✅ FIXED: Back button dengan dynamic route -->
      <button
        @click="router.push(`/merchant-center/${currentMerchantId}/products`)"
        class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Tambah Produk</h1>
    </div>

    <!-- Desktop Header -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-50 py-6">
      <div
        class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
      >
        <div>
          <!-- ✅ Use Breadcrumb Component -->
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantId"
          />
          <p class="text-muted-foreground text-xs lg:text-sm">
            Lengkapi informasi produk Anda.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Button
            @click="onSubmit"
            variant="merchant"
            size="md"
            :disabled="loading"
          >
            <span>{{ loading ? "Menyimpan..." : "Simpan" }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile Only -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- Container Responsive -->
    <div class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <!-- ✅ FIXED: Remove ref, use @submit -->
      <Form @submit="onSubmit">
        <!-- Foto Produk -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3
            class="text-sm font-semibold text-black mb-3 flex items-center gap-2"
          >
            <i class="pi pi-image text-merchant-primary"></i>
            Foto Produk
            <span class="text-xs font-normal text-danger-foreground">*</span>
          </h3>

          <!-- Image Grid - RESPONSIVE -->
          <div
            class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-3"
          >
            <div
              v-for="(img, index) in productImages"
              :key="img.id"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
              class="relative aspect-square rounded-xl overflow-hidden border-2 group cursor-move"
              :class="
                index === coverImageIndex
                  ? 'border-merchant-primary ring-2 ring-merchant-primary/20'
                  : 'border-gray-200'
              "
            >
              <img
                :src="img.preview"
                class="w-full h-full object-cover pointer-events-none"
              />

              <!-- Drag Handle -->
              <div
                class="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center pointer-events-none"
              >
                <i class="pi pi-arrows-alt text-white text-xs"></i>
              </div>

              <!-- Cover Badge -->
              <div
                v-if="index === coverImageIndex"
                class="absolute top-2 left-2 px-2 py-1 bg-merchant-primary text-white text-[10px] font-semibold rounded-full flex items-center gap-1"
              >
                <i class="pi pi-star-fill"></i>
                <span>Cover</span>
              </div>

              <!-- Actions -->
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
              >
                <button
                  @click.stop="removeImage(index)"
                  type="button"
                  class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition"
                >
                  <i class="pi pi-trash text-danger-foreground text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Add Button -->
            <button
              v-if="productImages.length < 6"
              @click="triggerFileInput"
              type="button"
              class="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-merchant-primary hover:bg-merchant-primary/5 transition flex flex-col items-center justify-center gap-2"
            >
              <i class="pi pi-plus text-2xl text-merchant-primary"></i>
              <span class="text-xs text-muted-foreground">Tambah</span>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleImageUpload"
          />

          <p class="text-xs text-muted-foreground">
            <i class="pi pi-info-circle"></i>
            Drag gambar untuk mengubah urutan. Foto pertama menjadi cover. Maks
            6 foto dengan masing-masing ukuran maksimal
            {{ MAX_IMAGE_SIZE_MB }} MB. Gunakan gambar dengan rasio 1:1 untuk
            hasil terbaik.
          </p>
        </div>

        <!-- Info Dasar -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="text-sm font-semibold text-black flex items-center gap-2">
            <i class="pi pi-info-circle text-merchant-primary"></i>
            Informasi Dasar
          </h3>

          <TextField
            name="name"
            label="Nama Produk"
            v-model="name"
            placeholder="Contoh: Sandal Jepit"
            required
          />
          <TextField
            name="description"
            label="Deskripsi"
            v-model="description"
            textarea
            :rows="4"
            placeholder="Jelaskan detail produk Anda"
            required
          />

          <!-- ✅ UPDATED: Kategori Section dengan Loading State -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Level 1 Category -->
            <div class="relative">
              <SelectField
                name="category_id"
                label="Kategori Utama"
                :options="categoriesLevel1"
                v-model="selectedCategory"
                :disabled="loadingLevel1"
                required
              />

              <!-- Empty State -->
              <p
                v-if="!loadingLevel1 && categoriesLevel1.length === 0"
                class="text-xs text-amber-600 mt-1 flex items-center gap-1"
              >
                <i class="pi pi-exclamation-triangle"></i>
                Tidak ada kategori tersedia
              </p>
            </div>

            <!-- Sub Categories -->
            <div v-if="selectedCategory">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sub Kategori
                <span class="text-xs font-normal text-muted-foreground"
                  >(Maks. 4)</span
                >
              </label>

              <!-- Loading State -->
              <div
                v-if="loadingLevel2"
                class="flex items-center justify-center py-4 text-sm text-gray-500"
              >
                <i class="pi pi-spin pi-spinner text-merchant-primary mr-2"></i>
                Memuat sub-kategori...
              </div>

              <!-- Empty State -->
              <div
                v-else-if="!loadingLevel2 && categoriesLevel2.length === 0"
                class="py-4 px-3 bg-gray-50 rounded-lg border border-gray-200 text-center"
              >
                <i class="pi pi-inbox text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-xs text-gray-500">
                  Kategori ini tidak memiliki sub-kategori
                </p>
              </div>

              <!-- Sub-category List -->
              <div v-else class="space-y-2 mb-2">
                <div
                  v-for="(subCat, index) in selectedSubCategories"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <select
                    v-model="selectedSubCategories[index]"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent"
                  >
                    <option value="" disabled>Pilih sub kategori</option>
                    <option
                      v-for="cat in categoriesLevel2"
                      :key="cat.value"
                      :value="cat.value"
                      :disabled="selectedSubCategories.includes(cat.value)"
                    >
                      {{ cat.label }}
                    </option>
                  </select>
                  <button
                    @click="selectedSubCategories.splice(index, 1)"
                    type="button"
                    class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition"
                  >
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Add Sub-category Button -->
              <button
                v-if="canAddSubCategory && categoriesLevel2.length > 0"
                @click="selectedSubCategories.push('')"
                type="button"
                class="text-sm text-merchant-primary hover:underline flex items-center gap-1"
              >
                <i class="pi pi-plus text-xs"></i>
                Tambah Sub Kategori
              </button>
            </div>
          </div>
        </div>

        <!-- Variasi Toggle -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <label
            class="flex items-center justify-between cursor-pointer"
            @click="useVariants = !useVariants"
          >
            <div>
              <h3 class="text-sm font-semibold text-black">Gunakan Variasi</h3>
              <p class="text-xs text-muted-foreground">
                Produk dengan ukuran, warna, dll
              </p>
            </div>
            <div
              :class="[
                'relative w-12 h-6 rounded-full transition flex-shrink-0',
                useVariants ? 'bg-merchant-primary' : 'bg-gray-300',
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  useVariants ? 'translate-x-7' : 'translate-x-1',
                ]"
              ></span>
            </div>
          </label>
        </div>

        <!-- Variasi Section -->
        <div
          v-if="useVariants"
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3
              class="text-sm font-semibold text-black flex items-center gap-2"
            >
              <i class="pi pi-box text-merchant-primary"></i>
              Varian
              <span class="text-sm font-normal text-muted-foreground"
                >(Maks. 2)</span
              >
            </h3>
            <button
              v-if="canAddVariant"
              @click="addVariant"
              type="button"
              class="text-sm text-merchant-primary hover:underline flex items-center gap-1"
            >
              <i class="pi pi-plus"></i>
              Tambah
            </button>
          </div>

          <!-- RESPONSIVE GRID dengan Accordion - PERBAIKAN -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              v-for="(variant, vIndex) in variants"
              :key="variant.id"
              class="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-merchant-primary/50 transition"
            >
              <!-- Variant Header - Always Visible -->
              <div class="p-4 space-y-4 bg-white">
                <!-- Top Bar: Label + Delete Button -->
                <div
                  class="flex items-center justify-between pb-3 border-b border-gray-100"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="px-3 py-1 bg-merchant-primary text-white text-xs font-bold rounded-full"
                    >
                      Varian {{ vIndex + 1 }}
                    </span>
                    <span
                      v-if="
                        variant.options.filter((opt) => opt.name.trim())
                          .length > 0
                      "
                      class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                    >
                      {{
                        variant.options.filter((opt) => opt.name.trim()).length
                      }}
                      opsi
                    </span>
                  </div>
                  <button
                    @click="removeVariant(vIndex)"
                    type="button"
                    class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition flex-shrink-0"
                  >
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>

                <!-- PERBAIKAN: Input Nama Varian dengan identifier unik -->
                <div>
                  <TextField
                    :name="`variant_name_${variant.id}`"
                    type="text"
                    v-model="variantNames[variant.id]"
                    @input="variant.name = variantNames[variant.id]"
                    :label="`Nama Varian`"
                    :placeholder="`Contoh: ${
                      vIndex === 0 ? 'Warna' : 'Ukuran'
                    }`"
                    required
                  />
                </div>

                <!-- ✅ FIXED: Toggle images dengan 0/1 -->
                <div v-if="vIndex === 0">
                  <label
                    @click="toggleVariantImages(variant.id)"
                    class="flex items-center justify-between cursor-pointer py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div class="flex items-center gap-2">
                      <i class="pi pi-image text-merchant-primary"></i>
                      <span class="text-sm font-medium text-gray-700">
                        Gunakan foto untuk varian ini
                      </span>
                    </div>
                    <!-- ✅ FIXED: Check dengan === 1 -->
                    <div
                      :class="[
                        'relative w-11 h-6 rounded-full transition flex-shrink-0',
                        variantUsesImages[variant.id] === 1
                          ? 'bg-merchant-primary'
                          : 'bg-gray-300',
                      ]"
                    >
                      <span
                        :class="[
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                          variantUsesImages[variant.id] === 1
                            ? 'translate-x-6'
                            : 'translate-x-1',
                        ]"
                      ></span>
                    </div>
                  </label>
                </div>

                <!-- Accordion Toggle Button -->
                <button
                  @click="toggleVariantExpand(variant.id)"
                  type="button"
                  class="w-full flex items-center justify-between py-3 px-4 bg-merchant-primary/5 rounded-lg border border-merchant-primary/20 hover:bg-merchant-primary/10 transition"
                >
                  <div class="flex items-center gap-2">
                    <i class="pi pi-list text-merchant-primary"></i>
                    <span class="text-sm font-semibold text-black">
                      Kelola Opsi
                      <span class="text-muted-foreground ml-1">
                        ({{
                          variant.options.filter((opt) => opt.name.trim())
                            .length
                        }})
                      </span>
                    </span>
                  </div>
                  <i
                    :class="[
                      'pi text-merchant-primary transition-transform duration-300',
                      isVariantExpanded(variant.id)
                        ? 'pi-chevron-up'
                        : 'pi-chevron-down',
                    ]"
                  ></i>
                </button>
              </div>

              <!-- Accordion Content - tetap sama -->
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[2000px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[2000px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div
                  v-if="isVariantExpanded(variant.id)"
                  class="border-t border-gray-200 overflow-hidden"
                >
                  <div class="p-4 pt-3 bg-gray-50 space-y-3">
                    <!-- Header Opsi dengan Border -->
                    <div
                      class="flex items-center justify-between pb-2 border-b border-gray-300"
                    >
                      <label
                        class="text-xs font-bold text-black uppercase tracking-wide"
                      >
                        Daftar Opsi
                      </label>
                      <button
                        @click="addOption(vIndex)"
                        :disabled="!canAddVariantOption(vIndex)"
                        type="button"
                        class="text-xs text-merchant-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <i class="pi pi-plus text-[10px]"></i>
                        Tambah
                      </button>
                    </div>

                    <!-- List Opsi dengan Scroll -->
                    <div
                      v-if="isVariantExpanded(variant.id)"
                      class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1"
                    >
                      <div
                        v-for="(option, oIndex) in variant.options"
                        :key="option.id"
                        class="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 hover:shadow-md transition-shadow"
                      >
                        <!-- Opsi Input dengan Number Badge -->
                        <div class="flex items-start gap-2.5">
                          <div
                            class="w-7 h-7 rounded-lg bg-merchant-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          >
                            {{ oIndex + 1 }}
                          </div>
                          <div class="flex-1 space-y-2.5">
                            <!-- UPDATED: Gunakan TextField -->
                            <TextField
                              :name="`variant_${variant.id}_option_${option.id}_name`"
                              v-model="option.name"
                              :placeholder="`Contoh: ${
                                vIndex === 0 ? 'Merah' : 'S'
                              }`"
                              :hideLabel="true"
                              variant="primary"
                            />

                            <!-- ✅ FIXED: Check dengan === 1 -->
                            <!-- Option Image (hanya jika varian 1 & uses_images === 1) -->
                            <div
                              v-if="
                                vIndex === 0 &&
                                variantUsesImages[variant.id] === 1
                              "
                            >
                              <label
                                class="text-xs font-semibold text-gray-600 mb-1.5 block"
                              >
                                Foto Opsi
                              </label>

                              <!-- Image Preview -->
                              <div
                                v-if="option.images.length > 0"
                                class="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group"
                              >
                                <img
                                  :src="option.images[0].preview"
                                  class="w-full h-full object-cover"
                                />
                                <button
                                  @click="removeOptionImage(vIndex, oIndex, 0)"
                                  type="button"
                                  class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                >
                                  <i class="pi pi-trash text-white text-sm"></i>
                                </button>
                              </div>

                              <!-- Upload Button -->
                              <label
                                v-else
                                class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-merchant-primary hover:bg-merchant-primary/5 transition flex flex-col items-center justify-center cursor-pointer gap-1"
                              >
                                <i
                                  class="pi pi-plus text-lg text-merchant-primary"
                                ></i>
                                <span
                                  class="text-[10px] text-gray-500 font-medium"
                                >
                                  Upload
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  class="hidden"
                                  @change="
                                    handleOptionImageUpload(
                                      vIndex,
                                      oIndex,
                                      $event
                                    )
                                  "
                                />
                              </label>
                            </div>
                          </div>

                          <!-- Delete Button -->
                          <button
                            v-if="variant.options.length > 1"
                            @click="removeOption(vIndex, oIndex)"
                            type="button"
                            class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition flex-shrink-0 mt-0.5"
                          >
                            <i class="pi pi-times text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Add Option Button (Bottom) -->
                    <button
                      @click="addOption(vIndex)"
                      type="button"
                      class="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-merchant-primary font-bold hover:border-merchant-primary hover:bg-white transition flex items-center justify-center gap-2"
                    >
                      <i class="pi pi-plus text-xs"></i>
                      Tambah Opsi Baru
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Combinations Summary -->
          <div
            v-if="variants.length > 0"
            class="bg-merchant-primary/5 rounded-xl p-4 border-2 border-merchant-primary/20"
          >
            <div
              class="flex flex-wrap sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <p class="text-sm font-semibold text-merchant-primary">
                  Total Kombinasi
                </p>
                <p class="text-xs text-gray-600">
                  {{ totalCombinations }} kombinasi akan dibuat
                </p>
              </div>
              <Button
                @click="openCombinationsModal"
                :disabled="totalCombinations === 0"
                variant="merchant"
              >
                <i class="pi pi-cog"></i>
                Atur Harga & Stok
              </Button>
            </div>
            <p
              v-if="combinationsExceedLimit"
              class="text-xs text-danger-foreground flex items-center gap-1 mt-2 font-medium"
            >
              <i class="pi pi-exclamation-triangle"></i>
              Kombinasi melebihi batas maksimal ({{ maxOptions }})
            </p>
          </div>
        </div>

        <!-- Harga & Stok (tanpa variasi) - PERBAIKAN dengan v-model.number -->
        <div
          v-if="!useVariants"
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="text-sm font-semibold text-black flex items-center gap-2">
            <i class="pi pi-tag text-merchant-primary"></i>
            Harga & Stok
          </h3>

          <div class="space-y-4">
            <!-- ✅ NEW: SKU Input -->
            <TextField
              name="sku"
              label="SKU (Opsional)"
              type="text"
              placeholder="Contoh: PRD-001"
              v-model="formSku"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name="price"
                label="Harga"
                type="number"
                placeholder="0"
                prefix="Rp"
                v-model.number="formPrice"
                required
              />
              <TextField
                name="stock"
                label="Stok"
                type="number"
                placeholder="0"
                v-model.number="formStock"
                min="0"
                max="9999"
                required
              />
            </div>
          </div>
        </div>

        <!-- UPDATED: Add-on Groups Section dengan Grid Layout -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3
                class="text-sm font-semibold text-black flex items-center gap-2"
              >
                <i class="pi pi-plus-circle text-merchant-primary"></i>
                Grup Add-on (Opsional)
                <span class="text-sm font-normal text-muted-foreground"
                  >(Maks. {{ maxAddOnGroups }})</span
                >
              </h3>
              <p class="text-xs text-muted-foreground mt-1">
                Kelompokkan add-on berdasarkan kategori (contoh: tingkat
                kepedasan, topping)
              </p>
            </div>
            <button
              v-if="canAddAddOnGroup"
              @click="addAddOnGroup"
              type="button"
              class="text-sm text-merchant-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <i class="pi pi-plus"></i>
              Tambah
            </button>
          </div>

          <!-- UPDATED: Grid Layout untuk Desktop -->
          <div
            v-if="addOnGroups.length > 0"
            class="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <div
              v-for="(group, gIndex) in addOnGroups"
              :key="group.id"
              class="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-merchant-primary/50 transition"
            >
              <!-- Group Header - Always Visible -->
              <div class="p-4 space-y-4 bg-white">
                <!-- Header: Badge + Delete -->
                <div
                  class="flex items-center justify-between pb-3 border-b border-gray-100"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="px-3 py-1 bg-merchant-primary text-white text-xs font-bold rounded-full"
                    >
                      Grup {{ gIndex + 1 }}
                    </span>
                    <span
                      v-if="group.is_required || group.min_selection > 0"
                      class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1"
                    >
                      <i class="pi pi-exclamation-circle text-[10px]"></i>
                      Wajib
                    </span>
                    <span
                      v-if="group.max_selection > 0"
                      class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"
                    >
                      <i class="pi pi-list text-[10px]"></i>
                      {{ group.min_selection }}-{{ group.max_selection }}
                      pilihan
                    </span>
                  </div>
                  <button
                    @click="removeAddOnGroup(gIndex)"
                    type="button"
                    class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition flex-shrink-0"
                  >
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>

                <!-- Group Name -->
                <TextField
                  :name="`addon_group_name_${group.id}`"
                  v-model="group.name"
                  label="Nama Grup Add-on"
                  placeholder="Contoh: Tingkat Kepedasan, Topping"
                  required
                />

                <!-- Min/Max Selection Settings -->
                <div
                  class="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3"
                >
                  <label class="text-xs font-semibold text-gray-700 block">
                    Aturan Pemilihan
                  </label>

                  <div class="grid grid-cols-2 gap-3">
                    <!-- UPDATED: Min Selection -->
                    <div>
                      <TextField
                        :name="`addon_group_${group.id}_min_selection`"
                        label="Minimal Pilihan"
                        v-model.number="group.min_selection"
                        type="number"
                        min="0"
                        :max="group.max_selection"
                        placeholder="0"
                        suffix="opsi"
                        :labelBold="false"
                      />
                      <p class="text-[10px] text-gray-500 mt-1">0 = opsional</p>
                    </div>

                    <!-- UPDATED: Max Selection -->
                    <div>
                      <TextField
                        :name="`addon_group_${group.id}_max_selection`"
                        label="Maksimal Pilihan"
                        v-model.number="group.max_selection"
                        type="number"
                        :min="Math.max(1, group.min_selection)"
                        :max="
                          group.options.filter((opt) => opt.name.trim())
                            .length || 1
                        "
                        placeholder="1"
                        suffix="opsi"
                        :labelBold="false"
                      />
                    </div>
                  </div>

                  <!-- Quick Presets -->
                  <div
                    class="flex flex-wrap gap-2 pt-2 border-t border-gray-200"
                  >
                    <button
                      @click="
                        group.min_selection = 0;
                        group.max_selection = 1;
                      "
                      type="button"
                      class="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 hover:border-merchant-primary transition"
                    >
                      <i class="pi pi-circle text-[8px] mr-1"></i>
                      Pilih 1 (Optional)
                    </button>
                    <button
                      @click="
                        group.min_selection = 1;
                        group.max_selection = 1;
                      "
                      type="button"
                      class="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 hover:border-merchant-primary transition"
                    >
                      <i class="pi pi-exclamation-circle text-[8px] mr-1"></i>
                      Wajib Pilih 1
                    </button>
                    <button
                      @click="
                        group.min_selection = 0;
                        group.max_selection =
                          group.options.filter((opt) => opt.name.trim())
                            .length || 99;
                      "
                      type="button"
                      class="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] font-medium text-gray-700 hover:bg-gray-50 hover:border-merchant-primary transition"
                    >
                      <i class="pi pi-check-square text-[8px] mr-1"></i>
                      Multi-pilih
                    </button>
                  </div>

                  <!-- Validation Warning -->
                  <div
                    v-if="group.min_selection > group.max_selection"
                    class="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <i
                      class="pi pi-exclamation-triangle text-red-600 text-xs mt-0.5"
                    ></i>
                    <p class="text-[10px] text-red-700 flex-1">
                      Minimal tidak boleh lebih besar dari maksimal
                    </p>
                  </div>
                </div>

                <!-- Accordion Toggle Button -->
                <button
                  @click="toggleAddOnGroupExpand(group.id)"
                  type="button"
                  class="w-full flex items-center justify-between py-3 px-4 bg-merchant-primary/5 rounded-lg border border-merchant-primary/20 hover:bg-merchant-primary/10 transition"
                >
                  <div class="flex items-center gap-2">
                    <i class="pi pi-list text-merchant-primary"></i>
                    <span class="text-sm font-semibold text-black">
                      Kelola Opsi
                      <span class="text-muted-foreground ml-1">
                        ({{
                          group.options.filter((opt) => opt.name.trim()).length
                        }})
                      </span>
                    </span>
                  </div>
                  <i
                    :class="[
                      'pi text-merchant-primary transition-transform duration-300',
                      isAddOnGroupExpanded(group.id)
                        ? 'pi-chevron-up'
                        : 'pi-chevron-down',
                    ]"
                  ></i>
                </button>
              </div>

              <!-- Accordion Content - Options List -->
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[2000px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[2000px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div
                  v-if="isAddOnGroupExpanded(group.id)"
                  class="border-t border-gray-200 overflow-hidden"
                >
                  <div class="p-4 pt-3 bg-gray-50 space-y-3">
                    <!-- Options Header -->
                    <div
                      class="flex items-center justify-between pb-2 border-b border-gray-300"
                    >
                      <label
                        class="text-xs font-bold text-black uppercase tracking-wide"
                      >
                        Daftar Opsi
                      </label>
                      <button
                        @click="addAddOnOption(gIndex)"
                        type="button"
                        :disabled="group.options.length >= maxAddOnOptions"
                        class="text-xs text-merchant-primary hover:underline flex items-center gap-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i class="pi pi-plus text-[10px]"></i>
                        Tambah
                      </button>
                    </div>

                    <!-- Options List with Scroll -->
                    <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      <div
                        v-for="(option, oIndex) in group.options"
                        :key="option.id"
                        class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div class="flex items-start gap-2.5">
                          <div
                            class="w-7 h-7 rounded-lg bg-merchant-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          >
                            {{ oIndex + 1 }}
                          </div>

                          <div class="flex-1 space-y-2.5">
                            <!-- UPDATED: Option Name -->
                            <TextField
                              :name="`addon_group_${group.id}_option_${option.id}_name`"
                              v-model="option.name"
                              :placeholder="`Contoh: ${
                                gIndex === 0 ? 'Tidak Pedas' : 'Daging Asap'
                              }`"
                              :hideLabel="true"
                              variant="primary"
                            />

                            <!-- UPDATED: Price -->
                            <TextField
                              :name="`addon_group_${group.id}_option_${option.id}_price`"
                              label="Harga Tambahan"
                              v-model.number="option.price"
                              type="number"
                              min="0"
                              placeholder="0"
                              prefix="Rp"
                              :labelBold="false"
                            />
                            <p
                              v-if="option.price === 0"
                              class="text-xs text-gray-500 -mt-1 flex items-center gap-1"
                            >
                              <i class="pi pi-info-circle text-[10px]"></i>
                              Gratis (Rp 0)
                            </p>
                          </div>

                          <!-- Delete Button -->
                          <button
                            v-if="group.options.length > 1"
                            @click="removeAddOnOption(gIndex, oIndex)"
                            type="button"
                            class="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 flex items-center justify-center transition flex-shrink-0 mt-0.5"
                          >
                            <i class="pi pi-times text-sm"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Add Option Button (Bottom) -->
                    <button
                      @click="addAddOnOption(gIndex)"
                      type="button"
                      :disabled="group.options.length >= maxAddOnOptions"
                      class="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-merchant-primary font-bold hover:border-merchant-primary hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i class="pi pi-plus text-xs"></i>
                      Tambah Opsi Baru
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Empty State (tetap sama) -->
          <div
            v-else
            class="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
          >
            <i class="pi pi-plus-circle text-4xl text-gray-300 mb-3 block"></i>
            <p class="text-sm text-gray-500 mb-3">
              Belum ada grup add-on ditambahkan
            </p>
            <button
              @click="addAddOnGroup"
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 bg-merchant-primary text-white rounded-lg hover:bg-merchant-primary/90 transition text-sm font-medium"
            >
              <i class="pi pi-plus"></i>
              Tambah Grup Pertama
            </button>
          </div>
        </div>

        <!-- Min Purchase -->
        <div
          class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <TextField
            name="min_purchase"
            label="Minimal Jumlah Pembelian"
            type="number"
            placeholder="1"
            v-model.number="formMinPurchase"
            required
          />
        </div>

        <!-- ✅ FIXED: Desktop Submit Button -->
        <div class="hidden sm:flex justify-end">
          <Button
            @click="onSubmit"
            variant="merchant"
            size="md"
            :disabled="loading"
          >
            <span>{{ loading ? "Menyimpan..." : "Simpan" }}</span>
          </Button>
        </div>

        <!-- ✅ FIXED: Mobile Submit Button -->
        <div
          class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40"
        >
          <Button type="submit" :loading="loading" variant="merchant" block>
            Simpan
          </Button>
        </div>
      </Form>
    </div>

    <!-- UPDATED: Combinations Modal menggunakan ResponsiveModal -->
    <ResponsiveModal
      v-model:show="showCombinationsModal"
      title="Atur Harga & Stok"
      :subtitle="
        selectedCombinations.size > 0
          ? `${selectedCombinations.size} kombinasi dipilih`
          : null
      "
      show-footer
      @close="closeCombinationsModal"
    >
      <!-- Bulk Edit Section -->
      <div
        class="px-2 sm:px-0 py-4 bg-merchant-primary/5 border border-muted-background rounded-xl mb-4"
      >
        <div class="px-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-black">Edit Massal</h3>
            <label
              class="flex items-center gap-2 cursor-pointer"
              @click="toggleAllCombinations"
            >
              <div
                class="w-5 h-5 rounded border-2 flex items-center justify-center transition"
                :class="
                  allCombinationsSelected
                    ? 'bg-merchant-primary border-merchant-primary'
                    : 'border-gray-300'
                "
              >
                <i
                  v-if="allCombinationsSelected"
                  class="pi pi-check text-white text-xs"
                ></i>
              </div>
              <span class="text-xs font-medium text-gray-700">Pilih Semua</span>
            </label>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <TextField
                label="Harga untuk Terpilih"
                name="bulkPrice"
                v-model.number="bulkPrice"
                type="number"
                min="0"
                placeholder="0"
                prefix="Rp"
                :labelBold="false"
              />

              <TextField
                label="Stok untuk Terpilih"
                name="bulkStock"
                v-model.number="bulkStock"
                type="number"
                min="0"
                max="9999"
                placeholder="0"
                suffix="pcs"
                :labelBold="false"
              />
            </div>

            <Button
              @click="applyBulkEdit"
              size="sm"
              variant="merchant"
              customClass="!w-full"
              :disabled="selectedCombinations.size === 0"
            >
              <span v-if="selectedCombinations.size > 0">
                Terapkan ke {{ selectedCombinations.size }} Kombinasi
              </span>
              <span v-else>Terapkan</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Combinations List -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="(combo, cIndex) in combinations"
          :key="cIndex"
          @click="toggleCombinationSelection(cIndex)"
          class="bg-white border-2 rounded-xl p-4 transition cursor-pointer"
          :class="
            selectedCombinations.has(cIndex)
              ? 'border-merchant-primary bg-merchant-primary/5'
              : 'border-gray-200'
          "
        >
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 mt-0.5"
              :class="
                selectedCombinations.has(cIndex)
                  ? 'bg-merchant-primary border-merchant-primary'
                  : 'border-gray-300'
              "
            >
              <i
                v-if="selectedCombinations.has(cIndex)"
                class="pi pi-check text-white text-xs"
              ></i>
            </div>
            <h4 class="text-sm font-semibold text-black flex-1">
              {{ combo.combination }}
            </h4>
          </div>

          <div class="space-y-3 pl-8" @click.stop>
            <!-- ✅ FIXED: Unique name dengan cIndex -->
            <TextField
              :name="`combination_${cIndex}_sku`"
              label="SKU (Opsional)"
              v-model="combo.sku"
              type="text"
              placeholder="Masukkan SKU"
              :labelBold="false"
            />

            <div class="grid grid-cols-2 gap-3">
              <!-- ✅ FIXED: Unique name untuk price -->
              <TextField
                :name="`combination_${cIndex}_price`"
                label="Harga"
                v-model.number="combo.price"
                type="number"
                min="0"
                placeholder="0"
                prefix="Rp"
                :labelBold="false"
                required
              />

              <!-- ✅ FIXED: Unique name untuk stock -->
              <TextField
                :name="`combination_${cIndex}_stock`"
                label="Stok"
                v-model.number="combo.stock"
                type="number"
                min="0"
                max="9999"
                placeholder="0"
                suffix="pcs"
                :labelBold="false"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <!-- Footer Actions (Mobile Only) -->
      <template #footer>
        <div class="flex gap-3">
          <Button @click="closeCombinationsModal" block variant="merchant">
            Selesai
          </Button>
        </div>
      </template>
    </ResponsiveModal>
  </div>
</template>

<style scoped>
/* Custom scrollbar untuk opsi list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth accordion animation */
.transition-all {
  transition-property: max-height, opacity;
}
</style>
