"use client";

import { useEffect, useState } from "react";
import API from "../api";
import StatCard from "./stat-card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  Users,
  CreditCard,
  Award,
  TrendingUp,
  BarChart as BarChartIcon,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    points: 0,
    transactions: 0,
  });

  const [recentTxs, setRecentTxs] = useState([]);
  const [trendTxs, setTrendTxs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes, tRes] = await Promise.all([
          API.get("/customers"),
          API.get("/points"),
          API.get("/transactions"),
        ]);

        const getDataArray = (res) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          return [];
        };

        const customersData = getDataArray(cRes);
        const pointsData = getDataArray(pRes);
        const transactionsData = getDataArray(tRes);

        setStats({
          customers: customersData.length,
          points: pointsData.reduce((s, i) => s + (i.points || 0), 0),
          transactions: transactionsData.length,
        });

        // --- XỬ LÝ 1: BIỂU ĐỒ CỘT (10 Giao dịch riêng lẻ mới nhất) ---
        const individualTxs = [...transactionsData]
          .sort(
            (a, b) =>
              new Date(b.paidAt || Date.now()) -
              new Date(a.paidAt || Date.now())
          )
          .slice(0, 10)
          .reverse()
          .map((t) => ({
            name: t._id.slice(-4),
            code: t._id,
            fullDate: new Date(t.paidAt || Date.now()).toLocaleString("vi-VN"),
            value: Number(t.subtotal || 0),
          }));
        setRecentTxs(individualTxs);

        // --- XỬ LÝ 2: BIỂU ĐỒ ĐƯỜNG (Tổng tiền gộp theo ngày) ---
        const groupedMap = {};
        transactionsData.forEach((t) => {
          const date = new Date(t.paidAt || Date.now());
          const dateKey = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime();

          if (!groupedMap[dateKey]) groupedMap[dateKey] = 0;
          groupedMap[dateKey] += Number(t.subtotal || 0);
        });

        const aggregatedTxs = Object.keys(groupedMap)
          .map((key) => Number(key))
          .sort((a, b) => a - b)
          .slice(-10)
          .map((timestamp) => ({
            name: new Date(timestamp).toLocaleDateString("vi-VN", {
              day: "numeric",
              month: "short",
            }),
            fullDate: new Date(timestamp).toLocaleDateString("vi-VN"),
            value: groupedMap[timestamp],
          }));
        setTrendTxs(aggregatedTxs);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    load();
  }, []);

  // Hàm format trục Y
  const formatYAxis = (value) => {
    if (value === 0) return "0";
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
    if (value >= 1000000) {
      const val = value / 1000000;
      return Number.isInteger(val) ? `${val} tr` : `${val.toFixed(1)} tr`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(0)} k`;
    return value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-sm muted mt-2">
          Tổng quan hoạt động hệ thống khách hàng thân thiết
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tổng khách hàng"
          value={stats.customers}
          icon={Users}
        />
        <StatCard
          title="Tổng điểm tích lũy"
          value={stats.points.toLocaleString("vi-VN")}
          icon={Award}
        />
        <StatCard
          title="Tổng giao dịch"
          value={stats.transactions}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* --- BIỂU ĐỒ CỘT: 10 GIAO DỊCH RIÊNG LẺ --- */}
        <div className="card p-6 rounded-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-primary" />
            10 Giao dịch mới nhất
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentTxs}
                margin={{ top: 10, right: 0, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(51, 65, 85, 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(203, 213, 225, 0.6)"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  stroke="rgba(203, 213, 225, 0.6)"
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  width={50}
                  tickCount={6}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                    minWidth: "200px",
                  }}
                  // --- SỬA LỖI HYDRATION TẠI ĐÂY ---
                  // Thay <div> bằng <span> cho container ngoài cùng
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <span className="flex flex-col gap-1 mb-2 border-b border-slate-700 pb-2">
                          <span className="font-bold text-cyan-400 block">
                            {data.code}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {data.fullDate}
                          </span>
                        </span>
                      );
                    }
                    return label;
                  }}
                  formatter={(value) => [
                    value.toLocaleString("vi-VN") + " ₫",
                    "Giá trị",
                  ]}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BIỂU ĐỒ ĐƯỜNG: XU HƯỚNG THEO NGÀY --- */}
        <div className="card p-6 rounded-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Xu hướng doanh thu (Theo ngày)
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendTxs}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(51, 65, 85, 0.5)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(203, 213, 225, 0.6)"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="rgba(203, 213, 225, 0.6)"
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  width={50}
                  tickCount={6}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0)
                      return payload[0].payload.fullDate;
                    return label;
                  }}
                  formatter={(value) => [
                    value.toLocaleString("vi-VN") + " ₫",
                    "Tổng ngày",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
