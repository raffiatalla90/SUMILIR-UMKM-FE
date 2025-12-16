<script setup>
// Import statements remain the same
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import Breadcrumb from "@/components/merchant/Breadcrumb.vue"; // ✅ ADD
import api from "@/libs/axios";
import { Form, useForm } from "vee-validate";
import * as yup from "yup";
import TextField from "@/components/forms/TextField.vue";
import SelectField from "@/components/forms/SelectField.vue";
import Button from "@/components/common/Button.vue";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
import ResponsiveModal from "@/components/common/ResponsiveModal.vue";
import { useCategories } from "@/composables/useCategories";
import { useJasa } from "@/composables/useJasa";
import { getImageUrl } from "@/libs/getImageUrl.js";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const serviceId = computed(() => route.params.id);

// Get merchantId from route
const currentMerchantId = computed(() => {
  return route.params.merchantId ? Number(route.params.merchantId) : null;
});

// Breadcrumb items
const breadcrumbItems = computed(() => [
  {
    label: "Jasa",
    path: `/merchant-center/${currentMerchantId.value}/jasas`,
  },
  {
    label: "Edit Jasa",
  },
]);

// Use composables
const {
  categoriesLevel1,
  categoriesLevel2,
  loadingLevel1,
  loadingLevel2,
  fetchLevel1Categories,
  fetchSubCategories,
} = useCategories();

const { loading: loadingService, fetchJasaDetail } = useJasa();

const loading = ref(false);
const loadingData = ref(true);

// State Management for Jasa
const name = ref("");
const description = ref("");
const serviceImages = ref([]);
const fileInput = ref(null);
const coverImageIndex = ref(0);

// Categories
const selectedCategory = ref(null);
const selectedSubCategories = ref([]);

// Add-on Groups
const addOnGroups = ref([]);
const maxAddOnGroups = 10;
const maxAddOnOptions = 20;

// Form fields
const formPrice = computed({
  get: () => values.price || 0,
  set: (val) => setFieldValue("price", val),
});

const formMinPurchase = computed({
  get: () => values.min_purchase || 1,
  set: (val) => setFieldValue("min_purchase", val),
});

// Validation Schema
const schema = yup.object({
  name: yup.string().required("Nama layanan wajib diisi"),
  description: yup.string().required("Deskripsi wajib diisi"),
  category_id: yup.number().required("Kategori utama wajib dipilih"),
  price: yup.number().min(0, "Harga minimal 0").required("Harga wajib diisi"),
  min_purchase: yup.number().integer("Minimal pembelian harus bilangan bulat").min(1, "Minimal pembelian minimal 1").required("Minimal pembelian wajib diisi"),
});

// VEE-VALIDATE SETUP
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
    price: 0,
  },
});

// Computed
const canAddSubCategory = computed(() => selectedSubCategories.value.length < 4);
const canAddAddOnGroup = computed(() => addOnGroups.value.length < maxAddOnGroups);

// Watchers
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
});

// Flag to prevent auto-regeneration during initial load
const isInitialLoad = ref(false);

// Fetch service data
const fetchServiceData = async () => {
  loadingData.value = true;
  isInitialLoad.value = true;

  try {
    const payload = await fetchJasaDetail(serviceId.value);

    const serviceData = payload;
    if (serviceData.categories && serviceData.categories.length > 0) {
      await fetchSubCategories(serviceData.categories[0].id);
    }

    // Normalize service images
    if (!Array.isArray(serviceData.images)) {
      serviceData.images = serviceData.images ? [serviceData.images] : [];
    }

    serviceImages.value = (serviceData.images || []).map((img) => ({
      id: img.id,
      preview: getImageUrl(img.id),
      is_cover: !!img.is_cover,
      existing: true,
    }));

    coverImageIndex.value = serviceImages.value.findIndex((img) => img.is_cover);
    if (coverImageIndex.value === -1 && serviceImages.value.length > 0) {
      coverImageIndex.value = 0;
      serviceImages.value[0].is_cover = true;
    }

    // Populate form
    populateFormFromService(serviceData);
  } catch (error) {
    toast.error(error.response?.data?.message || "Gagal memuat data jasa");
    router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
  } finally {
    loadingData.value = false;
    await nextTick();
    isInitialLoad.value = false;
  }
};

