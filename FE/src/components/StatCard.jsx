import React from 'react'
export default function StatCard({title, value, children}) {
  return (
    <div className="p-4 card rounded-lg">
      <div className="text-sm muted">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
