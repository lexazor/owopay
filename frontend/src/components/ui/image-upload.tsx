"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Trash2, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
}

export function ImageUpload({ value, onChange, label = "Upload Gambar", maxSizeMB = 5 }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMB}MB`);
      return;
    }

    setError("");
    setLoading(true);

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload gagal");

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Upload gagal");
      setPreview("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (value) {
      const filename = value.split("/").pop();
      if (filename) {
        api("/uploads", {
          method: "DELETE",
          body: JSON.stringify({ filename }),
        }).catch(() => {});
      }
    }
    setPreview("");
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
              >
                <Upload size={18} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleRemove}
                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            ) : (
              <>
                <ImageIcon size={32} className="text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">Klik untuk upload gambar</span>
                <span className="text-xs text-gray-400">Max {maxSizeMB}MB (JPG, PNG, WEBP)</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 mt-1.5"
        >
          {error}
        </motion.p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
