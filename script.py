import re

with open('frontend/src/pages/StudentDashboard.jsx', 'r') as f:
    content = f.read()

# Replace activeMenu === 'dashboard' block
pattern = re.compile(r"\{\s*activeMenu === 'dashboard' && \(\s*<div className=\"space-y-8\">\s*\{\/\* Welcome Hero Banner Card \*\/\}.*?\n\s*</div>\s*\)\}", re.DOTALL)

new_block = r"""{activeMenu === 'dashboard' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Welcome Hero Banner Card */}
                  <div className="bg-gradient-to-r from-brand-500/[0.04] to-brand-600/[0.01] border border-brand-500/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        Welcome Back, <span className="text-brand-605">{user.full_name.toUpperCase()}!</span> ??
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Ready to access your classes and academic performance?</p>
                      
                      <button 
                        onClick={() => setActiveMenu('report')}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md mt-6"
                      >
                        View Full Cognitive Performance Profile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Pane: Assignments + Historical Overall Report */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Overall Report: Historical Data */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                          <TrendingUp className="h-4.5 w-4.5 text-brand-600" />
                          Overall Academic Report
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Historical semester data and cognitive performance.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { sem: 'Semester 1', gpa: '3.8/4.0', status: 'Excellent', color: 'emerald' },
                            { sem: 'Semester 2', gpa: '3.6/4.0', status: 'Good', color: 'blue' },
                            { sem: 'Semester 3', gpa: '3.9/4.0', status: 'Outstanding', color: 'indigo' }
                          ].map((sem, i) => (
                            <div key={i} className={p-4 rounded-2xl border border--100 bg--50}>
                              <h4 className={	ext-xs font-bold text--800 uppercase tracking-wider mb-1}>{sem.sem}</h4>
                              <div className="flex justify-between items-end">
                                <span className={	ext-xl font-black text--700}>{sem.gpa}</span>
                                <span className={	ext-[10px] font-bold text--600 bg--100 px-2 py-0.5 rounded}>{sem.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignments Widget */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider flex items-center gap-1.5">
                          <ListTodo className="h-4.5 w-4.5 text-brand-600" />
                          Pending & Upcoming Assignments
                        </h4>
                        
                        <div className="space-y-3">
                          {allUpcomingAssignments.length === 0 ? (
                            <p className="text-slate-550 text-xs">No pending assignments at the moment. Keep it up!</p>
                          ) : (
                            allUpcomingAssignments.map((assign) => {
                              const isSubmitted = !!mySubmissions[assign.id];
                              return (
                                <div 
                                  key={assign.id} 
                                  className={p-3 rounded-2xl border text-xs space-y-1.5 transition-colors }
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-bold text-slate-800 line-clamp-1">{assign.title}</span>
                                    {isSubmitted ? (
                                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Done</span>
                                    ) : (
                                      <span className="text-[9px] font-extrabold text-yellow-600 uppercase bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">Due</span>
                                    )}
                                  </div>
                                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>{assign.className}</span>
                                    <span>{new Date(assign.deadline).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Pane: Announcements */}
                    <div className="lg:col-span-1 space-y-8">
                      {/* Announcements block */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Announcements</h3>
                          <Bell className="h-4 w-4 text-slate-405" />
                        </div>

                        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                          {announcements.length > 0 ? (
                            announcements.map((ann, i) => (
                              <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-xs text-slate-800">{ann.title}</h4>
                                  <span className={	ext-[9px] font-bold uppercase px-2 py-0.5 rounded }>
                                    {ann.priority}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 leading-normal">{ann.content}</p>
                                <span className="text-[9px] text-slate-400 mt-2 block">{ann.date || new Date(ann.created_at).toLocaleDateString()}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                                <MessageSquare className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-800">No Announcements</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Check back later for updates.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}"""

new_content, count = pattern.subn(new_block, content)
if count > 0:
    with open('frontend/src/pages/StudentDashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Dashboard refactored successfully.")
else:
    print("Pattern not found.")
