<script setup>
// ======================================================
// IMPORTS
// ======================================================
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue";
import api from "@/libs/axios";
import { Form, useForm } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useCategories } from "@/composables/useCategories";
<<<<<<< HEAD
import { useProducts } from "@/composables/useProducts";
import { getVariantImageUrl } from "@/libs/getVariantImageUrl";

// === SHARED COMPOSABLES (SAMA DENGAN CREATE) ===
import { useProductImages } from "@/composables/product/forms/useProductImages";
import { useProductVariants } from "@/composables/product/forms/useProductVariants";
import { useProductCombinations } from "@/composables/product/forms/useProductCombinations";
import { useProductAddons } from "@/composables/product/forms/useProductAddons";

// ======================================================
// BASIC SETUP
// ======================================================
=======
import { useProducts } from "@/composables/useProducts"; // already present — ensure fetchProductDetail used
import { getImageUrl } from "@/libs/getImageUrl.js"; // ADD THIS
import { getVariantImageUrl } from "@/libs/getVariantImageUrl.js"; // ✅ ADD THIS
>>>>>>> origin/feat/jasa
const router = useRouter();
const route = useRoute();
const toast = useToast();
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_COMBINATIONS = 50;

const productSlug = computed(() => route.params.slug); // ✅ gunakan slug
const currentMerchantId = ref(null);

watch(
  () => route.params?.merchantId,
  (val) => {
    currentMerchantId.value = val ? Number(val) : null;
  },
  { immediate: true }
);

// ======================================================
// STATE
// ======================================================
const name = ref("");
const description = ref("");
const selectedCategory = ref(null);
const selectedSubCategories = ref([]);
const loading = ref(false);
const loadingData = ref(true);

// ======================================================
// CATEGORIES
// ======================================================
const {
  categoriesLevel1,
  categoriesLevel2,
  loadingLevel1,
  loadingLevel2,
  fetchLevel1Categories,
  fetchSubCategories,
} = useCategories();

// ======================================================
// PRODUCT FETCH
// ======================================================
const { fetchProductDetail } = useProducts();

const loading = ref(false);
const loadingData = ref(true);

// ✅ SAMA SEPERTI CREATE: State Management
const useVariants = ref(false);
const variantUsesImages = ref({}); // ✅ Gunakan 0 dan 1

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
const formSku = ref("");
// ✅ SAMA SEPERTI CREATE: Form values
const formPrice = computed({
  get: () => values.price || 0,
  set: (val) => setFieldValue("price", val),
});

const formStock = computed({
  get: () => values.stock || 0,
  set: (val) => setFieldValue("stock", val),
});

const formMinPurchase = computed({
  get: () => values.min_purchase || 1,
  set: (val) => setFieldValue("min_purchase", val),
});

// ======================================================
// VEE VALIDATE (TIDAK DIUBAH)
// ======================================================
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
const { handleSubmit, errors, values, setFieldValue, validate } = useForm({
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

// ======================================================
// WATCHERS (TETAP ADA)
// ======================================================
watch(name, (v) => setFieldValue("name", v));
watch(description, (v) => setFieldValue("description", v));

watch(selectedCategory, async (v) => {
  setFieldValue("category_id", v);
  if (v) await fetchSubCategories(v);
});

// ======================================================
// POPULATE EDIT DATA
// ======================================================
const canAddSubCategory = computed(
  () => selectedSubCategories.value.length < 4
);
const canAddAddOnGroup = computed(
  () => addOnGroups.value.length < maxAddOnGroups
);

const combinationsExceedLimit = computed(
  () => totalCombinations.value > maxOptions
);

const allCombinationsSelected = computed(() => {
  return (
    combinations.value.length > 0 &&
    selectedCombinations.value.size === combinations.value.length
  );
});

const breadcrumbs = computed(() => [
  { label: "Produk", path: "/merchant-center/products" },
  { label: "Edit Produk", path: null },
]);

// ✅ SAMA SEPERTI CREATE: Watchers
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
  // Jangan clear sub categories pada mode edit
});

// ✅ ADD: Flag to prevent auto-regenerate during initial load
const isInitialLoad = ref(false);

// ✅ IMPROVED: Watcher with debounce and smart regeneration
let regenerateTimeout = null;

watch(
  () => [useVariants.value, variants.value],
  () => {
    // Clear previous timeout
    if (regenerateTimeout) {
      clearTimeout(regenerateTimeout);
    }

    // ✅ Debounce: Wait 300ms before regenerating
    regenerateTimeout = setTimeout(() => {
      if (useVariants.value && variants.value.length > 0) {
        generateCombinations();
      } else {
        selectedCombinations.value.clear();
      }
    }, 300);
  },
  { deep: true }
);

<<<<<<< HEAD
      return {
        id: opt.id, // untuk backend
        clientKey, // untuk frontend
        name: opt.option_name,
        options: opt.values.map((v) => ({
          id: v.id,
          clientKey: crypto.randomUUID(),
          name: v.option_value,
          images: v.image_path
            ? [{ id: v.id, preview: getVariantImageUrl(v.id), existing: true }]
            : [],
        })),
      };
    });

    if (product.variants?.length) {
      setCombinationsFromBackend(product.variants);
    }
  } else {
    // Produk tanpa variants - populate SKU, price, stock
    useVariants.value = false;
    
    // Jika ada 1 variant di backend (hasil dari variant OFF), ambil datanya
    if (product.variants?.length === 1) {
      const variant = product.variants[0];
      setFieldValue("sku", variant.sku || "");
      setFieldValue("price", Number(variant.price) || 0);
      setFieldValue("stock", Number(variant.stock) || 0);
    } else {
      // Fallback ke data produk langsung
      setFieldValue("sku", product.sku || "");
      setFieldValue("price", product.price || 0);
      setFieldValue("stock", product.stock || 0);
    }
  }

  // ADDONS
  if (product.addon_groups) {
    addOnGroups.value = product.addon_groups.map((g) => {
      const groupClientKey = crypto.randomUUID();

      return {
        id: g.id, // backend
        clientKey: groupClientKey, // 🔥 WAJIB
        name: g.addon_group_name,
        min_selection: g.min_selection,
        max_selection: g.max_selection,
        options: g.options.map((o) => ({
          id: o.id, // backend
          clientKey: crypto.randomUUID(), // 🔥 WAJIB
          name: o.addon.addon_name,
          price: Number(o.addon_price),
        })),
      };
    });
  }
=======
// ✅ IMPROVED: Helper function dengan EXPLICIT sorting
const createCombinationKey = (attributes) => {
  if (!Array.isArray(attributes) || attributes.length === 0) return "";

  return attributes
    .filter((a) => a.option_value_id)
    .map((a) => Number(a.option_value_id))
    .sort((a, b) => a - b)
    .join("|");
>>>>>>> origin/feat/jasa
};

