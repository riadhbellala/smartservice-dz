import sys

file_path = '/Users/riadh/smartservice-dz/frontend/src/pages/Home.tsx'

with open(file_path, 'r') as f:
    content = f.read()

missing_content = """
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
"""

with open(file_path, 'w') as f:
    f.write(content.rstrip() + "\n" + missing_content)

print("Fixed!")
