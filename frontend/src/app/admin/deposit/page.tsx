"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminDepositPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [user, router]);

  const load = () =>
    api("/admin/deposits")
      .then((data) => setDeposits(data || []))
      .catch(() => setDeposits([]));

  const updateStatus = async (id: string, status: string) => {
    await api(`/admin/deposits/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen Deposit</h1>
      </div>

      <div className="p-4 space-y-3">
        {deposits.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.invoiceNumber}</p>
                <p className="text-xs text-gray-500">
                  {d.user?.fullName} (@{d.user?.username}) • {d.paymentMethod?.name}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  d.status === "SUCCESS"
                    ? "bg-green-50 text-green-700"
                    : d.status === "FAILED" || d.status === "EXPIRED"
                    ? "bg-red-50 text-red-700"
                    : d.status === "WAITING_VERIFICATION"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {d.status}
              </span>
            </div>
            <p className="text-sm font-bold text-indigo-600 mb-3">{formatRupiah(Number(d.totalAmount))}</p>
            {d.proofImage && (
              <a
                href={d.proofImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 mb-2 hover:underline"
              >
                <ImageIcon size={14} /> Lihat Bukti Transfer
              </a>
            )}
            {(d.status === "PENDING" || d.status === "WAITING_VERIFICATION") && (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateStatus(d.id, "SUCCESS")}
                  className="flex-1 bg-green-50 text-green-700 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={14} /> Konfirmasi
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateStatus(d.id, "FAILED")}
                  className="flex-1 bg-red-50 text-red-700 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
                >
                  <XCircle size={14} /> Tolak
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
        {deposits.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Belum ada deposit</div>
        )}
      </div>
    </div>
  );
}
