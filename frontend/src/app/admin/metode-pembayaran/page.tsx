"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminMetodePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [methods, setMethods] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    logo: "",
    accountNumber: "",
    accountName: "",
    minAmount: "",
    maxAmount: "",
    uniqueCode: true,
    uniqueMin: "100",
    uniqueMax: "999",
    expiredMinutes: "30",
    instructions: "",
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [user, router]);

  const load = () => api("/admin/payment-methods").then((data) => setMethods(data || []));

  const handleSubmit = async () => {
    const payload = {
      ...form,
      minAmount: parseFloat(form.minAmount),
      maxAmount: parseFloat(form.maxAmount),
      uniqueMin: parseInt(form.uniqueMin),
      uniqueMax: parseInt(form.uniqueMax),
      expiredMinutes: parseInt(form.expiredMinutes),
      isActive: true,
    };
    if (editing) {
      await api(`/admin/payment-methods/${editing}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await api("/admin/payment-methods", { method: "POST", body: JSON.stringify(payload) });
    }
    setForm({
      name: "",
      logo: "",
      accountNumber: "",
      accountName: "",
      minAmount: "",
      maxAmount: "",
      uniqueCode: true,
      uniqueMin: "100",
      uniqueMax: "999",
      expiredMinutes: "30",
      instructions: "",
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus metode pembayaran?")) return;
    await api(`/admin/payment-methods/${id}`, { method: "DELETE" });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{editing ? "Edit Metode" : "Tambah Metode"}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Metode"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <ImageUpload
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            label="Logo Metode Pembayaran"
          />
          <input
            value={form.accountNumber}
            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            placeholder="Nomor Rekening/Akun"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <input
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            placeholder="Nama Pemilik"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.minAmount}
              onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
              placeholder="Minimal"
              type="number"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
            />
            <input
              value={form.maxAmount}
              onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
              placeholder="Maksimal"
              type="number"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <input
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            placeholder="Instruksi Pembayaran"
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
          {methods.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {m.logo && <img src={m.logo} alt="" className="w-10 h-10 object-contain" />}
                <div>
                  <p className="font-medium text-sm text-gray-900">{m.name}</p>
                  <p className="text-[11px] text-gray-500">{m.accountNumber} - {m.accountName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(m.id);
                    setForm({
                      name: m.name,
                      logo: m.logo || "",
                      accountNumber: m.accountNumber,
                      accountName: m.accountName,
                      minAmount: String(m.minAmount),
                      maxAmount: String(m.maxAmount),
                      uniqueCode: m.uniqueCode,
                      uniqueMin: String(m.uniqueMin),
                      uniqueMax: String(m.uniqueMax),
                      expiredMinutes: String(m.expiredMinutes),
                      instructions: m.instructions || "",
                    });
                  }}
                  className="p-2 text-gray-500 hover:text-indigo-600"
                >
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-500 hover:text-red-600">
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
