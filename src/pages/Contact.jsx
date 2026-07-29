import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowUpRight, X, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/Home/PageHeader';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const communicationChannels = [
    { icon: Mail, label: 'Email Us', val: 'hello@pasoja.com', href: 'mailto:hello@pasoja.com', desc: 'We reply within 24 hours' },
    { icon: Phone, label: 'Call Us', val: '+91 98765 43210', href: 'tel:+919876543210', desc: 'Mon–Sat, 10am – 7pm IST' },
    { icon: MapPin, label: 'Visit Us', val: 'Mumbai, Maharashtra', href: '#', desc: '123 Fashion Street, 400001' }
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 25 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PageHeader
        title="Get In Touch"
        subtitle="We'd love to hear from you. Reach out anytime."
        breadcrumbItems={[{ label: 'Home', path: '/' }, { label: 'Contact' }]}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {formSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-3.5 shadow-2xl flex items-center gap-3"
          >
            <CheckCircle size={14} />
            <p className="text-[12px] font-black uppercase tracking-wider">Message sent! We'll respond shortly.</p>
            <button onClick={() => setFormSubmitted(false)} className="opacity-40 hover:opacity-100 ml-1"><X size={13} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14 py-14 md:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: Channels */}
          <motion.div {...fadeUp} className="lg:col-span-5 space-y-7">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/25 block mb-4">Reach Out</span>
              <h2 className="text-3xl sm:text-4xl font-light text-white tracking-widest leading-[1.05] uppercase">We're Here<br />to Help</h2>
              <p className="text-[14px] text-white/35 mt-4 leading-relaxed max-w-sm">
                Whether you have a question about sizing, need styling advice, or want to discuss a bulk order — our team is ready.
              </p>
            </div>

            <div className="space-y-2">
              {communicationChannels.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    href={item.href}
                    key={i}
                    onMouseEnter={() => setActiveChannel(i)}
                    onMouseLeave={() => setActiveChannel(null)}
                    className="flex items-center gap-4 p-4 sm:p-5 bg-[#141414] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 border border-white/10 text-white/35 group-hover:bg-white group-hover:text-black group-hover:border-white flex items-center justify-center transition-all duration-400 shrink-0">
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mb-0.5">{item.label}</p>
                      <p className="text-[15px] font-bold text-white truncate">{item.val}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowUpRight size={15} className={`text-white/15 transition-all duration-300 shrink-0 ${activeChannel === i ? 'rotate-45 text-white/40' : ''}`} />
                  </a>
                );
              })}
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#141414] border border-white/[0.06]">
              <Clock size={14} className="text-white/30 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Business Hours</p>
                <p className="text-[12px] text-white/30">Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                <p className="text-[12px] text-white/30">Sunday: Closed</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Form */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="lg:col-span-7">
            <div className="bg-[#111111] border border-white/[0.06] p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-2 mb-7">
                <MessageSquare size={14} className="text-white/30" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Send a Message</h3>
              </div>

              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Full Name</label>
                    <input type="text" required
                      className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Email Address</label>
                    <input type="email" required
                      className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Subject</label>
                  <select className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer">
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Sizing Help</option>
                    <option>Returns & Exchanges</option>
                    <option>Wholesale / B2B</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Your Message</label>
                  <textarea rows="5" required
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <button type="submit"
                  className="w-full py-4 bg-white hover:bg-white/85 text-black font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2.5 group"
                >
                  <Send size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* MAP */}
      <section className="bg-[#0a0a0a] py-14 md:py-16 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14">
          <div className="mb-8 pb-8 border-b border-white/[0.06]">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold block mb-3">Find Us</span>
            <h2 className="text-2xl font-light text-white uppercase tracking-widest">Visit Our Store</h2>
          </div>
          <div className="w-full h-[280px] sm:h-[350px] bg-[#1a1a1a] overflow-hidden border border-white/[0.06]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.116396!2d72.74109995!3d19.08219865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%" height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9)' }}
              allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Pasoja Store Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
