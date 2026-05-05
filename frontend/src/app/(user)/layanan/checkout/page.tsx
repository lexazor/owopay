"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const productId = searchParams.get("productId");
  const dataParam = searchParams.get("data");
  const customerData = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : {};

  const [product, setProduct] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    api("/providers/products/all")
      .catch(() => [])
      .then((data) => {
        const p = (data || []).find((x: any) => x.id === productId);
        setProduct(p);
      });
  }, [productId]);

  const handlePay = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      await api("/transactions", {
        method: "POST",
        body: JSON.stringify({ productId, customerData, pin }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/riwayat"), 1500);
    } catch (err: any) {
      setError(err.message || "Transaksi gagal");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 max-w-md mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 size={40} className="text-green-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900">Transaksi Berhasil!</h2>
          <p className="text-sm text-gray-500 mt-1">Pesanan kamu sedang diproses</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Konfirmasi Pembayaran</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Produk</p>
          <p className="font-semibold text-gray-900">{product?.name || "-"}</p>
          <p className="text-xs text-gray-500 mt-2">Provider</p>
          <p className="font-medium text-gray-900">{product?.provider?.name || "-"}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold text-indigo-600">{formatRupiah(Number(product?.price || 0))}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">Masukkan PIN</h2>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all ${
                  i < pin.length ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-300"
                }`}
              >
                {i < pin.length ? "●" : ""}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPin((p) => (p.length < 6 ? p + num.toString() : p))}
                className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-lg font-semibold text-gray-700 transition-colors"
              >
                {num}
              </motion.button>
            ))}
            <div />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setPin((p) => p + "0")}
              className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-lg font-semibold text-gray-700 transition-colors"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-500 transition-colors"
            >
              Hapus
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePay}
          disabled={pin.length !== 6 || loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </motion.button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 max-w-md mx-auto flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
