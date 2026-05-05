"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminKategoriPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", logo: "", badge: "", order: 0 });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [user, router]);

  const load = () => api("/admin/categories").then((data) => setCategories(data || []));

  const handleSubmit = async () => {
    if (editing) {
      await api(`/admin/categories/${editing}`, { method: "PATCH", body: JSON.stringify(form) });
    } else {
      await api("/admin/categories", { method: "POST", body: JSON.stringify({ ...form, isActive: true }) });
    }
    setForm({ name: "", logo: "", badge: "", order: 0 });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori?")) return;
    await api(`/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen Kategori</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{editing ? "Edit Kategori" : "Tambah Kategori"}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Kategori"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <ImageUpload
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            label="Logo Kategori"
          />
          <input
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="Badge (BARU/PROMO)"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
            placeholder="Urutan"
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
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {cat.logo && <img src={cat.logo} alt="" className="w-10 h-10 object-contain" />}
                <div>
                  <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                  {cat.badge && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">{cat.badge}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(cat.id);
                    setForm({ name: cat.name, logo: cat.logo || "", badge: cat.badge || "", order: cat.order });
                  }}
                  className="p-2 text-gray-500 hover:text-indigo-600"
                >
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-500 hover:text-red-600">
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
