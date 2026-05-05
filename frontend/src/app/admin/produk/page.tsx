"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminProdukPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    providerId: "",
    nominal: "",
    price: "",
    badge: "",
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
    api("/admin/providers").then((data) => setProviders(data || []));
  }, [user, router]);

  const load = () => api("/admin/products").then((data) => setProducts(data || []));

  const handleSubmit = async () => {
    const payload = {
      ...form,
      nominal: parseFloat(form.nominal),
      price: parseFloat(form.price),
      isActive: true,
    };
    if (editing) {
      await api(`/admin/products/${editing}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await api("/admin/products", { method: "POST", body: JSON.stringify(payload) });
    }
    setForm({ name: "", providerId: "", nominal: "", price: "", badge: "" });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk?")) return;
    await api(`/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen Produk</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{editing ? "Edit Produk" : "Tambah Produk"}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Produk"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <select
            value={form.providerId}
            onChange={(e) => setForm({ ...form, providerId: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm bg-white"
          >
            <option value="">Pilih Provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            value={form.nominal}
            onChange={(e) => setForm({ ...form, nominal: e.target.value })}
            placeholder="Nominal"
            type="number"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Harga Jual"
            type="number"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <input
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="Badge (opsional)"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {editing ? "Update" : "Simpan"}
          </motion.button>
        </div>

        <div className="space-y-2">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{p.name}</p>
                <p className="text-[11px] text-gray-500">{p.provider?.name} • {p.provider?.category?.name}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{formatRupiah(Number(p.price))}</p>
                {p.badge && (
                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">{p.badge}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(p.id);
                    setForm({
                      name: p.name,
                      providerId: p.providerId,
                      nominal: String(p.nominal),
                      price: String(p.price),
                      badge: p.badge || "",
                    });
                  }}
                  className="p-2 text-gray-500 hover:text-indigo-600"
                >
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
