import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Transactions from './pages/Transactions'
import Points from './pages/Points'
import { ToastContainer } from 'react-toastify'

export default function App(){
  const [dark, setDark] = useState(true);
  return (
    <div className={"flex min-h-screen " + (dark ? 'bg-app' : 'bg-gray-50')}>
      <Sidebar dark={dark} />
      <div className="flex-1 min-h-screen">
        <Header dark={dark} setDark={setDark} />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/customers" element={<Customers/>} />
            <Route path="/transactions" element={<Transactions/>} />
            <Route path="/points" element={<Points/>} />
          </Routes>
        </main>
      </div>
      <ToastContainer position="top-right" theme={dark ? 'dark' : 'light'} />
    </div>
  )
}
