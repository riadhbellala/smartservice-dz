import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { useAuthStore } from "./store/authStore";

// Placeholder pages — we'll build these next
const Home = () => (
  <div className="min-h-screen bg-background flex items-center justify-center font-sans">
    <div className="text-center">
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-white text-3xl">auto_awesome</span>
      </div>
      <h1 className="text-4xl font-bold text-primary mb-2">SmartService DZ</h1>
      <p className="text-slate-500 font-medium mb-6">
        Algeria's smartest appointment platform
      </p>
      <div className="flex gap-3 justify-center">
        <a href="/login"
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
          Sign In
        </a>
        <a href="/register"
          className="border-2 border-primary text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
          Register
        </a>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm">
        <span className="material-symbols-outlined text-primary text-5xl">
          check_circle
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-4">
          Welcome, {user?.firstName}! 🎉
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Role: {user?.role}</p>
        <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/provider" element={<Dashboard />} />
      <Route path="/admin" element={<Dashboard />} />
      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;