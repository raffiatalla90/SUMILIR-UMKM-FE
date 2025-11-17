<script setup>
// filepath: /var/www/html/KMI-SIMSLIFE-FE/src/views/merchant/products/Edit.vue
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { Form } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(false);
const loadingData = ref(true);
const useVariants = ref(false);
const variantUsesImages = ref({});

// Images
const productImages = ref([]);
const fileInput = ref(null);
const coverImageIndex = ref(0);
const draggedImageIndex = ref(null);

// Categories
const categoriesLevel1 = ref([
  { value: 1, label: "Benda Pakai" },
  { value: 2, label: "Makanan & Minuman" },
]);
const categoriesLevel2 = ref([]);
const selectedCategory = ref(null);
const selectedSubCategories = ref([]);

// Variants
const variants = ref([]);
const maxVariants = 2;
const maxOptions = 50;

// Combinations
const name = ref("");
const description = ref("");
const combinations = ref([]);
const showCombinationsModal = ref(false);
const bulkPrice = ref(0);
const bulkStock = ref(0);
const selectedCombinations = ref(new Set());
useBodyScrollLock(showCombinationsModal);

// Form values
const formPrice = ref(0);
const formStock = ref(0);
const formMinPurchase = ref(1);
const expandedVariants = ref(new Set());

// Initial values untuk form
const initialValues = ref({});

