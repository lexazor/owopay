"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ArrowDownToLine, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export default function RiwayatPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "purchase" | "deposit">("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    api("/transactions").then((data) => setTransactions(data || []));
    api("/deposits").then((data) => setDeposits(data || []));
  }, []);

  const allItems = [
    ...(transactions || []).map((t) => ({ ...t, type: "purchase" as const })),
    ...(deposits || []).map((d) => ({ ...d, type: "deposit" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = tab === "all" ? allItems : allItems.filter((i) => i.type === tab);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Riwayat Transaksi</h1>
      </div>

      <div className="flex p-4 gap-2">
        {(["all", "purchase", "deposit"] as const).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {t === "all" ? "Semua" : t === "purchase" ? "Pembelian" : "Deposit"}
          </motion.button>
        ))}
      </div>

      <div className="px-4 pb-8 space-y-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.status === "SUCCESS"
                      ? "bg-green-100 text-green-600"
                      : item.status === "FAILED" || item.status === "EXPIRED"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {item.type === "deposit" ? (
                    item.status === "SUCCESS" ? (
                      <CheckCircle2 size={20} />
                    ) : item.status === "FAILED" || item.status === "EXPIRED" ? (
                      <XCircle size={20} />
                    ) : (
                      <ArrowDownToLine size={20} />
                    )
                  ) : item.status === "SUCCESS" ? (
                    <CheckCircle2 size={20} />
                  ) : item.status === "FAILED" ? (
                    <XCircle size={20} />
                  ) : (
                    <Clock size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {item.type === "deposit"
                      ? `Deposit ${item.paymentMethod?.name || ""}`
                      : item.product?.name || "Pembelian"}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">
                  {formatRupiah(Number(item.type === "deposit" ? item.amount : item.amount))}
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.status === "SUCCESS"
                      ? "bg-green-50 text-green-700"
                      : item.status === "FAILED" || item.status === "EXPIRED"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        )}
      </div>
    </div>
  );
}
