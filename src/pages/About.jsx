import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Shield, Heart, Compass, Leaf, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/Home/PageHeader';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }
};

const About = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="Our Story"
        subtitle="Crafted with intention, designed for the modern wardrobe."
        breadcrumbItems={[
          { label: 'Home', path: '/' },
          { label: 'About Us' },
        ]}
      />

      {/* HERO EDITORIAL */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image Grid */}
            <motion.div {...fadeUp} className="grid grid-cols-12 gap-3 sm:gap-4">
              <div className="col-span-7 aspect-[3/4] overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop"
                  alt="Pasoja craftsmanship"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="col-span-5 aspect-[3/4] overflow-hidden mt-10 sm:mt-16 relative group">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
                  alt="Pasoja studio"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="space-y-7 lg:pl-4">
              <motion.div {...fadeUp}>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/25 block mb-4">Our Philosophy</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-[1.1] tracking-widest uppercase">
                  Fashion That<br />Speaks to Your Soul
                </h2>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="space-y-4 text-[14px] sm:text-[15px] text-white/40 leading-relaxed"
              >
                <p>At Pasoja, we believe that fashion is more than fabric — it's an expression of identity. Every piece is thoughtfully designed to bridge the gap between contemporary style and timeless elegance.</p>
                <p>We work directly with skilled artisans and ethically-conscious manufacturers, ensuring every stitch carries purpose.</p>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="grid grid-cols-2 gap-6 py-7 border-y border-white/[0.07]"
              >
                <div>
                  <span className="text-4xl font-light text-white tracking-widest">500+</span>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 font-bold mt-1">Curated Designs</p>
                </div>
                <div>
                  <span className="text-4xl font-light text-white tracking-widest">10K+</span>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/25 font-bold mt-1">Happy Customers</p>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
                <Link to="/shop" className="inline-flex items-center gap-3 group">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-black text-white/60 group-hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white/40">
                    Explore Our Collection
                  </span>
                  <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-400">
                    <ArrowUpRight size={14} className="text-white/60 group-hover:text-black transition-colors duration-400" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 md:py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14">
          <div className="pb-10 border-b border-white/[0.06] mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold block mb-3">What Defines Us</span>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-widest">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              { icon: Gem, title: 'Premium Quality', desc: 'Every garment is crafted with the finest fabrics, rigorously tested for durability and comfort.' },
              { icon: Leaf, title: 'Sustainable Fashion', desc: 'We prioritize ethical sourcing and eco-friendly production to minimize our environmental footprint.' },
              { icon: Heart, title: 'Crafted with Love', desc: 'Our artisans pour passion into every stitch, creating pieces that are truly one-of-a-kind.' },
              { icon: Compass, title: 'Timeless Design', desc: 'We design beyond trends — creating versatile pieces that remain stylish season after season.' }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group bg-[#191919] border border-white/[0.06] p-6 sm:p-7 hover:border-white/[0.14] transition-all duration-400"
                >
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 mb-5 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-400">
                    <Icon size={17} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[12px] font-semibold text-white uppercase tracking-wide mb-2">{pillar.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FULL WIDTH BANNER */}
      <section className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop"
          alt="Pasoja atelier"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Our Promise</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white max-w-2xl leading-[1.1] tracking-widest uppercase">
              Designed to Inspire.<br />Built to Last.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-5 md:px-10 lg:px-14">
          <div className="pb-10 border-b border-white/[0.06] mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold block mb-3">Our Journey</span>
            <h2 className="text-3xl font-light text-white uppercase tracking-widest">Milestones That Define Us</h2>
          </div>
          <div className="space-y-0">
            {[
              { year: '2024', title: 'The Beginning', desc: 'Pasoja was born from a vision to redefine affordable luxury in Indian fashion.' },
              { year: '2024', title: 'First Collection', desc: 'Launched our debut collection with 50+ handcrafted pieces, sold out within weeks.' },
              { year: '2025', title: 'Growing Community', desc: 'Reached 10,000+ satisfied customers and expanded our collection to 500+ designs.' },
              { year: '2025', title: 'Looking Ahead', desc: 'Expanding into new categories while staying true to our commitment to quality.' },
            ].map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-6 sm:gap-10 group py-7 border-b border-white/[0.06] last:border-0"
              >
                <div className="shrink-0 pt-1">
                  <span className="text-[10px] font-black tracking-widest text-white/30 border border-white/10 px-2.5 py-1">
                    {milestone.year}
                  </span>
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-base font-bold text-white mb-1 group-hover:text-white/60 transition-colors">{milestone.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
