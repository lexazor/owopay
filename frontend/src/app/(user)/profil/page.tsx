"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, User, Phone, Mail, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function ProfilPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    api("/user/profile").then((data) => setProfile(data));
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
          <ArrowLeft size={24} className="text-gray-700" />
        </motion.button>
        <h1 className="text-lg font-semibold text-gray-900">Profil</h1>
      </div>

      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
            {profile?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{profile?.fullName}</h2>
          <p className="text-sm text-gray-500">@{profile?.username}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ProfileItem icon={<Phone size={18} />} label="WhatsApp" value={profile?.whatsapp} />
          <ProfileItem icon={<Mail size={18} />} label="Email" value={profile?.email} />
          <ProfileItem icon={<Shield size={18} />} label="PIN" value={profile?.isPinSet ? "Sudah diatur" : "Belum diatur"} />
          <ProfileItem
            icon={<Calendar size={18} />}
            label="Bergabung"
            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID") : "-"}
          />
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </motion.button>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
      </div>
    </div>
  );
}
