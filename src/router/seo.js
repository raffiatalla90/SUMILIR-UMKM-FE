function setOrCreateMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

export function setMeta({ title, description, image }) {
  // TITLE
  if (title) {
    document.title = title;
  }

  // DESCRIPTION
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description || "");

  // CANONICAL
  let canonical = document.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute(
    "href",
    window.location.origin + window.location.pathname
  );

  // OG IMAGE (minimal)
  if (image) {
    let ogImage = document.querySelector("meta[property='og:image']");
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", image);
  }

  if (title) {
    setOrCreateMeta("property", "og:title", title);
  }
  if (description) {
    setOrCreateMeta("property", "og:description", description);
  }

  const defaultOgImage = "https://sumilir.web.id/og-image.png";

  setOrCreateMeta("property", "og:image", image || defaultOgImage);
}
