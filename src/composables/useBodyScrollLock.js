import { watch, onUnmounted } from "vue";

export function useBodyScrollLock(isLocked) {
  const lockScroll = () => {
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  watch(
    () => isLocked.value,
    (locked) => {
      if (locked) {
        lockScroll();
      } else {
        unlockScroll();
      }
    },
    { immediate: true }
  );

  // Cleanup on unmount
  onUnmounted(() => {
    unlockScroll();
  });

  return {
    lockScroll,
    unlockScroll,
  };
}
