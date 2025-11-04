"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function CustomerModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    membership: { tier: "SILVER" },
  })

  useEffect(() => {
    if (initial) setForm(initial)
    else
      setForm({
        fullName: "",
        phone: "",
        email: "",
        membership: { tier: "SILVER" },
      })
  }, [initial, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card p-6 rounded-xl w-full max-w-md border-primary/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{initial ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-dark-border/40 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Họ tên *</label>
            <input
              required
              placeholder="Nhập họ tên"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Số điện thoại</label>
            <input
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              placeholder="Nhập email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hạng thành viên</label>
            <select
              value={form.membership?.tier}
              onChange={(e) =>
                setForm({
                  ...form,
                  membership: { ...form.membership, tier: e.target.value },
                })
              }
              className="w-full p-3 border rounded-lg"
            >
              <option value="SILVER">🥈 Hạng Bạc</option>
              <option value="GOLD">🟡 Hạng Vàng</option>
              <option value="PLATINUM">💎 Hạng Kim Cương</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-dark-border/80 rounded-lg hover:bg-dark-border/20 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-slate-900 font-semibold rounded-lg shadow-lg transition-all"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
