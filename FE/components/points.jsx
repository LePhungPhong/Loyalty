"use client";

import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { Plus, Minus, AlertCircle, TrendingUp } from "lucide-react";

export default function Points() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState(0);

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
      toast.error("Không thể tải dữ liệu");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const burn = async () => {
    if (!customerId) return toast.error("Chọn khách hàng");
    try {
      await API.post("/points/burn", {
        customerId,
        points: Number(amount),
        title: "Đã đổi thưởng",
      });
      toast.success("✓ Ghi nhận đổi thưởng");
      setAmount(0);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi thưởng thất bại");
    }
  };

  const expire = async () => {
    if (!customerId) return toast.error("Chọn khách hàng");
    try {
      await API.post("/points/expire", {
        customerId,
        points: Number(amount),
      });
      toast.success("✓ Ghi nhận hết hạn điểm");
      setAmount(0);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Ghi nhận hết hạn thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lịch sử điểm thưởng</h2>
        <p className="text-sm muted mt-1">
          Quản lý điểm tích lũy, đổi thưởng và hết hạn
        </p>
      </div>

      <div className="card p-6 rounded-xl border-primary/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Quản lý điểm thưởng
        </h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Khách hàng</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Chọn khách hàng</option>
              {(customers || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.membership?.availablePoints || 0} điểm)
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium mb-2">Số điểm</label>
            <input
              placeholder="0"
              value={amount || ""}
              onChange={(e) =>
                setAmount(
                  e.target.value ? Number.parseInt(e.target.value, 10) || 0 : 0
                )
              }
              className="w-full p-3 border rounded-lg text-right"
              type="number"
              min="0"
            />
          </div>

          <button
            onClick={burn}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-slate-900 font-semibold rounded-lg shadow-lg transition-all"
          >
            <Minus className="w-4 h-4" />
            Đổi thưởng
          </button>

          <button
            onClick={expire}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-danger to-danger/80 hover:from-danger/90 hover:to-danger/70 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            Hết hạn
          </button>
        </div>
      </div>

      <div className="card p-6 rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border/50">
              <th className="px-4 py-3 text-left font-semibold text-primary">
                Mã GD
              </th>
              <th className="px-4 py-3 text-left font-semibold text-primary">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-center font-semibold text-primary">
                Loại
              </th>
              <th className="px-4 py-3 text-center font-semibold text-primary">
                Điểm
              </th>
              <th className="px-4 py-3 text-left font-semibold text-primary">
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((it) => (
              <tr
                key={it._id}
                className="border-b border-dark-border/30 hover:bg-primary/5 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                  {it._id}
                </td>
                <td className="px-4 py-3">{it.customer?.name || "Unknown"}</td>
                <td className="px-4 py-3 text-center">
                  {it.type === "EARN" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent-light font-semibold rounded">
                      <TrendingUp className="w-3 h-3" />
                      Tích điểm
                    </span>
                  )}
                  {it.type === "BURN" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning rounded font-semibold">
                      <Minus className="w-3 h-3" />
                      Đổi thưởng
                    </span>
                  )}
                  {it.type === "EXPIRE" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger/20 text-danger rounded font-semibold">
                      <AlertCircle className="w-3 h-3" />
                      Hết hạn
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold">
                  {it.points}
                </td>
                <td className="px-4 py-3 text-sm muted">
                  {it.occurredAt
                    ? new Date(it.occurredAt).toLocaleString("vi-VN")
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
