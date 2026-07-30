import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-zinc-900 flex items-center justify-center px-6 pt-[80px] pb-20 select-none">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Large 404 text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative inline-block"
        >
          <span className="text-8xl md:text-9xl font-extralight tracking-widest text-[#b8860b]/20 font-serif">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs uppercase tracking-[0.4em] font-extrabold text-[#b8860b] bg-[#faf9f5] px-4 py-1 border border-[#b8860b]/40 shadow-sm">
              Page Not Found
            </span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-light tracking-widest uppercase text-zinc-900">
            Lost In Silhouette
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 leading-relaxed font-light max-w-sm mx-auto">
            The requested page does not exist or has been relocated to another collection.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-black text-white font-semibold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft size={13} />
            Return Home
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-zinc-300 text-zinc-800 font-semibold text-[10px] uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag size={13} />
            Explore Shop
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
