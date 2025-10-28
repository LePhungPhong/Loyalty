import React, { useEffect, useState } from "react";
import API from "../api";
import StatCard from "../components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    points: 0,
    transactions: 0,
  });
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes, tRes] = await Promise.all([
          API.get("/customers"),
          API.get("/points"),
          API.get("/transactions"),
        ]);

        // Helper to safely extract array from response (handles direct array or {data: [...]})
        const getDataArray = (res) => {
          if (Array.isArray(res)) return res;
          if (Array.isArray(res?.data)) return res.data;
          return [];
        };

        const customersData = getDataArray(cRes);
        const pointsData = getDataArray(pRes);
        const transactionsData = getDataArray(tRes);

        // Optional: Log for debugging (uncomment if needed)
        // console.log("Customers data:", customersData);
        // console.log("Points data:", pointsData);
        // console.log("Transactions data:", transactionsData);

        setStats({
          customers: customersData.length,
          points: pointsData.reduce((s, i) => s + (i.points || 0), 0),
          transactions: transactionsData.length,
        });

        // Sort by paidAt descending and take top 10 recent (with safe access)
        const recentTxs = transactionsData
          .sort(
            (a, b) =>
              new Date(b.paidAt || Date.now()) -
              new Date(a.paidAt || Date.now())
          )
          .slice(0, 10)
          .map((t) => ({
            name: new Date(t.paidAt || Date.now()).toLocaleDateString("vi-VN", {
              month: "short",
              day: "numeric",
            }),
            value: t.subtotal || 0,
          }));
        setTxs(recentTxs);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Tổng số khách hàng" value={stats.customers} />
        <StatCard title="Tổng điểm tích lũy" value={stats.points} />
        <StatCard title="Tổng số giao dịch" value={stats.transactions} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 card rounded-lg">
          <h3 className="font-semibold mb-2">
            Giao dịch gần đây (theo tổng tiền)
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txs}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-4 card rounded-lg">
          <h3 className="font-semibold mb-2">Xu hướng giao dịch</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={txs}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
