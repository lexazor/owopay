"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard } from "lucide-react";
import { api } from "@/lib/api";

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.kategori as string;
  const [providers, setProviders] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    api(`/categories/${categoryId}/providers`).then((data) => setProviders(data || []));
    api("/categories").then((cats) => {
      const cat = (cats || []).find((c: any) => c.id === categoryId);
      setCategory(cat);
    });
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">{category?.name || "Layanan"}</h1>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {providers.map((provider, i) => (
          <motion.button
            key={provider.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/layanan/${categoryId}/${provider.id}`)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              {provider.logo ? (
                <img src={provider.logo} alt={provider.name} className="w-10 h-10 object-contain" />
              ) : (
                <CreditCard size={24} className="text-indigo-600" />
              )}
            </div>
            <span className="text-sm font-semibold text-gray-900">{provider.name}</span>
            {provider.description && (
              <span className="text-[11px] text-gray-500 mt-1 line-clamp-2">{provider.description}</span>
            )}
          </motion.button>
        ))}
        {providers.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm">Provider tidak tersedia</div>
        )}
      </div>
    </div>
  );
}
