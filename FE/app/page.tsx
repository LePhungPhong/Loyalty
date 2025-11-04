"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Dashboard from "@/components/dashboard"

export default function DashboardPage() {
  const [dark, setDark] = useState(true)

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header dark={dark} setDark={setDark} />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Dashboard />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
