import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getAllUsers, updateUserStatus } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/authStore";

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllUsers();
      // Backend returns { data: { users: [], total, page, totalPages } }
      const payload = res.data?.data || res.data || {};
      const usersArr = payload.users || payload || [];
      setUsers(Array.isArray(usersArr) ? usersArr : []);
    } catch (error) {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userToUpdate: any) => {
    if (userToUpdate.id === currentUser?.id) {
      return showToast("You cannot deactivate your own account", "error");
    }
    
    const isCurrentlyActive = userToUpdate.is_active !== false && userToUpdate.status !== "INACTIVE";
    const newIsActive = !isCurrentlyActive;
    const actionLabel = newIsActive ? "activate" : "deactivate";
    
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${userToUpdate.first_name || userToUpdate.firstName}?`)) return;

    try {
      // Backend expects { isActive: boolean }
      await updateUserStatus(userToUpdate.id, newIsActive ? "ACTIVE" : "INACTIVE");
      showToast(`${userToUpdate.first_name || userToUpdate.firstName} is now ${newIsActive ? 'active' : 'inactive'}`, "success");
      fetchUsers();
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const exportCSV = () => {
    if (filteredUsers.length === 0) return showToast("No data to export", "warning");

    const headers = ["ID", "Name", "Email", "Role", "Status", "Joined"];
    const rows = filteredUsers.map(u => [
      u.id, 
      `${u.first_name || u.firstName} ${u.last_name || u.lastName}`, 
      u.email, 
      u.role, 
      u.is_active === false ? 'Inactive' : 'Active',
      new Date(u.created_at || u.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering — backend uses snake_case columns
  const filteredUsers = users.filter((u) => {
    const name = `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`;
    const matchesSearch = search === "" || 
      name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const isActive = u.is_active !== false;
    const matchesStatus = statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && isActive) ||
      (statusFilter === "INACTIVE" && !isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <AdminLayout title="Users">
      {/* HEADER + FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
        <div className="w-full lg:max-w-md">
          <Input 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon="search"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={roleFilter} 
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border-2 border-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary font-bold text-slate-700 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-2 border-slate-200 rounded-xl p-2 focus:outline-none focus:border-primary font-bold text-slate-700 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          
          <Button variant="outline" onClick={exportCSV} className="ml-auto lg:ml-0 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">User</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Role</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Join Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // SKELETON LOADER
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-slate-200 rounded w-32"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="p-4 text-right"><div className="h-8 bg-slate-200 rounded-xl w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const roleColors = {
                    USER: "bg-blue-100 text-primary",
                    PROVIDER: "bg-green-100 text-secondary",
                    ADMIN: "bg-red-100 text-red-600"
                  };
                  const roleStyle = roleColors[u.role as keyof typeof roleColors] || "bg-slate-100 text-slate-600";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${roleStyle} shadow-sm shrink-0`}>
                            {(u.first_name || u.firstName || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.first_name || u.firstName} {u.last_name || u.lastName}</p>
                            <p className="text-sm text-slate-500 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${roleStyle}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.is_active === false ? "bg-red-500" : "bg-green-500"}`}></span>
                          <span className={`text-sm font-bold ${u.is_active === false ? "text-red-700" : "text-green-700"}`}>
                            {u.is_active === false ? "Inactive" : "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {new Date(u.created_at || u.createdAt || new Date()).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {u.id !== currentUser?.id && (
                          <Button 
                            variant={u.is_active === false ? "secondary" : "danger"} 
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.is_active === false ? "Activate" : "Deactivate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <span className="material-symbols-outlined text-5xl mb-2">person_search</span>
                      <p className="text-lg font-bold text-slate-700">No users found</p>
                      <p className="text-sm font-medium text-slate-500">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-bold text-slate-500">
          <p>
            Showing {Math.min((page - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 border-2 border-slate-200 rounded-lg hover:border-slate-300 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-4 text-slate-700">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 border-2 border-slate-200 rounded-lg hover:border-slate-300 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
