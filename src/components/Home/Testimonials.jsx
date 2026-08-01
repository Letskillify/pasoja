import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { Star, Award, MessageSquare, RefreshCw, Heart } from 'lucide-react';
import { Autoplay, Mousewheel } from 'swiper/modules';

import 'swiper/css';

const IconMap = {
  Star: Star,
  Award: Award,
  MessageSquare: MessageSquare,
  RefreshCw: RefreshCw,
  Heart: Heart
};

const Testimonials = () => {
  const [settings, setSettings] = useState({
    eyebrow: 'TESTIMONIALS',
    heading: 'LOVED BY OUR COMMUNITY',
    description_line_1: 'Real people. Real style. Real reviews.',
    description_line_2: 'See why they love Pasoja.',
    is_active: true
  });
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // 1. Settings
        const settingsDoc = await getDocs(collection(db, 'community_settings'));
        if (settingsDoc.empty) {
          const defaultSettings = {
            eyebrow: 'TESTIMONIALS',
            heading: 'LOVED BY OUR COMMUNITY',
            description_line_1: 'Real people. Real style. Real reviews.',
            description_line_2: 'See why they love Pasoja.',
            is_active: true
          };
          await setDoc(doc(db, 'community_settings', 'main'), defaultSettings);
          setSettings(defaultSettings);
        } else {
          setSettings(settingsDoc.docs[0].data());
        }

        // 2. Images
        const imgQuery = query(collection(db, 'community_images'), orderBy('sort_order', 'asc'));
        const imgSnap = await getDocs(imgQuery);
        if (imgSnap.empty) {
          const defaultImages = [
            { id: 'img_1', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317400/imjhv8luafwtxfu9iswq.jpg', link: '', sort_order: 1, is_active: true },
            { id: 'img_2', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317401/ffl2xbtgi5vetrobuxzl.jpg', link: '', sort_order: 2, is_active: true },
            { id: 'img_3', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317401/vuoqvdcaff3ni3jdmjkq.jpg', link: '', sort_order: 3, is_active: true },
            { id: 'img_4', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317402/bz0d4jlszdu0ju8e0iwl.jpg', link: '', sort_order: 4, is_active: true },
            { id: 'img_5', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317403/fc1is0gziu7rgyejzlwf.jpg', link: '', sort_order: 5, is_active: true },
            { id: 'img_6', image: 'https://res.cloudinary.com/dlsbj8nug/image/upload/v1785317404/zikp7hjgjndo7mjvqm4f.jpg', link: '', sort_order: 6, is_active: true }
          ];
          for (const item of defaultImages) {
            await setDoc(doc(db, 'community_images', item.id), item);
          }
          setImages(defaultImages);
        } else {
          setImages(imgSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.is_active !== false));
        }

        // 3. Stats
        const statsQuery = query(collection(db, 'community_stats'), orderBy('sort_order', 'asc'));
        const statsSnap = await getDocs(statsQuery);
        if (statsSnap.empty) {
          const defaultStats = [
            { id: 'stat_1', icon: 'Star', value: '15,000+', label: 'Happy Customers', sort_order: 1, is_active: true },
            { id: 'stat_2', icon: 'Award', value: '4.8/5', label: 'Avg. Rating', sort_order: 2, is_active: true },
            { id: 'stat_3', icon: 'MessageSquare', value: '2,000+', label: 'Reviews', sort_order: 3, is_active: true },
            { id: 'stat_4', icon: 'RefreshCw', value: '95%', label: 'Recommend Us', sort_order: 4, is_active: true }
          ];
          for (const item of defaultStats) {
            await setDoc(doc(db, 'community_stats', item.id), item);
          }
          setStats(defaultStats);
        } else {
          setStats(statsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.is_active !== false));
        }
      } catch (err) {
        console.error("Error fetching community data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  if (loading || !settings.is_active) return null;

  return (
    <section className="py-8 md:py-12 bg-[#faf9f5] overflow-hidden relative border-t border-zinc-200">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mobile Header (block md:hidden) - Screenshot 3 Style */}
        <div className="block md:hidden mb-6">
          <h2 className="text-xl   tracking-[0.05em] text-zinc-900 uppercase font-sans">
            #SEENONFEED
          </h2>
        </div>

        {/* Desktop Header (hidden md:flex) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex-1 flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
            <div>
              <p className="text-[10px] sm:text-[12px] tracking-[0.3em] text-[#b8860b] uppercase mb-2  ">
                {settings.eyebrow}
              </p>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extralight tracking-[0.15em] text-zinc-900 uppercase whitespace-nowrap">
                {settings.heading}
              </h2>
            </div>
            <div className="hidden md:block flex-1 h-[1px] bg-zinc-200 mb-2" />
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto">
            <div className="flex gap-2.5">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-10 h-10 rounded-full border border-zinc-300 bg-white flex items-center justify-center text-zinc-600 hover:text-black hover:border-black transition-all duration-300 cursor-pointer shadow-sm"
              >
                &larr;
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-10 h-10 rounded-full border border-zinc-300 bg-white flex items-center justify-center text-zinc-600 hover:text-black hover:border-black transition-all duration-300 cursor-pointer shadow-sm"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Separator under header - Desktop only */}
        <div className="hidden md:block w-full h-[1px] bg-zinc-200 mb-10" />

        {/* Gallery Carousel */}
        <div className="w-full mb-16">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            spaceBetween={8}
            slidesPerView={1.8}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 1,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 8,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 8,
              },
              1200: {
                slidesPerView: 6,
                spaceBetween: 8,
              },
            }}
            modules={[Autoplay, Mousewheel]}
            className="w-full overflow-visible"
          >
            {images.map((item) => {
              const ImageComponent = item.link ? Link : 'div';
              const componentProps = item.link ? { to: item.link } : {};

              return (
                <SwiperSlide key={item.id}>
                  <ImageComponent
                    {...componentProps}
                    className="relative group block overflow-hidden bg-zinc-100 aspect-[3/4] sm:aspect-[3/5] w-full border border-zinc-200 shadow-sm rounded-none"
                  >
                    <img
                      src={item.image}
                      alt="Community look"
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-[600ms] ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </ImageComponent>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Social Proof Statistics Row */}

      </div>
    </section>
  );
};

export default Testimonials;
export { Testimonials as TestimonialsSection };
