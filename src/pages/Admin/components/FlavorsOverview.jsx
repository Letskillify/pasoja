import React from 'react';
import { Sparkles, Leaf, Coffee, Cookie, Flame, Droplets } from 'lucide-react';

const flavorStats = [
  { name: "Classic Roasted", count: 4, icon: Leaf, color: "text-[#4A5D4E]", bg: "bg-[#4A5D4E]/10" },
  { name: "Elaichi", count: 2, icon: Sparkles, color: "text-[#D9A036]", bg: "bg-[#D9A036]/10" },
  { name: "Rose", count: 2, icon: Droplets, color: "text-pink-600", bg: "bg-pink-100" },
  { name: "Dry Fruit", count: 2, icon: Cookie, color: "text-[#6D4C3D]", bg: "bg-[#6D4C3D]/10" },
  { name: "Chocolate", count: 1, icon: Coffee, color: "text-amber-900", bg: "bg-amber-100" },
  { name: "Namkeen Spicy", count: 1, icon: Flame, color: "text-orange-700", bg: "bg-orange-100" },
];

const FlavorsOverview = () => {
  return (
    <section className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm p-6">
      <h2 className="text-lg font-poppins font-bold text-[#1C2B21] mb-1.5">
        Flavors Overview
      </h2>
      <p className="text-sm text-[#707A72] mb-6">
        Manage your sattu drink flavor catalog
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flavorStats.map((flavor) => {
          const Icon = flavor.icon;
          return (
            <div key={flavor.name} className="rounded-xl border border-[#D9D3C7] bg-[#FDFBF7] px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${flavor.bg} ${flavor.color} flex items-center justify-center`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C2B21]">{flavor.name}</p>
                  <p className="text-sm font-bold text-[#707A72]">{flavor.count} Products</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FlavorsOverview;
