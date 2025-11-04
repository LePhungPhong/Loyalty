"use client"

import { useEffect, useState } from "react"
import API from "../api"
import StatCard from "./stat-card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts"
import { Users, CreditCard, Award, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    points: 0,
    transactions: 0,
  })
  const [txs, setTxs] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes, tRes] = await Promise.all([
          API.get("/customers"),
          API.get("/points"),
          API.get("/transactions"),
        ])

        const getDataArray = (res) => {
          if (Array.isArray(res)) return res
          if (Array.isArray(res?.data)) return res.data
          return []
        }

        const customersData = getDataArray(cRes)
        const pointsData = getDataArray(pRes)
        const transactionsData = getDataArray(tRes)

        setStats({
          customers: customersData.length,
          points: pointsData.reduce((s, i) => s + (i.points || 0), 0),
          transactions: transactionsData.length,
        })

        const recentTxs = transactionsData
          .sort((a, b) => new Date(b.paidAt || Date.now()) - new Date(a.paidAt || Date.now()))
          .slice(0, 10)
          .map((t) => ({
            name: new Date(t.paidAt || Date.now()).toLocaleDateString("vi-VN", {
              month: "short",
              day: "numeric",
            }),
            value: t.subtotal || 0,
          }))
        setTxs(recentTxs)
      } catch (err) {
        console.error("Dashboard load error:", err)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-sm muted mt-2">Tổng quan hoạt động hệ thống khách hàng thân thiết</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Tổng khách hàng" value={stats.customers} icon={Users} />
        <StatCard title="Tổng điểm tích lũy" value={stats.points.toLocaleString("vi-VN")} icon={Award} />
        <StatCard title="Tổng giao dịch" value={stats.transactions} icon={CreditCard} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6 rounded-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Giao dịch gần đây
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txs} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.5)" />
                <XAxis dataKey="name" stroke="rgba(203, 213, 225, 0.6)" />
                <YAxis stroke="rgba(203, 213, 225, 0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [value.toLocaleString("vi-VN") + " ₫", "Tổng tiền"]}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 rounded-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Xu hướng giao dịch
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={txs} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.5)" />
                <XAxis dataKey="name" stroke="rgba(203, 213, 225, 0.6)" />
                <YAxis stroke="rgba(203, 213, 225, 0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30, 41, 59, 0.8)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [value.toLocaleString("vi-VN") + " ₫", "Tổng tiền"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
