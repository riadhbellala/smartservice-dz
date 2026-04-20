import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import NotificationBell from "./NotificationBell";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { href: "/admin", icon: "dashboard", label: "Overview", exact: true },
    { href: "/admin/users", icon: "people", label: "Users" },
    { href: "/admin/providers", icon: "business", label: "Providers" },
    { href: "/admin/bookings", icon: "calendar_month", label: "Bookings" },
    { href: "/admin/analytics", icon: "bar_chart", label: "Analytics" },
  ];

  const getInitials = (first?: string, last?: string) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    return "AD";
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* TOP */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex justify-between items-center lg:block">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-3">
                <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
                <h1 className="text-xl font-black text-white tracking-tight">SmartService DZ</h1>
              </div>
              <p className="text-slate-400 text-sm font-medium">Admin Panel</p>
            </div>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* NAV LINKS */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active 
                    ? "bg-white/10 text-white font-bold" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* BOTTOM */}
        <div className="p-6 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shadow-sm">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 transition-colors font-bold text-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 block">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-primary transition-colors p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-2xl block">menu</span>
            </button>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3 pl-4 lg:pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.firstName}</p>
                <p className="text-xs font-medium text-slate-500">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-4 lg:p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
