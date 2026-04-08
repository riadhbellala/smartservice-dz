import React, { useEffect, useState } from "react";
import ProviderLayout from "../../components/ProviderLayout";
import { useToast } from "../../context/ToastContext";
import { getProviderProfile, updateProviderProfile } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", 
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", 
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", 
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", 
  "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", 
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

const CATEGORIES = [
  "Medical", "Public Service", "Legal", "Education", "Banking", "Other"
];

export default function ProviderSettings() {
  const { showToast } = useToast();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    businessName: "",
    description: "",
    address: "",
    city: "",
    wilaya: "",
    category: "",
    phone: "",
    email: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProviderProfile();
      const data = res.data?.data || res.data;
      setProfileForm({
        businessName: data.business_name || data.businessName || data.first_name || "",
        description: data.description || "",
        address: data.address || "",
        city: data.city || "",
        wilaya: data.wilaya || "",
        category: data.category || "",
        phone: data.phone || "",
        email: data.email || ""
      });
    } catch (err) {
      showToast("Failed to load profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProviderProfile({
        business_name: profileForm.businessName,
        description: profileForm.description,
        address: profileForm.address,
        city: profileForm.city,
        wilaya: profileForm.wilaya,
        category: profileForm.category,
        phone: profileForm.phone,
        email: profileForm.email
      });
      showToast("Profile saved!", "success");
    } catch (err) {
      showToast("Failed to save profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      return showToast("New password must be at least 6 characters", "warning");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast("New passwords do not match", "error");
    }

    setIsSavingPassword(true);
    try {
      // Direct API call mapping to expected backend 
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/change-password`,
        { 
          currentPassword: passwordForm.currentPassword, 
          newPassword: passwordForm.newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Password updated successfully!", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to update password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <ProviderLayout title="Settings">
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* SECTION 1 — BUSINESS PROFILE */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
            Business Profile
          </h2>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Business Name"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({...profileForm, businessName: e.target.value})}
              />
              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea
                className="w-full border-2 rounded-xl p-3 text-sm border-slate-200 focus:outline-none focus:border-primary transition-colors font-medium text-slate-700 resize-none"
                rows={4}
                placeholder="Give customers an overview of your business..."
                value={profileForm.description}
                onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <Input
                label="Address"
                placeholder="Street address..."
                value={profileForm.address}
                onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
              />
              <Input
                label="City"
                value={profileForm.city}
                onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
              />
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Wilaya</label>
                <select 
                  value={profileForm.wilaya}
                  onChange={(e) => setProfileForm({...profileForm, wilaya: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl p-2.5 sm:p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800 appearance-none bg-white"
                >
                  <option value="" disabled>Select Wilaya...</option>
                  {WILAYAS.map((w, i) => (
                    <option key={w} value={w}>{i+1} - {w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select 
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({...profileForm, category: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl p-2.5 sm:p-3 focus:outline-none focus:border-primary transition-colors font-bold text-slate-800 appearance-none bg-white"
                >
                  <option value="" disabled>Select Category...</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Phone Number"
                placeholder="0555..."
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSavingProfile} className="px-8 flex items-center gap-2">
                {isSavingProfile ? (
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">save</span>
                )}
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION 2 — CHANGE PASSWORD */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
           <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <span className="material-symbols-outlined text-red-500 text-2xl">lock</span>
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
            />

             <div className="pt-2">
              <Button type="submit" variant="secondary" disabled={isSavingPassword} className="px-8 flex items-center gap-2">
                {isSavingPassword ? (
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">key</span>
                )}
                Update Password
              </Button>
            </div>
          </form>
        </div>

      </div>
    </ProviderLayout>
  );
}