// Validation schema
const schema = yup.object({
  name: yup.string().required("Nama produk wajib diisi"),
  description: yup.string().required("Deskripsi wajib diisi"),
  category_id: yup.number().required("Kategori utama wajib dipilih"),
  price: yup
    .number()
    .min(1, "Harga minimal 1")
    .when([], {
      is: () => !useVariants.value,
      then: (schema) => schema.required("Harga wajib diisi"),
    }),
  stock: yup
    .number()
    .integer("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif")
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

// Computed
const canAddSubCategory = computed(
  () => selectedSubCategories.value.length < 4
);
const canAddVariant = computed(() => variants.value.length < maxVariants);
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

// Breadcrumb
const breadcrumbs = computed(() => [
  { label: "Produk", path: "/merchant-center/products" },
  { label: "Edit Produk", path: null },
]);

// Watch category change
watch(selectedCategory, async (newCat) => {
  if (newCat) {
    categoriesLevel2.value = [
      { value: 10, label: "Alas Kaki" },
      { value: 11, label: "Pakaian" },
    ];
  } else {
    categoriesLevel2.value = [];
  }
  // Don't clear sub categories on edit mode
});

// Watch variants
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

// PERBAIKAN: Tambahkan ref untuk tracking nama varian
const variantNames = ref({});

// Load product data
onMounted(async () => {
  loadingData.value = true;
  try {
    // DUMMY DATA untuk simulasi
    const productData = {
      id: route.params.id,
      name: "Sandal Jepit Premium",
      description:
        "Sandal jepit berkualitas tinggi dengan bahan yang nyaman dan tahan lama. Cocok untuk pemakaian sehari-hari maupun santai di rumah. Tersedia dalam berbagai warna dan ukuran.\n\nSpesifikasi:\n- Material: Karet premium\n- Anti slip\n- Ringan dan nyaman\n- Mudah dibersihkan",
      category_id: 1,
      sub_categories: [10],
      min_purchase: 1,
      condition: "new",
      use_variants: true,
      price: 50000,
      stock: 100,
      images: [
        {
          id: 1,
          image_path:
            "https://via.placeholder.com/400/4A90E2/FFFFFF?text=Image+1",
          is_cover: true,
        },
        {
          id: 2,
          image_path:
            "https://via.placeholder.com/400/E74C3C/FFFFFF?text=Image+2",
          is_cover: false,
        },
        {
          id: 3,
          image_path:
            "https://via.placeholder.com/400/F39C12/FFFFFF?text=Image+3",
          is_cover: false,
        },
      ],
      variants: [
        {
          id: 1,
          name: "Warna",
          uses_images: true,
          options: [
            {
              id: 1,
              name: "Merah",
              images: [
                {
                  id: 1,
                  image_path:
                    "https://via.placeholder.com/100/FF0000/FFFFFF?text=Red",
                },
              ],
            },
            { id: 2, name: "Biru", images: [] },
            { id: 3, name: "Hijau", images: [] },
          ],
        },
        {
          id: 2,
          name: "Ukuran",
          uses_images: false,
          options: [
            { id: 4, name: "S", images: [] },
            { id: 5, name: "M", images: [] },
            { id: 6, name: "L", images: [] },
          ],
        },
      ],
      combinations: [
        {
          combination: "Merah - S",
          sku: "SANDAL-RED-S",
          price: 50000,
          stock: 25,
        },
        {
          combination: "Merah - M",
          sku: "SANDAL-RED-M",
          price: 55000,
          stock: 30,
        },
        {
          combination: "Merah - L",
          sku: "SANDAL-RED-L",
          price: 60000,
          stock: 20,
        },
        {
          combination: "Biru - S",
          sku: "SANDAL-BLUE-S",
          price: 50000,
          stock: 20,
        },
        {
          combination: "Biru - M",
          sku: "SANDAL-BLUE-M",
          price: 55000,
          stock: 25,
        },
        {
          combination: "Biru - L",
          sku: "SANDAL-BLUE-L",
          price: 60000,
          stock: 15,
        },
        {
          combination: "Hijau - S",
          sku: "SANDAL-GREEN-S",
          price: 50000,
          stock: 18,
        },
        {
          combination: "Hijau - M",
          sku: "SANDAL-GREEN-M",
          price: 55000,
          stock: 22,
        },
        {
          combination: "Hijau - L",
          sku: "SANDAL-GREEN-L",
          price: 60000,
          stock: 12,
        },
      ],
    };

    // PERBAIKAN: Set name dan description ke ref
    name.value = productData.name;
    description.value = productData.description;

    // Set form data - INI YANG MEMBUAT INPUT TER-ISI
    initialValues.value = {
      name: productData.name,
      description: productData.description,
      category_id: productData.category_id,
      min_purchase: productData.min_purchase,
      condition: productData.condition,
      price: productData.price || 0,
      stock: productData.stock || 0,
    };

    // Set images
    productImages.value = productData.images.map((img) => ({
      id: img.id,
      preview: img.image_path,
      is_cover: img.is_cover,
      existing: true,
    }));
    coverImageIndex.value = productImages.value.findIndex(
      (img) => img.is_cover
    );

    // Set categories
    selectedCategory.value = productData.category_id;
    if (productData.category_id) {
      categoriesLevel2.value = [
        { value: 10, label: "Alas Kaki" },
        { value: 11, label: "Pakaian" },
      ];
    }
    selectedSubCategories.value = productData.sub_categories || [];

    // Set variants
    useVariants.value = productData.use_variants;
    if (productData.use_variants && productData.variants) {
      variants.value = productData.variants.map((v) => ({
        id: v.id,
        name: v.name,
        options: v.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          images: opt.images.map((img) => ({
            id: img.id,
            preview: img.image_path,
            existing: true,
          })),
        })),
      }));

      // PERBAIKAN: Set variant names dengan ID unik
      productData.variants.forEach((v) => {
        variantNames.value[v.id] = v.name;
        variantUsesImages.value[v.id] = v.uses_images;
        expandedVariants.value.add(v.id);
      });

      // Set combinations
      combinations.value = productData.combinations.map((combo) => ({
        combination: combo.combination,
        sku: combo.sku,
        price: combo.price,
        stock: combo.stock,
        attributes: combo.attributes || [],
      }));
    } else {
      formPrice.value = productData.price;
      formStock.value = productData.stock;
    }

    formMinPurchase.value = productData.min_purchase;
  } catch (error) {
    toast.error("Gagal memuat data produk");
    router.push("/merchant-center/products");
  } finally {
    loadingData.value = false;
  }
});

