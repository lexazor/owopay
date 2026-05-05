"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, ArrowDownToLine, History, CreditCard, Bell, User, Home, BarChart2, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/use-socket";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  logo: string;
  badge: string | null;
}

interface Banner {
  id: string;
  image: string;
  url: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { on } = useSocket();
  const [balance, setBalance] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    api("/user/balance").then((data) => setBalance(Number(data.balance)));
    api("/categories").then((data) => setCategories(data));
    api("/categories/banners").catch(() => []).then((data) => setBanners(data || []));
  }, [user, router]);

  useEffect(() => {
    const unsubBalance = on("balance.updated", (data: any) => {
      if (data?.balance !== undefined) setBalance(data.balance);
    });
    const unsubTx = on("transaction.status_changed", (data: any) => {
      console.log("Transaction status:", data);
    });
    return () => {
      unsubBalance?.();
      unsubTx?.();
    };
  }, [on]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="mx-4 mt-6 p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-xl"
      >
        <p className="text-sm text-indigo-100 font-medium">Saldo Kamu</p>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mt-1 tracking-tight"
        >
          {formatRupiah(balance)}
        </motion.h1>
        <div className="flex gap-3 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/deposit")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowDownToLine size={18} />
            Deposit
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/riwayat")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <History size={18} />
            Riwayat
          </motion.button>
        </div>
      </motion.div>

      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="mx-4 mt-5 overflow-x-auto flex gap-3 snap-x snap-mandatory scrollbar-hide">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="snap-start flex-shrink-0 w-72 h-32 rounded-2xl bg-gray-200 overflow-hidden"
            >
              {banner.image ? (
                <img src={banner.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Banner
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="mx-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Layanan</h2>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, type: "spring" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/layanan/${cat.id}`)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center relative overflow-hidden">
                {cat.logo ? (
                  <img src={cat.logo} alt={cat.name} className="w-8 h-8 object-contain" />
                ) : (
                  <CreditCard size={24} className="text-indigo-600" />
                )}
                {cat.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-700 font-medium text-center leading-tight">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <NavButton icon={<Home size={22} />} label="Beranda" active onClick={() => router.push("/dashboard")} />
          <NavButton icon={<BarChart2 size={22} />} label="Keuangan" onClick={() => router.push("/riwayat")} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/layanan")}
            className="w-14 h-14 -mt-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200"
          >
            <QrCode size={24} />
          </motion.button>
          <NavButton icon={<Bell size={22} />} label="Notifikasi" onClick={() => {}} />
          <NavButton icon={<User size={22} />} label="Profil" onClick={() => router.push("/profil")} />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={active ? "text-indigo-600" : "text-gray-400"}>{icon}</div>
      <span className={`text-[10px] font-medium ${active ? "text-indigo-600" : "text-gray-400"}`}>{label}</span>
    </motion.button>
  );
}
