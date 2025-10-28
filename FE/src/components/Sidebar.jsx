import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-4 py-3 rounded-md hover:bg-white/5 ${
        isActive ? "bg-white/5 font-semibold" : "muted"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside
      className="w-72 hidden md:block border-r"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="p-6">
        <div className="mb-6">
          <div className="text-2xl font-bold">
            Hệ thống Khách hàng thân thiết
          </div>
          <div className="text-sm muted">Quản lý khách hàng & giao dịch</div>
        </div>
        <nav className="space-y-1">
          <Item to="/">Bảng điều khiển</Item>
          <Item to="/customers">Khách hàng</Item>
          <Item to="/transactions">Giao dịch</Item>
          <Item to="/points">Điểm thưởng</Item>
        </nav>
      </div>
    </aside>
  );
}
