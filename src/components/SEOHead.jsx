import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinaryUtils';

const SEOHead = ({
  title = "Pasoja | Premium Apparel & Modern Streetwear",
  description = "Shop Pasoja for premium oversized t-shirts, hoodies, casual shirts, jeans, and modern streetwear. Worldwide shipping available.",
  keywords = "Pasoja, Pasoja online store, pasoja.in, oversized t-shirts, streetwear India, premium apparel, fashion brand",
  image = "https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png",
  url = "https://pasoja.in",
  type = "website",
  robots = "index, follow",
  canonical = "",
  jsonLd = null
}) => {
  const optimizedImage = getOptimizedCloudinaryUrl?.(image, { width: 1200 }) || image;
  const fullTitle = title.includes("Pasoja") ? title : `${title} | Pasoja`;
  const targetUrl = canonical || url || "https://pasoja.in";

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="author" content="Pasoja" />
      <link rel="canonical" href={targetUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={optimizedImage} />
      <meta property="og:url" content={targetUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Pasoja" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={optimizedImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json" id="seo-jsonld">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
