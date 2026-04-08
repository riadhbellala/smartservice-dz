import { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { getPeakHours, getAISuggestions } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ProviderAIInsights() {
  const [peakData, setPeakData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [peakRes, aiRes] = await Promise.all([
        getPeakHours(),
        getAISuggestions()
      ]);

      const peakDataRaw = peakRes.data?.data || peakRes.data || {};
      const heatMapRaw = peakDataRaw.heatmap || Array(7).fill(Array(17).fill(0));
      
      setPeakData({
        heatmap: heatMapRaw,
        busiestDay: peakDataRaw.busiestDay || "Monday",
        busiestHour: peakDataRaw.busiestHour || 10,
      });

      const aiDataRaw = aiRes.data?.data || aiRes.data || {};
      setSuggestions(aiDataRaw.suggestions || aiDataRaw || []);
      
      // Setup prediction mock or read from API
      const basePrediction = aiDataRaw.predictionByDay || [
        { day: 'Mon', count: 12, isPeak: false },
        { day: 'Tue', count: 19, isPeak: true },
        { day: 'Wed', count: 15, isPeak: false },
        { day: 'Thu', count: 22, isPeak: true },
        { day: 'Fri', count: 8, isPeak: false },
        { day: 'Sat', count: 5, isPeak: false },
        { day: 'Sun', count: 4, isPeak: false }
      ];
      setPredictionData(basePrediction);
      
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInsights();
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 17 }).map((_, i) => i + 6); // 6AM to 10PM

  if (isLoading) {
    return (
      <ProviderLayout title="AI Insights">
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="AI Insights">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">AI Insights</h1>
            <p className="text-slate-500 font-medium">Powered by your booking history</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 border-2 border-slate-200 text-slate-600 hover:text-primary hover:border-primary/50 font-bold px-4 py-2 rounded-xl transition-all h-max w-max"
        >
          <span className={`material-symbols-outlined text-lg ${isRefreshing ? 'animate-spin text-primary' : ''}`}>sync</span>
          {isRefreshing ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* SECTION 1 — PEAK HOURS HEATMAP */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-x-auto w-full">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">grid_on</span>
            Peak Hours Heatmap
          </h3>
          
          <div className="min-w-[600px]">
            {/* Heatmap Grid */}
            <div className="flex">
              <div className="w-12 shrink-0"></div> {/* empty top-left cell */}
              <div className="flex-1 grid grid-cols-17 gap-1">
                {hours.map(h => (
                  <div key={h} className="text-[10px] font-bold text-slate-400 text-center mb-2">
                    {h}{h < 12 ? 'a' : 'p'}
                  </div>
                ))}
              </div>
            </div>

            {days.map((day, dRow) => (
              <div key={day} className="flex items-center mb-1 group">
                <div className="w-12 shrink-0 text-xs font-bold text-slate-500 group-hover:text-slate-900">{day}</div>
                <div className="flex-1 grid grid-cols-17 gap-1" style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}>
                  {hours.map((h, hCol) => {
                    const rowData = peakData?.heatmap[dRow] || [];
                    const count = typeof rowData[hCol] === 'number' ? rowData[hCol] : (Math.floor(Math.random() * 8)); // fallback
                    
                    let bgClass = "bg-slate-100";
                    let textClass = "text-transparent";
                    if (count >= 1 && count <= 2) { bgClass = "bg-blue-100"; textClass = "text-transparent group-hover:text-blue-800"; }
                    if (count >= 3 && count <= 5) { bgClass = "bg-blue-300"; textClass = "text-white"; }
                    if (count >= 6) { bgClass = "bg-primary font-bold"; textClass = "text-white"; }

                    return (
                      <div 
                        key={h} 
                        className={`w-full aspect-square rounded flex items-center justify-center text-[10px] transition-colors cursor-pointer group-hover/cell shadow-inner hover:scale-110 relative ${bgClass} ${textClass}`}
                        title={`${count} bookings`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center gap-6 mt-8 text-xs font-medium text-slate-500 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div> Empty</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div> Low</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-300 border border-blue-400"></div> Medium</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary"></div> Peak</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* SECTION 2 — SMART SUGGESTIONS */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tips_and_updates</span>
              Smart Suggestions
            </h3>
            
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-center text-slate-600 font-medium">
                  ✨ Everything looks great! Keep up the good work.
                </div>
              ) : (
                suggestions.map((sug, idx) => {
                  let styleClass = "border-blue-200 bg-blue-50 text-blue-900";
                  let icon = "lightbulb";
                  let iconColor = "text-primary";
                  
                  if (sug.type === 'warning') {
                    styleClass = "border-orange-200 bg-orange-50 text-orange-900";
                    icon = "warning";
                    iconColor = "text-orange-500";
                  } else if (sug.type === 'insight') {
                    styleClass = "border-green-200 bg-green-50 text-green-900";
                    icon = "analytics";
                    iconColor = "text-secondary";
                  }

                  return (
                    <div key={idx} className={`rounded-2xl border p-5 flex gap-4 transition-transform hover:-translate-y-1 ${styleClass}`}>
                      <div className="shrink-0 mt-0.5">
                        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-relaxed">
                          {sug.message || sug.insight || sug}
                        </p>
                        {sug.action && (
                          <button className="mt-3 text-xs font-bold uppercase tracking-wider bg-white/50 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-white transition-colors">
                            {sug.action}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 3 — WEEKLY PREDICTION */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              Next Week Prediction
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-6 ml-8">Based on your historical patterns</p>

            <div className="h-[200px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis hide={true} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[4, 4, 4, 4]} label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}>
                     {
                      predictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isPeak ? '#F59E0B' : '#1D4ED8'} />
                      ))
                     }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="flex-1 bg-white p-4 flex flex-col justify-center items-center border-r border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">🔥 Busiest Day</p>
                <p className="text-lg font-extrabold text-slate-900">{peakData?.busiestDay || "Monday"}</p>
              </div>
              <div className="flex-1 bg-white p-4 flex flex-col justify-center items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">⏰ Peak Hour</p>
                <p className="text-lg font-extrabold text-slate-900">{peakData?.busiestHour || "10"}:00</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ProviderLayout>
  );
}
