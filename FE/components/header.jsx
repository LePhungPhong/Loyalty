"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
export default function Header({ dark, setDark }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .text-gradient {
        background: linear-gradient(135deg, rgb(34, 211, 238), rgb(16, 185, 129));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return (
    <header className="card border-b sticky top-0 z-40 backdrop-blur-xl bg-dark-card/40">
      <div className="max-w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-slate-900">
            LY
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">
              Hệ thống Khách hàng thân thiết
            </h1>
            <div className="text-xs muted">Quản trị & phân tích khách hàng</div>
          </div>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          title={dark ? "Chế độ sáng" : "Chế độ tối"}
        >
          {dark ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-text-secondary" />
          )}
        </button>
      </div>
    </header>
  );
}
