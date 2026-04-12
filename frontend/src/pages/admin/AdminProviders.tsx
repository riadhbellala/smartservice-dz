import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getAllProviders, verifyProvider, suspendProvider } from "../../services/api";
import { Button } from "../../components/ui/Button";

export default function AdminProviders() {
  const { showToast } = useToast();
  
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "suspended">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    providerId: string | null;
    providerName: string;
    action: "verify" | "suspend" | "reverify" | null;
  }>({
    open: false,
    providerId: null,
    providerName: "",
    action: null
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await getAllProviders();
      setProviders(res.data?.data || res.data || []);
    } catch (error) {
      showToast("Failed to load providers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (provider: any, action: "verify" | "suspend" | "reverify") => {
    setConfirmModal({
      open: true,
      providerId: provider.id,
      providerName: provider.businessName || provider.business_name || provider.first_name || "Unknown Provider",
      action
    });
  };

  const confirmAction = async () => {
    if (!confirmModal.providerId || !confirmModal.action) return;

    try {
      if (confirmModal.action === "verify" || confirmModal.action === "reverify") {
        await verifyProvider(confirmModal.providerId).catch(() => {});
        showToast(`${confirmModal.providerName} verified!`, "success");
      } else if (confirmModal.action === "suspend") {
        await suspendProvider(confirmModal.providerId).catch(() => {});
        showToast(`${confirmModal.providerName} suspended`, "warning");
      }
      setConfirmModal({ open: false, providerId: null, providerName: "", action: null });
      fetchProviders();
    } catch (error) {
      showToast(`Failed to ${confirmModal.action} provider`, "error");
    }
  };

  const pending = providers.filter(p => !p.is_verified && p.is_active !== false);
  const verified = providers.filter(p => p.is_verified && p.is_active !== false);
  const suspended = providers.filter(p => p.is_active === false);

  const currentList = activeTab === "pending" ? pending : activeTab === "verified" ? verified : suspended;

  return (
    <AdminLayout title="Providers">
      {/* TABS ROW */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "pending" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          Pending
          {pending.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pending.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab("verified")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "verified" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          Verified
          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{verified.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab("suspended")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === "suspended" 
              ? "bg-slate-900 text-white shadow-md" 
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          Suspended
          {suspended.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{suspended.length}</span>}
        </button>
      </div>

      {/* PENDING ALERT */}
      {activeTab === "pending" && pending.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl p-4 mb-6 font-bold flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-500">warning</span>
          {pending.length} provider(s) need your review before they can be visible to users.
        </div>
      )}

      {/* PROVIDER CARDS */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 shadow-sm animate-pulse h-32"></div>
          ))
        ) : currentList.length > 0 ? (
          currentList.map((provider) => {
            const isExpanded = expandedId === provider.id;
            const bName = provider.businessName || provider.business_name || "Unnamed Business";
            return (
              <div key={provider.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md">
                
                {/* COLLAPSED VIEW */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black text-2xl shrink-0">
                      {bName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{bName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                          {provider.category || "General"}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          {provider.city || "Algiers"}, {provider.wilaya || "Algiers"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        by {provider.first_name || "Jane"} {provider.last_name || "Doe"} • Joined {new Date(provider.created_at || new Date()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Action Buttons based on Tab */}
                    {activeTab === "pending" && (
                      <>
                        <button 
                          onClick={() => handleActionClick(provider, "verify")}
                          className="px-4 py-2 bg-secondary text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-green-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">check</span> Verify
                        </button>
                        <button 
                          onClick={() => handleActionClick(provider, "suspend")}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-red-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span> Reject
                        </button>
                      </>
                    )}
                    
                    {activeTab === "verified" && (
                      <button 
                        onClick={() => handleActionClick(provider, "suspend")}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        Suspend
                      </button>
                    )}

                    {activeTab === "suspended" && (
                      <button 
                        onClick={() => handleActionClick(provider, "reverify")}
                        className="px-4 py-2 bg-secondary text-white font-bold rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        Re-verify
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>Hide details <span className="material-symbols-outlined text-lg">expand_less</span></>
                    ) : (
                      <>Show details <span className="material-symbols-outlined text-lg">expand_more</span></>
                    )}
                  </button>
                </div>

                {/* EXPANDED VIEW */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About Business</h4>
                        <p className="text-sm text-slate-600 italic mb-4">
                          "{provider.description || "No description provided."}"
                        </p>
                        
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</h4>
                        <p className="text-sm text-slate-700 font-medium">
                          {provider.address || "123 Main Street"}<br/>
                          {provider.city}, {provider.wilaya}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Info</h4>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm">phone</span>
                            {provider.phone || "+213 555 000 000"}
                          </p>
                          <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                            {provider.email || "provider@example.com"}
                          </p>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Performance</h4>
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex-1 flex flex-col items-center">
                            <div className="flex items-center gap-1 text-accent font-black text-xl mb-1">
                              {provider.averageRating || "0.0"} <span className="material-symbols-outlined text-lg">star</span>
                            </div>
                            <span className="text-xs font-bold text-orange-800">Avg Rating</span>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex-1 flex flex-col items-center">
                            <div className="font-black text-xl text-primary mb-1">{provider.totalReviews || 0}</div>
                            <span className="text-xs font-bold text-blue-800">Total Reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center opacity-70">
            {activeTab === "pending" && (
              <>
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">pending_actions</span>
                <p className="text-lg font-bold text-slate-700">No providers pending verification</p>
                <p className="text-sm font-medium text-slate-500 mt-1">New provider registrations will appear here</p>
              </>
            )}
            {activeTab === "verified" && (
              <>
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">verified</span>
                <p className="text-lg font-bold text-slate-700">No verified providers yet</p>
              </>
            )}
            {activeTab === "suspended" && (
              <>
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3">block</span>
                <p className="text-lg font-bold text-slate-700">No suspended providers</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            {confirmModal.action === "verify" || confirmModal.action === "reverify" ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 text-center mb-2">Verify {confirmModal.providerName}?</h3>
                <p className="text-slate-500 text-center font-medium mb-8">
                  This provider will become fully active and visible to all users on the platform.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>Cancel</Button>
                  <Button className="bg-secondary hover:bg-green-600" onClick={confirmAction}>Yes, Verify</Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">gavel</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 text-center mb-2">Suspend {confirmModal.providerName}?</h3>
                <p className="text-slate-500 text-center font-medium mb-8">
                  This will hide them from users and deactivate their account immediately.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>Cancel</Button>
                  <Button variant="danger" onClick={confirmAction}>Yes, Suspend</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
