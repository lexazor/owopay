"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Clock, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  accountNumber: string;
  accountName: string;
  minAmount: number;
  maxAmount: number;
  instructions: string | null;
}

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deposit, setDeposit] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [proofUrl, setProofUrl] = useState<string>("");

  useEffect(() => {
    api("/categories").catch(() => {});
    api("/deposits").catch(() => {});
  }, []);

  useEffect(() => {
    if (step === 1) {
      api("/providers/payment-methods")
        .then((data) => {
          if (Array.isArray(data)) setMethods(data);
        })
        .catch(() => setMethods([]));
    }
  }, [step]);

  const fetchMethods = async () => {
    try {
      const data = await api("/providers/payment-methods");
      if (Array.isArray(data)) {
        setMethods(data);
      }
    } catch {
      setMethods([]);
    }
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val.toString());
  };

  const handleContinue = async () => {
    if (!amount || !selectedMethod) return;
    const data = await api("/deposits", {
      method: "POST",
      body: JSON.stringify({ paymentMethodId: selectedMethod.id, amount: parseInt(amount) }),
    });
    setDeposit(data);
    setStep(3);
    const expiredAt = new Date(data.expiredAt).getTime();
    setTimeLeft(Math.max(0, Math.floor((expiredAt - Date.now()) / 1000)));
  };

  useEffect(() => {
    if (step === 3 && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleUploadProof = async () => {
    if (!proofUrl || !deposit) return;
    try {
      await api(`/deposits/${deposit.id}/upload-proof`, {
        method: "POST",
        body: JSON.stringify({ proofImage: proofUrl }),
      });
      alert("Bukti transfer berhasil diupload!");
      router.push("/riwayat");
    } catch (err: any) {
      alert(err.message || "Upload gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.back())}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Deposit Saldo</h1>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nominal Deposit</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg font-semibold"
            placeholder="Rp 0"
          />
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {[10000, 20000, 50000, 100000, 200000, 500000].map((val) => (
              <motion.button
                key={val}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAmountSelect(val)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  amount === val.toString() ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                {formatRupiah(val)}
              </motion.button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              fetchMethods();
              setStep(2);
            }}
            disabled={!amount}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Lanjut
          </motion.button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 space-y-3">
          {methods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Metode pembayaran belum tersedia. Silakan hubungi admin.
            </div>
          ) : (
            methods.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(m)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors text-left ${
                  selectedMethod?.id === m.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  {m.logo ? <img src={m.logo} alt="" className="w-8 h-8 object-contain" /> : <span className="text-xl">🏦</span>}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">
                    Min {formatRupiah(m.minAmount)} - Max {formatRupiah(m.maxAmount)}
                  </p>
                </div>
              </motion.button>
            ))
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            disabled={!selectedMethod}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Lanjut ke Pembayaran
          </motion.button>
        </motion.div>
      )}

      {step === 3 && deposit && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Invoice</span>
              <span className="text-sm font-mono font-semibold text-gray-900">{deposit.invoiceNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-red-500 font-semibold mb-4">
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Metode</span>
                <span className="text-sm font-medium">{deposit.paymentMethod?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nomor Tujuan</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{deposit.paymentMethod?.accountNumber}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(deposit.paymentMethod?.accountNumber)}
                    className="text-indigo-600"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Atas Nama</span>
                <span className="text-sm font-medium">{deposit.paymentMethod?.accountName}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">Total Transfer</span>
                <span className="text-lg font-bold text-indigo-600">{formatRupiah(Number(deposit.totalAmount))}</span>
              </div>
            </div>
          </div>

          <ImageUpload
            value={proofUrl}
            onChange={(url: string) => setProofUrl(url)}
            label="Upload Bukti Transfer"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleUploadProof}
            disabled={!proofUrl}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Upload size={18} />
            Kirim Bukti
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
