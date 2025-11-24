"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CustomerModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    address: { city: "", country: "" },
    membership: { tier: "SILVER" },
  });

  useEffect(() => {
    if (initial) {
      setForm({
        ...initial,
        address: initial.address || { city: "", country: "" },
        membership: initial.membership || { tier: "SILVER" },
      });
    } else {
      setForm({
        fullName: "",
        phone: "",
        email: "",
        dob: "",
        gender: "",
        address: { city: "", country: "" },
        membership: { tier: "SILVER" },
      });
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card bg-slate-900 p-6 rounded-xl w-full max-w-lg border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
          <h3 className="text-xl font-bold text-white">
            {initial ? "Chỉnh sửa" : "Thêm mới"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-slate-300">Họ và tên *</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Số điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Ngày sinh</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              >
                <option value="">-- Chọn --</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Thành phố</label>
              <input
                value={form.address?.city || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: { ...form.address, city: e.target.value },
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Quốc gia</label>
              <input
                value={form.address?.country || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: { ...form.address, country: e.target.value },
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Hạng</label>
            <select
              value={form.membership?.tier}
              onChange={(e) =>
                setForm({
                  ...form,
                  membership: { ...form.membership, tier: e.target.value },
                })
              }
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mt-1"
            >
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-bold"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
