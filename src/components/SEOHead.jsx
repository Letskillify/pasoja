import { useEffect } from 'react';

const SEOHead = ({
  title = "Pasoja | Premium Apparel & Modern Streetwear",
  description = "Shop Pasoja for premium oversized t-shirts, hoodies, casual shirts, jeans, and modern streetwear. Worldwide shipping available.",
  keywords = "Pasoja, Pasoja online store, pasoja.in, oversized t-shirts, streetwear India, premium apparel, fashion brand",
  image = "https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/p3jd3nuet4vkqbfd5qaz.png",
  url = "https://pasoja.in",
  type = "website",
  robots = "index, follow",
  canonical = "",
  jsonLd = null
}) => {
  useEffect(() => {
    // Title
    const fullTitle = title.includes("Pasoja") ? title : `${title} | Pasoja`;
    document.title = fullTitle;

    // Helper to update meta tag
    const updateMeta = (nameAttr, nameVal, contentVal) => {
      if (!contentVal) return;
      let tag = document.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(nameAttr, nameVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentVal);
    };

    // Helper to update link tag
    const updateLink = (relVal, hrefVal) => {
      if (!hrefVal) return;
      let tag = document.querySelector(`link[rel="${relVal}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', relVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', hrefVal);
    };

    const targetUrl = canonical || url || "https://pasoja.in";

    // Standard Meta Tags
    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', keywords);
    updateMeta('name', 'robots', robots);
    updateMeta('name', 'author', 'Pasoja');

    // Open Graph Tags
    updateMeta('property', 'og:title', fullTitle);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', image);
    updateMeta('property', 'og:url', targetUrl);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:site_name', 'Pasoja');

    // Twitter Card Tags
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', fullTitle);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', image);

    // Canonical Link
    updateLink('canonical', targetUrl);

    // JSON-LD Structured Data
    let scriptTag = document.querySelector('script[type="application/ld+json"]#seo-jsonld');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('id', 'seo-jsonld');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

  }, [title, description, keywords, image, url, type, robots, canonical, jsonLd]);

  return null;
};

export default SEOHead;
