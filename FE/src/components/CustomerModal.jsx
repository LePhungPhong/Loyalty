import React, { useState, useEffect } from "react";

export default function CustomerModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    membership: { tier: "SILVER" },
  });
  useEffect(() => {
    if (initial) setForm(initial);
    else
      setForm({
        fullName: "",
        phone: "",
        email: "",
        membership: { tier: "SILVER" },
      });
  }, [initial, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#071024] p-6 rounded-lg w-full max-w-md card">
        <h3 className="text-lg font-semibold mb-3">
          {initial ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          <div className="space-y-2">
            <input
              required
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="p-2 border rounded w-full bg-transparent"
            />
            <input
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="p-2 border rounded w-full bg-transparent"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="p-2 border rounded w-full bg-transparent"
            />
            <select
              value={form.membership?.tier}
              onChange={(e) =>
                setForm({
                  ...form,
                  membership: { ...form.membership, tier: e.target.value },
                })
              }
              className="p-2 border rounded w-full bg-transparent"
            >
              <option value="SILVER">Hạng Bạc</option>
              <option value="GOLD">Hạng Vàng</option>
              <option value="PLATINUM">Hạng Kim Cương</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
