import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const GenderBanner = () => {
  const banners = [
    {
      id: 'mens',
      title: 'SHOP MENS',
      buttonText: 'EXPLORE',
      image: 'https://plus.unsplash.com/premium_photo-1669688174622-0393f5c6baa2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVucyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D',
      path: '/shop?category=Men'
    },
    {
      id: 'womens',
      title: 'SHOP WOMENS',
      buttonText: 'EXPLORE',
      image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW4lMjBmYXNoaW9ufGVufDB8fDB8fHww',
      path: '/shop?category=Women'
    }
  ];

  return (
    <section className="bg-black py-4 md:py-6 overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group overflow-hidden rounded-xs bg-[#111]"
            >
              <Link to={banner.path} className="block relative w-full h-[520px] sm:h-[620px] md:h-[680px] lg:h-[760px]">
                {/* Background Image */}
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Bottom-left Overlay Content */}
                <div className="absolute bottom-8 left-8 sm:bottom-10 sm:left-10 lg:bottom-12 lg:left-12 z-10 flex flex-col items-start">
                  <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase mb-4 drop-shadow-md">
                    {banner.title}
                  </h2>
                  <div className="px-6 py-2 sm:px-7 sm:py-2.5 rounded-full border border-white text-white text-xs sm:text-sm font-bold uppercase tracking-widest bg-black/20 backdrop-blur-xs transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white shadow-md">
                    {banner.buttonText}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenderBanner;