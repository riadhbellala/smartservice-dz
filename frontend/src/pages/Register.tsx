import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Check if ?role=PROVIDER in URL
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") === "PROVIDER" ? "PROVIDER" : "USER";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generic change handler — updates any field by name
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(form);
      const { token, user } = response.data;
      login(user, token);

      // Redirect based on role
      if (user.role === "PROVIDER") navigate("/provider");
      else navigate("/dashboard");

    } catch (err) {
  const error = err as { response?: { data?: { message?: string } } };
  setError(error.response?.data?.message || "Registration failed.");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col lg:flex-row-reverse overflow-hidden relative z-10 border border-slate-100">
        
        {/* BRANDING PANEL */}
        <div className="w-full lg:w-5/12 bg-primary p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 blur-3xl rounded-full" />

          {/* Top Logo */}
          <div className="flex items-center gap-3 relative z-10 mb-8 lg:mb-12">
            <Link to="/" className="flex items-center gap-3">
              <img src="/ssd.png" alt="SmartService DZ" className="h-12 w-auto hover:opacity-90 transition-opacity" />
              <h1 className="text-white text-2xl font-extrabold tracking-tight">
                SmartService <span className="opacity-70">DZ</span>
              </h1>
            </Link>
          </div>

          <div className="relative z-10 flex-1">
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-8">
              Join thousands<br />
              already saving<br />
              <span className="text-blue-200">their time.</span>
            </h2>

            <div className="space-y-3 sm:space-y-5 hidden sm:block">
              {[
                { icon: "bolt", text: "Book appointments in 60 seconds" },
                { icon: "psychology", text: "AI predicts your best slots" },
                { icon: "notifications_active", text: "Smart reminders & alerts" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-white text-sm">{item.icon}</span>
                  </div>
                  <p className="text-blue-50 text-sm font-semibold">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-white overflow-y-auto max-h-[85vh] lg:max-h-none scrollbar-hide">
          <div className="w-full max-w-md">
            <div className="mb-8 mt-2 sm:mt-0">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Create account
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                Free forever. No credit card needed.
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { value: "USER", label: "I'm a User", icon: "person" },
                { value: "PROVIDER", label: "I'm a Provider", icon: "business" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange("role", option.value)}
                  className={`
                    p-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300
                    flex flex-col items-center gap-2 group
                    ${form.role === option.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-slate-100 text-slate-500 hover:border-primary/30 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className={`material-symbols-outlined text-2xl transition-transform ${form.role === option.value ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="Ahmed"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  icon="badge"
                />
                <Input
                  label="Last Name"
                  placeholder="Benali"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  icon="badge"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="ahmed@gmail.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                icon="mail"
              />
              <Input
                label="Phone (optional)"
                placeholder="+213 555 123 456"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                icon="phone"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                icon="lock"
              />

              <Button type="submit" fullWidth size="lg" disabled={loading} className="mt-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl mr-2">progress_activity</span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined text-xl ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-slate-600 font-medium mt-8 pb-4 sm:pb-0">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:text-blue-700 hover:underline transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};