import React, { useEffect, useState } from "react";
import API from "../api";
import CustomerModal from "../components/CustomerModal";
import { toast } from "react-toastify";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const data = await API.get(
        "/customers?" + new URLSearchParams({ search: q, sortBy, order })
      );
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Không thể tải dữ liệu khách hàng");
      setCustomers([]);
    }
  };

  useEffect(() => {
    load();
  }, [q, sortBy, order]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const onEdit = (c) => {
    setEditing(c);
    setModalOpen(true);
  };
  const onDelete = async (c) => {
    if (!confirm("Xóa khách hàng này?")) return;
    try {
      const res = await API.delete(`/customers/${c._id}`);
      toast.success(res.message || "Đã xóa khách hàng");
      load();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const submit = async (data) => {
    try {
      if (editing) await API.put(`/customers/${editing._id}`, data);
      else await API.post("/customers", data);
      toast.success("Đã lưu thành công");
      setModalOpen(false);
      load();
    } catch {
      toast.error("Lưu thất bại");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Khách hàng</h2>
        <div className="flex items-center space-x-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm Mã KH, tên, email, số điện thoại"
            className="p-2 rounded-md bg-transparent border"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-md bg-transparent text-white"
          >
            <option value="createdAt" className="text-black">
              Ngày tạo
            </option>
            <option value="fullName" className="text-black">
              Họ tên
            </option>
            <option value="membership.availablePoints" className="text-black">
              Điểm
            </option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="p-2 border rounded-md bg-transparent"
          >
            <option value="desc" className="text-black">
              Giảm dần
            </option>
            <option value="asc" className="text-black">
              Tăng dần
            </option>
          </select>
          <button
            onClick={openCreate}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            + Khách hàng mới
          </button>
        </div>
      </div>

      <div className="card p-4 rounded-lg overflow-x-auto">
        <table className="min-w-full border-collapse border border-white/10 text-sm">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 border border-white/10 w-40">Mã KH</th>
              <th className="px-4 py-3 border border-white/10 w-64">Họ tên</th>
              <th className="px-4 py-3 border border-white/10 w-32 text-center">
                Điểm
              </th>
              <th className="px-4 py-3 border border-white/10 w-40 text-center">
                Hạng
              </th>
              <th className="px-4 py-3 border border-white/10 w-48 text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(customers) && customers.length > 0 ? (
              customers.map((c, idx) => (
                <tr
                  key={c._id || idx}
                  className={`hover:bg-white/5 transition ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-2 border border-white/10 font-mono text-xs text-gray-400">
                    {c._id}
                  </td>
                  <td className="px-4 py-2 border border-white/10">
                    {c.fullName}
                  </td>
                  <td className="px-4 py-2 border border-white/10 text-center">
                    {c.membership?.availablePoints || 0}
                  </td>
                  <td className="px-4 py-2 border border-white/10 text-center">
                    {c.membership?.tier}
                  </td>
                  <td className="px-4 py-2 border border-white/10 text-center">
                    <button
                      onClick={() => onEdit(c)}
                      className="mr-2 px-3 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-xs"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="px-3 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white text-xs"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-400 italic border border-white/10"
                >
                  {customers
                    ? "Không có khách hàng nào."
                    : "Đang tải dữ liệu..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}
