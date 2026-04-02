import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page refresh
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      const { token, user } = response.data;

      // Save to global store + localStorage
      login(user, token);

      // Redirect based on role
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "PROVIDER") navigate("/provider");
      else navigate("/dashboard");

   } catch (err) {
  const error = err as { response?: { data?: { message?: string } } };
  setError(error.response?.data?.message || "Login failed. Try again.");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10 border border-slate-100">
        
        {/* BRANDING PANEL (Visible on Mobile & Desktop) */}
        <div className="w-full lg:w-5/12 bg-primary p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
          {/* Glass circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-2xl rounded-full" />
          <div className="absolute bottom-10 -left-20 w-48 h-48 bg-white/10 blur-2xl rounded-full" />

          {/* Top Logo */}
          <div className="flex items-center gap-3 relative z-10 mb-8 sm:mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <h1 className="text-white text-xl font-extrabold tracking-tight">
              SmartService <span className="opacity-70">DZ</span>
            </h1>
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-4 sm:mb-6">
              Book smarter.<br />
              Wait less.<br />
              <span className="text-blue-200">Live better.</span>
            </h2>
            <p className="text-blue-100/80 text-sm sm:text-base leading-relaxed max-w-sm hidden sm:block">
              Algeria's first AI-powered appointment platform. No more queues, no more wasted days.
            </p>
          </div>
          
          <div className="relative z-10 hidden sm:block mt-12">
             <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-primary bg-blue-300"></div>
               <div className="w-10 h-10 rounded-full border-2 border-primary bg-blue-400"></div>
               <div className="w-10 h-10 rounded-full border-2 border-primary bg-blue-500"></div>
               <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center">
                 <span className="text-xs font-bold text-primary">+50k</span>
               </div>
             </div>
             <p className="text-blue-200 text-xs mt-3 font-medium">Join thousands of happy users today.</p>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back 👋
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                Sign in to manage your appointments
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="ahmed@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="mail"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon="lock"
              />

              <div className="flex justify-end">
                <a href="#" className="text-sm font-bold text-primary hover:text-blue-700 transition">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
                className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl mr-2">progress_activity</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-xl ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-slate-400 text-sm font-medium">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-slate-600 font-medium">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create one free
              </Link>
            </p>
            <p className="text-center text-slate-400 text-xs mt-4">
              Are you a clinic or office?{" "}
              <Link to="/register?role=PROVIDER" className="text-primary font-semibold hover:text-primary/80 transition cursor-pointer">
                Register as Provider →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};