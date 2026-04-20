import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import NotificationBell from "./NotificationBell";

export interface ProviderLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const ProviderLayout = ({ children, title }: ProviderLayoutProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { path: "/provider", icon: "dashboard", label: "Overview" },
    { path: "/provider/bookings", icon: "calendar_month", label: "Bookings" },
    { path: "/provider/slots", icon: "schedule", label: "Time Slots" },
    { path: "/provider/services", icon: "medical_services", label: "Services" },
    { path: "/provider/analytics", icon: "bar_chart", label: "Analytics" },
    { path: "/provider/ai", icon: "psychology", label: "AI Insights" },
    { path: "/provider/settings", icon: "settings", label: "Settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight truncate">
              SmartService <span className="text-primary truncate">DZ</span>
            </h1>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-left"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-100 flex justify-between items-center px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-primary transition-colors lg:hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h2 className="text-xl font-bold text-slate-900 truncate">{title}</h2>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationBell />
            <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-sm text-sm">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
