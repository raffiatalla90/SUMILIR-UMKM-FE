function setOrCreateMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content || "");
}

function setOrCreateLink(rel, href) {
  let el = document.querySelector(`link[rel='${rel}']`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href || "");
}

export function setMeta({ title, description, image, url, type }) {
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
  const canonicalUrl = url || window.location.origin + window.location.pathname;
  setOrCreateLink("canonical", canonicalUrl);

  // OpenGraph
  const defaultOgImage = "https://sumilir.web.id/og-image.png";
  const resolvedImage = image || defaultOgImage;
  const resolvedType = type || "website";

  setOrCreateMeta("property", "og:title", title || document.title);
  setOrCreateMeta("property", "og:description", description || "");
  setOrCreateMeta("property", "og:image", resolvedImage);
  setOrCreateMeta("property", "og:url", canonicalUrl);
  setOrCreateMeta("property", "og:type", resolvedType);

  // Twitter
  setOrCreateMeta("name", "twitter:card", "summary_large_image");
  setOrCreateMeta("name", "twitter:title", title || document.title);
  setOrCreateMeta("name", "twitter:description", description || "");
  setOrCreateMeta("name", "twitter:image", resolvedImage);
}

export function setJsonLd(id, data) {
  const scriptId = id ? String(id) : "jsonld";
  let el = document.getElementById(scriptId);

  if (!el) {
    el = document.createElement("script");
    el.id = scriptId;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }

  el.text = JSON.stringify(data || {}, null, 0);
}
