/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMyBookings, cancelBooking, submitReview } from '../services/api';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import NotificationBell from '../components/NotificationBell';

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: string | null }>({ open: false, bookingId: null });
  const [ratingModal, setRatingModal] = useState<{ open: boolean; bookingId: string | null }>({ open: false, bookingId: null });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(Array.isArray(res.data?.appointments) ? res.data.appointments : (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (id: string) => {
    setCancelModal({ open: true, bookingId: id });
  };

  const confirmCancel = async () => {
    if (!cancelModal.bookingId) return;
    try {
      await cancelBooking(cancelModal.bookingId);
      showToast("Appointment cancelled", "success");
      fetchBookings();
      setCancelModal({ open: false, bookingId: null });
    } catch (err) {
      console.error(err);
      showToast("Cannot cancel. Less than 1 hour away.", "error");
      setCancelModal({ open: false, bookingId: null });
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingModal.bookingId) return;
    setSubmittingRating(true);
    try {
      await submitReview(ratingModal.bookingId, {
        rating: selectedRating,
        review: reviewText
      });
      showToast("Review submitted! Thank you 🌟", "success");
      setRatingModal({ open: false, bookingId: null });
      setSelectedRating(0);
      setReviewText("");
      fetchBookings();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit review", "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const now = new Date();
  
  const filteredBookings = bookings.filter((b) => {
    if (!b.start_time) return false;
    const slotTime = new Date(b.start_time);
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'PAST') return b.status === 'COMPLETED' || (slotTime < now && b.status !== 'CANCELLED');
    if (activeTab === 'UPCOMING') return (b.status === 'PENDING' || b.status === 'CONFIRMED') && slotTime >= now;
    return true;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const upcomingCount = bookings.filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="bg-white border-b border-slate-100 py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
          <span className="font-extrabold text-xl tracking-tight text-slate-800 hidden sm:block">
            SmartService<span className="text-primary ml-1">DZ</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-500 font-medium">Manage your appointments and bookings here.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-bold text-slate-500 mb-1">Total</p>
            <p className="text-2xl font-extrabold text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-bold text-blue-600 mb-1">Upcoming</p>
            <p className="text-2xl font-extrabold text-primary">{upcomingCount}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-sm font-bold text-red-600 mb-1">Cancelled</p>
            <p className="text-2xl font-extrabold text-red-700">{cancelledCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 w-full overflow-x-auto scrollbar-hide whitespace-nowrap">
          {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-3 font-bold text-sm transition-all border-b-2
                ${activeTab === tab 
                  ? "text-primary border-primary" 
                  : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"}
              `}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : filteredBookings.length === 0 ? (
             <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
               <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">calendar_month</span>
               <h3 className="font-extrabold text-lg text-slate-900 mb-2">No {activeTab.toLowerCase()} appointments</h3>
               <p className="text-slate-500 mb-6 font-medium">You don't have any records here.</p>
               {activeTab === 'UPCOMING' && (
                 <Button onClick={() => navigate('/providers')}>Find a Provider</Button>
               )}
             </div>
          ) : (
            filteredBookings.map((b) => {
              const date = new Date(b.start_time);
              
              let statusColor = "bg-slate-100 text-slate-600 border-slate-200";
              if (b.status === 'CONFIRMED') statusColor = "bg-green-50 text-secondary border-green-100";
              if (b.status === 'PENDING') statusColor = "bg-orange-50 text-accent border-orange-100";
              if (b.status === 'CANCELLED') statusColor = "bg-red-50 text-red-600 border-red-100";

              return (
                <div key={b.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-primary flex flex-col items-center justify-center flex-shrink-0 border border-blue-100">
                       <span className="text-xs font-bold uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                       <span className="text-lg font-extrabold leading-none">{date.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900">{b.provider_name || "Provider"}</h3>
                      <p className="text-sm font-medium text-slate-500 mb-2">{b.service_name || "Service Appointment"}</p>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${statusColor}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {['PENDING', 'CONFIRMED'].includes(b.status) && activeTab === 'UPCOMING' && (
                     <div className="mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 flex-shrink-0">
                       <Button variant="danger" size="sm" onClick={() => handleCancel(b.id)} fullWidth>
                         Cancel Appointment
                       </Button>
                     </div>
                  )}

                  {b.status === 'COMPLETED' && (
                     <div className="mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 flex-shrink-0">
                       {b.rating ? (
                         <div className="flex flex-col items-center sm:items-end">
                           <span className="text-xs font-bold text-slate-500 mb-1">Your rating:</span>
                           <div className="flex text-accent">
                             {Array.from({ length: 5 }).map((_, i) => (
                               <span key={i} className={`material-symbols-outlined text-[16px] ${i < b.rating ? "text-accent" : "text-slate-300"}`}>
                                 {i < b.rating ? "star" : "star_border"}
                               </span>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <Button variant="outline" size="sm" onClick={() => setRatingModal({ open: true, bookingId: b.id })} fullWidth>
                           <span className="material-symbols-outlined text-[18px]">star</span>
                           Rate this appointment
                         </Button>
                       )}
                     </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-2">cancel</span>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 mb-6 font-medium">This action cannot be undone.</p>
            <div className="flex flex-col gap-3">
              <Button variant="danger" onClick={confirmCancel} fullWidth>
                Yes, Cancel
              </Button>
              <Button variant="outline" onClick={() => setCancelModal({ open: false, bookingId: null })} fullWidth>
                Keep It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Rate Your Appointment ⭐</h3>
            <p className="text-slate-500 mb-6 text-sm font-medium">How was your experience?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  className={`material-symbols-outlined text-4xl cursor-pointer transition-all hover:scale-110 ${star <= selectedRating ? 'text-accent' : 'text-slate-300'}`}
                  onClick={() => setSelectedRating(star)}
                >
                  {star <= selectedRating ? 'star' : 'star_border'}
                </span>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-6 font-medium text-slate-700 placeholder:text-slate-400"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                onClick={handleSubmitRating} 
                disabled={selectedRating === 0 || submittingRating} 
                fullWidth
              >
                {submittingRating ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRatingModal({ open: false, bookingId: null });
                  setSelectedRating(0);
                  setReviewText("");
                }} 
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
