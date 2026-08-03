import React from 'react';
import Hero from '../Home/Hero';
import CategorySection from '../Home/CategorySection';
import Bestsellers from '../Home/Bestsellers';
import ShopTheLook from '../Home/ShopTheLook';
import BenefitsStrip from '../Home/BenefitsStrip';
import GallerySwiper from '../Home/GallerySwiper';
import Testimonials from '../Home/Testimonials';
import RandomProducts from '../Home/RandomProducts';

const Home = () => {
  return (
    <main className="bg-[#faf9f5] min-h-screen selection:bg-black selection:text-white">
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
