import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getPlatformAnalytics } from "../../services/api";
import { 
  AreaChart, Area, BarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const COLORS = ["#1D4ED8", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const STATUS_COLORS = {
  CONFIRMED: "#10B981",
  CANCELLED: "#EF4444",
  COMPLETED: "#6B7280",
  PENDING: "#F59E0B"
};

export default function AdminAnalytics() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getPlatformAnalytics();
      setData(res.data?.data || res.data || null);
    } catch (error) {
      showToast("Failed to load analytics data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-200 h-28 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-slate-200 h-[400px] rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-200 h-[350px] rounded-2xl animate-pulse" />
             <div className="bg-slate-200 h-[350px] rounded-2xl animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="Analytics">
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-center opacity-70 mt-12">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">bar_chart</span>
          <p className="text-xl font-bold text-slate-700">No analytics data yet</p>
          <p className="text-slate-500 font-medium">As more people use the platform, your analytics will appear here.</p>
        </div>
      </AdminLayout>
    );
  }

  // Safe destructuring with fallbacks — keys match backend getPlatformAnalytics response
  const summary = data.summary || {
    totalBookings: data.totalAppointments || 0,
    thisMonthBookings: data.appointmentsThisMonth || 0,
    totalRevenue: data.totalRevenue || 0,
    activeProviders: data.verifiedProviders || 0
  };
  const bookingsPerDay = data.bookingsPerDay || [];
  const bookingsPerCategory = data.bookingsByCategory || data.bookingsPerCategory || [];
  const userGrowthPerMonth = data.userGrowth || data.userGrowthPerMonth || [];
  // Backend returns { status, count } — recharts Pie needs { name, value }
  const statusDistribution = (data.statusDistribution || []).map((s: any) => ({
    name: s.status || s.name,
    value: parseInt(s.count || s.value || 0)
  }));
  const topProviders = (data.topProviders || []).map((p: any) => ({
    ...p,
    name: p.business_name || p.name || "Unknown",
    bookings: parseInt(p.bookings || 0),
    revenue: parseFloat(p.revenue || 0)
  }));

  return (
    <AdminLayout title="Analytics & Reports">
      {/* SUMMARY STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{summary.totalBookings}</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">all time</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">This Month</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{summary.thisMonthBookings}</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">bookings in current month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-black text-secondary mt-2">{summary.totalRevenue.toLocaleString()} DZD</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">gross platform revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Providers</p>
          <h3 className="text-3xl font-black text-primary mt-2">{summary.activeProviders}</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">verified & active</p>
        </div>
      </div>

      {/* CHART 1: BOOKINGS OVER TIME */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Platform Bookings (Last 30 Days)</h2>
        <div className="w-full">
          {bookingsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={bookingsPerDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Area type="monotone" dataKey="count" stroke="#1D4ED8" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-slate-400 font-medium">No booking volume data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* CHART 2: BOOKINGS BY CATEGORY */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Bookings by Category</h2>
          {bookingsPerCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingsPerCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium">No category data available</div>
          )}
        </div>

        {/* CHART 3: USER GROWTH */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">New Users per Month</h2>
          {userGrowthPerMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthPerMonth} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5, fill: "#F59E0B", strokeWidth: 0 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium">No user growth data available</div>
          )}
        </div>

        {/* CHART 4: BOOKING STATUS DISTRIBUTION */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Booking Status Distribution</h2>
          <div className="flex-1 flex justify-center items-center">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontWeight: "bold" }} 
                    itemStyle={{ color: "#111827" }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {statusDistribution.map((entry: any, index: number) => {
                      const statusColor = STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length];
                      return <Cell key={`cell-${index}`} fill={statusColor} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium">No status data available</div>
            )}
          </div>
        </div>

        {/* TOP PROVIDERS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-100 border-t-4 border-t-primary p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">stars</span>
            Top 10 Providers
          </h2>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-xl">Rank</th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Bookings</th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right rounded-tr-xl">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProviders.length > 0 ? (
                  topProviders.map((provider: any, i: number) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    const medal = i < 3 ? medals[i] : (i + 1).toString();
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-lg text-slate-700 w-12 text-center">{medal}</td>
                        <td className="p-3 font-bold text-slate-900 text-sm">{provider.name || "Unknown Provider"}</td>
                        <td className="p-3 text-slate-600 font-medium text-sm text-right">{provider.bookings || 0}</td>
                        <td className="p-3 text-green-600 font-bold text-sm text-right">{(provider.revenue || 0).toLocaleString()} DZD</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                      No top provider data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