// Methods - Images
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        productImages.value.push({
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          is_cover: productImages.value.length === 0,
          existing: false,
        });
        if (productImages.value.length === 1) coverImageIndex.value = 0;
      };
      reader.readAsDataURL(file);
    }
  });
  event.target.value = "";
};

const removeImage = (index) => {
  productImages.value.splice(index, 1);
  if (coverImageIndex.value >= productImages.value.length) {
    coverImageIndex.value = Math.max(0, productImages.value.length - 1);
  }
};

const setCoverImage = (index) => {
  coverImageIndex.value = index;
  productImages.value.forEach((img, i) => {
    img.is_cover = i === index;
  });
};

// Drag & Drop
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

  if (draggedImageIndex.value === coverImageIndex.value) {
    coverImageIndex.value = index;
  } else if (
    draggedImageIndex.value < coverImageIndex.value &&
    index >= coverImageIndex.value
  ) {
    coverImageIndex.value--;
  } else if (
    draggedImageIndex.value > coverImageIndex.value &&
    index <= coverImageIndex.value
  ) {
    coverImageIndex.value++;
  }

  draggedImageIndex.value = null;
};

const onDragEnd = () => {
  draggedImageIndex.value = null;
};

// Methods - Variants
const addVariant = () => {
  if (canAddVariant.value) {
    const variantId = Date.now() + Math.random();
    variants.value.push({
      id: variantId,
      name: "",
      options: [{ id: Date.now(), name: "", images: [] }],
    });
    variantNames.value[variantId] = ""; // Initialize empty name
    variantUsesImages.value[variantId] = false;
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
  variants.value[variantIndex].options.push({
    id: Date.now() + Math.random(),
    name: "",
    images: [],
  });
};

const removeOption = (variantIndex, optionIndex) => {
  variants.value[variantIndex].options.splice(optionIndex, 1);
};

const toggleVariantImages = (variantId) => {
  variantUsesImages.value[variantId] = !variantUsesImages.value[variantId];

  if (!variantUsesImages.value[variantId]) {
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

// Generate combinations
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
    combinations.value = newCombinations.slice(0, maxOptions);
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

// Submit
const handleSubmit = async (values) => {
  if (productImages.value.length === 0) {
    toast.error("Minimal tambahkan 1 foto produk");
    return;
  }

  if (useVariants.value) {
    if (variants.value.length === 0) {
      toast.error("Minimal tambahkan 1 varian");
      return;
    }

    if (combinationsExceedLimit.value) {
      toast.error(`Kombinasi maksimal ${maxOptions}`);
      return;
    }

    const hasInvalidCombo = combinations.value.some(
      (c) => !c.price || c.price <= 0 || c.stock < 0
    );
    if (hasInvalidCombo) {
      toast.error("Semua kombinasi harus diisi harga dan stok yang valid");
      return;
    }
  }

  loading.value = true;

  try {
    const formData = new FormData();

    formData.append("_method", "PUT"); // For Laravel PUT request
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("category_id", values.category_id);
    formData.append("min_purchase", values.min_purchase);
    formData.append("condition", values.condition);

    selectedSubCategories.value.forEach((subCat, index) => {
      formData.append(`sub_categories[${index}]`, subCat);
    });

    // Images - send both new and existing
    productImages.value.forEach((img, index) => {
      if (img.existing) {
        formData.append(`existing_images[${index}][id]`, img.id);
        formData.append(
          `existing_images[${index}][is_cover]`,
          index === coverImageIndex.value
        );
        formData.append(`existing_images[${index}][order]`, index);
      } else {
        formData.append(`images[${index}]`, img.file);
        formData.append(
          `images[${index}][is_cover]`,
          index === coverImageIndex.value
        );
        formData.append(`images[${index}][order]`, index);
      }
    });

    if (useVariants.value) {
      variants.value.forEach((variant, vIndex) => {
        formData.append(`variants[${vIndex}][id]`, variant.id);
        formData.append(`variants[${vIndex}][name]`, variant.name);
        formData.append(
          `variants[${vIndex}][uses_images]`,
          variantUsesImages.value[variant.id] || false
        );

        variant.options.forEach((opt, oIndex) => {
          if (opt.name.trim()) {
            formData.append(
              `variants[${vIndex}][options][${oIndex}][id]`,
              opt.id
            );
            formData.append(
              `variants[${vIndex}][options][${oIndex}][name]`,
              opt.name.trim()
            );

            if (variantUsesImages.value[variant.id] && opt.images.length > 0) {
              opt.images.forEach((img, iIndex) => {
                if (img.existing) {
                  formData.append(
                    `variants[${vIndex}][options][${oIndex}][existing_images][${iIndex}]`,
                    img.id
                  );
                } else {
                  formData.append(
                    `variants[${vIndex}][options][${oIndex}][images][${iIndex}]`,
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
        formData.append(`combinations[${cIndex}][sku]`, combo.sku || "");
        formData.append(`combinations[${cIndex}][price]`, combo.price);
        formData.append(`combinations[${cIndex}][stock]`, combo.stock);
      });
    } else {
      formData.append("price", values.price);
      formData.append("stock", values.stock);
    }

    // TODO: API call
    // await api.post(`/merchant/products/${route.params.id}`, formData);

    setTimeout(() => {
      toast.success("Produk berhasil diperbarui");
      router.push(`/merchant-center/products/${route.params.id}`);
    }, 1000);
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal memperbarui produk");
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Loading State -->
    <div v-if="loadingData" class="flex justify-center items-center py-20">
      <div
        class="w-10 h-10 border-4 border-gray-300 border-t-merchant-primary rounded-full animate-spin"
      ></div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Mobile Header -->
      <div
        class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl"
      >
        <button
          @click="goBack"
          class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition"
        >
          <i class="pi pi-arrow-left"></i>
        </button>
        <h1 class="text-lg font-semibold">Edit Produk</h1>
      </div>

      <!-- Desktop Header -->
      <div class="hidden sm:block sticky top-0 left-0 right-0 z-50 py-6">
        <div
          class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4"
        >
          <div>
            <nav class="flex items-center gap-2 text-sm">
              <template v-for="(crumb, index) in breadcrumbs" :key="index">
                <router-link
                  v-if="crumb.path"
                  :to="crumb.path"
                  class="text-muted-foreground hover:text-merchant-primary transition flex items-center gap-2 text-base lg:text-2xl"
                >
                  {{ crumb.label }}
                </router-link>
                <span
                  v-else
                  class="text-merchant-primary font-bold text-base lg:text-2xl whitespace-nowrap"
                >
                  {{ crumb.label }}
                </span>
                <i
                  v-if="index < breadcrumbs.length - 1"
                  class="pi pi-chevron-right text-gray-400 text-xs"
                ></i>
              </template>
            </nav>
            <p class="text-muted-foreground text-xs lg:text-sm">
              Perbarui informasi produk Anda.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <Button
              @click="$refs.formRef.handleSubmit()"
              variant="merchant"
              size="md"
              :loading="loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-check"></i>
              <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- Spacer for Mobile -->
      <div class="h-[72px] sm:h-0"></div>

      <!-- Form -->
      <div class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
        <Form
          ref="formRef"
          :validation-schema="schema"
          :initial-values="initialValues"
          @submit="handleSubmit"
        >
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

                <div
                  class="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center pointer-events-none"
                >
                  <i class="pi pi-arrows-alt text-white text-xs"></i>
                </div>

                <div
                  v-if="index === coverImageIndex"
                  class="absolute top-2 left-2 px-2 py-1 bg-merchant-primary text-white text-[10px] font-semibold rounded-full flex items-center gap-1"
                >
                  <i class="pi pi-star-fill"></i>
                  <span>Cover</span>
                </div>

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
              Drag gambar untuk mengubah urutan. Foto pertama menjadi cover.
              Maks 6 foto.
            </p>
          </div>

          <!-- Info Dasar -->
          <div
            class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm"
          >
            <h3
              class="text-sm font-semibold text-black flex items-center gap-2"
            >
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

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectField
                name="category_id"
                label="Kategori Utama"
                :options="categoriesLevel1"
                v-model="selectedCategory"
                required
              />

              <div v-if="categoriesLevel2.length > 0">
                <label class="block text-sm font-bold text-black mb-2">
                  Sub Kategori
                  <span class="text-xs font-normal text-muted-foreground"
                    >(Maks. 4)</span
                  >
                </label>

                <div class="space-y-2 mb-2">
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
                      class="w-9 h-9 rounded-xl bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition"
                    >
                      <i class="pi pi-trash text-sm"></i>
                    </button>
                  </div>
                </div>

                <button
                  v-if="canAddSubCategory"
                  @click="selectedSubCategories.push('')"
                  type="button"
                  class="text-sm text-merchant-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <i class="pi pi-plus text-xs"></i>
                  Tambah Sub Kategori
                </button>
              </div>
            </div>
          </div>

          <!-- Pengaturan Varian -->
          <div
            class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm"
          >
            <label
              @click="useVariants = !useVariants"
              class="flex items-center justify-between cursor-pointer"
            >
              <div>
                <h3 class="text-sm font-semibold text-black">
                  Gunakan Variasi
                </h3>
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

            <!-- Variants Grid - PERBAIKAN TextField dengan v-model unik -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                v-for="(variant, vIndex) in variants"
                :key="variant.id"
                class="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-merchant-primary/50 transition"
              >
                <!-- Variant Header -->
                <div class="p-4 space-y-4 bg-white">
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
                          variant.options.filter((opt) => opt.name.trim())
                            .length
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

                  <!-- PERBAIKAN: TextField dengan name unique per variant -->
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

                  <div v-if="vIndex === 0">
                    <label
                      @click="toggleVariantImages(variant.id)"
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
                          variantUsesImages[variant.id]
                            ? 'bg-merchant-primary'
                            : 'bg-gray-300',
                        ]"
                      >
                        <span
                          :class="[
                            'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                            variantUsesImages[variant.id]
                              ? 'translate-x-6'
                              : 'translate-x-1',
                          ]"
                        ></span>
                      </div>
                    </label>
                  </div>

                  <!-- Accordion Toggle -->
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

                <!-- Accordion Content - tetap sama seperti sebelumnya -->
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
                          type="button"
                          class="text-xs text-merchant-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <i class="pi pi-plus text-[10px]"></i>
                          Tambah
                        </button>
                      </div>

                      <div
                        class="space-y-2.5 max-h-[500px] overflow-y-auto pr-1"
                      >
                        <div
                          v-for="(option, oIndex) in variant.options"
                          :key="option.id"
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
                                  vIndex === 0 && variantUsesImages[variant.id]
                                "
                              >
                                <label
                                  class="text-xs font-semibold text-gray-600 mb-1.5 block"
                                >
                                  Foto Opsi
                                </label>

                                <div
                                  v-if="option.images.length > 0"
                                  class="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group"
                                >
                                  <img
                                    :src="option.images[0].preview"
                                    class="w-full h-full object-cover"
                                  />
                                  <button
                                    @click="
                                      removeOptionImage(vIndex, oIndex, 0)
                                    "
                                    type="button"
                                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                  >
                                    <i
                                      class="pi pi-trash text-white text-sm"
                                    ></i>
                                  </button>
                                </div>

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

                            <button
                              v-if="variant.options.length > 1"
                              @click="removeOption(vIndex, oIndex)"
                              type="button"
                              class="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 flex items-center justify-center transition flex-shrink-0 mt-0.5"
                            >
                              <i class="pi pi-times text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>

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
                <button
                  @click="openCombinationsModal"
                  type="button"
                  :disabled="totalCombinations === 0"
                  class="w-full sm:w-auto px-5 py-2.5 bg-merchant-primary text-white text-sm font-semibold rounded-lg hover:bg-merchant-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <i class="pi pi-cog mr-2"></i>
                  Atur Harga & Stok
                </button>
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

          <!-- Harga & Stok (tanpa variasi) -->
          <div
            v-if="!useVariants"
            class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
          >
            <h3
              class="text-sm font-semibold text-black flex items-center gap-2"
            >
              <i class="pi pi-tag text-merchant-primary"></i>
              Harga & Stok
            </h3>

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
                required
              />
            </div>
          </div>

          <!-- Min Purchase & Condition -->
          <div
            class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm"
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

          <!-- Submit Button Desktop -->
          <div class="hidden sm:flex justify-end gap-3">
            <Button
              type="submit"
              variant="merchant"
              size="md"
              :loading="loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <i v-else class="pi pi-check"></i>
              <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
            </Button>
          </div>

          <!-- Submit Button Mobile -->
          <div
            class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40"
          >
            <Button type="submit" :loading="loading" variant="merchant" block>
              Simpan Perubahan
            </Button>
          </div>
        </Form>
      </div>

      <!-- Modal Combinations (copy dari Create.vue) -->
      <!-- Combinations Modal - RESPONSIVE (Bottom Sheet Mobile, Center Modal Desktop) -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showCombinationsModal"
          @click="closeCombinationsModal"
          class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-0 sm:p-4"
        ></div>
      </transition>

      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="sm:opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
        enter-to-class="sm:opacity-100 sm:scale-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="sm:opacity-100 sm:scale-100 translate-y-0"
        leave-to-class="sm:opacity-0 sm:scale-95 translate-y-full sm:translate-y-0"
      >
        <div
          v-if="showCombinationsModal"
          @click.stop
          class="fixed inset-x-0 bottom-0 sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center z-[70] sm:pointer-events-none sm:w-3/4 sm:max-w-4xl sm:mx-auto"
        >
          <div
            class="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] sm:max-h-[90vh] sm:max-w-4xl sm:w-full flex flex-col sm:pointer-events-auto"
          >
            <!-- Modal Header -->
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
            >
              <div>
                <h2 class="text-lg font-semibold text-black">
                  Atur Harga & Stok
                </h2>
                <p
                  v-if="selectedCombinations.size > 0"
                  class="text-xs text-muted-foreground mt-1"
                >
                  {{ selectedCombinations.size }} kombinasi dipilih
                </p>
              </div>
              <button
                @click="closeCombinationsModal"
                type="button"
                class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                <i class="pi pi-times text-gray-600"></i>
              </button>
            </div>

            <!-- Bulk Edit Section -->
            <div
              class="px-4 sm:px-6 py-4 bg-merchant-primary/5 border-b border-gray-200"
            >
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
                  <span class="text-xs font-medium text-gray-700"
                    >Pilih Semua</span
                  >
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

            <!-- Modal Body - Scrollable -->
            <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
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
                    <TextField
                      label="SKU (Opsional)"
                      name="sku"
                      v-model="combo.sku"
                      type="text"
                      placeholder="Masukkan SKU"
                      :labelBold="false"
                    />

                    <div class="grid grid-cols-2 gap-3">
                      <TextField
                        label="Harga"
                        name="price"
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
                        name="stock"
                        v-model.number="combo.stock"
                        type="number"
                        min="0"
                        placeholder="0"
                        suffix="pcs"
                        :labelBold="false"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="border-t border-gray-200 p-4">
              <Button
                @click="closeCombinationsModal"
                type="button"
                variant="merchant"
                block
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </transition>
    </div>
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
