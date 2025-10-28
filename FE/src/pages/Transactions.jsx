import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

export default function Transactions() {
  const [customers, setCustomers] = useState([]);
  const [txs, setTxs] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    customerId: "",
    subtotal: "",
    pointsEarned: 0,
    paidAt: new Date().toISOString().slice(0, 19),
  });

  // Helper to safely extract array from response (handles direct array or {data: [...]})
  const getDataArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const load = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        API.get("/customers"),
        API.get("/transactions", { params: { search: q } }),
      ]);
      setCustomers(getDataArray(cRes));
      setTxs(getDataArray(tRes));
    } catch (err) {
      console.error("Transactions load error:", err);
      toast.error("Load failed");
    }
  };
  useEffect(() => {
    load();
  }, [q]);

  const calcPoints = (subtotal) => Math.floor(Number(subtotal || 0) / 1000);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customerId || !form.subtotal) {
      return toast.error("Please fill required fields");
    }
    try {
      const customerName =
        customers?.find((c) => c._id === form.customerId)?.fullName || "";
      const payload = {
        customer: {
          id: form.customerId,
          name: customerName,
        },
        subtotal: Number(form.subtotal),
        pointsEarned: calcPoints(form.subtotal),
        paidAt: new Date(form.paidAt).toISOString(),
      };
      await API.post("/transactions", payload);
      toast.success("Transaction recorded");
      setForm({
        customerId: "",
        subtotal: "",
        pointsEarned: 0,
        paidAt: new Date().toISOString().slice(0, 19),
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* --- Thanh tiêu đề và ô tìm kiếm --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Giao dịch</h2>
        <div className="flex items-center space-x-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm giao dịch"
            className="p-2 rounded-md bg-transparent border w-64"
          />
        </div>
      </div>

      {/* --- Form tạo giao dịch mới --- */}
      <form onSubmit={submit} className="p-4 card rounded-lg">
        <div className="grid grid-cols-3 gap-3">
          <select
            required
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className="p-2 border rounded bg-transparent"
          >
            <option value="" class>
              Chọn khách hàng
            </option>
            {(customers || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c._id})
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
            className="p-2 border rounded bg-transparent"
            type="number"
            min="0"
          />

          <input
            type="datetime-local"
            value={form.paidAt}
            onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
            className="p-2 border rounded bg-transparent"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="muted text-sm">
            Tự động cộng 1 điểm cho mỗi 1000₫ giao dịch (Điểm:{" "}
            {calcPoints(form.subtotal)})
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
            >
              Tạo giao dịch
            </button>
          </div>
        </div>
      </form>

      {/* --- Bảng danh sách giao dịch --- */}
      <div className="card p-4 rounded-lg overflow-x-auto">
        <table className="min-w-full border-collapse border border-white/10 text-sm">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 border border-white/10 w-48">Mã GD</th>
              <th className="px-4 py-3 border border-white/10 w-56">
                Khách hàng
              </th>
              <th className="px-4 py-3 border border-white/10 w-40 text-right">
                Tổng tiền (VNĐ)
              </th>
              <th className="px-4 py-3 border border-white/10 w-32 text-center">
                Điểm cộng
              </th>
              <th className="px-4 py-3 border border-white/10 w-48 text-center">
                Ngày thanh toán
              </th>
            </tr>
          </thead>

          <tbody>
            {(txs || []).map((tx, idx) => (
              <tr
                key={tx._id}
                className={`hover:bg-white/5 transition ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-2 border border-white/10 font-mono text-xs text-gray-400">
                  {tx._id}
                </td>
                <td className="px-4 py-2 border border-white/10">
                  {tx.customer?.name
                    ? `${tx.customer.name} (${tx.customer.id})`
                    : "Unknown"}
                </td>
                <td className="px-4 py-2 border border-white/10 text-right">
                  {tx.subtotal?.toLocaleString("vi-VN")} ₫
                </td>
                <td className="px-4 py-2 border border-white/10 text-center text-green-400 font-semibold">
                  +{tx.pointsEarned || 0}
                </td>
                <td className="px-4 py-2 border border-white/10 text-center">
                  {tx.paidAt
                    ? new Date(tx.paidAt).toLocaleString("vi-VN")
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