// Handle image upload
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        serviceImages.value.push({
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          is_cover: serviceImages.value.length === 0,
          existing: false,
        });
        if (serviceImages.value.length === 1) coverImageIndex.value = 0;
      };
      reader.readAsDataURL(file);
    }
  });
  event.target.value = "";
};

const removeImage = (index) => {
  serviceImages.value.splice(index, 1);
  if (coverImageIndex.value >= serviceImages.value.length) {
    coverImageIndex.value = Math.max(0, serviceImages.value.length - 1);
  }
};

// Add-on Group Methods
const addAddOnGroup = () => {
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
  }
};

// Submit Handler
const onSubmit = veeHandleSubmit(
  async (values) => {
    try {
      const formData = new FormData();

      // Basic Info
      formData.append("_method", "PUT");
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("category_id", values.category_id);
      formData.append("min_purchase", values.min_purchase);

      // Add-ons
      addOnGroups.value.forEach((group, gIndex) => {
        if (group.name.trim()) {
          if (group.id) {
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

      // Service Images
      serviceImages.value.forEach((img, index) => {
        if (img.existing) {
          formData.append(`existing_images[${index}][id]`, img.id);
          formData.append(
            `existing_images[${index}][is_cover]`,
            index === coverImageIndex.value ? 1 : 0
          );
        } else {
          formData.append(`images[${index}][file]`, img.file);
        }
      });

      formData.append("cover_image_index", coverImageIndex.value);

      // API Call
      await api.post(`/jasas/${serviceId.value}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Jasa berhasil diperbarui");
      router.push(`/merchant-center/${currentMerchantId.value}/jasas`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui jasa");
    } finally {
      loading.value = false;
    }
  }
);

// Populate form from service data
const populateFormFromService = (serviceData) => {
  name.value = serviceData.name || "";
  description.value = serviceData.description || "";

  setFieldValue("name", serviceData.name || "");
  setFieldValue("description", serviceData.description || "");
  setFieldValue("category_id", serviceData.categories?.[0]?.id || null);
  setFieldValue("min_purchase", serviceData.min_purchase ?? 1);

  if (serviceData.categories && serviceData.categories.length > 0) {
    selectedCategory.value = serviceData.categories[0].id;
    selectedSubCategories.value = serviceData.categories
      .slice(1)
      .map((cat) => cat.id);
  }

  // Images
  serviceImages.value = (serviceData.images || []).map((img) => ({
    id: img.id,
    preview: img.id ? getImageUrl(img.id) : img.image_path || "",
    is_cover: !!img.is_cover,
    existing: true,
  }));

  coverImageIndex.value = serviceImages.value.findIndex((img) => img.is_cover);
  if (coverImageIndex.value === -1 && serviceImages.value.length > 0) {
    coverImageIndex.value = 0;
  }

  // Add-on groups
  const addonGroups = serviceData.addon_groups ?? [];
  addOnGroups.value = addonGroups.map((group) => ({
    id: group.id,
    name: group.addon_group_name || group.name || "",
    is_required: (group.min_selection ?? 0) > 0,
    min_selection: group.min_selection ?? 0,
    max_selection: group.max_selection ?? 1,
    options: (group.options || []).map((opt) => ({
      id: opt.id,
      name: opt.addon?.addon_name || opt.addon_name || "",
      price: parseFloat(opt.addon_price ?? 0),
    })),
  }));
};

// Fetch categories on mount
onMounted(async () => {
  await fetchLevel1Categories();
  await fetchServiceData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 sm:pb-0">
    <!-- Mobile Header -->
    <div class="fixed sm:hidden top-0 left-0 right-0 bg-merchant-primary text-white px-4 py-6 flex items-center justify-center z-50 rounded-b-2xl shadow-lg">
      <button @click="router.back()" class="absolute left-4 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition">
        <i class="pi pi-arrow-left"></i>
      </button>
      <h1 class="text-lg font-semibold">Edit Layanan</h1>
    </div>

    <!-- Desktop Header -->
    <div class="hidden sm:block sticky top-0 left-0 right-0 z-30 py-6">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-y-2 items-center justify-between gap-x-4">
        <div>
          <!-- ✅ Use Breadcrumb Component -->
          <Breadcrumb :items="breadcrumbItems" :merchantId="currentMerchantId" />
          <p class="text-muted-foreground text-xs lg:text-sm">
            {{ loadingData ? "Memuat data layanan..." : name || "Edit Layanan" }}
          </p>
        </div>

        <div v-if="!loadingData" class="flex items-center gap-3">
          <Button @click="onSubmit" variant="merchant" size="md" :loading="loading">
            <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Spacer for Mobile -->
    <div class="h-[72px] sm:h-0"></div>

    <!-- ✅ Loading State -->
    <div v-if="loadingData" class="flex flex-col justify-center items-center py-20 gap-3">
      <div class="w-12 h-12 border-4 border-gray-300 border-t-merchant-primary rounded-full animate-spin"></div>
      <p class="text-sm text-muted-foreground">Memuat data layanan...</p>
    </div>

    <!-- ✅ Content (Only show when data loaded) -->
    <div v-else class="mx-auto px-0 sm:px-4 lg:px-6 sm:py-6 sm:pt-0">
      <Form ref="formRef" :validation-schema="schema" :initial-values="initialValues" @submit="onSubmit">
        <!-- Foto Layanan -->
        <div class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 sm:rounded-xl sm:shadow-sm">
          <h3 class="text-sm font-semibold text-black mb-3 flex items-center gap-2">
            <i class="pi pi-image text-merchant-primary"></i>
            Foto Layanan
            <span class="text-xs font-normal text-danger-foreground">*</span>
          </h3>

          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
            <div
              v-for="(img, index) in serviceImages"
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
              <img :src="img.preview" class="w-full h-full object-cover pointer-events-none" />
              <div class="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center pointer-events-none">
                <i class="pi pi-arrows-alt text-white text-xs"></i>
              </div>

              <div v-if="index === coverImageIndex" class="absolute top-2 left-2 px-2 py-1 bg-merchant-primary text-white text-[10px] font-semibold rounded-full flex items-center gap-1">
                <i class="pi pi-star-fill"></i>
                <span>Cover</span>
              </div>

              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button @click.stop="removeImage(index)" type="button" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition">
                  <i class="pi pi-trash text-danger-foreground text-sm"></i>
                </button>
              </div>
            </div>

            <button
              v-if="serviceImages.length < 6"
              @click="triggerFileInput"
              type="button"
              class="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-merchant-primary hover:bg-merchant-primary/5 transition flex flex-col items-center justify-center gap-2"
            >
              <i class="pi pi-plus text-2xl text-merchant-primary"></i>
              <span class="text-xs text-muted-foreground">Tambah</span>
            </button>
          </div>

          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload" />
          <p class="text-xs text-muted-foreground">
            <i class="pi pi-info-circle"></i>
            Drag gambar untuk mengubah urutan. Foto pertama menjadi cover. Maks 6 foto.
          </p>
        </div>

        <!-- Informasi Layanan -->
        <div class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-3 sm:rounded-xl sm:shadow-sm">
          <h3 class="text-sm font-semibold text-black flex items-center gap-2">
            <i class="pi pi-info-circle text-merchant-primary"></i>
            Informasi Layanan
          </h3>

          <TextField
            name="name"
            label="Nama Layanan"
            placeholder="Contoh: Layanan Konsultasi"
            v-model="name"
            required
          />
          <TextField
            name="description"
            label="Deskripsi"
            v-model="description"
            textarea
            :rows="4"
            placeholder="Jelaskan detail layanan Anda"
            required
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              name="category_id"
              label="Kategori Utama"
              :options="categoriesLevel1"
              v-model="selectedCategory"
              :loading="loadingLevel1"
              required
            />

            <div v-if="selectedCategory">
              <label class="block text-sm font-bold text-black mb-2">
                Sub Kategori
                <span class="text-xs font-normal text-muted-foreground"
                  >(Maks. 4)</span
                >
              </label>

              <div v-if="loadingLevel2" class="py-4 px-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div class="w-5 h-5 border-2 border-gray-300 border-t-merchant-primary rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-xs text-muted-foreground">Memuat sub kategori...</p>
              </div>

              <div v-else-if="!loadingLevel2 && categoriesLevel2.length === 0" class="py-4 px-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <i class="pi pi-inbox text-2xl text-gray-300 mb-2 block"></i>
                <p class="text-xs text-gray-500">Tidak ada sub kategori tersedia</p>
              </div>

              <div v-else class="space-y-2">
                <div class="space-y-2 mb-2">
                  <div v-for="(subCat, index) in selectedSubCategories" :key="index" class="flex items-center gap-2">
                    <select v-model="selectedSubCategories[index]" class="flex-1 px-3 py-2.5 border border-primary rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="" disabled>Pilih sub kategori</option>
                      <option v-for="cat in categoriesLevel2" :key="cat.value" :value="cat.value" :disabled="selectedSubCategories.includes(cat.value) && selectedSubCategories[index] !== cat.value">
                        {{ cat.label }}
                      </option>
                    </select>
                    <button @click="selectedSubCategories.splice(index, 1)" type="button" class="w-9 h-9 rounded-xl bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center transition">
                      <i class="pi pi-trash text-sm"></i>
                    </button>
                  </div>
                </div>

                <button v-if="canAddSubCategory" @click="selectedSubCategories.push('')" type="button" class="text-sm text-merchant-primary hover:underline flex items-center gap-1 font-medium">
                  <i class="pi pi-plus text-xs"></i>
                  Tambah Sub Kategori
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add-on Groups Section -->
        <div class="bg-white mb-2 sm:mb-4 p-4 sm:p-6 space-y-4 sm:rounded-xl sm:shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-black flex items-center gap-2">
                <i class="pi pi-plus-circle text-merchant-primary"></i>
                Grup Add-on (Opsional)
                <span class="text-sm font-normal text-muted-foreground">(Maks. {{ maxAddOnGroups }})</span>
              </h3>
              <p class="text-xs text-muted-foreground mt-1">
                Kelompokkan layanan tambahan (contoh: waktu tambahan, lokasi tertentu)
              </p>
            </div>
            <button v-if="canAddAddOnGroup" @click="addAddOnGroup" type="button" class="text-sm text-merchant-primary hover:underline flex items-center gap-1 font-semibold">
              <i class="pi pi-plus"></i>
              Tambah
            </button>
          </div>

          <!-- Add-on Groups Content -->
          <div v-if="addOnGroups.length > 0" class="space-y-3">
            <div v-for="(group, gIndex) in addOnGroups" :key="group.id">
              <div class="bg-white border border-gray-200 p-4 rounded-xl">
                <TextField v-model="group.name" label="Nama Grup Add-on" placeholder="Contoh: Waktu Tambahan, Lokasi Tambahan" required />
                <div class="flex justify-between items-center mt-3">
                  <button @click="removeAddOnGroup(gIndex)" type="button" class="w-6 h-6 rounded-full bg-danger-background text-danger-foreground hover:bg-red-100 flex items-center justify-center">
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <i class="pi pi-plus-circle text-4xl text-gray-300 mb-3 block"></i>
            <p class="text-sm text-gray-500 mb-3">Belum ada grup add-on ditambahkan</p>
            <button @click="addAddOnGroup" type="button" class="inline-flex items-center gap-2 px-4 py-2 bg-merchant-primary text-white rounded-lg hover:bg-merchant-primary/90 transition text-sm font-medium">
              <i class="pi pi-plus"></i>
              Tambah Grup Pertama
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="hidden sm:flex justify-end gap-3">
          <Button type="submit" variant="merchant" size="md" :loading="loading">
            <span>{{ loading ? "Menyimpan..." : "Simpan Perubahan" }}</span>
          </Button>
        </div>

        <!-- Mobile Submit Button -->
        <div class="fixed sm:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <Button type="submit" :loading="loading" variant="merchant" block>
            Simpan Perubahan
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for the page */
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

.transition-all {
  transition-property: max-height, opacity;
}
</style>
