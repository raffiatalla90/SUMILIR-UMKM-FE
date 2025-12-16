// ✅ PWA registration - only runs in production
let updateSW = null;

if (import.meta.env.PROD) {
  try {
    const { registerSW } = await import("virtual:pwa-register");
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        updateSW(true);
      },
      onOfflineReady() {
        // optional: show toast "Siap offline"
      },
    });
  } catch (error) {
    console.log("[PWA] Service worker registration skipped (dev mode)");
  }
}

export { updateSW };
