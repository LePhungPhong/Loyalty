import React from "react";

export default function Header({ dark, setDark }) {
  return (
    <header
      className={(dark ? "bg-transparent" : "bg-white") + " border-b"}
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Bảng điều khiển Loyalty</h1>
          <div className="text-sm muted">
            Quản trị hệ thống khách hàng thân thiết
          </div>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="px-3 py-1 rounded border muted"
        >
          Đổi giao diện
        </button>
      </div>
    </header>
  );
}
