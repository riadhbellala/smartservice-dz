import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';


const Home = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const categories = [
    { name: "Medical", icon: "local_hospital", count: "450" },
    { name: "Public Services", icon: "account_balance", count: "120" },
    { name: "Legal", icon: "gavel", count: "85" },
    { name: "Education", icon: "school", count: "60" },
    { name: "Banking", icon: "account_balance_wallet", count: "40" },
    { name: "Other", icon: "category", count: "245" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
              <span className="font-extrabold text-xl tracking-tight text-slate-800 hidden sm:block">
                SmartService<span className="text-primary ml-1">DZ</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/providers')}>Providers</span>
              <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>How it works</span>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:inline text-sm font-medium text-slate-600">
                    Hi, {user?.firstName}
                  </span>
                  <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative px-4 py-16 sm:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 mb-6">
            <span>🇩🇿</span>
            Algeria's First AI Appointment Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 mt-4">
            Book Smarter.<br/>
            Wait Less.<br/>
            <span className="text-primary">Live Better.</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0 font-medium">
            No more queues at clinics, offices, or public services. 
            Book your appointment in seconds with AI-powered scheduling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
            <Button variant="primary" size="lg" onClick={() => navigate('/providers')}>
              Book Appointment
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Learn More
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 border-t border-slate-200 pt-8 mt-12">
            <div className="text-center lg:text-left w-1/3 sm:w-auto">
              <h4 className="text-2xl font-extrabold text-slate-900">50K+</h4>
              <p className="text-sm font-medium text-slate-500">Users</p>
            </div>
            <div className="text-center lg:text-left w-1/3 sm:w-auto">
              <h4 className="text-2xl font-extrabold text-slate-900">1,200+</h4>
              <p className="text-sm font-medium text-slate-500">Providers</p>
            </div>
            <div className="text-center lg:text-left w-1/3 sm:w-auto">
              <h4 className="text-2xl font-extrabold text-slate-900">70%</h4>
              <p className="text-sm font-medium text-slate-500">Less Waiting</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md lg:max-w-none relative z-10">
          <div className="bg-white rounded-2xl shadow-xl shadow-primary/10 border border-slate-100 p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Booking Confirmed!</h3>
                <p className="text-sm font-medium text-slate-500">Your spot is secured.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-slate-400">person</span>
                <div>
                  <p className="text-sm text-slate-500">Provider</p>
                  <p className="font-bold text-slate-900">Dr. Amina Benali</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-slate-400">event</span>
                <div>
                  <p className="text-sm text-slate-500">Date & Time</p>
                  <p className="font-bold text-slate-900">Tomorrow, 10:30 AM</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-sm font-bold text-slate-600 gap-2">
                <span className="material-symbols-outlined text-lg">event_available</span>
                Added to Calendar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — animated horizontal roadmap ── */}
      <section
        id="how-it-works"
        ref={sectionRef}
        className="bg-white py-24 border-y border-slate-100 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-20">
            <span
              className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-3"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: '0ms',
              }}
            >
              Step by Step
            </span>
            <h2
              className="text-4xl font-black text-slate-900 mb-4"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.55s ease, transform 0.55s ease',
                transitionDelay: '100ms',
              }}
            >
              How It Works
            </h2>
            <p
              className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.55s ease, transform 0.55s ease',
                transitionDelay: '200ms',
              }}
            >
              From search to confirmation — in under 60 seconds. No calls, no waiting rooms.
            </p>
          </div>

          {/* ── Desktop horizontal roadmap ── */}
          <div className="hidden md:flex items-start justify-between relative">

            {/* STEP 1 */}
            <div
              className="flex flex-col items-center text-center w-48 shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(12px)',
                transition: 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: '0ms',
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-4 relative">
                {/* Soft glow ring that expands once on entry */}
                <span
                  className="absolute inset-0 rounded-full bg-primary/10"
                  style={{
                    transform: visible ? 'scale(2.2)' : 'scale(1)',
                    opacity: visible ? 0 : 0.6,
                    transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
                    transitionDelay: '150ms',
                  }}
                />
                <span
                  className="absolute inset-0 rounded-full bg-primary/15"
                  style={{
                    transform: visible ? 'scale(1.6)' : 'scale(1)',
                    opacity: visible ? 0 : 0.8,
                    transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                    transitionDelay: '100ms',
                  }}
                />
                <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '2.8rem' }}>travel_explore</span>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center z-20">1</span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1.5">Search</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Find clinics, offices or public services across Algeria by city or specialty.</p>
            </div>

            {/* LINE 1 → 2 */}
            <div className="flex-1 flex items-center pt-9 px-3">
              <div
                className="h-px w-full bg-slate-300 origin-left"
                style={{
                  transform: visible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '500ms',
                }}
              />
              <span
                className="material-symbols-outlined text-slate-400 text-base shrink-0 -ml-0.5"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  transitionDelay: '1050ms',
                }}
              >chevron_right</span>
            </div>

            {/* STEP 2 */}
            <div
              className="flex flex-col items-center text-center w-48 shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(12px)',
                transition: 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: '1100ms',
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-4 relative">
                <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '2.8rem' }}>calendar_add_on</span>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center z-20">2</span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1.5">Pick a Slot</h3>
              <p className="text-slate-500 text-sm leading-relaxed">AI suggests the best available time. Confirm in one tap — zero back-and-forth calls.</p>
            </div>

            {/* LINE 2 → 3 */}
            <div className="flex-1 flex items-center pt-9 px-3">
              <div
                className="h-px w-full bg-slate-300 origin-left"
                style={{
                  transform: visible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '1650ms',
                }}
              />
              <span
                className="material-symbols-outlined text-slate-400 text-base shrink-0 -ml-0.5"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  transitionDelay: '2200ms',
                }}
              >chevron_right</span>
            </div>

            {/* STEP 3 */}
            <div
              className="flex flex-col items-center text-center w-48 shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(12px)',
                transition: 'opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: '2250ms',
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-4 relative">
                <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '2.8rem' }}>notifications_active</span>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center z-20">3</span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1.5">Get Notified</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Instant confirmation on your phone. Auto reminder 24h before your appointment.</p>
            </div>

            {/* LINE 3 → 4 */}
            <div className="flex-1 flex items-center pt-9 px-3">
              <div
                className="h-px w-full bg-slate-300 origin-left"
                style={{
                  transform: visible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '2800ms',
                }}
              />
              <span
                className="material-symbols-outlined text-slate-400 text-base shrink-0 -ml-0.5"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  transitionDelay: '3350ms',
                }}
              >chevron_right</span>
            </div>

            {/* STEP 4 — final, spring pop */}
            <div
              className="flex flex-col items-center text-center w-48 shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(12px)',
                transition: 'opacity 0.5s cubic-bezier(0.34, 1.8, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.8, 0.64, 1)',
                transitionDelay: '3400ms',
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-4 relative">
                <span className="material-symbols-outlined text-secondary relative z-10" style={{ fontSize: '2.8rem' }}>emoji_events</span>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary text-white text-[11px] font-black flex items-center justify-center z-20">✓</span>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1.5">Skip the Queue</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Walk in at your exact time. No waiting. No stress. You're done.</p>
            </div>

          </div>

          {/* ── Mobile vertical fallback ── */}
          <div className="flex md:hidden flex-col gap-8">
            {[
              { icon: 'travel_explore', num: '1', title: 'Search', desc: 'Find clinics, doctors or offices near you.' },
              { icon: 'calendar_add_on', num: '2', title: 'Pick a Slot', desc: 'AI picks the best time available for you.' },
              { icon: 'notifications_active', num: '3', title: 'Get Notified', desc: 'Instant confirmation + reminder before your visit.' },
              { icon: 'emoji_events', num: '✓', title: 'Skip the Queue', desc: 'Walk in at your time. Zero waiting.' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-primary text-4xl">{s.icon}</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">{s.num}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-black text-slate-900 text-base mb-1">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Explore Categories</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(`/providers?category=${encodeURIComponent(cat.name)}`)}
              className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-primary transition-colors">
                  {cat.icon}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{cat.name}</h3>
              <p className="text-sm font-medium text-slate-500">{cat.count} providers</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400">

        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
                <span className="font-extrabold text-white text-lg tracking-tight">SmartService DZ</span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                Algeria's AI-powered appointment platform. Book smarter, wait less, live better.
              </p>
              <p className="text-xs text-slate-500">Made by Riadh 🇩🇿</p>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Platform</h4>
              <ul className="space-y-3 text-sm">
                {['Book Now', 'Find Providers', 'How It Works', 'Pricing'].map(link => (
                  <li key={link}>
                    <span
                      className="hover:text-white transition-colors cursor-pointer hover:translate-x-0.5 inline-block transition-transform"
                      onClick={() => navigate('/providers')}
                    >
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Services</h4>
              <ul className="space-y-3 text-sm">
                {['Medical', 'Legal', 'Public Services', 'Education', 'Banking'].map(cat => (
                  <li key={cat}>
                    <span
                      className="hover:text-white transition-colors cursor-pointer hover:translate-x-0.5 inline-block transition-transform"
                      onClick={() => navigate(`/providers?category=${encodeURIComponent(cat)}`)}
                    >
                      {cat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA column */}
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Get Started</h4>
              <p className="text-sm leading-relaxed mb-5">
                Join 50,000+ Algerians saving time every day. It's completely free.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 px-5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
              >
                Create Free Account →
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full mt-2 py-3 px-5 bg-white/5 text-slate-300 text-sm font-medium rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© 2026 SmartService DZ. All rights reserved.</span>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
                <span key={l} className="hover:text-slate-400 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>

      </footer>
    </div>
  );
};

export default Home;
