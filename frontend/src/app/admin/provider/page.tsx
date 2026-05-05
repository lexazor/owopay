"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminProviderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    logo: "",
    description: "",
    formFields: "[{\"name\":\"phone\",\"label\":\"Nomor HP\",\"type\":\"phone\",\"placeholder\":\"08123456789\",\"required\":true}]",
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
    api("/admin/categories").then((data) => setCategories(data || []));
  }, [user, router]);

  const load = () => api("/admin/providers").then((data) => setProviders(data || []));

  const handleSubmit = async () => {
    const payload = { ...form, formFields: JSON.parse(form.formFields || "[]"), isActive: true };
    if (editing) {
      await api(`/admin/providers/${editing}`, { method: "PATCH", body: JSON.stringify(payload) });
    } else {
      await api("/admin/providers", { method: "POST", body: JSON.stringify(payload) });
    }
    setForm({ name: "", categoryId: "", logo: "", description: "", formFields: form.formFields });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus provider?")) return;
    await api(`/admin/providers/${id}`, { method: "DELETE" });
    load();
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen Provider</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">{editing ? "Edit Provider" : "Tambah Provider"}</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama Provider"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm bg-white"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ImageUpload
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            label="Logo Provider"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm"
          />
          <textarea
            value={form.formFields}
            onChange={(e) => setForm({ ...form, formFields: e.target.value })}
            placeholder="Form Fields (JSON)"
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-sm font-mono text-xs"
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
          {providers.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {p.logo && <img src={p.logo} alt="" className="w-10 h-10 object-contain" />}
                <div>
                  <p className="font-medium text-sm text-gray-900">{p.name}</p>
                  <p className="text-[11px] text-gray-500">{p.category?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(p.id);
                    setForm({
                      name: p.name,
                      categoryId: p.categoryId,
                      logo: p.logo || "",
                      description: p.description || "",
                      formFields: JSON.stringify(p.formFields || []),
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
