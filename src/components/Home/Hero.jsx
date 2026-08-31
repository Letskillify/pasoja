import React, { useState, useEffect, useRef } from 'react';
import MiniLoader from '../MiniLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { getOptimizedCloudinaryUrl, generateCloudinarySrcSet } from '../../utils/cloudinaryUtils';

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const q = query(collection(db, 'hero_slides'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (snap.empty) {
          const defaults = [
            {
              id: 'slide_1',
              image: 'https://res.cloudinary.com/duzwys877/image/upload/v1783595080/ChatGPT_Image_Jul_9_2026_04_31_19_PM_nholgd.png',
              tag: 'AW 2025',
              title: 'Define Your\nElegance.',
              subtitle: 'Curated silhouettes for the modern connoisseur.',
              cta: 'Shop Collection',
              ctaLink: '/shop',
              sort_order: 1,
              is_active: true
            },
            {
              id: 'slide_2',
              image: 'https://res.cloudinary.com/duzwys877/image/upload/v1783595088/ChatGPT_Image_Jul_9_2026_04_31_27_PM_yam8qn.png',
              tag: 'Just Dropped',
              title: 'New Season\nArrivals.',
              subtitle: 'Fresh perspectives on timeless design.',
              cta: 'Explore Now',
              ctaLink: '/shop?filter=new',
              sort_order: 2,
              is_active: true
            },
            {
              id: 'slide_3',
              image: 'https://res.cloudinary.com/duzwys877/image/upload/v1783595079/ChatGPT_Image_Jul_9_2026_04_33_24_PM_nudlxb.png',
              tag: 'Limited Edition',
              title: 'The Artisan\nEdit.',
              subtitle: 'Handcrafted exclusives. Meticulous detailing.',
              cta: 'Discover Now',
              ctaLink: '/shop?filter=sale',
              sort_order: 3,
              is_active: true
            }
          ];
          for (const item of defaults) {
            await setDoc(doc(db, 'hero_slides', item.id), item);
          }
          setSlides(defaults);
        } else {
          setSlides(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.is_active !== false));
        }
      } catch (err) {
        console.error("Error loading hero slides:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroSlides();
  }, []);

  const startAutoplay = () => {
    if (slides.length <= 1) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  useEffect(() => {
    if (slides.length > 0) {
      startAutoplay();
    }
    return () => clearInterval(intervalRef.current);
  }, [slides]);

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    startAutoplay();
  };

  if (loading || slides.length === 0) return (
    <section className="relative h-[85vh] md:h-screen w-full bg-[#f5f5f5] mt-[72px] md:mt-[80px] overflow-hidden flex flex-col justify-end pb-12 sm:pb-24 lg:pb-32 px-6 md:px-12 lg:px-16">
      {/* Background ambient glow shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f5] via-[#f5f5f5] to-[#f5f5f5] animate-pulse" />

      {/* Skeleton layout matching Hero typography */}
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6 opacity-60">
        {/* Tag line skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-zinc-400" />
          <div className="h-3 w-28 bg-zinc-300 rounded animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-3 max-w-3xl">
          <div className="h-10 sm:h-14 md:h-20 w-4/5 bg-zinc-300 rounded animate-pulse" />
          <div className="h-10 sm:h-14 md:h-20 w-3/5 bg-zinc-300 rounded animate-pulse" />
        </div>

        {/* Subtitle & CTA skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12 pt-2">
          <div className="space-y-2 max-w-sm w-full">
            <div className="h-3.5 w-full bg-zinc-300 rounded animate-pulse" />
            <div className="h-3.5 w-3/4 bg-zinc-300 rounded animate-pulse" />
          </div>
          <div className="h-12 w-44 bg-zinc-400 rounded animate-pulse shrink-0" />
        </div>
      </div>
    </section>
  );

  const slide = slides[currentSlide];

  const imgVariants = {
    enter: (dir) => ({ opacity: 0, scale: 1.06 }),
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0 },
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black mt-[72px] md:mt-[80px]">
      {/* Background */}
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={imgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 z-0"
        >
          {slide.image && (slide.image.endsWith('.mp4') || slide.image.includes('/video/upload/') || slide.image.includes('.webm') || slide.image.includes('.mov') || slide.image.includes('.m4v')) ? (
            <video
              src={slide.image}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <picture className="h-full w-full block">
              <source
                media="(max-width: 639px)"
                srcSet={getOptimizedCloudinaryUrl(slide.mobileImage || slide.image, { width: 600 })}
              />
              <source
                media="(max-width: 1023px)"
                srcSet={getOptimizedCloudinaryUrl(slide.tabletImage || slide.image, { width: 1200 })}
              />
              <motion.img
                src={getOptimizedCloudinaryUrl(slide.image, { width: 1920 })}
                srcSet={generateCloudinarySrcSet(slide.image, { preset: 'banner' }, [600, 1200, 1920])}
                sizes="(max-width: 640px) 600px, (max-width: 1024px) 1200px, 1920px"
                alt={slide.title}
                className="h-full w-full object-cover"
                loading={currentSlide === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={currentSlide === 0 ? "high" : "auto"}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: 'linear' }}
              />
            </picture>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/40 via-transparent to-transparent sm:hidden" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-8 sm:pb-14 lg:pb-20">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex items-center gap-3 mb-4 lg:mb-6"
              >
                <span className="w-8 h-[1px] bg-white/70" />
                <span className="text-[10px]   tracking-[0.4em] uppercase text-white/70">
                  {slide.tag}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white mb-6 md:mb-8 leading-[1.05] tracking-wide whitespace-pre-line uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              >
                {slide.title}
              </motion.h1>

              {/* Subtitle + CTA */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.55 }}
                className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12"
              >
                <p className="text-sm md:text-base text-white/60 max-w-sm leading-relaxed font-light drop-shadow-md">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.ctaLink}
                  className="group inline-flex items-center justify-center gap-4 bg-white text-black px-8 py-4 text-[10px] sm:text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-300 hover:bg-white/80 shrink-0 w-full sm:w-auto"
                >
                  {slide.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators + Counter */}
          {slides.length > 1 && (
            <div className="flex items-center justify-between mt-10 md:mt-12">
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="group py-2"
                  >
                    <div className={`h-[1px] transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-white' : 'w-4 bg-white/25 group-hover:bg-white/50'}`} />
                  </button>
                ))}
              </div>
              <span className="text-white/30 text-[10px] tracking-[0.2em] font-medium tabular-nums">
                {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
