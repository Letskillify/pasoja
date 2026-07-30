import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { db } from '../../components/Firebase';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';

const IconMap = {
  Truck: Truck,
  Zap: Zap,
  RotateCcw: RotateCcw,
  ShieldCheck: ShieldCheck
};

const BenefitsStrip = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const q = query(collection(db, 'benefits_strip'), orderBy('sort_order', 'asc'));
        const snap = await getDocs(q);
        if (snap.empty) {
          const defaults = [
            { id: 'b_1', icon: 'Truck', text: 'Free Shipping Over ₹1999', sort_order: 1, is_active: true },
            { id: 'b_2', icon: 'Zap', text: 'Fast Delivery 3–5 Days', sort_order: 2, is_active: true },
            { id: 'b_3', icon: 'RotateCcw', text: '30-Day Easy Returns', sort_order: 3, is_active: true },
            { id: 'b_4', icon: 'ShieldCheck', text: 'Secure Checkout', sort_order: 4, is_active: true },
            { id: 'b_5', icon: 'Truck', text: 'Ethically Sourced', sort_order: 5, is_active: true },
            { id: 'b_6', icon: 'Zap', text: 'Premium Quality', sort_order: 6, is_active: true }
          ];
          for (const item of defaults) {
            await setDoc(doc(db, 'benefits_strip', item.id), item);
          }
          setBenefits(defaults);
        } else {
          setBenefits(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.is_active !== false));
        }
      } catch (err) {
        console.error("Error loading benefits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBenefits();
  }, []);

  if (loading || benefits.length === 0) return null;

  return (
    <section className="bg-[#f4f1ea] border-y border-zinc-200 py-3.5 overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
        className="flex gap-0 whitespace-nowrap"
      >
        {[...benefits, ...benefits].map((item, i) => {
          const Icon = IconMap[item.icon] || Zap;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-700"
            >
              <Icon size={13} strokeWidth={2} className="text-[#b8860b] flex-shrink-0" />
              {item.text}
              <span className="w-1 h-1 bg-zinc-400 rounded-full ml-2 flex-shrink-0" />
            </span>
          );
        })}
      </motion.div>
    </section>
  );
};

export default BenefitsStrip;
