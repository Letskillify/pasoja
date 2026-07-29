import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, IndianRupee, Users } from 'lucide-react';
import { db } from '../../../components/Firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const MetricCards = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users"))
        ]);

        const totalRevenue = ordersSnap.docs.reduce((acc, doc) => {
          const data = doc.data();
          return data.status === 'confirmed' ? acc + (Number(data.total) || 0) : acc;
        }, 0);

        setStats({
          products: productsSnap.size,
          orders: ordersSnap.docs.filter(d => d.data().status === 'confirmed').length,
          revenue: totalRevenue,
          users: usersSnap.size
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    {
      label: "Total Products",
      value: loading ? "..." : stats.products,
      hint: "Across all categories",
      icon: Package,
      color: "text-[#4A5D4E]",
      bg: "bg-[#4A5D4E]/10"
    },
    {
      label: "Open Orders",
      value: loading ? "..." : stats.orders,
      hint: "Confirmed & Pending",
      icon: ShoppingCart,
      color: "text-[#D9A036]",
      bg: "bg-[#D9A036]/10"
    },
    {
      label: "Total Revenue",
      value: loading ? "..." : `₹${stats.revenue.toLocaleString('en-IN')}`,
      hint: "Lifetime earnings",
      icon: IndianRupee,
      color: "text-[#6D4C3D]",
      bg: "bg-[#6D4C3D]/10"
    },
    {
      label: "Active Users",
      value: loading ? "..." : stats.users,
      hint: "Registered customers",
      icon: Users,
      color: "text-[#6b4f3]",
      bg: "bg-[#6b4f3]/10"
    },
  ];

  return (
    <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm hover:shadow-lg transition-all duration-300 group"
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <Icon size={24} strokeWidth={2} />
              </div>
              <p className="text-sm font-bold tracking-wider text-[#707A72] uppercase mb-2">
                {card.label}
              </p>
              <p className="text-3xl font-poppins font-bold text-[#1C2B21] mb-1">
                {card.value}
              </p>
              <p className="text-sm font-medium text-[#707A72]">
                {card.hint}
              </p>
            </div>
            <div className="h-1.5 w-full rounded-b-2xl bg-gradient-to-r from-[#4A5D4E] via-[#D9A036] to-[#6D4C3D]" />
          </article>
        );
      })}
    </section>
  );
};

export default MetricCards;
