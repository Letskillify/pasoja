import React, { useEffect } from 'react';
import Hero from '../Home/Hero';
import CategorySection from '../Home/CategorySection';
import Bestsellers from '../Home/Bestsellers';
import ShopTheLook from '../Home/ShopTheLook';
import BenefitsStrip from '../Home/BenefitsStrip';
import GallerySwiper from '../Home/GallerySwiper';
import Testimonials from '../Home/Testimonials';
import { db } from '../Firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Home = () => {
  useEffect(() => {
    const updateDatabaseUrls = async () => {
      try {
        // Update category URLs in Firestore
        await updateDoc(doc(db, 'shop_by_category', 'cat_1'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/aksfxvhby4udttszyk8u.jpg'
        });
        await updateDoc(doc(db, 'shop_by_category', 'cat_2'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317405/jmm894vjineywo4jlbkm.jpg'
        });

        // Update lookbook URLs in Firestore
        await updateDoc(doc(db, 'shop_the_look', 'look_1'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317398/yastxilcsghbsdmkcp2x.jpg'
        });
        await updateDoc(doc(db, 'shop_the_look', 'look_2'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317396/kq4a9s5dkptuvp8iev2j.jpg'
        });
        await updateDoc(doc(db, 'shop_the_look', 'look_3'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317395/qegbcn6kqdrl2s44cwm0.jpg'
        });
        await updateDoc(doc(db, 'shop_the_look', 'look_4'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317397/pac3lrqmjr4nsemoldna.jpg'
        });

        // Update community review URLs in Firestore
        await updateDoc(doc(db, 'community_images', 'img_1'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317400/imjhv8luafwtxfu9iswq.jpg'
        });
        await updateDoc(doc(db, 'community_images', 'img_2'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317401/ffl2xbtgi5vetrobuxzl.jpg'
        });
        await updateDoc(doc(db, 'community_images', 'img_3'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317401/vuoqvdcaff3ni3jdmjkq.jpg'
        });
        await updateDoc(doc(db, 'community_images', 'img_4'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317402/bz0d4jlszdu0ju8e0iwl.jpg'
        });
        await updateDoc(doc(db, 'community_images', 'img_5'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317403/fc1is0gziu7rgyejzlwf.jpg'
        });
        await updateDoc(doc(db, 'community_images', 'img_6'), {
          image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317404/zikp7hjgjndo7mjvqm4f.jpg'
        });

        console.log("Firestore image references successfully migrated to Cloudinary URLs.");
      } catch (err) {
        console.warn("Stale documents might not exist yet, ignoring:", err.message);
      }
    };
    updateDatabaseUrls();
  }, []);

  return (
    <main className="bg-[#0a0a0a] min-h-screen selection:bg-white selection:text-black">
      <Hero />
      <BenefitsStrip />
      <GallerySwiper />
      <CategorySection />
      <Bestsellers />
      <ShopTheLook />
      <Testimonials />
    </main>
  );
};

export default Home;
