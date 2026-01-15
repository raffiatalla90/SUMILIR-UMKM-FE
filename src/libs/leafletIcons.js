import L from "leaflet";

const storeIconCache = new Map();

function normalizeColor(color) {
  if (typeof color === "string" && color.trim()) return color.trim();
  return "var(--color-primary)";
}

export function getUmkmStoreIcon(color) {
  const normalized = normalizeColor(color);
  if (storeIconCache.has(normalized)) return storeIconCache.get(normalized);

  const icon = L.divIcon({
    className: "umkm-marker-icon",
    html: `
      <div class="umkm-marker" style="--umkm-marker-color: ${normalized}">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 10.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9.5"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M3 10.5l2-7h14l2 7"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 21v-7h6v7"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });

  storeIconCache.set(normalized, icon);
  return icon;
}

export function getUmkmMarkerColorByVariant(variant) {
  return variant === "merchant"
    ? "var(--color-merchant-primary)"
    : "var(--color-merchant-primary)";
}
