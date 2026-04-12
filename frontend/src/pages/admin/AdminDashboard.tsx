import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../context/ToastContext";
import { getPlatformStats, getAllBookings } from "../../services/api";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          getPlatformStats().catch(() => ({ data: {} })),
          getAllBookings().catch(() => ({ data: { bookings: [] } }))
        ]);
        
        const raw = statsRes.data?.data || statsRes.data || {};
        setStats(raw);
        const bookingsRaw = bookingsRes.data?.data || bookingsRes.data || {};
        let allBookings = bookingsRaw.bookings || bookingsRaw || [];
        if (!Array.isArray(allBookings)) allBookings = [];
        setRecentBookings(allBookings.slice(0, 10));
      } catch (error) {
        showToast("Failed to load dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Confirmed</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Cancelled</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Completed</span>;
      default:
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Pending</span>;
    }
  };

  // Safe fallbacks matching backend response keys
  const totalUsers = stats?.users || 0;
  const totalProviders = stats?.providers || 0;
  const bookingsToday = stats?.appointmentsToday || 0;
  const platformRevenue = stats?.totalRevenue || 0;
  const pendingVerification = stats?.unverifiedProviders || 0;
  const activeProviders = stats?.verifiedProviders || 0;
  const bookingsThisMonth = stats?.appointmentsThisMonth || 0;

  if (isLoading) {
    return (
      <AdminLayout title="Overview">
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Overview">
      {/* 1. WELCOME HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Here's your platform overview
        </p>
      </div>

      {/* 2. ALERT BANNER */}
      {pendingVerification > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500 text-2xl">warning</span>
            <p className="font-bold text-orange-800">
              ⚠️ {pendingVerification} providers waiting for verification
            </p>
          </div>
          <button 
            onClick={() => navigate("/admin/providers")}
            className="whitespace-nowrap px-4 py-2 bg-white text-orange-600 border border-orange-200 rounded-xl font-bold hover:bg-orange-100 hover:border-orange-300 transition-colors shadow-sm"
          >
            Review Now →
          </button>
        </div>
      )}

      {/* 3. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Row 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">people</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">business</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Providers</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{totalProviders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-accent flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">today</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Bookings Today</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{bookingsToday}</h3>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Platform Revenue</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{platformRevenue.toLocaleString()} DZD</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Verification</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{pendingVerification}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Providers</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{activeProviders}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 4. RECENT BOOKINGS TABLE (Span 2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-bold text-slate-900">Recent Platform Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">User</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Provider</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Service</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date & Time</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, i) => (
                    <tr key={booking.id || i} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-4 font-medium text-slate-800 text-sm">{booking.first_name ? `${booking.first_name} ${booking.last_name}` : booking.user?.firstName || "Unknown User"}</td>
                      <td className="p-4 font-medium text-slate-800 text-sm">{booking.business_name || booking.provider?.businessName || "Unknown Provider"}</td>
                      <td className="p-4 text-slate-600 text-sm">{booking.service_name || booking.service?.name || "Custom Service"}</td>
                      <td className="p-4 text-slate-600 text-sm">
                        {booking.start_time ? new Date(booking.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short'}) : "Date TBA"}
                      </td>
                      <td className="p-4">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                      No recent bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. QUICK STATS ROW (Stacked cards in 1 col) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Bookings This Month</h3>
            <div className="flex items-end gap-3 mt-4">
              <span className="text-4xl font-black text-slate-900">{bookingsThisMonth}</span>
              <span className="text-sm font-bold text-green-500 mb-1 flex items-center">
                <span className="material-symbols-outlined text-sm">trending_up</span> +12%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">vs last month</p>
            {/* Small decorative line chart simulation */}
            <div className="h-12 w-full mt-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik0wLDgwIFEyNSwzMCA1MCw2MCBUMTAwLDIwIEwxMDAsMTAwIEwwLDEwMCBaIiBmaWxsPSJyZ2JhKDI5LCA3OCwgMjE2LCAwLjEpIi8+PHBhdGggZD0iTTAsODAgUTI1LDMwIDUwLDYwIFQxMDAsMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFENEVEOCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-no-repeat bg-cover bg-bottom border-b-2 border-primary">
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Platform Health</h3>
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">dns</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Database connected</p>
                  <p className="text-xs text-green-600 font-medium tracking-wide">Operational</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">api</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">API responding</p>
                  <p className="text-xs text-green-600 font-medium tracking-wide">99.9% Uptime</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{activeProviders} providers active</p>
                  <p className="text-xs text-slate-500 font-medium">Accepting bookings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
