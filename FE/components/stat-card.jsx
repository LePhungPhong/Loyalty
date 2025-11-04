import { TrendingUp } from "lucide-react"

export default function StatCard({ title, value, trend, icon: Icon, children }) {
  return (
    <div className="group card rounded-xl p-6 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm muted mb-2">{title}</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            {value}
          </div>
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center text-xs text-accent gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
