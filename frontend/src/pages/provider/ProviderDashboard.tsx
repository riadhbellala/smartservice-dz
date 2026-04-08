import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProviderLayout from "../../components/ProviderLayout";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import {
  getProviderAnalytics,
  getProviderBookings,
  getAISuggestions,
  getProviderProfile,
  updateBookingStatus
} from "../../services/api";

export default function ProviderDashboard() {
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthlyRevenue: 0,
    cancellationRate: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, analyticsRes, bookingsRes, aiRes] = await Promise.all([
          getProviderProfile(),
          getProviderAnalytics(),
          getProviderBookings(),
          getAISuggestions()
        ]);

        const profileData = profileRes.data?.data || profileRes.data;
        setBusinessName(profileData.business_name || profileData.first_name || "Provider");
        
        const anaData = analyticsRes.data?.data || analyticsRes.data;
        const bookingsData = bookingsRes.data?.data || bookingsRes.data;
        const aiData = aiRes.data?.data || aiRes.data;

        setStats({
          todayBookings: anaData.todayBookings ?? 0,
          monthlyRevenue: anaData.monthlyRevenue ?? 0,
          cancellationRate: anaData.cancellationRate ?? 0,
          totalReviews: profileData.total_reviews ?? 0,
        });

        const allBookings = bookingsData.bookings || bookingsData || [];
        setRecentBookings(Array.isArray(allBookings) ? allBookings.slice(0, 5) : []);
        
        const suggestions = aiData.suggestions || aiData || [];
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          setSuggestion(suggestions[0]);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      await updateBookingStatus(id, "CONFIRMED");
      showToast("Booking confirmed!", "success");
      setRecentBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: "CONFIRMED" } : b)
      );
    } catch (err) {
      showToast("Failed to confirm booking", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-2 py-1 text-xs font-bold rounded-md bg-orange-100 text-orange-700">PENDING</span>;
      case "CONFIRMED": return <span className="px-2 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700">CONFIRMED</span>;
      case "COMPLETED": return <span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-700">COMPLETED</span>;
      case "CANCELLED": return <span className="px-2 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700">CANCELLED</span>;
      default: return <span className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatDateTime = (dateString?: string, startString?: string, endString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (startString && endString) {
      return `${date} • ${startString} - ${endString}`;
    }
    return date;
  };

  if (isLoading) {
    return (
      <ProviderLayout title="Overview">
        <div className="flex justify-center items-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Overview">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Good morning, {businessName}! ☀️
        </h1>
        <p className="text-slate-500 font-medium mt-1">Here's what's happening today</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-2xl">calendar_today</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Bookings</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.todayBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-green-600 text-2xl">payments</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.monthlyRevenue || 0} DZD</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-orange-600 text-2xl">cancel</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Cancellation Rate</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.cancellationRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-yellow-600 text-2xl">star</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Reviews</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT BOOKINGS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
            <Link to="/provider/bookings" className="text-sm font-bold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            {recentBookings.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-400">event_busy</span>
                </div>
                <p className="text-slate-500 font-medium whitespace-nowrap">No bookings yet</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient/User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 min-w-[200px]">
                        <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{b.user?.firstName} {b.user?.lastName}</p>
                        <p className="text-xs text-slate-500 whitespace-nowrap">{b.user?.phone || b.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-sm text-slate-700 min-w-[150px]">
                        {b.service?.name || "Service"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 min-w-[200px]">
                        {formatDateTime(b.slot?.date, b.slot?.start_time, b.slot?.end_time)}
                      </td>
                      <td className="px-6 py-4 min-w-[120px]">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4 text-right min-w-[120px]">
                        {b.status === "PENDING" && (
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleConfirm(b.id)}>
                            Confirm
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI INSIGHT CARD */}
        <div className="bg-blue-50 border-l-4 border-primary rounded-2xl p-6 flex flex-col items-start shadow-sm relative overflow-hidden">
          <div className="absolute -top-4 -right-4 p-6 pointer-events-none opacity-[0.03]">
            <span className="material-symbols-outlined text-9xl text-primary">psychology</span>
          </div>
          <div className="relative z-10 w-full h-full flex flex-col">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">psychology</span>
            <h2 className="text-lg font-bold text-slate-900 mb-2">AI Insight 💡</h2>
            <div className="flex-1">
              {suggestion ? (
                <p className="text-slate-700 font-medium leading-relaxed text-sm">
                  {suggestion.message || suggestion.insight || suggestion}
                </p>
              ) : (
                <p className="text-slate-600 font-medium text-sm">Not enough data yet. Keep accepting bookings!</p>
              )}
            </div>
            <Link to="/provider/ai" className="mt-6 font-bold text-primary hover:underline text-sm flex items-center gap-1 group w-max">
              View all insights
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
