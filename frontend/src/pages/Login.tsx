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
    <div className="min-h-screen bg-background font-sans flex">

      {/* LEFT SIDE — Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">

       {/* Background decorative circles */}
<div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
<div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
<div className="absolute top-1/2 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">
              auto_awesome
            </span>
          </div>
          <h1 className="text-white text-xl font-extrabold tracking-tight">
            SmartService <span className="opacity-70">DZ</span>
          </h1>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight mb-6">
            Book smarter.<br />
            Wait less.<br />
            <span className="opacity-70">Live better.</span>
          </h2>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Algeria's first AI-powered appointment platform.
            No more queues, no more wasted days.
          </p>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "50K+", label: "Users" },
              { value: "1.2K", label: "Providers" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <p className="text-white text-2xl font-extrabold">{stat.value}</p>
                <p className="text-blue-200 text-xs font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-blue-300 text-xs relative z-10">
          © 2026 SmartService DZ. All rights reserved.
        </p>
      </div>

      {/* RIGHT SIDE — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">auto_awesome</span>
            </div>
            <h1 className="text-xl font-extrabold text-textDark">
              SmartService <span className="text-primary">DZ</span>
            </h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Welcome back 👋
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Sign in to manage your appointments
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-xl">
                error
              </span>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <a href="#" className="text-sm font-bold text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-slate-600 font-medium">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create one free
            </Link>
          </p>

          {/* Provider signup note */}
          <p className="text-center text-slate-400 text-xs mt-4">
            Are you a clinic or office?{" "}
            <Link to="/register?role=PROVIDER" className="text-primary font-semibold">
              Register as Provider →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};