import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import UserDashboard from "./pages/UserDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderSlots from "./pages/provider/ProviderSlots";
import ProviderServices from "./pages/provider/ProviderServices";
import ProviderAnalytics from "./pages/provider/ProviderAnalytics";
import ProviderAIInsights from "./pages/provider/ProviderAIInsights";
import ProviderSettings from "./pages/provider/ProviderSettings";

const AdminDashboard = () => <div className="min-h-screen bg-background flex justify-center items-center"><div className="bg-white p-8 rounded-2xl shadow border text-center"><h2 className="text-2xl font-bold">Admin Dashboard</h2></div></div>;
const BookingPage = () => <div className="min-h-screen bg-background flex justify-center items-center"><div className="bg-white p-8 rounded-2xl shadow border text-center"><h2 className="text-2xl font-bold">Booking Details (In Progress)</h2></div></div>;

function App() {
  return (
    <Routes>
      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/bookings"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/slots"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderSlots />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/services"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/analytics"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/ai"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderAIInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/settings"
        element={
          <ProtectedRoute allowedRoles={["PROVIDER"]}>
            <ProviderSettings />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/providers" element={<Providers />} />
      <Route path="/providers/:id" element={<ProviderDetail />} />
      <Route path="/book/:slotId" element={<BookingPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["USER"]}>
          <UserDashboard />
        </ProtectedRoute>
      } />
      

      
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;