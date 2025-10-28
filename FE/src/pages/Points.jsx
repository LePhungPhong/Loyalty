import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { fmtDate } from "../utils/format";

export default function Points() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState(0);

  // Helper to safely extract array from response (handles direct array or {data: [...]})
  const getDataArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        API.get("/points"),
        API.get("/customers"),
      ]);
      setItems(getDataArray(pRes));
      setCustomers(getDataArray(cRes));
    } catch (err) {
      console.error("Points load error:", err);
      toast.error("Load failed");
    }
  };
  useEffect(() => {
    load();
  }, []);

  const burn = async () => {
    if (!customerId) return toast.error("Select customer");
    try {
      await API.post("/points/burn", {
        customerId,
        points: Number(amount),
        title: "Redeemed",
      });
      toast.success("Points burned");
      setAmount(0);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Burn failed");
    }
  };

  const expire = async () => {
    if (!customerId) return toast.error("Select customer");
    try {
      await API.post("/points/expire", { customerId, points: Number(amount) });
      toast.success("Points expired");
      setAmount(0);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Expire failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* --- Thanh tiêu đề và thao tác --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch sử điểm thưởng</h2>
        <div className="flex items-center space-x-2">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="p-2 border rounded bg-transparent"
          >
            <option value="">Chọn khách hàng</option>
            {(customers || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.fullName} ({c._id})
              </option>
            ))}
          </select>

          <input
            placeholder="Số điểm"
            value={amount || ""}
            onChange={(e) =>
              setAmount(e.target.value ? parseInt(e.target.value, 10) || 0 : 0)
            }
            className="p-2 border rounded bg-transparent w-28 text-right"
            type="number"
            min="0"
          />

          <button
            onClick={burn}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded"
          >
            Đổi thưởng
          </button>

          <button
            onClick={expire}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
          >
            Hết hạn
          </button>
        </div>
      </div>

      {/* --- Bảng lịch sử điểm --- */}
      <div className="card p-4 rounded-lg overflow-x-auto">
        <table className="min-w-full border-collapse border border-white/10 text-sm">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 border border-white/10 w-48">
                Mã giao dịch
              </th>
              <th className="px-4 py-3 border border-white/10 w-56">
                Khách hàng
              </th>
              <th className="px-4 py-3 border border-white/10 w-32 text-center">
                Loại
              </th>
              <th className="px-4 py-3 border border-white/10 w-24 text-center">
                Điểm
              </th>
              <th className="px-4 py-3 border border-white/10 w-40 text-center">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((it, idx) => (
              <tr
                key={it._id}
                className={`hover:bg-white/5 transition ${
                  idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-2 border border-white/10 font-mono text-xs text-gray-400">
                  {it._id}
                </td>
                <td className="px-4 py-2 border border-white/10">
                  {it.customer?.name
                    ? `${it.customer.name} (${it.customer.id})`
                    : "Unknown"}
                </td>
                <td className="px-4 py-2 border border-white/10 text-center">
                  {it.type === "EARN" && (
                    <span className="text-green-400 font-semibold">
                      + Tích điểm
                    </span>
                  )}
                  {it.type === "BURN" && (
                    <span className="text-yellow-400 font-semibold">
                      – Đổi thưởng
                    </span>
                  )}
                  {it.type === "EXPIRE" && (
                    <span className="text-red-400 font-semibold">Hết hạn</span>
                  )}
                </td>
                <td className="px-4 py-2 border border-white/10 text-center">
                  {it.points}
                </td>
                <td className="px-4 py-2 border border-white/10 text-center">
                  {fmtDate(it.occurredAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
