import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import UserDashboard from "./pages/UserDashboard";

const ProviderDashboard = () => <div className="min-h-screen bg-background flex justify-center items-center"><div className="bg-white p-8 rounded-2xl shadow border text-center"><h2 className="text-2xl font-bold">Provider Dashboard</h2></div></div>;
const AdminDashboard = () => <div className="min-h-screen bg-background flex justify-center items-center"><div className="bg-white p-8 rounded-2xl shadow border text-center"><h2 className="text-2xl font-bold">Admin Dashboard</h2></div></div>;
const BookingPage = () => <div className="min-h-screen bg-background flex justify-center items-center"><div className="bg-white p-8 rounded-2xl shadow border text-center"><h2 className="text-2xl font-bold">Booking Details (In Progress)</h2></div></div>;

function App() {
  return (
    <Routes>
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
      
      <Route path="/provider" element={
        <ProtectedRoute allowedRoles={["PROVIDER"]}>
          <ProviderDashboard />
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