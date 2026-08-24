import React from 'react';
import Hero from '../Home/Hero';
import CategorySection from '../Home/CategorySection';
import Bestsellers from '../Home/Bestsellers';
import ShopTheLook from '../Home/ShopTheLook';
import BenefitsStrip from '../Home/BenefitsStrip';
import GallerySwiper from '../Home/GallerySwiper';
import Testimonials from '../Home/Testimonials';
import RandomProducts from '../Home/RandomProducts';
import SEOHead from '../SEOHead';

const Home = () => {
  return (
    <main className="bg-[#f5f5f5] min-h-screen selection:bg-black selection:text-white">
      <SEOHead
        title="Pasoja | Premium Apparel, Oversized Tees & Modern Streetwear"
        description="Shop Pasoja online for premium oversized t-shirts, casual shirts, jeans, hoodies, and luxury streetwear fits. Worldwide shipping available."
        keywords="Pasoja, Pasoja online store, pasoja.in, oversized t-shirts, streetwear India, luxury clothing, men fashion, women streetwear"
        url="https://pasoja.in/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "OnlineStore",
          "name": "Pasoja",
          "url": "https://pasoja.in/",
          "logo": "https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png",
          "email": "pasoja.help@gmail.com",
          "telephone": "+91-8959041514",
          "description": "Pasoja is a modern luxury apparel and streetwear brand offering premium oversized t-shirts, casual shirts, jeans, and hoodies with worldwide shipping."
        }}
      />
      <Hero />
      <BenefitsStrip />
      <GallerySwiper />
      <CategorySection />
      <Bestsellers />
      <RandomProducts />
      <ShopTheLook />
      <Testimonials />
    </main>
  );
};

export default Home;
