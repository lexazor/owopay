"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export default function ProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.provider as string;
  const [products, setProducts] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    api(`/providers/${providerId}/products`).then((data) => setProducts(data || []));
    api("/providers").catch(() => []).then((data) => {
      const p = (data || []).find((x: any) => x.id === providerId);
      setProvider(p);
    });
  }, [providerId]);

  const formFields = provider?.formFields || [];

  const handleFormChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = formFields.every((f: any) => !f.required || formData[f.name]);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">{provider?.name || "Provider"}</h1>
      </div>

      <div className="p-4 space-y-4">
        {formFields.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Data Pelanggan</h2>
            {formFields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type === "phone" ? "tel" : field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleFormChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  required={field.required}
                />
              </div>
            ))}
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-900">Pilih Produk</h2>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, i) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              disabled={formFields.length > 0 && !allFilled}
              onClick={() => setSelectedProduct(product)}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 text-left transition-colors disabled:opacity-50 ${
                selectedProduct?.id === product.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100"
              }`}
            >
              <p className="text-lg font-bold text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Nominal</p>
              <p className="text-sm font-semibold text-indigo-600 mt-0.5">{formatRupiah(Number(product.price))}</p>
              {product.badge && (
                <span className="inline-block mt-2 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {product.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-500">Total Pembayaran</p>
                <p className="text-xl font-bold text-indigo-600">{formatRupiah(Number(selectedProduct.price))}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Ubah
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                router.push(
                  `/layanan/checkout?productId=${selectedProduct.id}&data=${encodeURIComponent(
                    JSON.stringify(formData)
                  )}`
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Konfirmasi Pesanan
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
