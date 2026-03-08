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
    <div className="min-h-screen bg-background font-sans flex">

      {/* LEFT SIDE — Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-white/5 rounded-full" />

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

        {/* Features list */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight mb-8">
            Join thousands<br />
            already saving<br />
            <span className="opacity-70">their time.</span>
          </h2>

          {[
            { icon: "bolt", text: "Book appointments in under 60 seconds" },
            { icon: "psychology", text: "AI predicts your best time slots" },
            { icon: "notifications_active", text: "Smart reminders so you never miss" },
            { icon: "trending_down", text: "Average wait time reduced by 70%" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-sm">
                  {item.icon}
                </span>
              </div>
              <p className="text-blue-100 text-sm font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="text-blue-300 text-xs relative z-10">
          © 2026 SmartService DZ. All rights reserved.
        </p>
      </div>

      {/* RIGHT SIDE — Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">auto_awesome</span>
            </div>
            <h1 className="text-xl font-extrabold text-textDark">
              SmartService <span className="text-primary">DZ</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">
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
                  p-4 rounded-xl border-2 text-sm font-bold transition-all
                  flex flex-col items-center gap-2
                  ${form.role === option.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }
                `}
              >
                <span className="material-symbols-outlined text-2xl">
                  {option.icon}
                </span>
                {option.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-xl">error</span>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-slate-600 font-medium mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};