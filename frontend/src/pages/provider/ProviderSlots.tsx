import React, { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { useToast } from "../../context/ToastContext";
import { getProviderOwnSlots, createSlot, createBulkSlots, deleteSlot } from "../../services/api";
import { Button } from "../../components/ui/Button";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function ProviderSlots() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single Slot Form
  const [addForm, setAddForm] = useState({ date: "", startTime: "", endTime: "" });
  
  // Bulk Slot Form
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkForm, setBulkForm] = useState({
    days: [] as number[],
    startHour: "09:00",
    endHour: "17:00",
    interval: 30,
    weeks: 1,
  });

  useEffect(() => {
    fetchSlots();
  }, [currentWeekStart]);

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const res = await getProviderOwnSlots();
      
      const data = res.data?.data || res.data;
      const rawSlots = Array.isArray(data) ? data : (data.slots || []);
      
      const mapped = rawSlots.map((dbSlot: any) => {
         const d = new Date(dbSlot.start_time);
         const year = d.getFullYear();
         const month = String(d.getMonth() + 1).padStart(2, '0');
         const day = String(d.getDate()).padStart(2, '0');
         const h = String(d.getHours()).padStart(2, '0');
         const m = String(d.getMinutes()).padStart(2, '0');
         
         const e = new Date(dbSlot.end_time);
         const eh = String(e.getHours()).padStart(2, '0');
         const em = String(e.getMinutes()).padStart(2, '0');

         return {
           id: dbSlot.id,
           date: `${year}-${month}-${day}`,
           start_time: `${h}:${m}`,
           end_time: `${eh}:${em}`,
           is_booked: dbSlot.status === 'BOOKED'
         };
      });
      
      setSlots(mapped);
    } catch (err) {
      showToast("Failed to fetch slots", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const getWeekRangeLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} — ${end.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  };

  const daysLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      dayName: daysLabels[i],
      dayOfMonth: d.getDate(),
      isPast: d < new Date(new Date().setHours(0,0,0,0))
    };
  });

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    try {
      await deleteSlot(selectedSlot.id);
      showToast("Slot deleted", "success");
      setSlots(slots.filter(s => s.id !== selectedSlot.id));
      setSelectedSlot(null);
    } catch (err) {
      showToast("Failed to delete slot", "error");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.endTime <= addForm.startTime) {
      return showToast("End time must be after start time", "error");
    }
    
    try {
      await createSlot({
        startTime: new Date(`${addForm.date}T${addForm.startTime}:00`).toISOString(),
        endTime: new Date(`${addForm.date}T${addForm.endTime}:00`).toISOString()
      });
      showToast("Slot created!", "success");
      setShowAddModal(false);
      fetchSlots();
      setAddForm({ date: "", startTime: "", endTime: "" });
    } catch (err) {
      showToast("Failed to create slot", "error");
    }
  };

  const handleBulkToggleDay = (dayIndex: number) => {
    setBulkForm(prev => ({
      ...prev,
      days: prev.days.includes(dayIndex) 
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex]
    }));
  };

  const handleBulkSubmit = async () => {
    try {
      const sHour = parseInt(bulkForm.startHour.split(":")[0], 10);
      const eHour = parseInt(bulkForm.endHour.split(":")[0], 10);

      const dates: string[] = [];
      const today = new Date();
      today.setHours(0,0,0,0);
      
      for (let i = 0; i < bulkForm.weeks * 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        if (bulkForm.days.includes(d.getDay())) {
          // Format as YYYY-MM-DD
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dates.push(`${year}-${month}-${day}`);
        }
      }

      await createBulkSlots({
        dates,
        startHour: sHour,
        endHour: eHour,
        intervalMinutes: bulkForm.interval
      });
      showToast("Bulk slots created successfully!", "success");
      setShowBulkModal(false);
      setBulkStep(1);
      fetchSlots();
    } catch (err) {
      showToast("Failed to create bulk slots", "error");
    }
  };

  return (
    <ProviderLayout title="Time Slots">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={handlePrevWeek} className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-bold flex items-center text-sm">
            <span className="material-symbols-outlined text-lg mr-1">chevron_left</span> Prev
          </button>
          <div className="px-4 py-2 font-bold text-slate-900 border-x border-slate-100 text-sm min-w-[200px] text-center">
            {getWeekRangeLabel()}
          </div>
          <button onClick={handleNextWeek} className="p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors font-bold flex items-center text-sm">
            Next <span className="material-symbols-outlined text-lg ml-1">chevron_right</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)} className="bg-white border text-slate-700 hover:border-slate-300 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">add</span> Add Slot
          </button>
          <button onClick={() => setShowBulkModal(true)} className="bg-primary text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">bolt</span> Bulk Create
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative h-[65vh]">
        
        {/* ROW HEADERS */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {weekDays.map((day, i) => {
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div key={i} className={`p-4 text-center border-r border-slate-100 last:border-0 ${isToday ? 'bg-primary/5' : ''}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-primary' : 'text-slate-500'}`}>{day.dayName}</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold ${isToday ? 'bg-primary text-white' : 'text-slate-900'}`}>
                  {day.dayOfMonth}
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUMNS */}
        <div className="flex-1 overflow-y-auto grid grid-cols-7 relative p-2 gap-2 min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          )}

          {weekDays.map((day, colIdx) => {
            const daySlots = slots.filter(s => s.date === day.date).sort((a,b) => a.start_time.localeCompare(b.start_time));
            
            return (
              <div key={colIdx} className="flex flex-col gap-2 min-h-full">
                {daySlots.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center pt-8 opacity-50">
                    <span className="material-symbols-outlined text-2xl text-slate-300">event_busy</span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">No slots</p>
                  </div>
                ) : (
                  daySlots.map(slot => {
                    const isBooked = slot.is_booked;
                    const isPast = new Date(`${slot.date}T${slot.end_time}`) < new Date();
                    const stateColor = isBooked ? 'bg-blue-50 border-blue-200 text-blue-800' : isPast ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-green-50 border-green-200 text-green-800 cursor-pointer hover:shadow-md transition-shadow';
                    const dotColor = isBooked ? 'bg-blue-500' : isPast ? 'bg-slate-400' : 'bg-green-500';

                    return (
                      <div 
                        key={slot.id} 
                        onClick={() => !isBooked ? setSelectedSlot(slot) : null}
                        className={`p-2 rounded-xl border text-xs font-bold leading-none ${stateColor}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="truncate">{slot.start_time.slice(0,5)}</span>
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        </div>
                        <div className="font-medium opacity-80 text-[10px] truncate">- {slot.end_time.slice(0,5)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED SLOT MODAL / PANEL */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 relative pt-10">
            <button onClick={() => setSelectedSlot(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-1">Available Slot</h3>
            <p className="text-center font-medium text-slate-500 mb-6">{selectedSlot.date} | {selectedSlot.start_time} - {selectedSlot.end_time}</p>
            
            <button onClick={handleDeleteSlot} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">delete</span> Delete Slot
            </button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 relative">
             <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Time Slot</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  required
                  value={addForm.date}
                  onChange={(e) => setAddForm({...addForm, date: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors font-medium text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    required
                    value={addForm.startTime}
                    onChange={(e) => setAddForm({...addForm, startTime: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                  <input 
                    type="time" 
                    required
                    value={addForm.endTime}
                    onChange={(e) => setAddForm({...addForm, endTime: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800"
                  />
                </div>
              </div>
              <Button type="submit" fullWidth size="lg" className="mt-4">
                 Create Slot
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* BULK CREATE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 relative overflow-hidden flex flex-col">
            <button onClick={() => {setShowBulkModal(false); setBulkStep(1);}} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">bolt</span> Bulk Create
            </h2>

            {bulkStep === 1 && (
              <div className="animate-in slide-in-from-right-8">
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Step 1: Select working days</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => handleBulkToggleDay(idx)}
                      className={`p-3 rounded-xl border-2 font-bold transition-all flex justify-between items-center ${
                        bulkForm.days.includes(idx) ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {day.slice(0,3)}
                      {bulkForm.days.includes(idx) && <span className="material-symbols-outlined text-base">check_circle</span>}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setBulkStep(2)} disabled={bulkForm.days.length === 0}>
                    Next Step <span className="material-symbols-outlined ml-1">arrow_forward</span>
                  </Button>
                </div>
              </div>
            )}

            {bulkStep === 2 && (
              <div className="animate-in slide-in-from-right-8">
                 <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Step 2: Configure Times & Duration</h3>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Start Hour</label>
                      <input type="time" value={bulkForm.startHour} onChange={e => setBulkForm({...bulkForm, startHour: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">End Hour</label>
                      <input type="time" value={bulkForm.endHour} onChange={e => setBulkForm({...bulkForm, endHour: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Slot Interval</label>
                      <select value={bulkForm.interval} onChange={e => setBulkForm({...bulkForm, interval: Number(e.target.value)})} className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold appearance-none bg-white">
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Weeks ahead</label>
                      <select value={bulkForm.weeks} onChange={e => setBulkForm({...bulkForm, weeks: Number(e.target.value)})} className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold appearance-none bg-white">
                        <option value={1}>1 week</option>
                        <option value={2}>2 weeks</option>
                        <option value={4}>1 month (4 weeks)</option>
                      </select>
                    </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                    <p className="text-sm font-medium text-blue-800">
                      This will create approximately <b>{bulkForm.days.length * Math.floor((parseInt(bulkForm.endHour) - parseInt(bulkForm.startHour)) * 60 / bulkForm.interval) * bulkForm.weeks}</b> slots based on your selection.
                    </p>
                 </div>

                 <div className="flex justify-between items-center">
                    <button onClick={() => setBulkStep(1)} className="text-slate-500 font-bold hover:text-slate-800 px-4 py-2 transition-colors">
                      ← Back
                    </button>
                    <Button onClick={handleBulkSubmit}>
                      Create Slots
                    </Button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
