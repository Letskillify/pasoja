import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Mousewheel } from 'swiper/modules';
import { db } from '../Firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SectionHeader from './SectionHeader';
import OptimizedCloudinaryImage from '../OptimizedCloudinaryImage';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const fallbackSlides = [
  {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    title: 'Neo-Street Edit',
    subtitle: 'Fall/Winter Campaign'
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    title: 'Luxury Silhouette',
    subtitle: 'Atelier Collection'
  },
  {
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    title: 'Summer Atelier',
    subtitle: 'Raw Linen Focus'
  },
  {
    image: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=800&auto=format&fit=crop',
    title: 'Structured Tailoring',
    subtitle: 'Architectural Cuts'
  },
  {
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    title: 'Monochrome Canvas',
    subtitle: 'Minimalist Separates'
  },
  {
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    title: 'Avant Garde Fit',
    subtitle: 'Limited Editions'
  },
  {
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
    title: 'Sartorial Form',
    subtitle: 'Tailored Men Edit'
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
    title: 'The Divine Drape',
    subtitle: 'Classic Fluid Silhouettes'
  }
];

const GallerySwiper = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(8));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
      } catch (err) {
        console.error("Error loading gallery products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const slides = products.length > 0
    ? products.map(p => ({
      id: p.id,
      image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800',
      title: p.name,
      subtitle: p.category || 'New Season',
      price: p.price,
      isProduct: true
    }))
    : fallbackSlides;

  const currentSlide = slides[activeIndex] || {};

  return (
    <section className="pt-2 pb-6 md:pt-4 md:pb-8 bg-[#faf9f5] overflow-x-hidden relative border-t border-zinc-200">
      {/* Premium ambient decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#000/[0.01],transparent_40%)] pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-black/[0.005] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl py-3 mx-auto px-5 md:px-10 lg:px-14">

        <SectionHeader
          subtitle="New Brand Showcase"
          title="Recent Arrivals"
        />

        <div className="relative w-full py-2 gallery-swiper overflow-x-hidden">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={slides.length > 3}
            speed={1000}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: -20,
              depth: 250,
              modifier: 1,
              slideShadows: false,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.realIndex);
            }}
            modules={[EffectCoverflow, Autoplay, Mousewheel]}
            className="w-full overflow-visible"
          >
            {slides.map((slide, idx) => (
              <SwiperSlide
                key={idx}
                onClick={() => slide.isProduct && navigate(`/product/${slide.id}`)}
                className="relative rounded-none overflow-hidden border border-zinc-200/80 bg-white shadow-md cursor-pointer group"
              >
                {/* Image */}
                <OptimizedCloudinaryImage
                  src={slide.image}
                  alt={slide.title}
                  preset="product-grid"
                  className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out hover:scale-105"
                />

                {/* Soft Subtle Wash */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Dynamic centered slide content below swiper */}
        <div className="mt-8 flex flex-col items-center justify-center text-center px-4">
          {currentSlide.subtitle && (
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-zinc-500 mb-2">
              {currentSlide.subtitle}
            </span>
          )}

          <div className="flex items-center justify-center gap-6 max-w-2xl w-full">
            {/* Left Scroller Button */}
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="text-zinc-700 hover:text-[#b8860b] transition-colors p-1 cursor-pointer"
            >
              <span className="text-base select-none">&larr;</span>
            </button>

            {/* Slide Title */}
            <h4 className="text-sm md:text-base   text-zinc-900 tracking-wider uppercase leading-snug line-clamp-1 flex-1">
              {currentSlide.title || 'Loading...'}
            </h4>

            {/* Right Scroller Button */}
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="text-zinc-700 hover:text-[#b8860b] transition-colors p-1 cursor-pointer"
            >
              <span className="text-base select-none">&rarr;</span>
            </button>
          </div>

          {currentSlide.price !== undefined && currentSlide.price !== null && (
            <span className="text-[12px] font-semibold text-zinc-600 tracking-widest mt-2 block">
              INR {Number(currentSlide.price).toLocaleString("en-IN")}.00
            </span>
          )}
        </div>
      </div>

      {/* Styled overrides for the custom swiper structure */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .gallery-swiper .swiper {
            overflow: visible !important;
          }
          .gallery-swiper .swiper-slide {
            width: 260px;
            height: 380px;
            opacity: 0.88;
            filter: brightness(0.96);
            transform: scale(0.9);
            transition: all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          @media (min-width: 640px) {
            .gallery-swiper .swiper-slide {
              width: 360px;
              height: 480px;
            }
          }
          .gallery-swiper .swiper-slide-active {
            opacity: 1;
            filter: brightness(1);
            transform: scale(1.05);
            border-color: rgba(0, 0, 0, 0.15);
            box-shadow: 0 15px 35px -10px rgba(0,0,0,0.1);
            z-index: 10;
          }
        `
      }} />
    </section>
  );
};

export default GallerySwiper;