let existingCombosMap = new Map();
// ✅ CRITICAL FIX: Generate combinations dengan proper attribute structure
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
    selectedCombinations.value.clear();
    return;
  }

  const newCombinations = [];

  const generateRecursive = (variantIndex, current) => {
    // ==========================
    // BASE CASE (WAJIB RETURN)
    // ==========================
    if (variantIndex === validVariants.length) {
      const normalizedAttributes = current.attributes;

      const attributeKey = normalizedAttributes.every((a) => a.option_value_id)
        ? createCombinationKey(normalizedAttributes)
        : null;

      const existingData = attributeKey
        ? existingCombosMap.get(attributeKey)
        : null;

      let variantId = null;

      if (attributeKey && existingCombosMap.has(attributeKey)) {
        const existing = existingCombosMap.get(attributeKey);

        const currentOptionIds = normalizedAttributes
          .map((a) => a.option_value_id)
          .filter(Boolean)
          .sort((a, b) => a - b);

        const isSameStructure =
          JSON.stringify(currentOptionIds) ===
          JSON.stringify(existing.optionValueIds);

        if (isSameStructure) {
          variantId = existing.id;
        }
      }

      newCombinations.push({
        id: variantId,
        combination: current.combination,
        sku: existingData?.sku || "",
        price: existingData?.price || 0,
        stock: existingData?.stock || 0,
        attributes: normalizedAttributes,
      });

      return; // 🔥🔥🔥 INI KUNCI UTAMANYA
    }

    // ==========================
    // RECURSIVE STEP
    // ==========================
    const variant = validVariants[variantIndex];

    if (!variant || !Array.isArray(variant.options)) {
      return; // safety guard
    }

    variant.options.forEach((option) => {
      generateRecursive(variantIndex + 1, {
        combination: current.combination
          ? `${current.combination} - ${option.name}`
          : option.name,
        attributes: [
          ...current.attributes,
          {
            name: variant.name,
            value: option.name,
            option_value_id: option.id || null,
          },
        ],
      });
    });
  };

  generateRecursive(0, { combination: "", attributes: [] });

  if (newCombinations.length > maxOptions) {
    combinations.value = newCombinations.slice(0, maxOptions);
    toast.warning(`Kombinasi dipotong menjadi ${maxOptions} (maksimal)`);
  } else {
    combinations.value = newCombinations;
  }

  selectedCombinations.value.clear();
  combinations.value.forEach((combo) => {
    if (combo.id && combo.attributes.some((a) => !a.option_value_id)) {
      combo.id = null; // 🔥 PAKSA CREATE BARU
    }
  });
};
const absoluteImagePath = (img) => {
  // img bisa berupa string (path) atau object { id, image_path }
  if (!img) return "";

  const baseURL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  ).replace(/\/$/, "");

  // jika argumen adalah object
  const image_path = typeof img === "string" ? img : img.image_path;
  const id = typeof img === "string" ? null : img.id;

  if (!image_path && id) {
    // tidak ada image_path, fallback ke endpoint by id
    return getImageUrl(id);
  }

  if (!image_path && !id) return "";

  const path = image_path.trim();

  // already absolute URL?
  if (/^https?:\/\//i.test(path)) return path;

  // starts with api/ or /api/... -> prefix baseURL
  if (
    /^\/?api\//i.test(path) ||
    /^\/storage\//i.test(path) ||
    path.startsWith("/")
  ) {
    return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  // fallback: treat as file path relative to API root
  return `${baseURL}/${path}`;
};
// ================= REPLACE EXISTING fetchProductData WITH THIS =================
const fetchProductData = async () => {
  loadingData.value = true;
  isInitialLoad.value = true;

  try {
    const payload = await fetchProductDetail(productSlug.value); // ✅ pakai slug
    const productData = payload;

    // Fetch sub categories jika ada main category
    if (productData.categories && productData.categories.length > 0) {
      await fetchSubCategories(productData.categories[0].id);
    }

    // Normalisasi: pastikan images adalah array
    if (!Array.isArray(productData.images)) {
      productData.images = productData.images ? [productData.images] : [];
    }

    productImages.value = (productData.images || []).map((img, idx) => ({
      id: img.id,
      preview: absoluteImagePath(img), // <- penting: pakai absolute URL
      is_cover: !!img.is_cover,
      existing: true,
    }));

    // set coverImageIndex
    coverImageIndex.value = productImages.value.findIndex(
      (img) => img.is_cover
    );
    if (coverImageIndex.value === -1 && productImages.value.length > 0) {
      coverImageIndex.value = 0;
      // mark first as cover if none flagged
      productImages.value[0].is_cover = true;
    }

    // Populate rest of the form + variants/addons using helper yang sudah ada
    populateFormFromProduct(productData);
  } catch (error) {
    // biarkan toast dan redirect seperti sebelumnya; gunakan existing toast/router yang ada
    toast.error(error.response?.data?.message || "Gagal memuat data produk");
    router.push("/merchant-center/products");
  } finally {
    loadingData.value = false;

    // Release initial load flag setelah tick supaya watcher tidak auto-trigger saat populate
    await nextTick();
    setTimeout(() => {
      isInitialLoad.value = false;
    }, 300);
  }
};

// ✅ SAMA SEPERTI CREATE: Image Methods
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

  // Ambil hanya sesuai slot yang tersedia
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
        existing: false,
      });

      // Pastikan cover selalu valid
      if (productImages.value.length === 1) {
        coverImageIndex.value = 0;
      }
    };
    reader.readAsDataURL(file);
  });

  // Reset input supaya bisa upload file yang sama lagi
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

// ✅ SAMA SEPERTI CREATE: Variant Methods
const addVariant = () => {
  if (!canAddVariant.value) return;

  // jika sudah ada 1 varian dengan 50 opsi → varian ke-2 = 1 opsi max
  if (
    variants.value.length === 1 &&
    variants.value[0].options.filter((o) => o.name.trim()).length >=
      MAX_COMBINATIONS
  ) {
    toast.warning(
      `Tidak bisa menambah varian. Kombinasi maksimal ${MAX_COMBINATIONS}`
    );
    return;
  }

  const variantId = Date.now() + Math.random();
  variants.value.push({
    id: null,
    clientKey: variantId,
    name: "",
    options: [{ id: null, name: "", images: [] }],
  });

  variantNames.value[variantId] = "";
  variantUsesImages.value[variantId] = 0;
  expandedVariants.value.add(variantId);
};

const removeVariant = (index) => {
  const clientKey = variants.value[index].clientKey;

  delete variantNames.value[clientKey];
  delete variantUsesImages.value[clientKey];
  expandedVariants.value.delete(clientKey);

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

  variant.options.push({
    id: null,
    clientKey: Date.now() + Math.random(),
    name: "",
    images: [],
  });

  variants.value[variantIndex].options = opts; // reaktif
};

const removeOption = (variantIndex, optionIndex) => {
  variants.value[variantIndex].options.splice(optionIndex, 1);
};

