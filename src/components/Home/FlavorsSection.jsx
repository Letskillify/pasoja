import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Mousewheel } from 'swiper/modules';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

const flavors = [
  {
    id: 1,
    name: "Rose",
    subtitle: "Floral · Refreshing · Cool",
    tag: "Aromatic",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Chocolate",
    subtitle: "Rich · Smooth · Indulgent",
    tag: "Indulgent",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Namkeen",
    subtitle: "Chatpata · Desi · Energetic",
    tag: "Spicy & Bold",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Dry Fruit",
    subtitle: "Nutty · Rich · Nourishing",
    tag: "Nourishing",
    image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Elaichi",
    subtitle: "Aromatic · Refreshing · Classic",
    tag: "Classic Desi",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop"
  }
];

const FlavorCard = ({ flavor }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#FDF6E9] p-4 flex flex-col justify-between h-full relative border-[3px] border-[#8B7355] shadow-[8px_8px_0px_0px_rgba(139,115,85,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(139,115,85,0.3)] transition-all duration-300"
    >
      {/* "Hand-stamped" corners */}
      <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#5C4033]"></div>
      <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#5C4033]"></div>
      
      <div>
        {/* Image Container with "Polaroid" or "Old Print" style */}
        <div className="w-full aspect-[4/3] relative border-b-4 border-r-4 border-[#5C4033] bg-[#E5D3B3] p-2">
          <img 
            src={flavor.image} 
            alt={flavor.name}
            className="w-full h-full object-cover grayscale-[20%] sepia-[10%]"
          />
          <div className="absolute inset-0 bg-[#8B5A2B]/10 mix-blend-multiply" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center text-center mt-6">
          <h3 className="text-xl font-poppins font-bold text-[#2D241E] mb-1">
            {flavor.name}
          </h3>
          <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-[#8B5A2B] italic mb-3">
            {flavor.subtitle}
          </p>
          
          <div className="text-[14px] bg-[#2D241E] text-[#E5D3B3] px-3 py-1 font-mono tracking-widest uppercase">
            {flavor.tag}
          </div>
        </div>
      </div>

      {/* Button Module */}
      <div className="w-full pt-6 mt-4 flex justify-center">
        <Link to="/shop" className="relative px-6 py-2 border-2 border-[#5C4033] hover:bg-[#5C4033] hover:text-[#FDF6E9] transition-colors duration-300">
          <span className="font-poppins font-bold text-sm uppercase">
            Pick Harvest
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

const FlavorsSection = () => {
  return (
    <section 
      className="py-24 relative overflow-hidden border-y border-[#D1B894]"
      style={{ backgroundImage: "url('/img/b1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Warm Traditional Overlay */}
      <div className="absolute inset-0 bg-[#FDF8F1]/40 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C2B21]/10 via-transparent to-[#1C2B21]/10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Block Layout */}
        <div className="text-center mb-16 lg:mb-20 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="h-[1px] w-12 bg-[#D1B894]" />
            <span className="text-[#D9A036] font-poppins italic text-sm tracking-wide">
              Established Heritage
            </span>
            <div className="h-[1px] w-12 bg-[#D1B894]" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold text-[#1C2B21] tracking-tight max-w-3xl leading-[1.1] mb-6">
            The Golden Standard of <span className="text-[#D9A036] italic">Indian Flavors</span>
          </h2>
          
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#D9A036]" />
             <div className="w-24 h-[1px] bg-[#D9A036]" />
             <div className="w-1.5 h-1.5 rounded-full bg-[#D9A036]" />
          </div>
        </div>

        {/* Full-width Swiper Slider */}
        <div className="!-mr-6 md:!-mr-12">
          <Swiper
            modules={[Autoplay, Pagination, Mousewheel]}
            spaceBetween={24}
            slidesPerView={1.2}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            mousewheel={{ forceToAxis: true }}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              768: { slidesPerView: 2.5 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4 },
            }}
            className="pb-16 premium-flavor-swiper"
          >
            {flavors.map((flavor, index) => (
              <SwiperSlide key={flavor.id} className="h-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                >
                  <FlavorCard flavor={flavor} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .premium-flavor-swiper .swiper-pagination-bullet {
          background: #1C2B21 !important;
          opacity: 0.1;
          width: 8px;
          height: 8px;
          transition: all 0.4s ease;
          border: 1px solid #D9A036;
        }
        .premium-flavor-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #D9A036 !important;
          width: 24px;
          border-radius: 4px;
        }
        .premium-flavor-swiper .swiper-pagination {
          bottom: 0px !important;
        }
      `}} />

    </section>
  );
};

export default FlavorsSection;
