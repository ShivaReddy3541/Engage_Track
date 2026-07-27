import re

with open('frontend/src/pages/StudentDashboard.jsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"\{\s*activeMenu === 'leaderboard' && \(\s*<div className=\"bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto\">.*?</div>\s*\)\}", re.DOTALL)

new_block = r"""{activeMenu === 'leaderboard' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-4xl mx-auto space-y-8 animate-fadeIn">
                  <div className="text-center space-y-2 mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">?? Student Leaderboard</h3>
                    <p className="text-slate-500 text-xs font-semibold">Real-time academic and engagement standings.</p>
                  </div>
                  
                  {/* Podium for Top 3 */}
                  <div className="flex justify-center items-end gap-4 mb-12 mt-8 h-48">
                    {/* Rank 2 */}
                    <div className="w-1/3 flex flex-col items-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full mb-3 flex items-center justify-center border-4 border-slate-300 shadow-md relative z-10">
                        <span className="text-2xl">??</span>
                      </div>
                      <div className="bg-slate-100 w-full rounded-t-lg pt-4 pb-2 text-center h-24 border-t-4 border-slate-300 relative shadow-inner">
                        <h4 className="font-bold text-slate-800 text-xs truncate px-2">P. Sneha Latha</h4>
                        <p className="text-[10px] text-slate-500 font-bold">95%</p>
                      </div>
                    </div>
                    
                    {/* Rank 1 */}
                    <div className="w-1/3 flex flex-col items-center -mt-8 relative z-20">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <span className="text-3xl animate-bounce">??</span>
                      </div>
                      <div className="h-20 w-20 bg-yellow-100 rounded-full mb-3 flex items-center justify-center border-4 border-yellow-400 shadow-lg relative z-10">
                        <span className="text-4xl">??</span>
                      </div>
                      <div className="bg-yellow-100 w-full rounded-t-lg pt-6 pb-2 text-center h-32 border-t-4 border-yellow-400 relative shadow-inner">
                        <h4 className="font-black text-slate-900 text-sm truncate px-2">S. Amith Reddy</h4>
                        <p className="text-xs text-yellow-700 font-black">98%</p>
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="w-1/3 flex flex-col items-center">
                      <div className="h-16 w-16 bg-orange-50 rounded-full mb-3 flex items-center justify-center border-4 border-orange-300 shadow-md relative z-10">
                        <span className="text-2xl">??</span>
                      </div>
                      <div className="bg-orange-50 w-full rounded-t-lg pt-4 pb-2 text-center h-20 border-t-4 border-orange-300 relative shadow-inner">
                        <h4 className="font-bold text-slate-800 text-xs truncate px-2">{user.full_name}</h4>
                        <p className="text-[10px] text-orange-700 font-bold">92%</p>
                      </div>
                    </div>
                  </div>

                  {/* Rest of the leaderboard list */}
                  <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Runners Up</h4>
                    {[
                      { rank: 4, name: 'K. Vikrant Sharma', gpa: '89%', active: false },
                      { rank: 5, name: 'M. Sandeep Kumar', gpa: '87%', active: false },
                      { rank: 6, name: 'R. Anjali Devi', gpa: '85%', active: false },
                      { rank: 7, name: 'T. Rahul Verma', gpa: '82%', active: false }
                    ].map((lead, i) => (
                      <div 
                        key={i}
                        className={p-4 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all hover:scale-[1.01] shadow-sm }
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-black text-slate-400 w-6 bg-slate-100 text-center rounded py-1">#{lead.rank}</span>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>{lead.name}</span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-100">{lead.gpa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}"""

new_content, count = pattern.subn(new_block, content)
if count > 0:
    with open('frontend/src/pages/StudentDashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Leaderboard refactored successfully.")
else:
    print("Pattern not found.")