// ✅ SAMA SEPERTI CREATE: Toggle antara 0 dan 1
const toggleVariantImages = (clientKey) => {
  variantUsesImages.value[clientKey] = variantUsesImages.value[clientKey]
    ? 0
    : 1;

  const variant = variants.value.find((v) => v.clientKey === clientKey);
  if (variant) {
    variant.uses_images = variantUsesImages.value[clientKey]; // ✅ SYNC
  }

  if (variantUsesImages.value[clientKey] === 0 && variant) {
    variant.options.forEach((opt) => (opt.images = []));
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
          existing: false,
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
    } else {
      selectedCombinations.value.forEach((index) => {
        combinations.value[index].stock = bulkStock.value;
      });
      updated = true;
    }
  }

  if (hasError) return;

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

// ✅ SAMA SEPERTI CREATE: Add-on Group Methods
const addAddOnGroup = () => {
  if (!canAddAddOnGroup.value) return;

  const groupClientKey = Date.now(); // ✅ DEFINISIKAN DULU

  addOnGroups.value.push({
    id: null, // DB ID (kosong = baru)
    clientKey: groupClientKey, // UI key
    name: "",
    is_required: false,
    min_selection: 0,
    max_selection: 1,
    options: [
      {
        id: null, // DB ID
        clientKey: Date.now(), // UI key
        name: "",
        price: 0,
      },
    ],
  });

  // ✅ pakai clientKey, BUKAN groupId
  expandedAddOnGroups.value.add(groupClientKey);
};

const removeAddOnGroup = (index) => {
  const key = addOnGroups.value[index].clientKey;
  expandedAddOnGroups.value.delete(key);
  addOnGroups.value.splice(index, 1);
};

