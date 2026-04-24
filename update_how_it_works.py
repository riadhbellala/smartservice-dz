import sys

file_path = '/Users/riadh/smartservice-dz/frontend/src/pages/Home.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add State Hooks
state_insert = """  const [tutStep, setTutStep]           = useState(0);
  const [tutPaused, setTutPaused]       = useState(false);
"""
if 'const [tutStep' not in content:
    content = content.replace("  const [headlineIndex, setHeadlineIndex] = useState(0);\n", "  const [headlineIndex, setHeadlineIndex] = useState(0);\n" + state_insert)

# 2. Add useEffect loop for tutStep
effect_insert = """  useEffect(() => {
    if (tutPaused) return;
    const delays = [3500, 2000, 2500, 3000];
    const t = setTimeout(() => {
      setTutStep(prev => (prev === 3 ? 0 : prev + 1));
    }, delays[tutStep]);
    return () => clearTimeout(t);
  }, [tutStep, tutPaused]);
"""
if 'const delays = [3500, 2000, 2500, 3000];' not in content:
    content = content.replace("  const { isAuthenticated, user } = useAuthStore();\n", effect_insert + "\n  const { isAuthenticated, user } = useAuthStore();\n")

# 3. Replace How it works section
start_marker = '{/* ── HOW IT WORKS'
end_marker = '{/* ── BENTO GRID'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_how_it_works = """{/* ── HOW IT WORKS — Interactive Tutorial ── */}
      <section id="how-it-works" ref={sectionRef} className="py-24 sm:py-32 bg-slate-50 border-y border-slate-100 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
               <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">See it in Action</h2>
               <p className="text-xl text-slate-500 font-medium">From discovering a provider to a confirmed booking in under a minute.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
               
               {/* LEFT: Textual Steps */}
               <div className="flex flex-col gap-6 order-2 lg:order-1 relative z-10 w-full max-w-lg mx-auto lg:mx-0">
                  {/* Vertical Line Connector */}
                  <div className="absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-slate-200 -z-10 hidden sm:block" />

                  {[
                     { icon: 'search', title: 'Find your provider', desc: 'Search by name, city, or specialty and instantly view their live schedule.' },
                     { icon: 'medical_services', title: 'Choose the service', desc: 'Prices, duration, and details are clear upfront. No surprises.' },
                     { icon: 'calendar_clock', title: 'Pick a time', desc: 'Select any available slot. Smart system prevents double-booking automatically.' },
                     { icon: 'task_alt', title: 'Booked instantly', desc: 'Receive instant confirmation and automated SMS reminders. Done.' }
                  ].map((step, idx) => {
                     const isActive = tutStep === idx;
                     const isPast = tutStep > idx;
                     return (
                        <div 
                           key={idx} 
                           className={`relative flex items-start gap-5 sm:gap-6 p-5 sm:p-6 rounded-[2rem] transition-all duration-500 cursor-pointer ${isActive ? 'bg-white shadow-[0_20px_40px_-15px_rgba(30,58,138,0.1)] border border-slate-200/80 scale-[1.03] z-10' : 'hover:bg-slate-100 border border-transparent'}`}
                           onClick={() => setTutStep(idx)}
                        >
                           <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${isActive ? 'bg-gradient-to-br from-primary to-blue-500 text-white shadow-primary/30 scale-110' : isPast ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                              <span className="material-symbols-outlined text-[26px]">{step.icon}</span>
                           </div>
                           <div className="pt-1">
                              <h3 className={`text-xl font-black mb-2 transition-colors duration-500 ${isActive ? 'text-primary' : 'text-slate-900'}`}>{step.title}</h3>
                              <p className={`text-sm sm:text-base transition-colors duration-500 font-medium leading-relaxed ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>{step.desc}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* RIGHT: Simulated App Screen */}
               <div 
                  className="order-1 lg:order-2 flex justify-center relative w-full perspective-1000 px-4 sm:px-0"
                  onMouseEnter={() => setTutPaused(true)}
                  onMouseLeave={() => setTutPaused(false)}
               >
                  {/* Decorative backdrop */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10 translate-y-10">
                     <div className="w-[300px] h-[300px] bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-[80px]" />
                  </div>

                  <div className="relative w-full max-w-[360px] bg-white border-8 border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col transform transition-transform duration-700 hover:rotate-y-0 group">
                     
                     <style>{`
                        @keyframes typing { from { width: 0 } to { width: 100% } }
                        .animate-typing { overflow: hidden; white-space: nowrap; animation: typing 1.5s steps(20, end) infinite alternate; border-right: 2px solid #1D4ED8; }
                     `}</style>
                     
                     {/* Simulated status bar */}
                     <div className="h-12 flex items-center justify-between px-6 text-slate-800 text-[10px] font-black bg-white border-b border-slate-100 shrink-0">
                        <span>9:41</span>
                        {/* Dynamic notch slot */}
                        <div className="absolute left-1/2 -ml-16 top-0 w-32 h-6 bg-slate-900 rounded-b-2xl" />
                        <div className="flex gap-1.5 items-center">
                           <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                           <span className="material-symbols-outlined text-[14px]">wifi</span>
                           <span className="material-symbols-outlined text-[14px]">battery_full</span>
                        </div>
                     </div>

                     {/* Content Area */}
                     <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
                        
                        {/* STEP 0: Search */}
                        <div className={`absolute inset-0 p-6 flex flex-col gap-6 bg-slate-50 transition-all duration-700 ${tutStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                           <div className="flex justify-between items-center mt-2 mb-4">
                             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">RZ</div>
                             <span className="material-symbols-outlined text-slate-400">notifications</span>
                           </div>
                           <h3 className="font-black text-3xl text-slate-800 tracking-tight leading-tight">Find your<br/>appointment</h3>
                           
                           {/* Fake search bar */}
                           <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-md shadow-slate-200/50">
                              <span className="material-symbols-outlined text-primary">search</span>
                              <div className="flex-1 min-w-0">
                                 <div className="inline-block animate-typing font-bold text-slate-700 text-sm">Dr. Amina Benali</div>
                              </div>
                           </div>

                           <div className="flex-1" />

                           {/* Fake skeleton result */}
                           <div className="w-full bg-white p-4 rounded-3xl border border-primary/20 shadow-xl shadow-primary/15 flex items-center gap-4 step-in cursor-pointer hover:bg-slate-50 transition-colors">
                              <div className="w-[52px] h-[52px] bg-gradient-to-br from-primary to-blue-500 rounded-xl text-white flex items-center justify-center shadow-md">
                                 <span className="material-symbols-outlined text-2xl">stethoscope</span>
                              </div>
                              <div className="flex-1">
                                 <p className="font-black text-slate-900 text-sm">Dr. Amina Benali</p>
                                 <p className="text-[11px] text-slate-500 font-medium">General Med · Alger</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center pointer-events-auto hover:bg-primary hover:text-white transition-colors">
                                 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </div>
                           </div>
                        </div>

                        {/* STEP 1: Select Service */}
                        <div className={`absolute inset-0 p-6 flex flex-col gap-6 bg-slate-50 transition-all duration-700 ${tutStep === 1 ? 'opacity-100 translate-x-0' : tutStep < 1 ? 'opacity-0 translate-x-12 pointer-events-none' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                           
                           <div className="flex items-center gap-4 border-b border-slate-200 pb-5 pt-2">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-500 rounded-[14px] text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                 <span className="material-symbols-outlined text-[26px]">stethoscope</span>
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-lg">Dr. Amina Benali</p>
                                 <p className="text-xs text-secondary font-bold flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"/> Available now</p>
                              </div>
                           </div>

                           <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-2">Select a Service</p>
                           
                           <div className="flex flex-col gap-3">
                              <div className="bg-white border-2 border-primary bg-primary/5 rounded-2xl p-4 flex justify-between items-center shadow-lg shadow-primary/10 relative overflow-hidden group">
                                 <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                                 <div className="relative z-10">
                                    <p className="font-black text-primary text-sm flex items-center gap-2">Consultation <span className="material-symbols-outlined text-[14px]">medical_services</span></p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">30 min duration</p>
                                 </div>
                                 <span className="bg-white border border-primary/20 text-primary font-black text-xs px-3 py-1.5 rounded-lg shadow-sm relative z-10">2,500 DA</span>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center opacity-60 grayscale-[30%]">
                                 <div>
                                    <p className="font-bold text-slate-700 text-sm">Follow-up</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">15 min duration</p>
                                 </div>
                                 <span className="text-slate-500 font-bold text-xs px-3 py-1 bg-slate-100 rounded-lg">1,500 DA</span>
                              </div>
                           </div>
                        </div>

                        {/* STEP 2: Date & Time */}
                        <div className={`absolute inset-0 p-6 flex flex-col gap-5 bg-slate-50 transition-all duration-700 ${tutStep === 2 ? 'opacity-100 translate-x-0' : tutStep < 2 ? 'opacity-0 translate-x-12 pointer-events-none' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                           
                           <div className="flex justify-between items-center mt-2">
                             <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">May 2025</p>
                             <div className="flex gap-1">
                               <span className="material-symbols-outlined text-slate-400 text-sm">chevron_left</span>
                               <span className="material-symbols-outlined text-slate-900 text-sm">chevron_right</span>
                             </div>
                           </div>
                           
                           <div className="flex gap-2.5 overflow-x-hidden">
                              {['Mon 12','Tue 13','Wed 14','Thu 15'].map((d, i) => (
                                 <div key={d} className={`shrink-0 w-[4.8rem] py-3.5 rounded-[1.25rem] text-center border ${i === 2 ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">{d.split(' ')[0]}</p>
                                    <p className={`text-xl font-black ${i===2 ? 'text-white' : 'text-slate-800'}`}>{d.split(' ')[1]}</p>
                                 </div>
                              ))}
                           </div>

                           <p className="font-bold text-slate-400 text-xs uppercase tracking-widest mt-3">Available Slots</p>
                           
                           <div className="grid grid-cols-2 gap-3">
                              {['08:30', '09:00', '10:30', '11:00'].map((t, i) => (
                                 <div key={t} className={`py-4 text-center rounded-2xl font-black text-sm border ${i === 2 ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 step-in scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    {t}
                                 </div>
                              ))}
                           </div>

                           <div className="flex-1" />
                           <div className="w-full py-4 text-center rounded-2xl bg-primary text-white font-bold tracking-wide shadow-lg shadow-primary/30 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-2">
                              Confirm 10:30 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                           </div>
                        </div>

                        {/* STEP 3: Confirm */}
                        <div className={`absolute inset-0 p-6 flex flex-col transition-all duration-700 bg-white ${tutStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
                           
                           <div className="flex-1 flex flex-col items-center justify-center text-center -mt-6">
                              <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-6 relative">
                                 <span className="absolute inset-0 border-[6px] border-secondary/20 rounded-full animate-ping delay-150" style={{ animationDuration: '2s'}} />
                                 <span className="material-symbols-outlined text-secondary" style={{fontSize: '3.5rem'}}>check_circle</span>
                              </div>
                              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Confirmed!</h3>
                              <p className="text-slate-500 font-medium px-4 mb-8">Your appointment is scheduled. We've sent the details via SMS.</p>
                              
                              <div className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-left shadow-sm">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">When</span>
                                   <span className="font-black text-sm text-slate-800">Wed May 14 · 10:30</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</span>
                                   <span className="font-black text-sm text-slate-800 dark:text-slate-100">Consultation</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Doctor</span>
                                   <span className="font-black text-sm text-slate-800 dark:text-slate-100">Dr. Amina Benali</span>
                                </div>
                              </div>
                           </div>

                           <div className="w-full py-4 text-center rounded-2xl bg-slate-100 text-slate-700 font-bold tracking-wide cursor-pointer hover:bg-slate-200 transition-colors">Done</div>
                        </div>

                     </div>
                     
                     {/* Bottom home indicator simulated */}
                     <div className="h-6 w-full flex justify-center items-center pb-2 bg-white z-20 shrink-0">
                        <div className="w-1/3 h-1 bg-slate-200 rounded-full" />
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>
"""

new_content = content[:start_idx] + new_how_it_works + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(new_content)
print("Updated successfully")

