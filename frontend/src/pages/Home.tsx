import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';


const Home = () => {
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

      <section id="how-it-works" className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Book your next appointment in three simple steps.</p>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-slate-200"></div>
            
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 relative z-10 shadow-sm">
                <span className="material-symbols-outlined text-primary text-4xl">search</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">1</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Search</h3>
              <p className="text-slate-500 font-medium">Find your clinic, office or service</p>
            </div>
            
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 relative z-10 shadow-sm">
                <span className="material-symbols-outlined text-primary text-4xl">touch_app</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">2</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Book</h3>
              <p className="text-slate-500 font-medium">Choose your time slot in seconds</p>
            </div>
            
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100 relative z-10 shadow-sm">
                <span className="material-symbols-outlined text-secondary text-4xl">task_alt</span>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">3</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Done</h3>
              <p className="text-slate-500 font-medium">Get confirmed & skip the queue</p>
            </div>
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

      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3 mb-2">
              <img src="/ssd.png" alt="SmartService DZ" className="h-10 w-auto" />
              <span className="font-extrabold text-white text-xl tracking-tight">SmartService DZ</span>
            </div>
            <p className="text-sm text-slate-400">Algeria's smarter way to book.</p>
          </div>
          
          <div className="flex gap-6 text-sm font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">About</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
          
          <div className="text-sm text-slate-500">
            © 2026 SmartService DZ
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