const addAddOnOption = (groupIndex) => {
  const group = addOnGroups.value[groupIndex];
  if (group.options.length >= maxAddOnOptions) {
    toast.warning(`Maksimal ${maxAddOnOptions} opsi add-on`);
    return;
  }
  if (group.options.length < maxAddOnOptions) {
    group.options.push({
      id: null, // ⬅️ DB ID (kosong = option baru)
      clientKey: Date.now(), // ⬅️ KHUSUS UI
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

// ✅ SAMA SEPERTI CREATE: Submit Handler
const onSubmit = veeHandleSubmit(
  async (values) => {
    combinations.value.forEach((combo) => {
      const hasNewOption = combo.attributes.some((a) => !a.option_value_id);

      if (hasNewOption) {
        combo.id = null; // 🔥 FORCE CREATE
      }
    });

    if (useVariants.value && totalCombinations.value > MAX_COMBINATIONS) {
      toast.error(`Kombinasi varian maksimal ${MAX_COMBINATIONS}`);
      return;
    }
    const hasTooManyAddonOptions = addOnGroups.value.some(
      (group) => group.options.length > maxAddOnOptions
    );

    if (hasTooManyAddonOptions) {
      toast.error(`Setiap grup add-on maksimal ${maxAddOnOptions} opsi`);
      return;
    }
    // === 1) Validasi dengan Yup langsung (deterministik, gak tergantung field registration) ===
    try {
      // validasi semua field di values berdasarkan schema
      await schema.validate(values, { abortEarly: false });
    } catch (yupError) {
      // yupError adalah ValidationError
      const messages = (yupError.inner || [])
        .map((e) => e.message)
        .filter(Boolean);

      // fallback jika inner kosong tapi ada message tunggal
      if (messages.length === 0 && yupError.message) {
        messages.push(yupError.message);
      }

      // pastikan yang dikirim ke toast adalah string (hindari passing object)
      const firstMsg = String(
        messages[0] || "Mohon lengkapi semua field yang wajib diisi"
      );
      toast.error(firstMsg);
      return;
    }

    // === 2) Lanjut validasi kustom yang tergantung UI (gambar, variants, add-ons) ===
    if (productImages.value.length === 0) {
      toast.error("Minimal tambahkan 1 foto produk");
      return;
    }

    if (useVariants.value) {
      if (variants.value.length === 0) {
        toast.error("Minimal tambahkan 1 varian");
        return;
      }
      const hasVariantWithAtLeastTwoOptions = variants.value.some((variant) => {
        const validOptionsCount = variant.options.filter(
          (opt) => opt.name && opt.name.trim()
        ).length;

        return validOptionsCount >= 2;
      });

      if (!hasVariantWithAtLeastTwoOptions) {
        toast.error(
          "Jika menggunakan variasi, minimal salah satu varian harus memiliki 2 pilihan atau lebih"
        );
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

    // Validasi add-on groups
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

    const oversizedImage = productImages.value.find(
      (img) => img.file && img.file.size > MAX_IMAGE_SIZE_BYTES
    );

    if (oversizedImage) {
      toast.error(`Ukuran gambar maksimal ${MAX_IMAGE_SIZE_MB} MB`);
      return;
    }

    if (productImages.value.length > MAX_IMAGES) {
      toast.error("Maksimal upload 6 foto produk");
      return;
    }
    loading.value = true;

    try {
      const formData = new FormData();

      // Basic Info
      formData.append("_method", "PUT");
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category_id", values.category_id);
      formData.append("min_purchase", values.min_purchase);

      // Sub Categories
      selectedSubCategories.value.forEach((subCat, index) => {
        formData.append(`sub_categories[${index}]`, subCat);
      });

      // ✅ Images - separate existing and new
      let existingIndex = 0;
      let newIndex = 0;

      productImages.value.forEach((img, index) => {
        if (img.existing) {
          formData.append(`existing_images[${existingIndex}][id]`, img.id);
          formData.append(`existing_images[${existingIndex}][order]`, index);
          formData.append(
            `existing_images[${existingIndex}][is_cover]`,
            index === coverImageIndex.value ? 1 : 0
          );
          existingIndex++;
        } else {
          formData.append(`images[${newIndex}][file]`, img.file);
          formData.append(`images[${newIndex}][order]`, index);
          newIndex++;
        }
      });

      formData.append("cover_image_index", coverImageIndex.value);

      // ✅ Variants or direct pricing (SAMA SEPERTI CREATE)
      if (useVariants.value) {
        variants.value.forEach((variant, vIndex) => {
          if (variant.id) {
            formData.append(`variants[${vIndex}][id]`, variant.id);
          }
          formData.append(`variants[${vIndex}][name]`, variant.name);
          formData.append(
            `variants[${vIndex}][uses_images]`,
            variantUsesImages.value[variant.clientKey] || 0
          );

          variant.options.forEach((opt, oIndex) => {
            if (opt.name.trim()) {
              if (opt.id) {
                formData.append(
                  `variants[${vIndex}][options][${oIndex}][id]`,
                  opt.id
                );
              }
              formData.append(
                `variants[${vIndex}][options][${oIndex}][name]`,
                opt.name.trim()
              );

              if (
                variantUsesImages.value[variant.clientKey] === 1 &&
                opt.images.length > 0
              ) {
                opt.images.forEach((img, iIndex) => {
                  if (img.existing) {
                    formData.append(
                      `variants[${vIndex}][options][${oIndex}][existing_images][${iIndex}][id]`,
                      img.id
                    );
                  } else {
                    formData.append(
                      `variants[${vIndex}][options][${oIndex}][images][${iIndex}][file]`,
                      img.file
                    );
                  }
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
          if (combo.id && combo.attributes.every((a) => a.option_value_id)) {
            formData.append(`combinations[${cIndex}][id]`, combo.id);
          }
          formData.append(`combinations[${cIndex}][sku]`, combo.sku || "");
          formData.append(`combinations[${cIndex}][price]`, combo.price);
          formData.append(`combinations[${cIndex}][stock]`, combo.stock);

          // 🔑 attributes pakai option_value_id
          combo.attributes.forEach((attr, aIndex) => {
            if (attr.option_value_id) {
              formData.append(
                `combinations[${cIndex}][attributes][${aIndex}][option_value_id]`,
                attr.option_value_id
              );
            }
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
        formData.append("sku", values.sku || "");
        formData.append("price", values.price);
        formData.append("stock", values.stock);
      }

      // ✅ Add-on groups (SAMA SEPERTI CREATE)
      addOnGroups.value.forEach((group, gIndex) => {
        if (group.name.trim()) {
          if (Number.isInteger(group.id)) {
            formData.append(`add_on_groups[${gIndex}][id]`, group.id);
          }
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
              if (Number.isInteger(opt.id)) {
                formData.append(
                  `add_on_groups[${gIndex}][options][${oIndex}][id]`,
                  opt.id
                );
              }
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
      combinations.value.forEach((combo) => {
        if (combo.id && combo.attributes.some((a) => !a.option_value_id)) {
          combo.id = null;
        }
      });

      // ✅ API Call
      await api.post(`/api/products/${productSlug.value}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Produk berhasil diperbarui");
      // Redirect setelah update
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
      } else {
        // ✅ Show detailed error message
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Gagal memperbarui produk";

        toast.error(errorMsg);
      }
    } finally {
      loading.value = false;
    }
  },
  (errorsFromVee) => {
    // Helper: ambil pesan string pertama dari berbagai shape error
    function getFirstErrorMessage(errObj) {
      if (!errObj) return null;

      // jika sudah string
      if (typeof errObj === "string") return errObj;

      // jika ada field 'errors' yang berupa object mapping field -> message(s)
      if (errObj.errors && typeof errObj.errors === "object") {
        const vals = Object.values(errObj.errors);
        for (const v of vals) {
          if (typeof v === "string") return v;
          if (Array.isArray(v) && v.length) return String(v[0]);
          if (v && v.message) return String(v.message);
        }
      }

      // jika ada 'results' (vee-validate might provide nested result objects)
      if (errObj.results && typeof errObj.results === "object") {
        const vals = Object.values(errObj.results);
        for (const r of vals) {
          // many shapes: r may have .errors (array) or .message
          if (r && r.errors && Array.isArray(r.errors) && r.errors.length)
            return String(r.errors[0]);
          if (r && r.message) return String(r.message);
        }
      }

      // fallback: try to flatten top-level object values
      if (typeof errObj === "object") {
        const vals = Object.values(errObj);
        for (const v of vals) {
          if (typeof v === "string") return v;
          if (Array.isArray(v) && v.length && typeof v[0] === "string")
            return v[0];
          if (v && typeof v === "object") {
            // dive one level
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

    // Pastikan kita kirim string, bukan object
    toast.error(String(firstMsg));
  }
);

const goBack = () => {
  router.back();
};

const populateFormFromProduct = async (productData) => {
  // 1️⃣ Basic info
  name.value = productData.name || "";
  description.value = productData.description || "";

  setFieldValue("name", productData.name || "");
  setFieldValue("description", productData.description || "");
  setFieldValue("min_purchase", productData.min_purchase ?? 1);

  // ==============================
  // 2️⃣ KATEGORI UTAMA & SUB KATEGORI
  // ==============================
  if (Array.isArray(productData.categories) && productData.categories.length) {
    const mainCategory = productData.categories[0];
    const subCategories = productData.categories.slice(1);

    // set kategori utama
    selectedCategory.value = mainCategory.id;
    setFieldValue("category_id", mainCategory.id);

    // fetch sub categories dulu (penting!)
    await fetchSubCategories(mainCategory.id);

    // set sub kategori (id saja)
    selectedSubCategories.value = subCategories.map((c) => c.id);
  } else {
    selectedCategory.value = null;
    selectedSubCategories.value = [];
  }

  // ==============================
  // 3️⃣ VARIANTS (lanjutkan seperti sekarang)
  // ==============================
  existingCombosMap = new Map();

  productData.variants?.forEach((variant) => {
    const attrs = variant.option_values.map((ov) => ({
      option_value_id: ov.id,
    }));

    const key = createCombinationKey(attrs);

    existingCombosMap.set(key, {
      id: variant.id, // 🔑 SIMPAN ID VARIANT
      sku: variant.sku || "",
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
      optionValueIds: attrs.map((a) => a.option_value_id).sort(),
    });
  });

  if (productData.options?.length) {
    useVariants.value = true;

    variants.value = productData.options.map((optionGroup) => {
      const clientKey = optionGroup.id; // 🔑 PENTING

      variantNames.value[clientKey] = optionGroup.option_name || "";
      variantUsesImages.value[clientKey] = optionGroup.uses_image ? 1 : 0;
      expandedVariants.value.add(clientKey);

      return {
        id: optionGroup.id, // ID DB
        clientKey: optionGroup.id, // 🔑 ID UI
        name: optionGroup.option_name || "",
        uses_images: optionGroup.uses_image ? 1 : 0, // ✅ TAMBAH INI
        options: optionGroup.values.map((val) => ({
          id: val.id,
          clientKey: val.id ?? `${Date.now()}-${Math.random()}`,
          name: val.option_value,
          images:
            val.image_url || val.image_path
              ? [
                  {
                    id: val.id,
                    preview: val.image_url || absoluteImagePath(val.image_path),
                    existing: true,
                  },
                ]
              : [],
        })),
      };
    });

    productData.options.forEach((opt) => {
      variantUsesImages.value[opt.id] = opt.uses_image ? 1 : 0;
      expandedVariants.value.add(opt.id);
    });

    generateCombinations();
  } else {
    // ===== MODE TANPA VARIAN =====
    useVariants.value = false;

    const singleVariant = productData.variants?.[0];

    if (singleVariant) {
      // 🔥 INI YANG KAMU LUPA
      setFieldValue("price", Number(singleVariant.price || 0));
      setFieldValue("stock", Number(singleVariant.stock || 0));
      setFieldValue("sku", singleVariant.sku || "");

      formSku.value = singleVariant.sku || "";
    }
  }

  // ==============================
  // 4️⃣ ADD-ON GROUPS (kalau mau sekalian)
  // ==============================
  if (Array.isArray(productData.addon_groups)) {
    addOnGroups.value = productData.addon_groups.map((group) => ({
      id: group.id,
      clientKey: group.id, // UI key
      name: group.addon_group_name,
      min_selection: group.min_selection,
      max_selection: group.max_selection,
      options: group.options.map((opt) => ({
        id: opt.id,
        clientKey: opt.id, // UI key
        name: opt.addon.addon_name,
        price: Number(opt.addon_price),
      })),
    }));

    addOnGroups.value.forEach((g) => expandedAddOnGroups.value.add(g.id));
  }
};
watch(useVariants, (val) => {
  if (val) {
    // pindah ke variant → bersihkan single price
    setFieldValue("price", 0);
    setFieldValue("stock", 0);
    setFieldValue("sku", "");
  }
});

watch(
  () => values.sku,
  (newVal) => {
    formSku.value = newVal || "";
  }
);
watch(formSku, (newVal) => {
  setFieldValue("sku", newVal);
});
onMounted(async () => {
  await fetchLevel1Categories();
  await fetchProductData();
});
const breadcrumbItems = computed(() => [
  {
    label: "Produk",
    path: `/merchant-center/${currentMerchantId.value}/products`,
  },
  {
    label: "Edit Produk",
  },
]);
const formMinPurchase = computed({
  get: () => values.min_purchase,
  set: (val) => setFieldValue("min_purchase", val),
});
</script>

<template>
  <div class="min-h-screen pb-20 bg-gray-50 sm:pb-0">
    <!-- Mobile Header -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-6 text-white shadow-lg sm:hidden bg-merchant-primary rounded-b-2xl"
    >
      <button
        @click="router.back()"
        class="absolute flex items-center justify-center w-10 h-10 transition rounded-full left-4 hover:bg-white/10"
      >
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Edit Produk</h1>
    </div>

    <!-- Desktop Header -->
    <div class="sticky top-0 left-0 right-0 z-30 hidden py-6 sm:block">
      <div
        class="flex flex-wrap items-center justify-between px-4 mx-auto sm:px-6 lg:px-8 gap-y-2 gap-x-4"
      >
        <div>
          <!-- ✅ Use Breadcrumb Component -->
          <Breadcrumb
            :items="breadcrumbItems"
            :merchantId="currentMerchantId"
          />
          <p class="text-xs text-muted-foreground lg:text-sm">
            {{ loadingData ? "Memuat data produk..." : name || "Edit Produk" }}
          </p>
        </div>

        <div v-if="!loadingData" class="flex items-center gap-3">
          <Button
            @click="onSubmit"
            variant="merchant"
            size="md"
            :loading="loading"
          >
            <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- ✅ Loading State - IMPROVED -->
    <div
      v-if="loadingData"
      class="flex flex-col items-center justify-center gap-3 py-20"
    >
      <div
        class="w-12 h-12 border-4 border-gray-300 rounded-full border-t-merchant-primary animate-spin"
      ></div>
      <p class="text-sm text-muted-foreground">Memuat data produk...</p>
    </div>

    <!-- ✅ Content (Only show when data loaded) -->
    <div v-else class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <Form ref="formRef" :validation-schema="schema" @submit="onSubmit">
        <!-- Foto Produk -->
        <div
          class="p-4 mb-2 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3
            class="flex items-center gap-2 mb-3 text-sm font-semibold text-black"
          >
            <i class="pi pi-image text-merchant-primary"></i>
            Foto Produk
            <span class="text-xs font-normal text-danger-foreground">*</span>
          </h3>

          <div
            class="grid grid-cols-3 gap-3 mb-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            <div
              v-for="(img, index) in productImages"
              :key="img.id"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
              class="relative overflow-hidden border-2 cursor-move aspect-square rounded-xl group"
              :class="
                index === coverImageIndex
                  ? 'border-merchant-primary ring-2 ring-merchant-primary/20'
                  : 'border-gray-200'
              "
            >
              <img
                :src="img.preview"
                class="object-cover w-full h-full pointer-events-none"
              />

              <div
                class="absolute flex items-center justify-center w-6 h-6 rounded-full pointer-events-none top-2 right-2 bg-black/60"
              >
                <i class="text-xs text-white pi pi-arrows-alt"></i>
              </div>

              <div
                v-if="index === coverImageIndex"
                class="absolute top-2 left-2 px-2 py-1 bg-merchant-primary text-white text-[10px] font-semibold rounded-full flex items-center gap-1"
              >
                <i class="pi pi-star-fill"></i>
                <span>Cover</span>
              </div>

              <div
                class="absolute inset-0 flex items-center justify-center gap-2 transition opacity-0 bg-black/50 group-hover:opacity-100"
              >
                <button
                  @click.stop="removeImage(index)"
                  type="button"
                  class="flex items-center justify-center w-8 h-8 transition bg-white rounded-full hover:scale-110"
                >
                  <i class="text-sm pi pi-trash text-danger-foreground"></i>
                </button>
              </div>
            </div>

            <button
              v-if="productImages.length < 6"
              @click="triggerFileInput"
              type="button"
              class="flex flex-col items-center justify-center gap-2 transition border-2 border-gray-300 border-dashed aspect-square rounded-xl hover:border-merchant-primary hover:bg-merchant-primary/5"
            >
              <i class="text-2xl pi pi-plus text-merchant-primary"></i>
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
          class="p-4 mb-2 space-y-3 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="flex items-center gap-2 text-sm font-semibold text-black">
            <i class="pi pi-info-circle text-merchant-primary"></i>
            Informasi Dasar
          </h3>

          <TextField
            name="name"
            label="Nama Produk"
            placeholder="Contoh: Sandal Jepit"
            v-model="name"
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

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              name="category_id"
              label="Kategori Utama"
              :options="categoriesLevel1"
              v-model="selectedCategory"
              :loading="loadingLevel1"
              required
            />

            <div v-if="selectedCategory">
              <label class="block mb-2 text-sm font-bold text-black">
                Sub Kategori
                <span class="text-xs font-normal text-muted-foreground"
                  >(Maks. 4)</span
                >
              </label>

              <!-- ✅ Loading State for Level 2 -->
              <div
                v-if="loadingLevel2"
                class="px-3 py-4 text-center border border-gray-200 rounded-lg bg-gray-50"
              >
                <div
                  class="w-5 h-5 mx-auto mb-2 border-2 border-gray-300 rounded-full border-t-merchant-primary animate-spin"
                ></div>
                <p class="text-xs text-muted-foreground">
                  Memuat sub kategori...
                </p>
              </div>

              <!-- ✅ Empty State -->
              <div
                v-else-if="!loadingLevel2 && categoriesLevel2.length === 0"
                class="px-3 py-4 text-center border border-gray-200 rounded-lg bg-gray-50"
              >
                <i class="block mb-2 text-2xl text-gray-300 pi pi-inbox"></i>
                <p class="text-xs text-gray-500">
                  Tidak ada sub kategori tersedia
                </p>
              </div>

              <!-- ✅ Sub Categories List -->
              <div v-else class="space-y-2">
                <div class="mb-2 space-y-2">
                  <div
                    v-for="(subCat, index) in selectedSubCategories"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <select
                      v-model="selectedSubCategories[index]"
                      class="flex-1 px-3 py-2.5 border border-primary rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="" disabled>Pilih sub kategori</option>
                      <option
                        v-for="cat in categoriesLevel2"
                        :key="cat.value"
                        :value="cat.value"
                        :disabled="
                          selectedSubCategories.includes(cat.value) &&
                          selectedSubCategories[index] !== cat.value
                        "
                      >
                        {{ cat.label }}
                      </option>
                    </select>
                    <button
                      @click="selectedSubCategories.splice(index, 1)"
                      type="button"
                      class="flex items-center justify-center transition w-9 h-9 rounded-xl bg-danger-background text-danger-foreground hover:bg-red-100"
                    >
                      <i class="text-sm pi pi-trash"></i>
                    </button>
                  </div>
                </div>

                <button
                  v-if="canAddSubCategory"
                  @click="selectedSubCategories.push('')"
                  type="button"
                  class="flex items-center gap-1 text-sm font-medium text-merchant-primary hover:underline"
                >
                  <i class="text-xs pi pi-plus"></i>
                  Tambah Sub Kategori
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pengaturan Varian -->
        <div
          class="p-4 mb-2 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <label
            @click="useVariants = !useVariants"
            class="flex items-center justify-between cursor-pointer"
          >
            <div>
              <h3 class="text-sm font-semibold text-black">Gunakan Variasi</h3>
              <p class="text-xs text-muted-foreground">
                Produk dengan ukuran, warna, dll
              </p>
            </div>

            <div
              :class="[
                'relative w-11 h-6 rounded-full transition',
                useVariants ? 'bg-merchant-primary' : 'bg-gray-300',
              ]"
            >
              <span
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  useVariants ? 'translate-x-6' : 'translate-x-1',
                ]"
              ></span>
            </div>
          </label>
        </div>

        <!-- Variasi Section (jika useVariants true) -->
        <div
          v-if="useVariants"
          class="p-4 mb-2 space-y-4 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <h3
              class="flex items-center gap-2 text-sm font-semibold text-black"
            >
              <i class="pi pi-box text-merchant-primary"></i>
              Varian
              <span class="text-sm font-normal text-muted-foreground"
                >(Maks. 2)</span
              >
            </h3>
            <button
              v-if="canAddVariant"
              @click="addVariantEdit"
              type="button"
              class="flex items-center gap-1 text-sm text-merchant-primary hover:underline"
            >
              <i class="pi pi-plus"></i>
              Tambah
            </button>
          </div>

          <!-- Variants Grid - PERBAIKAN TextField dengan v-model unik -->
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div
              v-for="(variant, vIndex) in variants"
              :key="variant.clientKey"
              class="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-merchant-primary/50 transition"
            >
              <!-- Variant Header -->
              <div class="p-4 space-y-4 bg-white">
                <div
                  class="flex items-center justify-between pb-3 border-b border-gray-100"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="px-3 py-1 text-xs font-bold text-white rounded-full bg-merchant-primary"
                    >
                      Varian {{ vIndex + 1 }}
                    </span>
                    <span
                      v-if="
                        variant.options.filter((opt) => opt.name.trim())
                          .length > 0
                      "
                      class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
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
                    class="flex items-center justify-center flex-shrink-0 w-8 h-8 transition rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100"
                  >
                    <i class="text-sm pi pi-trash"></i>
                  </button>
                </div>

                <!-- PERBAIKAN: TextField dengan name unique per variant -->
                <div>
                  <TextField
                    :name="`variant_name_${variant.clientKey}`"
                    type="text"
                    v-model="variantNames[variant.clientKey]"
                    @input="variant.name = variantNames[variant.clientKey]"
                    :label="`Nama Varian`"
                    :placeholder="`Contoh: ${
                      vIndex === 0 ? 'Warna' : 'Ukuran'
                    }`"
                    required
                  />
                </div>

                <div v-if="vIndex === 0">
                  <label
                    @click="toggleVariantImages(variant.clientKey)"
                    class="flex items-center justify-between cursor-pointer py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div class="flex items-center gap-2">
                      <i class="pi pi-image text-merchant-primary"></i>
                      <span class="text-sm font-medium text-gray-700"
                        >Gunakan foto untuk varian ini</span
                      >
                    </div>
                    <div
                      :class="[
                        'relative w-11 h-6 rounded-full transition flex-shrink-0',
                        variantUsesImages[variant.clientKey]
                          ? 'bg-merchant-primary'
                          : 'bg-gray-300',
                      ]"
                    >
                      <span
                        :class="[
                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                          variantUsesImages[variant.clientKey]
                            ? 'translate-x-6'
                            : 'translate-x-1',
                        ]"
                      ></span>
                    </div>
                  </label>
                </div>

                <!-- Accordion Toggle -->
                <button
                  @click="toggleVariantExpand(variant.clientKey)"
                  type="button"
                  class="flex items-center justify-between w-full px-4 py-3 transition border rounded-lg bg-merchant-primary/5 border-merchant-primary/20 hover:bg-merchant-primary/10"
                >
                  <div class="flex items-center gap-2">
                    <i class="pi pi-list text-merchant-primary"></i>
                    <span class="text-sm font-semibold text-black">
                      Kelola Opsi
                      <span class="ml-1 text-muted-foreground">
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
                      isVariantExpanded(variant.clientKey)
                        ? 'pi-chevron-up'
                        : 'pi-chevron-down',
                    ]"
                  ></i>
                </button>
              </div>

              <!-- Accordion Content - tetap sama seperti sebelumnya -->
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="max-h-[2000px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[2000px] opacity-100"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="isVariantExpanded(variant.clientKey)"
                  class="border-t border-gray-200 overflow-hidden"
                >
                  <div class="p-4 pt-3 space-y-3 bg-gray-50">
                    <div
                      class="flex items-center justify-between pb-2 border-b border-gray-300"
                    >
                      <label
                        class="text-xs font-bold tracking-wide text-black uppercase"
                      >
                        Daftar Opsi
                      </label>
                      <button
                        @click="addOptionEdit(vIndex)"
                        type="button"
                        class="flex items-center gap-1 text-xs font-semibold text-merchant-primary hover:underline"
                      >
                        <i class="pi pi-plus text-[10px]"></i>
                        Tambah
                      </button>
                    </div>

                    <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      <div
                        v-for="(option, oIndex) in variant.options"
                        :key="option.clientKey || option.id"
                        class="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 hover:shadow-md transition-shadow"
                      >
                        <div class="flex items-start gap-2.5">
                          <div
                            class="w-7 h-7 rounded-lg bg-merchant-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          >
                            {{ oIndex + 1 }}
                          </div>
                          <div class="flex-1 space-y-2.5">
                            <input
                              v-model="option.name"
                              type="text"
                              :placeholder="`Contoh: ${
                                vIndex === 0 ? 'Merah' : 'S'
                              }`"
                              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-merchant-primary focus:border-transparent placeholder:text-muted-foreground bg-white"
                            />

                            <div
                              v-if="
                                vIndex === 0 &&
                                variantUsesImages[variant.clientKey]
                              "
                            >
                              <label
                                class="text-xs font-semibold text-gray-600 mb-1.5 block"
                              >
                                Foto Opsi
                              </label>

                              <div
                                v-if="
                                  option.images.length > 0 ||
                                  option.image_path ||
                                  option.image_url
                                "
                                class="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group"
                              >
                                <img
                                  :src="
                                    option.images?.[0]?.preview ||
                                    (option.id
                                      ? getVariantImageUrl(option.id)
                                      : '')
                                  "
                                  class="w-full h-full object-cover"
                                />
                                <button
                                  v-if="option.images.length > 0"
                                  @click="removeOptionImage(vIndex, oIndex, 0)"
                                  type="button"
                                  class="absolute inset-0 flex items-center justify-center transition opacity-0 bg-black/60 group-hover:opacity-100"
                                >
                                  <i class="text-sm text-white pi pi-trash"></i>
                                </button>
                              </div>

                              <label
                                v-else
                                class="flex flex-col items-center justify-center w-20 h-20 gap-1 transition border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-merchant-primary hover:bg-merchant-primary/5"
                              >
                                <i
                                  class="text-lg pi pi-plus text-merchant-primary"
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

                          <button
                            v-if="variant.options.length > 1"
                            @click="removeOption(vIndex, oIndex)"
                            type="button"
                            class="w-8 h-8 rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition flex-shrink-0 mt-0.5"
                          >
                            <i class="text-sm pi pi-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="addOptionEdit(vIndex)"
                      type="button"
                      class="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-merchant-primary font-bold hover:border-merchant-primary hover:bg-white transition flex items-center justify-center gap-2"
                    >
                      <i class="text-xs pi pi-plus"></i>
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
            class="p-4 border-2 bg-merchant-primary/5 rounded-xl border-merchant-primary/20"
          >
            <div
              class="flex flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center"
            >
              <div>
                <p class="text-sm font-semibold text-merchant-primary">
                  Total Kombinasi
                </p>
                <p class="text-xs text-gray-600">
                  {{ totalCombinations }} kombinasi akan dibuat
                </p>
              </div>
              <button
                @click="openCombinationsModal"
                type="button"
                :disabled="totalCombinations === 0"
                class="w-full sm:w-auto px-5 py-2.5 bg-merchant-primary text-white text-sm font-semibold rounded-lg hover:bg-merchant-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm"
              >
                <i class="mr-2 pi pi-cog"></i>
                Atur Harga & Stok
              </button>
            </div>
            <p
              v-if="combinationsExceedLimit"
              class="flex items-center gap-1 mt-2 text-xs font-medium text-danger-foreground"
            >
              <i class="pi pi-exclamation-triangle"></i>
              Kombinasi melebihi batas maksimal ({{ maxOptions }})
            </p>
          </div>
        </div>

        <!-- Harga & Stok (tanpa variasi) -->
        <div
          v-if="!useVariants"
          class="p-4 mb-2 space-y-4 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <h3 class="flex items-center gap-2 text-sm font-semibold text-black">
            <i class="pi pi-tag text-merchant-primary"></i>
            Harga & Stok
          </h3>
          <TextField
            name="sku"
            label="SKU (Opsional)"
            type="text"
            placeholder="Contoh: PRD-001"
            v-model="formSku"
          />
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- ✅ FIXED: Gunakan computed v-model -->

            <TextField
              name="price"
              label="Harga"
              type="number"
              placeholder="0"
              prefix="Rp"
              v-model="formPrice"
              required
            />
            <TextField
              name="stock"
              label="Stok"
              type="number"
              placeholder="0"
              min="0"
              max="9999"
              v-model="formStock"
              required
            />
          </div>
        </div>

        <!-- TAMBAHKAN: Add-on Groups Section -->
        <div
          class="p-4 mb-2 space-y-4 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3
                class="flex items-center gap-2 text-sm font-semibold text-black"
              >
                <i class="pi pi-plus-circle text-merchant-primary"></i>
                Grup Add-on (Opsional)
                <span class="text-sm font-normal text-muted-foreground"
                  >(Maks. {{ maxAddOnGroups }})</span
                >
              </h3>
              <p class="mt-1 text-xs text-muted-foreground">
                Kelompokkan add-on berdasarkan kategori (contoh: tingkat
                kepedasan, topping)
              </p>
            </div>
            <button
              v-if="canAddAddOnGroup"
              @click="addAddOnGroupEdit"
              type="button"
              class="flex items-center gap-1 text-sm font-semibold text-merchant-primary hover:underline"
            >
              <i class="pi pi-plus"></i>
              Tambah
            </button>
          </div>

          <!-- Grid Layout untuk Desktop -->
          <div
            v-if="addOnGroups.length > 0"
            class="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <div
              v-for="(group, gIndex) in addOnGroups"
              :key="group.clientKey"
              class="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-merchant-primary/50 transition"
            >
              <!-- Group Header -->
              <div class="p-4 space-y-4 bg-white">
                <!-- Header: Badge + Delete -->
                <div
                  class="flex items-center justify-between pb-3 border-b border-gray-100"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      class="px-3 py-1 text-xs font-bold text-white rounded-full bg-merchant-primary"
                    >
                      Grup {{ gIndex + 1 }}
                    </span>
                    <span
                      v-if="group.is_required || group.min_selection > 0"
                      class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
                    >
                      <i class="pi pi-exclamation-circle text-[10px]"></i>
                      Wajib
                    </span>
                    <span
                      class="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                    >
                      <i class="pi pi-list text-[10px]"></i>
                      {{ group.min_selection }}-{{ group.max_selection }}
                      pilihan
                    </span>
                  </div>
                  <button
                    @click="removeAddOnGroupEdit(gIndex)"
                    type="button"
                    class="flex items-center justify-center flex-shrink-0 w-8 h-8 transition rounded-lg bg-danger-background text-danger-foreground hover:bg-red-100"
                  >
                    <i class="text-sm pi pi-trash"></i>
                  </button>
                </div>

                <!-- Group Name -->
                <TextField
                  :name="`addon_group_name_${group.clientKey}`"
                  v-model="group.name"
                  label="Nama Grup Add-on"
                  placeholder="Contoh: Tingkat Kepedasan, Topping"
                  required
                />

                <!-- Settings -->
                <div class="space-y-2">
                  <!-- Min/Max Selection -->
                  <div
                    class="p-3 space-y-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <label class="block text-xs font-semibold text-gray-700">
                      Aturan Pemilihan
                    </label>

                    <div class="grid grid-cols-2 gap-3">
                      <!-- Min Selection -->
                      <div>
                        <TextField
                          :name="`addon_group_${group.clientKey}_min_selection`"
                          label="Minimal Pilihan"
                          v-model.number="group.min_selection"
                          type="number"
                          min="0"
                          :max="group.max_selection"
                          placeholder="0"
                          suffix="opsi"
                          :labelBold="false"
                        />
                        <p class="text-[10px] text-gray-500 mt-1">
                          0 = opsional
                        </p>
                      </div>

                      <!-- Max Selection -->
                      <div>
                        <TextField
                          :name="`addon_group_${group.clientKey}_max_selection`"
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
                      class="flex items-start gap-2 p-2 border border-red-200 rounded-lg bg-red-50"
                    >
                      <i
                        class="pi pi-exclamation-triangle text-red-600 text-xs mt-0.5"
                      ></i>
                      <p class="text-[10px] text-red-700 flex-1">
                        Minimal tidak boleh lebih besar dari maksimal
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Accordion Toggle Button -->
                <button
                  @click="toggleAddOnGroupExpand(group.clientKey)"
                  type="button"
                  class="flex items-center justify-between w-full px-4 py-3 transition border rounded-lg bg-merchant-primary/5 border-merchant-primary/20 hover:bg-merchant-primary/10"
                >
                  <div class="flex items-center gap-2">
                    <i class="pi pi-list text-merchant-primary"></i>
                    <span class="text-sm font-semibold text-black">
                      Kelola Opsi
                      <span class="ml-1 text-muted-foreground">
                        ({{
                          group.options.filter((opt) => opt.name.trim()).length
                        }})
                      </span>
                    </span>
                  </div>
                  <i
                    :class="[
                      'pi text-merchant-primary transition-transform duration-300',
                      isAddOnGroupExpanded(group.clientKey)
                        ? 'pi-chevron-up'
                        : 'pi-chevron-down',
                    ]"
                  ></i>
                </button>
              </div>

              <!-- Accordion Content - Options List -->
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="max-h-[2000px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[2000px] opacity-100"
                leave-to-class="opacity-0 max-h-0"
              >
                <div
                  v-if="isAddOnGroupExpanded(group.clientKey)"
                  class="border-t border-gray-200 overflow-hidden"
                >
                  <div class="p-4 pt-3 space-y-3 bg-gray-50">
                    <!-- Options Header -->
                    <div
                      class="flex items-center justify-between pb-2 border-b border-gray-300"
                    >
                      <label
                        class="text-xs font-bold tracking-wide text-black uppercase"
                      >
                        Daftar Opsi
                      </label>
                      <button
                        @click="addAddOnOptionEdit(gIndex)"
                        type="button"
                        :disabled="group.options.length >= maxAddOnOptions"
                        class="flex items-center gap-1 text-xs font-semibold text-merchant-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i class="pi pi-plus text-[10px]"></i>
                        Tambah
                      </button>
                    </div>

                    <!-- Options List -->
                    <div class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      <div
                        v-for="(option, oIndex) in group.options"
                        :key="option.clientKey"
                        class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div class="flex items-start gap-2.5">
                          <div
                            class="w-7 h-7 rounded-lg bg-merchant-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          >
                            {{ oIndex + 1 }}
                          </div>

                          <div class="flex-1 space-y-2.5">
                            <!-- Option Name -->
                            <TextField
                              :name="`addon_group_${group.clientKey}_option_${option.clientKey}_name`"
                              v-model="option.name"
                              :placeholder="`Contoh: ${
                                gIndex === 0 ? 'Tidak Pedas' : 'Daging Asap'
                              }`"
                              :hideLabel="true"
                              variant="primary"
                            />

                            <!-- Price -->
                            <TextField
                              :name="`addon_group_${group.clientKey}_option_${option.clientKey}_price`"
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
                              class="flex items-center gap-1 -mt-1 text-xs text-gray-500"
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
                            <i class="text-sm pi pi-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Add Option Button -->
                    <button
                      @click="addAddOnOptionEdit(gIndex)"
                      type="button"
                      :disabled="group.options.length >= maxAddOnOptions"
                      class="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-merchant-primary font-bold hover:border-merchant-primary hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i class="text-xs pi pi-plus"></i>
                      Tambah Opsi Baru
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="px-4 py-8 text-center border-2 border-gray-300 border-dashed rounded-xl bg-gray-50"
          >
            <i class="block mb-3 text-4xl text-gray-300 pi pi-plus-circle"></i>
            <p class="mb-3 text-sm text-gray-500">
              Belum ada grup add-on ditambahkan
            </p>
            <button
              @click="addAddOnGroupEdit"
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-merchant-primary hover:bg-merchant-primary/90"
            >
              <i class="pi pi-plus"></i>
              Tambah Grup Pertama
            </button>
          </div>
        </div>

        <!-- Min Purchase & Condition -->
        <div
          class="p-4 mb-2 space-y-4 bg-white sm:mb-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
        >
          <TextField
            name="min_purchase"
            label="Minimal Jumlah Pembelian"
            type="number"
            placeholder="1"
            v-model="formMinPurchase"
            required
          />
        </div>

        <!-- Submit Button Desktop -->
        <div class="justify-end hidden gap-3 sm:flex">
          <Button type="submit" variant="merchant" size="md" :loading="loading">
            <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
          </Button>
        </div>

        <!-- Submit Button Mobile -->
        <div
          class="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-gray-200 sm:hidden"
        >
          <Button type="submit" :loading="loading" variant="merchant" block>
            Simpan Perubahan
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
      :show-footer="true"
      @close="closeCombinationsModal"
    >
      <!-- Bulk Edit Section -->
      <div
        class="p-4 mb-4 border bg-merchant-primary/5 rounded-xl border-merchant-primary/20"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-semibold text-black">Edit Massal</h3>
          <label
            class="flex items-center gap-2 cursor-pointer"
            @click="toggleAllCombinations"
          >
            <div
              class="flex items-center justify-center w-5 h-5 transition border-2 rounded"
              :class="
                allCombinationsSelected
                  ? 'bg-merchant-primary border-merchant-primary'
                  : 'border-gray-300'
              "
            >
              <i
                v-if="allCombinationsSelected"
                class="text-xs text-white pi pi-check"
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

      <!-- Combinations List -->
      <div class="space-y-4">
        <div
          v-for="(combo, cIndex) in combinations"
          :key="cIndex"
          @click="toggleCombinationSelection(cIndex)"
          class="p-4 transition bg-white border-2 cursor-pointer rounded-xl hover:shadow-md"
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
                class="text-xs text-white pi pi-check"
              ></i>
            </div>
            <h4 class="flex-1 text-sm font-semibold text-black">
              {{ combo.combination }}
            </h4>
          </div>

          <div class="pl-8 space-y-3" @click.stop>
            <TextField
              label="SKU (Opsional)"
              :name="`combination_${cIndex}_sku`"
              v-model="combo.sku"
              type="text"
              placeholder="Masukkan SKU"
              :labelBold="false"
            />

            <div class="grid grid-cols-2 gap-3">
              <TextField
                label="Harga"
                :name="`combination_${cIndex}_price`"
                v-model.number="combo.price"
                type="number"
                min="0"
                placeholder="0"
                prefix="Rp"
                :labelBold="false"
                required
              />

              <TextField
                label="Stok"
                :name="`combination_${cIndex}_stock`"
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

      <!-- Footer -->
      <template #footer>
        <Button
          @click="closeCombinationsModal"
          type="button"
          variant="merchant"
          block
        >
          Selesai
        </Button>
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
</style>
