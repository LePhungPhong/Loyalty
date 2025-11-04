"use client"

import { useEffect, useState } from "react"
import API from "../api"
import CustomerModal from "./customer-modal"
import { toast } from "react-toastify"
import { Search, Plus, Edit2, Trash2, Users } from "lucide-react"

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [q, setQ] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [order, setOrder] = useState("desc")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    try {
      const data = await API.get("/customers?" + new URLSearchParams({ search: q, sortBy, order }))
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error("Không thể tải dữ liệu khách hàng")
      setCustomers([])
    }
  }

  useEffect(() => {
    load()
  }, [q, sortBy, order])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const onEdit = (c) => {
    setEditing(c)
    setModalOpen(true)
  }
  const onDelete = async (c) => {
    if (!confirm("Bạn chắc chắn muốn xóa khách hàng này?")) return
    try {
      const res = await API.delete(`/customers/${c._id}`)
      toast.success("✓ Đã xóa khách hàng")
      load()
    } catch {
      toast.error("Xóa thất bại")
    }
  }

  const submit = async (data) => {
    try {
      if (editing) await API.put(`/customers/${editing._id}`, data)
      else await API.post("/customers", data)
      toast.success("✓ Lưu thành công")
      setModalOpen(false)
      load()
    } catch {
      toast.error("Lưu thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Khách hàng</h2>
          <p className="text-sm muted mt-1">Quản lý danh sách khách hàng thân thiết ({customers.length})</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Khách hàng mới
        </button>
      </div>

      <div className="card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-4 h-4 muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm mã, tên, email hoặc số điện thoại..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-lg bg-dark-card/40 text-sm"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="fullName">Họ tên</option>
            <option value="membership.availablePoints">Điểm</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="p-2 border rounded-lg bg-dark-card/40 text-sm"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border/50">
                <th className="px-4 py-3 text-left font-semibold text-primary">Mã KH</th>
                <th className="px-4 py-3 text-left font-semibold text-primary">Họ tên</th>
                <th className="px-4 py-3 text-left font-semibold text-primary">Email</th>
                <th className="px-4 py-3 text-center font-semibold text-primary">Điểm</th>
                <th className="px-4 py-3 text-center font-semibold text-primary">Hạng</th>
                <th className="px-4 py-3 text-center font-semibold text-primary">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(customers) && customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c._id} className="border-b border-dark-border/30 hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{c._id.slice(-4)}</td>
                    <td className="px-4 py-3 font-semibold">{c.fullName}</td>
                    <td className="px-4 py-3 text-sm muted">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 bg-primary/20 text-primary-light font-semibold rounded">
                        {c.membership?.availablePoints || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 bg-accent/20 text-accent-light text-xs font-semibold rounded-full">
                        {c.membership?.tier || "SILVER"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          className="p-1 hover:bg-primary/20 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => onDelete(c)}
                          className="p-1 hover:bg-danger/20 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 muted/40" />
                      <span className="text-sm muted">
                        {customers ? "Chưa có khách hàng nào" : "Đang tải dữ liệu..."}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSubmit={submit} />
    </div>
  )
}
