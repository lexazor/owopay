"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Ban, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [user, router]);

  const load = () =>
    api("/admin/users")
      .then((data) => setUsers(data || []))
      .catch(() => setUsers([]));

  const updateUser = async (id: string, payload: any) => {
    await api(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    load();
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-3xl mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Manajemen User</h1>
      </div>

      <div className="p-4 space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari user..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm bg-white"
        />

        {filtered.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">{u.fullName}</p>
                <p className="text-xs text-gray-500">@{u.username} • {u.email}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  u.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {u.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-indigo-600">{formatRupiah(Number(u.balance))}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newBalance = prompt("Adjust saldo:", String(u.balance));
                    if (newBalance !== null) {
                      updateUser(u.id, { balance: parseFloat(newBalance) });
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-indigo-600"
                  title="Adjust saldo"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => updateUser(u.id, { status: u.status === "ACTIVE" ? "BANNED" : "ACTIVE" })}
                  className={`p-2 ${u.status === "ACTIVE" ? "text-gray-500 hover:text-red-600" : "text-gray-500 hover:text-green-600"}`}
                  title={u.status === "ACTIVE" ? "Ban" : "Unban"}
                >
                  {u.status === "ACTIVE" ? <Ban size={16} /> : <CheckCircle size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">User tidak ditemukan</div>
        )}
      </div>
    </div>
  );
}
