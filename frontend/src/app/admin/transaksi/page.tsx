"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminTransaksiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [user, router]);

  const load = () =>
    api("/admin/transactions")
      .then((data) => setTransactions(data || []))
      .catch(() => setTransactions([]));

  const updateStatus = async (id: string, status: string) => {
    await api(`/admin/transactions/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen Transaksi</h1>
      </div>

      <div className="p-4 space-y-3">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{tx.product?.name || "-"}</p>
                <p className="text-xs text-gray-500">
                  {tx.user?.fullName} (@{tx.user?.username}) • {new Date(tx.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  tx.status === "SUCCESS"
                    ? "bg-green-50 text-green-700"
                    : tx.status === "FAILED"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {tx.status}
              </span>
            </div>
            <p className="text-sm font-bold text-indigo-600 mb-3">{formatRupiah(Number(tx.amount))}</p>
            {tx.status === "PENDING" && (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateStatus(tx.id, "SUCCESS")}
                  className="flex-1 bg-green-50 text-green-700 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={14} /> Sukses
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateStatus(tx.id, "FAILED")}
                  className="flex-1 bg-red-50 text-red-700 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <XCircle size={14} /> Gagal
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Belum ada transaksi</div>
        )}
      </div>
    </div>
  );
}
