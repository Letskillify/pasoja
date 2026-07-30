import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { Autoplay, Mousewheel, FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';

const ShopTheLook = () => {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const q = query(collection(db, 'shop_the_look'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (snap.empty) {
          const defaults = [
            { id: 'look_1', title: 'TEES', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317398/yastxilcsghbsdmkcp2x.jpg', link: '/shop?category=T-Shirts', sort_order: 1, is_active: true, price: 2499, category: 'OVERSIZED T-SHIRT' },
            { id: 'look_2', title: 'JEANS', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317396/kq4a9s5dkptuvp8iev2j.jpg', link: '/shop?category=Jeans', sort_order: 2, is_active: true, price: 2499, category: 'WAFFLE KNIT' },
            { id: 'look_3', title: 'HOODIES', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317395/qegbcn6kqdrl2s44cwm0.jpg', link: '/shop?category=Hoodies', sort_order: 3, is_active: true, price: 2000, category: 'BABY TEE' },
            { id: 'look_4', title: 'SETS', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317397/pac3lrqmjr4nsemoldna.jpg', link: '/shop?category=Sets', sort_order: 4, is_active: true, price: 2499, category: 'OVERSIZED T-SHIRT' }
          ];
          for (const item of defaults) {
            await setDoc(doc(db, 'shop_the_look', item.id), item);
          }
          setLooks(defaults);
        } else {
          const list = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.is_active !== false);
          setLooks(list);
        }
      } catch (error) {
        console.error("Error loading Shop The Look data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLooks();
  }, []);

  if (loading || looks.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-[#faf9f5] overflow-hidden relative border-t border-zinc-200">
      {/* Ambient decorative lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-black/[0.005] rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header Container */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.3em] text-[#b8860b] uppercase mb-2 font-bold">
              SHOP THE LOOK
            </p>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-zinc-900 uppercase whitespace-nowrap leading-none">
              CURATED FITS. MADE TO STAND OUT.
            </h2>
          </div>
          <div className="text-zinc-600 text-xs sm:text-sm tracking-wide max-w-[280px] font-light leading-relaxed text-left md:text-right">
            Handpicked pieces styled for impact. Explore the looks.
          </div>
        </div>
      </div>

      {/* Desktop Grid View (hidden lg:grid) - Full Width Edge-to-Edge with 0 Gap */}
      <div className="hidden lg:grid grid-cols-4 gap-0 w-full max-w-none">
        {looks.map((look) => (
          <div key={look.id} className="relative w-full flex flex-col bg-[#faf9f5]">
            <Link
              to={look.link}
              className="relative group block overflow-hidden bg-zinc-100 aspect-[3/4] w-full"
            >
              {/* Campaign Image */}
              <img
                src={look.image}
                alt={look.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-[600ms] ease-out group-hover:scale-[1.03]"
              />
            </Link>
            {/* Product Meta Text Content below Image */}
            <div className="pt-5 pb-6 text-center flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-zinc-500 mb-1.5">
                {look.category || 'COLLECTION'}
              </span>
              <h4 className="text-xs font-semibold text-zinc-900 tracking-wider uppercase leading-snug px-3 line-clamp-1 mb-1">
                {look.title || 'Brand Look'}
              </h4>
              <span className="text-[10px] font-bold text-zinc-700 tracking-widest mt-1">
                INR {Number(look.price || 2499).toLocaleString("en-IN")}.00
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile/Tablet View (lg:hidden): Seamless continuous Swiper with 0 gap */}
      <div className="lg:hidden w-full max-w-none px-0">
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          spaceBetween={0}
          slidesPerView={1.25}
          breakpoints={{
            500: { slidesPerView: 1.5, spaceBetween: 0 },
            640: { slidesPerView: 2, spaceBetween: 0 }
          }}
          freeMode={true}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1.2,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, Mousewheel, FreeMode]}
          className="w-full overflow-visible"
        >
          {looks.map((look) => (
            <SwiperSlide key={look.id} className="flex flex-col bg-[#faf9f5] border-r border-zinc-200/80">
              <Link
                to={look.link}
                className="relative group block overflow-hidden bg-zinc-100 aspect-[3/4] w-full"
              >
                <img
                  src={look.image}
                  alt={look.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              {/* Product Meta Text Content below Image */}
              <div className="py-4 px-2 text-center flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 mb-1">
                  {look.category || 'COLLECTION'}
                </span>
                <h5 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-wider uppercase leading-snug px-1 line-clamp-1 mb-1">
                  {look.title || 'Brand Look'}
                </h5>
                <span className="text-xs font-bold text-zinc-800 tracking-widest">
                  INR {Number(look.price || 2499).toLocaleString("en-IN")}.00
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ShopTheLook;
