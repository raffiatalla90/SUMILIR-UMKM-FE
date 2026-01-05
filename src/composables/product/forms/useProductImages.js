import { ref } from "vue";

export function useProductImages({ maxImages, maxSizeBytes, toast }) {
  const productImages = ref([]);
  const coverImageIndex = ref(0);
  const draggedImageIndex = ref(null);
  const fileInput = ref(null);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const remainingSlots = maxImages - productImages.value.length;

    if (remainingSlots <= 0) {
      toast.warning(`Maksimal ${maxImages} foto produk`);
      event.target.value = "";
      return;
    }

    files.slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar`);
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`Gambar ${file.name} terlalu besar`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        productImages.value.push({
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
        });
        coverImageIndex.value = 0;
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeImage = (index) => {
    productImages.value.splice(index, 1);
    coverImageIndex.value = productImages.value.length ? 0 : null;
  };

  const onDragStart = (_, index) => {
    draggedImageIndex.value = index;
  };
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (_, index) => {
    if (draggedImageIndex.value === null) return;
    const item = productImages.value[draggedImageIndex.value];
    productImages.value.splice(draggedImageIndex.value, 1);
    productImages.value.splice(index, 0, item);
    coverImageIndex.value = 0;
    draggedImageIndex.value = null;
  };
  const onDragEnd = () => {
    draggedImageIndex.value = null;
  };

  return {
    productImages,
    coverImageIndex,
    fileInput,
    triggerFileInput,
    handleImageUpload,
    removeImage,
    onDragStart,
    onDrop,
    onDragOver,
    onDragEnd,
  };
}
