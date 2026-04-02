/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { getProviderById, getProviderSlots, createBooking } from '../services/api';

const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProvider = async () => {
      try {
        const res = await getProviderById(id);
        const data = res.data;
        setProvider(data);
        if (data?.services?.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProvider();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchSlots = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await getProviderSlots(id, dateStr);
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!selectedSlotId || !selectedServiceId) return;
    setBookingLoading(true);
    try {
      await createBooking({ timeSlotId: selectedSlotId, serviceId: selectedServiceId });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Booking failed. Please try again.');
      setBookingLoading(false);
    }
  };

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  if (loading && !provider) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-8"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!provider) {
    return <div className="p-8 text-center bg-background min-h-screen">Provider not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-10 flex items-center gap-4">
        <span className="material-symbols-outlined text-slate-400 cursor-pointer" onClick={() => navigate(-1)}>
          arrow_back
        </span>
        <h1 className="text-xl font-extrabold text-slate-800">Book Appointment</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Provider Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6 flex gap-6 items-start">
          <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
             <span className="material-symbols-outlined text-4xl text-slate-400">store</span>
          </div>
          <div>
             <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{provider.businessName || "Provider Profile"}</h2>
             <span className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-lg border border-blue-100 mb-2">
                {provider.category || 'Service'}
             </span>
             <p className="text-slate-500 text-sm flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {provider.address || provider.city || 'Algeria'}
             </p>
             <div className="flex items-center gap-1 text-accent mt-2">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="text-sm font-bold text-slate-700">{provider.rating || '4.5'}</span>
             </div>
          </div>
        </div>

        {/* Services List */}
        <h3 className="font-extrabold text-lg text-slate-900 mb-4 px-2">1. Select Service</h3>
        <div className="space-y-3 mb-8">
          {(provider.services || []).map((s: any) => (
            <div 
              key={s.id} 
              onClick={() => setSelectedServiceId(s.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center bg-white
                ${selectedServiceId === s.id ? "border-primary shadow-md shadow-primary/10" : "border-slate-100 hover:border-slate-300"}
              `}
            >
              <div>
                 <h4 className="font-bold text-slate-900">{s.name}</h4>
                 <p className="text-sm text-slate-500 font-medium">{s.duration} min</p>
              </div>
              <div className="text-right">
                 <p className="font-extrabold text-primary">{s.price ? `${s.price} DZD` : 'Free'}</p>
                 <span className={`material-symbols-outlined rounded-full border-2 
                    ${selectedServiceId === s.id ? "text-primary border-primary bg-blue-50" : "text-transparent border-slate-200"}
                  `}>check_circle</span>
              </div>
            </div>
          ))}
          {(!provider.services || provider.services.length === 0) && (
            <div className="p-4 bg-white border border-slate-100 rounded-xl text-center text-slate-500 text-sm">
              No services listed.
            </div>
          )}
        </div>

        {/* Date Picker */}
        <h3 className="font-extrabold text-lg text-slate-900 mb-4 px-2">2. Choose Date & Time</h3>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
          {dates.map((d, i) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <div 
                key={i}
                onClick={() => { setSelectedDate(d); setSelectedSlotId(null); }}
                className={`flex flex-col items-center justify-center p-3 w-16 flex-shrink-0 rounded-xl cursor-pointer transition-all border-2
                  ${isSelected ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"}
                `}
              >
                <span className={`text-xs font-bold mb-1 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-extrabold">{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 mb-8">
           {slots.length === 0 ? (
             <div className="col-span-full py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl">
               No slots available for this date.
             </div>
           ) : (
             slots.map((slot) => {
               const time = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               const isSelected = selectedSlotId === slot.id;
               const isAvailable = !slot.isBooked; // or status === 'AVAILABLE'

               return (
                 <button
                   key={slot.id}
                   onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                   disabled={!isAvailable}
                   className={`p-3 rounded-xl font-bold text-sm transition-all border-2
                     ${isSelected ? "bg-primary border-primary text-white" 
                        : isAvailable ? "bg-white border-slate-100 text-slate-700 hover:border-primary/50" 
                        : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"}
                   `}
                 >
                   {time}
                 </button>
               );
             })
           )}
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 flex justify-center">
           <div className="w-full max-w-3xl flex gap-4 items-center">
             <div className="flex-1 hidden sm:block">
                <p className="text-sm font-bold text-slate-500">Total Price</p>
                <p className="font-extrabold text-lg text-slate-900">
                  {selectedServiceId ? (provider.services?.find((s:any) => s.id === selectedServiceId)?.price || 0) : 0} DZD
                </p>
             </div>
             <Button 
               variant="primary" 
               size="lg" 
               fullWidth
               disabled={!selectedSlotId || !selectedServiceId || bookingLoading}
               onClick={handleBook}
             >
               {bookingLoading ? "Booking..." : "Confirm Booking"}
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetail;
