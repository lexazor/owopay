"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function SetupPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePinInput = (val: string) => {
    if (val.length > 6) return;
    if (step === 1) {
      setPin(val);
      if (val.length === 6) {
        setTimeout(() => setStep(2), 300);
      }
    } else {
      setConfirmPin(val);
    }
  };

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setError("PIN tidak cocok. Silakan coba lagi.");
      setConfirmPin("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("/auth/setup-pin", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan PIN");
    } finally {
      setLoading(false);
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Buat PIN" : "Konfirmasi PIN"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            {step === 1
              ? "PIN 6 digit untuk keamanan akun kamu"
              : "Masukkan ulang PIN untuk konfirmasi"}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                i < currentPin.length
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-300"
              }`}
            >
              {i < currentPin.length ? "●" : ""}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePinInput(currentPin + num.toString())}
              className="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-xl font-semibold text-gray-700 transition-colors"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (step === 2 && currentPin.length === 6) {
                handleSubmit();
              }
            }}
            disabled={step === 2 && currentPin.length !== 6}
            className="h-14 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center disabled:opacity-30"
          >
            {step === 2 && currentPin.length === 6 ? (
              loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
              ) : (
                <ArrowRight size={24} />
              )
            ) : null}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePinInput(currentPin + "0")}
            className="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-xl font-semibold text-gray-700 transition-colors"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (step === 2 && confirmPin.length === 0) {
                setStep(1);
                setConfirmPin("");
              } else {
                handlePinInput(currentPin.slice(0, -1));
              }
            }}
            className="h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-500 transition-colors"
          >
            Hapus
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
