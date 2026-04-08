import React, { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { useToast } from "../../context/ToastContext";
import { getProviderOwnServices, createService, updateService, deleteService } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function ProviderServices() {
  const { showToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState<string>("");
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true
  });

  // Delete Confirm State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string>("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await getProviderOwnServices();
      const data = res.data?.data || res.data;
      setServices(Array.isArray(data.services || data) ? (data.services || data) : []);
    } catch (err) {
      showToast("Failed to fetch services", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (service: any) => {
    try {
      await updateService(service.id, { isActive: !service.isActive });
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s));
      showToast("Service status updated", "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setForm({ name: "", description: "", duration: 30, price: 0, isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setIsEditMode(true);
    setCurrentServiceId(service.id);
    setForm({
      name: service.name || "",
      description: service.description || "",
      duration: service.duration || 30,
      price: service.price || 0,
      isActive: service.isActive ?? true
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateService(currentServiceId, form);
        showToast("Service updated!", "success");
      } else {
        await createService(form);
        showToast("Service added!", "success");
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} service`, "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteService(serviceToDelete);
      showToast("Service deleted", "success");
      setServices(prev => prev.filter(s => s.id !== serviceToDelete));
      setDeleteModalOpen(false);
    } catch (err: any) {
      // Handle the case where API returns error because it has bookings
      const msg = err.response?.data?.message || err.message || "Cannot delete: has active bookings";
      showToast(msg, "error");
    }
  };

  return (
    <ProviderLayout title="Services">
      <div className="flex justify-between items-center mb-8">
        <p className="text-slate-500 font-medium">Manage your service offerings and prices</p>
        <Button onClick={openAddModal} className="flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-lg">add</span> Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400">medical_services</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No services yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Create your first service to start accepting bookings.</p>
          <Button onClick={openAddModal}>Add your first service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* TOP ROW */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{service.name}</h3>
                
                {/* Custom Toggle Switch */}
                <button 
                  onClick={() => handleToggleActive(service)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    service.isActive ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    service.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* MIDDLE */}
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {service.description || "No description provided."}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="bg-blue-50 text-primary font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {service.duration} min
                </div>
                {service.price > 0 ? (
                  <div className="bg-green-50 text-green-700 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-green-100">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {service.price} DZD
                  </div>
                ) : (
                  <div className="bg-slate-50 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200">
                    FREE
                  </div>
                )}
              </div>

              {/* BOTTOM ROW */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => openEditModal(service)} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setServiceToDelete(service.id); setDeleteModalOpen(true); }} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{isEditMode ? "Edit Service" : "Add Service"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Service Name"
                placeholder="e.g. General Consultation"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full border-2 rounded-xl p-3 text-sm border-slate-200 focus:outline-none focus:border-primary transition-colors font-medium text-slate-700 resize-none"
                  rows={3}
                  placeholder="Describe what this service includes..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Duration</label>
                  <select 
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: Number(e.target.value)})}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800 appearance-none bg-white"
                  >
                    {[15, 30, 45, 60, 90, 120].map(mins => (
                      <option key={mins} value={mins}>{mins} minutes</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price (DZD)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Free"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: Number(e.target.value)})}
                    className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth size="lg">
                  {isEditMode ? "Save Changes" : "Create Service"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 relative">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete this service?</h3>
            <p className="text-center text-slate-500 font-medium mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
