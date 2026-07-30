import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';

const mobileCategories = [
  { id: 'm_1', title: 'OVERSIZED T-SHIRT', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop', link: '/shop?category=tshirts' },
  { id: 'm_2', title: 'SHIRTS', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop', link: '/shop?category=shirts' },
  { id: 'm_3', title: 'WAFFLE KNIT', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop', link: '/shop?category=sweaters' },
  { id: 'm_4', title: 'QUARTER ZIP', image: 'https://res.cloudinary.com/duzwys877/image/upload/v1783595079/ChatGPT_Image_Jul_9_2026_04_33_24_PM_nudlxb.png', link: '/shop?category=jackets' }
];

const CategorySection = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'shop_by_category'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (snap.empty) {
          const defaults = [
            { id: 'cat_1', title: 'MENS', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317399/aksfxvhby4udttszyk8u.jpg', link: '/shop?category=Men', sort_order: 1, is_active: true, position: 'left' },
            { id: 'cat_2', title: 'WOMENS', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317405/jmm894vjineywo4jlbkm.jpg', link: '/shop?category=Women', sort_order: 2, is_active: true, position: 'right' }
          ];
          for (const item of defaults) {
            await setDoc(doc(db, 'shop_by_category', item.id), item);
          }
          setBanners(defaults);
        } else {
          const list = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.is_active !== false);
          const positionedList = list.map((item, index) => ({
            ...item,
            position: index % 2 === 0 ? 'left' : 'right'
          }));
          setBanners(positionedList);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-[#faf9f5] overflow-hidden relative border-t border-zinc-200">
      {/* Header Container */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] text-[#b8860b] uppercase mb-2 font-bold">
          THE COLLECTION
        </p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-zinc-900 uppercase whitespace-nowrap">
              SHOP BY CATEGORY
            </h2>
            <div className="hidden md:block flex-1 h-[1px] bg-zinc-200 ml-8 mr-4 self-center mt-1" />
          </div>
          <div className="text-zinc-600 text-xs sm:text-sm tracking-wide max-w-[320px] text-left md:text-right font-light leading-relaxed">
            Curated separates crafted for uncompromising quality and fit.
          </div>
        </div>
      </div>

      {/* Mobile Grid View (lg:hidden) - Zero borders, subtle overlays, centered text at bottom */}
      <div className="lg:hidden w-full px-4">
        <div className="grid grid-cols-2 gap-2">
          {mobileCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="relative group block overflow-hidden bg-[#111] aspect-[3/4] w-full"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-0 right-0 z-20 text-center pointer-events-none px-2">
                <span className="text-[10px] sm:text-xs tracking-[0.15em] text-white uppercase font-bold">
                  {cat.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Grid View (hidden lg:grid) - Full Width Edge-to-Edge with 0 Gap */}
      <div className="hidden lg:grid grid-cols-2 gap-0 w-full max-w-none">
        {banners.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full"
          >
            <Link
              to={banner.link}
              className="relative group block overflow-hidden bg-[#111] w-full aspect-[1.35/1] border-none rounded-none"
            >
              {/* Hero Product Image */}
              <img
                src={banner.image}
                alt={`${banner.title} collection`}
                className="absolute inset-0 w-full h-full object-cover opacity-75 transition-all duration-[700ms] ease-out group-hover:scale-[1.04] group-hover:brightness-[1.08] group-hover:opacity-90"
              />

              {/* Subtle dark gradient overlay at bottom for readability */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Decorative Details: Large Outlined Number */}
              <span
                className="absolute top-4 left-4 sm:top-6 sm:left-6 font-light leading-none select-none text-[7rem] sm:text-[9rem] md:text-[11rem] pointer-events-none"
                style={{
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.05)',
                  color: 'transparent'
                }}
              >
                {`0${index + 1}`}
              </span>

              {/* Decorative Details: Vertically Rotated NEW COLLECTION */}
              {banner.position === 'left' ? (
                <div
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none"
                  style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg) translateY(50%)' }}
                >
                  <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-white/20 uppercase font-mono">
                    NEW COLLECTION
                  </span>
                </div>
              ) : (
                <div
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none"
                  style={{ writingMode: 'vertical-lr' }}
                >
                  <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-white/20 uppercase font-mono">
                    NEW COLLECTION
                  </span>
                </div>
              )}

              {/* Bottom Left Content */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-20 flex flex-col items-start pointer-events-none">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white uppercase tracking-[0.15em] leading-none mb-3">
                  {banner.title}
                </h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-white uppercase font-semibold border-b border-white/60 pb-0.5">
                    SHOP NOW
                  </span>
                  <span className="text-white/80 text-sm transform transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
