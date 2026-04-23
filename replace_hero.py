import re

file_path = '/Users/riadh/smartservice-dz/frontend/src/pages/Home.tsx'
with open(file_path, 'r') as f:
    content = f.read()

start_marker = '{/* ══ HERO ══ */}'
end_marker = '{/* ── HOW IT WORKS'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_hero = """{/* ══ HERO (SaaS Unified Card Layout) ══ */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pt-6 sm:pt-8 pb-32 sm:pb-40 z-10 w-full">
        
        {/* Massive Contained Card */}
        <div className="relative w-full rounded-[40px] sm:rounded-[64px] bg-white border border-slate-200/80 shadow-[0_40px_100px_-20px_rgba(30,58,138,0.15)] overflow-hidden flex flex-col items-center pt-24 sm:pt-32 lg:pt-40 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/20">

          <style>{`
            @keyframes heroFloat  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-16px)} }
            @keyframes floatSlow  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)}  }
            @keyframes stepIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
            @keyframes fadeInUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
            @keyframes driftBlob  { 0%,100%{transform:translate(0px,0px) scale(1)} 33%{transform:translate(30px,-40px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.95)} }
            
            .hero-float  { animation: heroFloat 6s ease-in-out infinite; }
            .float-slow  { animation: floatSlow 5s ease-in-out infinite; }
            .step-in     { animation: stepIn 0.32s ease forwards; }
            
            /* Staggered entrance animations */
            .stagger-1 { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
            .stagger-2 { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
            .stagger-3 { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
            .stagger-4 { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
            .stagger-5 { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }
            
            .animate-drift { animation: driftBlob 18s ease-in-out infinite alternate; }
          `}</style>

          {/* Internal Card Background Elements */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-primary/6 blur-[80px] -translate-y-1/3 translate-x-1/4 animate-drift" />
            <div className="absolute bottom-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-secondary/8 blur-[80px] translate-y-1/3 -translate-x-1/4 animate-drift" style={{ animationDelay: '-9s' }} />
            <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage:'radial-gradient(circle, #1D4ED8 1px, transparent 1px)', backgroundSize:'32px 32px' }} />
          </div>

          {/* ─── TEXT BLOCK (Centered Layout) ─── */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-8 w-full max-w-4xl mx-auto mb-16">
            
            {/* Top badge */}
            <div className="stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm text-xs sm:text-sm font-bold text-slate-700 mb-8 sm:mb-12 hover:scale-105 transition-transform cursor-default">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
              Algeria's #1 booking platform · 🇩🇿
            </div>

            {/* Main Headline */}
            <h1 className="stagger-2 text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight text-slate-900 mb-6">
              Stop answering<br />
              <span className="text-primary inline-block mt-2">
                "Are you free?"
              </span>
            </h1>

            {/* Dynamic rotating subheadlines */}
            <div className="stagger-3 h-[40px] sm:h-[48px] mb-8 flex items-start justify-center w-full">
              <div key={headlineIndex} className="step-in">
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-transparent px-4">
                  {["Too many WhatsApp messages?", "A chaotic, spoiled schedule?", "Long waiting room queues?", "The smart solution is here."][headlineIndex % 4]}
                </p>
              </div>
            </div>

            <p className="stagger-4 text-lg sm:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto mb-12">
              Let your clients book you automatically. No calls, no ping, no confusion.
            </p>

            {/* CTA row */}
            <div className="stagger-4 flex flex-col sm:flex-row justify-center items-center gap-4 w-full px-8 sm:px-0 mb-16">
              <button
                onClick={() => navigate('/register')}
                className="relative overflow-hidden group px-8 py-4 bg-primary text-white font-bold rounded-3xl text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start free — it's quick 
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold rounded-3xl text-sm border border-slate-200 hover:border-primary/40 hover:text-primary hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
              >
                See how it works
              </button>
            </div>

            {/* Stats row */}
            <div className="stagger-5 flex flex-wrap justify-center items-center gap-x-12 gap-y-8 pt-8 border-t border-slate-200/60 min-w-[70%]">
              {[['50K+','Happy users'],['1,200+','Active providers'],['70%','Less waiting time']].map(([n,l]) => (
                <div key={l} className="group cursor-default flex flex-col items-center">
                  <div className="text-2xl lg:text-3xl font-black text-slate-900 group-hover:text-primary transition-colors">{n}</div>
                  <div className="text-xs lg:text-sm text-slate-500 font-medium mt-1 group-hover:text-slate-700 transition-colors uppercase tracking-wider">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── INTERACTIVE UI (Anchored Bottom) ─── */}
          <div className="stagger-5 relative w-full flex justify-center mt-10 px-4 pb-0 pt-10">
            
            <div 
              className="hero-float relative w-full max-w-[460px] z-10"
              style={{ marginBottom: '-60px' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              
              {/* Background decorative elements */}

              {/* Rating mini-card — top left */}
              <div className="float-slow absolute -left-12 sm:-left-32 top-8 z-20 hidden lg:block">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 px-5 py-4 flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">4.9 / 5</p>
                    <p className="text-xs text-slate-400 font-medium">850 Patient Reviews</p>
                  </div>
                </div>
              </div>

              {/* Animated Calendar (tucked behind right) */}
              <div className="absolute top-[10%] -right-12 lg:-right-40 hidden md:block pointer-events-none z-[-1]" style={{transform: 'scale(1) rotate(5deg)'}}>
                <div className="float-slow opacity-[0.95]">
                  <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 w-64">
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-2.5 w-16 bg-slate-200 rounded-full" />
                      <div className="h-2.5 w-10 bg-slate-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({length: 28}).map((_, i) => (
                        <div key={i} className="aspect-square rounded-[6px] bg-slate-100/80 overflow-hidden relative border border-slate-200/50">
                           {/* Filled state overlay */}
                           {(i % 4 === 1 || i % 7 === 3) && (
                             <div 
                                className="absolute inset-[1px] rounded-[4px] bg-primary/70"
                                style={{
                                  animation: `stepIn ${4 + (i%3)}s ease-in-out infinite alternate`,
                                  animationDelay: `${i * 0.2}s`
                                }}
                             />
                           )}
                           {(i % 5 === 2 || i % 8 === 4) && (
                             <div 
                                className="absolute inset-[1px] rounded-[4px] bg-secondary/80"
                                style={{
                                  animation: `stepIn ${3 + (i%2)}s ease-in-out infinite alternate`,
                                  animationDelay: `${i * 0.4}s`
                                }}
                             />
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toast — top */}
              <div
                className="absolute -top-6 right-0 z-30 pointer-events-none"
                style={{
                  opacity: toastVisible ? 1 : 0,
                  transform: toastVisible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.95)',
                  transition: 'all 0.45s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl px-5 py-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">New appointment just now 🎉</p>
                    <p className="text-[11px] text-slate-400 font-medium">Consultation · 10:00 · Dr. Amina</p>
                  </div>
                </div>
              </div>

              {/* Main Booking Interface */}
              <div className="relative rounded-[2.5rem] bg-white/90 backdrop-blur-3xl border border-slate-200/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-secondary" />
                <div className="p-8 sm:p-10">
                  {/* Provider header */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-blue-500 text-white flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                      <span className="material-symbols-outlined text-[32px]">stethoscope</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-lg truncate">Dr. Amina Benali</p>
                      <p className="text-sm text-slate-500 mt-0.5">Algiers · ⭐ 4.9 · General Med</p>
                    </div>
                  </div>

                  {/* Progress pills */}
                  <div className="flex gap-2 mb-8">
                    {[0,1,2,3].map(i => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          flex: i === bookingStep ? 4 : 1,
                          background: i <= bookingStep ? '#1D4ED8' : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>

                  {/* Step content */}
                  <div className="min-h-[200px]">
                    {bookingStep === 0 && (
                      <div className="step-in">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Service</p>
                        <button
                          onClick={() => { setPaused(true); setBookingStep(1); }}
                          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-primary/20 bg-primary/5 text-primary font-bold text-sm hover:border-primary/40 hover:bg-primary/10 hover:scale-[1.01] transition-all duration-200 mb-3"
                        >
                          <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">medical_services</span> 
                            Consultation
                          </span>
                          <span className="text-slate-500 font-semibold text-xs bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">2 500 DA</span>
                        </button>
                        <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 text-slate-500 font-medium text-sm hover:bg-slate-50 transition-colors cursor-default">
                          <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[20px]">bloodtype</span>
                            Blood Test
                          </span>
                          <span>1 500 DA</span>
                        </button>
                      </div>
                    )}

                    {bookingStep === 1 && (
                      <div className="step-in">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pick a Date · May 2025</p>
                        <div className="grid grid-cols-4 gap-3 mb-5">
                          {['Mon 12','Tue 13','Wed 14','Thu 15'].map((d, idx) => (
                            <button
                              key={d}
                              onClick={() => { setPaused(true); setBookingStep(2); }}
                              className={`py-4 px-2 rounded-2xl text-xs font-bold text-center transition-all duration-200 hover:scale-105 leading-relaxed ${
                                idx === 2
                                  ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                  : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                              }`}
                            >
                              {d.split(' ').map((x, xi) => <span key={xi} className="block">{x}</span>)}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 font-medium text-center">4 slots available on Wed 14</p>
                      </div>
                    )}

                    {bookingStep === 2 && (
                      <div className="step-in">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Choose Time · Wed May 14</p>
                        <div className="grid grid-cols-3 gap-3 mb-5">
                          {['09:00','10:30','14:00'].map(t => (
                            <button
                              key={t}
                              onClick={() => { setSelectedTime(t); setPaused(true); setTimeout(() => setBookingStep(3), 380); }}
                              className={`py-4 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 ${
                                selectedTime === t
                                  ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105'
                                  : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 font-medium text-center">Duration: ~30 min · Consultation</p>
                      </div>
                    )}

                    {bookingStep === 3 && (
                      <div className="step-in flex flex-col items-center text-center py-2">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-5 relative">
                          <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping delay-75" />
                          <span className="material-symbols-outlined text-secondary text-4xl relative z-10">check_circle</span>
                        </div>
                        <p className="font-black text-slate-900 text-2xl mb-1.5">Confirmed! 🎉</p>
                        <p className="text-slate-500 text-sm font-medium mb-6">Your appointment is scheduled</p>
                        <div className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-600 font-medium text-left space-y-2">
                          <div className="flex justify-between"><span className="text-slate-400">Service</span><span className="font-bold text-slate-900">Consultation</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="font-bold text-slate-900">Wed May 14</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="font-bold text-slate-900">{selectedTime ?? '10:30'}</span></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA button */}
                  {bookingStep < 3 && (
                    <button
                      onClick={() => { setPaused(true); setBookingStep(s => Math.min(s+1, 3)); }}
                      className="mt-8 w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200 shadow-xl shadow-primary/25"
                    >
                      {['Choose Date →', 'Pick a Time →', 'Confirm Appointment →'][bookingStep]}
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
"""

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_hero + content[end_idx:]
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Failed")

