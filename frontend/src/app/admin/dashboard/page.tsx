"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Receipt, Wallet, TrendingUp, CreditCard, Layers, ShoppingBag, Percent } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    api("/admin/dashboard/stats").then((data) => setStats(data));
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  const cards = [
    { label: "Total User", value: stats?.totalUsers || 0, icon: <Users size={20} />, color: "bg-blue-50 text-blue-600" },
    { label: "Transaksi Hari Ini", value: stats?.totalTransactionsToday || 0, icon: <Receipt size={20} />, color: "bg-green-50 text-green-600" },
    { label: "Deposit Pending", value: stats?.totalDepositsPending || 0, icon: <Wallet size={20} />, color: "bg-yellow-50 text-yellow-600" },
    { label: "Total Revenue", value: formatRupiah(Number(stats?.totalRevenue || 0)), icon: <TrendingUp size={20} />, color: "bg-purple-50 text-purple-600" },
  ];

  const menus = [
    { label: "Kategori", icon: <Layers size={20} />, path: "/admin/kategori" },
    { label: "Provider", icon: <Percent size={20} />, path: "/admin/provider" },
    { label: "Produk", icon: <ShoppingBag size={20} />, path: "/admin/produk" },
    { label: "Metode Pembayaran", icon: <CreditCard size={20} />, path: "/admin/metode-pembayaran" },
    { label: "Deposit", icon: <Wallet size={20} />, path: "/admin/deposit" },
    { label: "Transaksi", icon: <Receipt size={20} />, path: "/admin/transaksi" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-5xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-2`}>
                {card.icon}
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-900 mb-3">Manajemen</h2>
        <div className="grid grid-cols-2 gap-3">
          {menus.map((menu, i) => (
            <motion.button
              key={menu.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(menu.path)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <div className="text-indigo-600">{menu.icon}</div>
              <span className="text-sm font-medium text-gray-700">{menu.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
