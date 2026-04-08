import { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { useToast } from "../../context/ToastContext";
import { getProviderBookings, updateBookingStatus } from "../../services/api";

type TabStatus = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export default function ProviderBookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    bookingId: string;
    action: string;
  }>({ open: false, bookingId: "", action: "" });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getProviderBookings();
      const data = res.data?.data || res.data;
      const arr = data.bookings || data || [];
      setBookings(Array.isArray(arr) ? arr : []);
    } catch (err) {
      showToast("Failed to fetch bookings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (bookingId: string, action: string) => {
    setConfirmModal({ open: true, bookingId, action });
  };

  const handleConfirmAction = async () => {
    const { bookingId, action } = confirmModal;
    let newStatus = "";
    if (action === "confirm") newStatus = "CONFIRMED";
    if (action === "complete") newStatus = "COMPLETED";
    if (action === "cancel") newStatus = "CANCELLED";

    try {
      await updateBookingStatus(bookingId, newStatus);
      showToast(`Booking ${newStatus.toLowerCase()}!`, "success");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setConfirmModal({ open: false, bookingId: "", action: "" });
    }
  };

  const filteredBookings = bookings.filter(
    (b) => activeTab === "ALL" || b.status === activeTab
  );

  const getCount = (status: TabStatus) =>
    status === "ALL" ? bookings.length : bookings.filter((b) => b.status === status).length;

  const tabs: { id: TabStatus; label: string; colorClass: string; badgeClass: string }[] = [
    { id: "ALL", label: "All", colorClass: "border-primary text-primary", badgeClass: "bg-primary text-white" },
    { id: "PENDING", label: "Pending", colorClass: "border-orange-500 text-orange-600", badgeClass: "bg-orange-100 text-orange-700" },
    { id: "CONFIRMED", label: "Confirmed", colorClass: "border-green-500 text-green-600", badgeClass: "bg-green-100 text-green-700" },
    { id: "COMPLETED", label: "Completed", colorClass: "border-slate-500 text-slate-700", badgeClass: "bg-slate-200 text-slate-800" },
    { id: "CANCELLED", label: "Cancelled", colorClass: "border-red-500 text-red-600", badgeClass: "bg-red-100 text-red-700" },
  ];

  return (
    <ProviderLayout title="Bookings">
      {/* TABS */}
      <div className="flex overflow-x-auto gap-6 border-b border-slate-200 mb-6 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-bold whitespace-nowrap transition-colors ${
                isActive ? tab.colorClass : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
              <span
                className={`py-0.5 px-2 rounded-full text-xs font-bold ${
                  isActive ? tab.badgeClass : "bg-slate-100 text-slate-600"
                }`}
              >
                {getCount(tab.id)}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400">calendar_month</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
          <p className="text-slate-500 mt-1">There are no {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} bookings currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center w-full">
              
              {/* LEFT */}
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {b.user?.firstName?.[0]}{b.user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{b.user?.firstName} {b.user?.lastName}</h3>
                  <p className="text-sm font-medium text-slate-500">{b.user?.phone || b.user?.email}</p>
                </div>
              </div>

              {/* MIDDLE */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">{b.service?.name || "Service"}</span>
                  <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {b.service?.duration || 30} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {b.slot?.date ? new Date(b.slot.date).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  }) : "N/A"}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {b.slot?.start_time} → {b.slot?.end_time}
                </div>
                
                {b.notes && (
                  <details className="mt-2 text-sm group">
                    <summary className="text-primary font-bold cursor-pointer hover:underline outline-none w-max">Show notes</summary>
                    <p className="mt-2 bg-slate-50 p-3 rounded-lg text-slate-700 italic border border-slate-100">{b.notes}</p>
                  </details>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3">
                 <div>
                    {b.status === "PENDING" && <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200">PENDING</span>}
                    {b.status === "CONFIRMED" && <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">CONFIRMED</span>}
                    {b.status === "COMPLETED" && <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">COMPLETED</span>}
                    {b.status === "CANCELLED" && <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">CANCELLED</span>}
                 </div>
                 
                 <div className="flex gap-2">
                   {b.status === "PENDING" && (
                     <>
                       <button onClick={() => handleActionClick(b.id, "confirm")} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1">
                         <span className="material-symbols-outlined text-sm">check</span> Confirm
                       </button>
                       <button onClick={() => handleActionClick(b.id, "cancel")} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                         <span className="material-symbols-outlined text-sm">close</span> Cancel
                       </button>
                     </>
                   )}
                   {b.status === "CONFIRMED" && (
                     <>
                        <button onClick={() => handleActionClick(b.id, "complete")} className="bg-primary hover:bg-blue-800 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1">
                         <span className="material-symbols-outlined text-sm">check_circle</span> Complete
                       </button>
                       <button onClick={() => handleActionClick(b.id, "cancel")} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                         <span className="material-symbols-outlined text-sm">close</span> Cancel
                       </button>
                     </>
                   )}
                 </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
              confirmModal.action === "cancel" ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {confirmModal.action === "cancel" ? "warning" : "help"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Confirm Action</h3>
            <p className="text-center text-slate-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to {confirmModal.action} this appointment?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ open: false, bookingId: "", action: "" })}
                className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm ${
                  confirmModal.action === "cancel" 
                    ? "bg-red-500 hover:bg-red-600" 
                    : confirmModal.action === "complete" ? "bg-primary hover:bg-blue-800" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                Yes, proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
