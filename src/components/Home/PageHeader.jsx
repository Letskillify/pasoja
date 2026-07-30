import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, breadcrumbItems = [] }) => {
  return (
    <section className="relative w-full bg-[#f4f1ea] mt-[72px] md:mt-[80px] overflow-hidden border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 py-10 md:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-5">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;
            if (isLast) {
              return (
                <React.Fragment key={index}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-700">
                    {item.label}
                  </span>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={index}>
                <Link
                  to={item.path || "/"}
                  className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
                >
                  {isFirst && <Home size={12} strokeWidth={2} />}
                  <span>{item.label}</span>
                </Link>
                <ChevronRight size={10} className="text-zinc-300" strokeWidth={2.5} />
              </React.Fragment>
            );
          })}
        </nav>

        {/* Title */}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-light text-zinc-900 tracking-widest leading-[1.0] uppercase"
          >
            {title}
          </motion.h1>
        )}

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-zinc-600 font-medium mt-3 max-w-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PageHeader;
