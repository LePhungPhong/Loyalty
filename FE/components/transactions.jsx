"use client"

import { useEffect, useState } from "react"
import API from "../api"
import { toast } from "react-toastify"
import { Search, Plus, TrendingUp } from "lucide-react"

export default function Transactions() {
  const [customers, setCustomers] = useState([])
  const [txs, setTxs] = useState([])
  const [q, setQ] = useState("")
  const [form, setForm] = useState({
    customerId: "",
    subtotal: "",
    pointsEarned: 0,
    paidAt: new Date().toISOString().slice(0, 19),
  })

  const getDataArray = (res) => {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data)) return res.data
    return []
  }

  const load = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        API.get("/customers"),
        API.get("/transactions", { params: { search: q } }),
      ])
      setCustomers(getDataArray(cRes))
      setTxs(getDataArray(tRes))
    } catch (err) {
      console.error("Transactions load error:", err)
      toast.error("Không thể tải dữ liệu")
    }
  }
  useEffect(() => {
    load()
  }, [q])

  const calcPoints = (subtotal) => Math.floor(Number(subtotal || 0) / 1000)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.customerId || !form.subtotal) {
      return toast.error("Vui lòng điền tất cả thông tin bắt buộc")
    }
    try {
      const customerName = customers?.find((c) => c._id === form.customerId)?.fullName || ""
      const payload = {
        customer: {
          id: form.customerId,
          name: customerName,
        },
        subtotal: Number(form.subtotal),
        pointsEarned: calcPoints(form.subtotal),
        paidAt: new Date(form.paidAt).toISOString(),
      }
      await API.post("/transactions", payload)
      toast.success("✓ Ghi nhận giao dịch thành công")
      setForm({
        customerId: "",
        subtotal: "",
        pointsEarned: 0,
        paidAt: new Date().toISOString().slice(0, 19),
      })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo giao dịch thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Giao dịch</h2>
          <p className="text-sm muted mt-1">Quản lý và ghi nhận giao dịch khách hàng</p>
        </div>
      </div>

      <form onSubmit={submit} className="card rounded-xl p-6 border-primary/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Ghi nhận giao dịch mới
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <select
            required
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="p-3 border rounded-lg bg-dark-card/40"
          >
            <option value="">Chọn khách hàng</option>
            {(customers || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName}
              </option>
            ))}
          </select>

          <input
            placeholder="Tổng tiền (VNĐ)"
            value={form.subtotal}
            onChange={(e) =>
              setForm({
                ...form,
                subtotal: e.target.value,
                pointsEarned: calcPoints(e.target.value),
              })
            }
            className="p-3 border rounded-lg"
            type="number"
            min="0"
          />

          <input
            type="datetime-local"
            value={form.paidAt}
            onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
            className="p-3 border rounded-lg"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm muted">1 điểm / 1.000₫ ({calcPoints(form.subtotal)} điểm)</span>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-accent to-accent-light hover:from-accent/90 hover:to-accent-light/90 text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Lưu giao dịch
          </button>
        </div>
      </form>

      <div className="card p-6 rounded-xl overflow-x-auto">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm giao dịch..."
            className="flex-1 max-w-xs bg-transparent text-sm"
          />
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border/50">
              <th className="px-4 py-3 text-left font-semibold text-primary">Mã GD</th>
              <th className="px-4 py-3 text-left font-semibold text-primary">Khách hàng</th>
              <th className="px-4 py-3 text-right font-semibold text-primary">Tổng tiền</th>
              <th className="px-4 py-3 text-center font-semibold text-primary">Điểm</th>
              <th className="px-4 py-3 text-center font-semibold text-primary">Ngày thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {(txs || []).map((tx, idx) => (
              <tr key={tx._id} className="border-b border-dark-border/30 hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{tx._id.slice(-6)}</td>
                <td className="px-4 py-3">{tx.customer?.name || "Unknown"}</td>
                <td className="px-4 py-3 text-right font-semibold">{tx.subtotal?.toLocaleString("vi-VN")} ₫</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block px-2 py-1 bg-accent/20 text-accent-light font-semibold rounded">
                    +{tx.pointsEarned || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm muted">
                  {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("vi-VN") : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
