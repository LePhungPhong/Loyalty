"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Gift } from "lucide-react"

const navItems = [
  { href: "/", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/customers", label: "Khách hàng", icon: Users },
  { href: "/transactions", label: "Giao dịch", icon: CreditCard },
  { href: "/points", label: "Điểm thưởng", icon: Gift },
]

const Item = ({ href, children, icon: Icon, isActive }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-primary/20 to-accent/20 border-l-2 border-primary text-primary font-semibold"
        : "text-text-secondary hover:bg-dark-border/30"
    }`}
  >
    <Icon className="w-5 h-5" />
    {children}
  </Link>
)

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 hidden md:flex flex-col border-r border-dark-border/50 bg-dark-card/30 backdrop-blur-sm sticky top-0 h-screen">
      <div className="p-6 border-b border-dark-border/30">
        <div className="mb-2">
          <div className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            Loyalty Pro
          </div>
          <div className="text-xs muted">Quản lý khách hàng & giao dịch</div>
        </div>
      </div>
      <nav className="space-y-1 p-4 flex-1">
        {navItems.map((item) => (
          <Item key={item.href} href={item.href} icon={item.icon} isActive={pathname === item.href}>
            {item.label}
          </Item>
        ))}
      </nav>
      <div className="p-4 border-t border-dark-border/30">
        <div className="text-xs muted text-center">v1.0.0</div>
      </div>
    </aside>
  )
}
