import { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { getProviderAnalytics } from "../../services/api";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function ProviderAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getProviderAnalytics();
      const anaData = res.data?.data || res.data;
      setData({
        todayBookings: anaData.todayBookings ?? 0,
        monthlyRevenue: anaData.monthlyRevenue ?? 0,
        cancellationRate: anaData.cancellationRate ?? 0,
        avgBookingsPerDay: Math.floor((anaData.monthlyBookings ?? 0) / 30) || 0,
        bookingsPerDay: anaData.bookingsPerDay || [],
        bookingsPerHour: anaData.bookingsPerHour || [],
        topServices: anaData.topServices || []
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#1D4ED8", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  if (isLoading) {
    return (
      <ProviderLayout title="Analytics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-28" />)}
        </div>
        <div className="bg-slate-200 animate-pulse rounded-2xl h-80 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-200 animate-pulse rounded-2xl h-80 w-full" />
          <div className="bg-slate-200 animate-pulse rounded-2xl h-80 w-full" />
        </div>
      </ProviderLayout>
    );
  }

  const hasData = data && (
    data.bookingsPerDay?.length > 0 || 
    data.bookingsPerHour?.length > 0 || 
    data.topServices?.length > 0 || 
    data.monthlyRevenue > 0
  );

  if (!hasData) {
    return (
      <ProviderLayout title="Analytics">
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center h-[60vh]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400">bar_chart</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No analytics data yet</h3>
          <p className="text-slate-500 mt-1">Start accepting bookings to see your stats.</p>
        </div>
      </ProviderLayout>
    );
  }

  // Calculate average for peak hour logic
  const totalHourly = data.bookingsPerHour.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);
  const avgHourly = data.bookingsPerHour.length > 0 ? totalHourly / data.bookingsPerHour.length : 0;

  return (
    <ProviderLayout title="Analytics">
      {/* SUMMARY STATS TABLE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: "Bookings this month", value: data.monthlyBookings || data.todayBookings * 15, icon: "event_available", color: "blue", prefix: "" },
          { label: "Total Revenue", value: data.monthlyRevenue, icon: "payments", color: "green", prefix: "DZD " },
          { label: "Cancellation Rate", value: data.cancellationRate, icon: "cancel", color: "red", prefix: "", suffix: "%" },
          { label: "Avg bookings/day", value: data.avgBookingsPerDay, icon: "trending_up", color: "orange", prefix: "" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              <span className={`material-symbols-outlined text-${stat.color}-600`}>{stat.icon}</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {stat.prefix}{stat.value}{stat.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* CHART 1: BOOKINGS OVER TIME (FULL WIDTH) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">timeline</span> 
          Bookings Over Time
        </h3>
        <div className="h-[300px] w-full">
          {data.bookingsPerDay.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.bookingsPerDay} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                 <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                 />
                 <Line type="monotone" dataKey="count" stroke="#1D4ED8" strokeWidth={3} dot={{ fill: '#1D4ED8', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Not enough daily data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CHART 2: PEAK HOURS */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">schedule</span> 
            Bookings by Hour
          </h3>
          <div className="h-[300px] w-full">
            {data.bookingsPerHour.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bookingsPerHour} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]}>
                    {
                      data.bookingsPerHour.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.count > avgHourly ? '#F59E0B' : '#1D4ED8'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Not enough hourly data</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2 text-[10px] sm:text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Peak Hour</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Normal</div>
          </div>
        </div>

        {/* CHART 3: SERVICES PIE CHART */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">pie_chart</span> 
            Bookings by Service
          </h3>
          <div className="h-[300px] w-full">
            {data.topServices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Pie
                    data={data.topServices}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="bookings"
                    nameKey="serviceName"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.topServices.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Not enough service data</div>
            )}
          </div>
        </div>
      </div>

      {/* TOP SERVICES TABLE */}
      {data.topServices.length > 0 && (
         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
           <div className="p-6 border-b border-slate-100 flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">trophy</span>
             <h3 className="text-lg font-bold text-slate-900">Top Services</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {data.topServices.map((service: any, idx: number) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 text-lg">
                       {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-slate-400 text-sm font-bold ml-2">#{idx+1}</span>}
                     </td>
                     <td className="px-6 py-4 font-bold text-slate-900 text-sm">{service.serviceName}</td>
                     <td className="px-6 py-4 font-medium text-slate-700">{service.bookings}</td>
                     <td className="px-6 py-4 font-bold text-green-600 text-right">{service.revenue || service.bookings * 1500} DZD</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      )}
    </ProviderLayout>
  );
}
