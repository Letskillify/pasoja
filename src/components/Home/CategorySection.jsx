import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';
import OptimizedCloudinaryImage from '../OptimizedCloudinaryImage';

const DEFAULT_DESKTOP_BANNERS = [
  { id: 'cat_sbc_1', name: 'OVERSIZED T-SHIRT', title: 'OVERSIZED T-SHIRT', slug: 'oversized-t-shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', link: '/shop?category=T-Shirts', sort_order: 1, is_active: true, position: 'left' },
  { id: 'cat_sbc_2', name: 'SHIRTS', title: 'SHIRTS', slug: 'shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shirts', sort_order: 2, is_active: true, position: 'right' },
  { id: 'cat_sbc_3', name: 'WAFFLE KNIT', title: 'WAFFLE KNIT', slug: 'waffle-knit', image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Sweaters', sort_order: 3, is_active: true, position: 'left' },
  { id: 'cat_sbc_4', name: 'QUARTER ZIP', title: 'QUARTER ZIP', slug: 'quarter-zip', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Jackets', sort_order: 4, is_active: true, position: 'right' }
];

const DEFAULT_MOBILE_CATEGORIES = [
  { id: 'm_cat_1', name: 'SHIRTS', title: 'SHIRTS', badge: '', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shirts', sort_order: 1, is_active: true },
  { id: 'm_cat_2', name: 'TROUSERS', title: 'TROUSERS', badge: '', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Trousers', sort_order: 2, is_active: true },
  { id: 'm_cat_3', name: 'POLOS', title: 'POLOS', badge: '', image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Polos', sort_order: 3, is_active: true },
  { id: 'm_cat_4', name: 'JEANS', title: 'JEANS', badge: '', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Jeans', sort_order: 4, is_active: true },
  { id: 'm_cat_5', name: 'CARGOS', title: 'CARGOS', badge: '', image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Cargos', sort_order: 5, is_active: true },
  { id: 'm_cat_6', name: 'T-SHIRTS', title: 'T-SHIRTS', badge: '', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', link: '/shop?category=T-Shirts', sort_order: 6, is_active: true },
  { id: 'm_cat_7', name: 'SHORTS', title: 'SHORTS', badge: '', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shorts', sort_order: 7, is_active: true },
  { id: 'm_cat_8', name: 'PLUS SIZE', title: 'PLUS SIZE', badge: '3XL TO 6XL', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Plus-Size', sort_order: 8, is_active: true },
  { id: 'm_cat_9', name: 'SHOES', title: 'SHOES', badge: 'JUST LAUNCHED', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', link: '/shop?category=Shoes', sort_order: 9, is_active: true }
];

const CategorySection = () => {
  const [banners, setBanners] = useState([]);
  const [mobileCategories, setMobileCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch Desktop Banners (shop_by_category)
        const snapDesktop = await getDocs(collection(db, 'shop_by_category'));
        let desktopList = snapDesktop.docs
          .map(doc => ({ id: doc.id, ...doc.data() }));

        if (desktopList.length === 0) {
          for (const item of DEFAULT_DESKTOP_BANNERS) {
            await setDoc(doc(db, 'shop_by_category', item.id), item);
          }
          desktopList = [...DEFAULT_DESKTOP_BANNERS];
        }

        const activeDesktop = desktopList
          .filter(item => item.is_active !== false)
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

        const positionedList = activeDesktop.map((item, index) => ({
          ...item,
          position: index % 2 === 0 ? 'left' : 'right'
        }));
        setBanners(positionedList);

        // Fetch Mobile Categories from Firestore collections
        const snapMobile = await getDocs(collection(db, 'mobile_categories'));
        let mobileList = snapMobile.docs
          .map(doc => ({ id: doc.id, ...doc.data() }));

        if (mobileList.length === 0) {
          for (const item of DEFAULT_MOBILE_CATEGORIES) {
            await setDoc(doc(db, 'mobile_categories', item.id), item);
          }
          mobileList = [...DEFAULT_MOBILE_CATEGORIES];
        }

        const activeMobile = mobileList
          .filter(item => item.is_active !== false)
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

        setMobileCategories(activeMobile);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setBanners(DEFAULT_DESKTOP_BANNERS.filter(item => item.is_active !== false));
        setMobileCategories(DEFAULT_MOBILE_CATEGORIES.filter(item => item.is_active !== false));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading && banners.length === 0 && mobileCategories.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-[#faf9f5] overflow-hidden relative border-t border-zinc-200">
      {/* Header Container */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] text-[#b8860b] uppercase mb-2">
          THE COLLECTION
        </p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-zinc-900 uppercase whitespace-nowrap">
              SHOP BY CATEGORY
            </h2>
            <div className="hidden md:block flex-1 h-[1px] bg-zinc-200 ml-8 mr-4 self-center mt-1" />
          </div>
        </div>
      </div>

      {/* Mobile Grid View (lg:hidden) - Dynamic Live Data from Firebase mobile_categories */}
      <div className="lg:hidden w-full px-4">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {mobileCategories.map((cat, idx) => (
            <Link
              key={cat.id || idx}
              to={cat.link || '/shop'}
              className="relative group block overflow-hidden rounded-none bg-[#111] aspect-[3/4] w-full shadow-sm"
            >
              <OptimizedCloudinaryImage
                src={cat.image}
                alt={cat.name || cat.title}
                preset="category"
                quality="auto:best"
                priority={idx < 4}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 text-center pointer-events-none px-2">
                {cat.badge && (
                  <span className="inline-block bg-[#b8860b] text-white text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase mb-1.5 shadow-sm">
                    {cat.badge}
                  </span>
                )}
                <span className="text-[11px] sm:text-xs tracking-[0.15em] text-white uppercase font-extrabold block drop-shadow-sm">
                  {cat.name || cat.title}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#c9a962] uppercase font-semibold mt-1 block">
                  SHOP NOW &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Grid View (hidden lg:grid) - Full Width Edge-to-Edge */}
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
              to={banner.link || '/shop'}
              className="relative group block overflow-hidden bg-[#111] w-full aspect-[1.35/1] border-none rounded-none"
            >
              {/* Hero Product Image */}
              <OptimizedCloudinaryImage
                src={banner.image}
                alt={`${banner.name || banner.title} collection`}
                preset="category"
                quality="auto:best"
                priority={index < 2}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-[700ms] ease-out group-hover:scale-[1.04] group-hover:brightness-[1.08]"
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
                  {banner.name || banner.title}
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