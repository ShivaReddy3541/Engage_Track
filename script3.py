import re

with open('frontend/src/pages/StudentDashboard.jsx', 'r') as f:
    content = f.read()

# Update label
content = content.replace("{ id: 'sessions', label: 'Sessions', icon: Clock }", "{ id: 'sessions', label: 'Online Meets', icon: Clock }")

# Replace activeMenu === 'sessions' block
pattern = re.compile(r"\{\s*activeMenu === 'sessions' && \(\s*<div className=\"space-y-6\">\s*<div className=\"bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-4\">.*?</div>\s*\)\}", re.DOTALL)

new_block = r"""{activeMenu === 'sessions' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4">Scheduled Online Meets</h3>
                    
                    {enrolledClasses.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-550 text-xs">
                        No upcoming online meets scheduled by your teachers.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrolledClasses.map(cls => (
                          <div 
                            key={cls.id}
                            onClick={() => setSelectedClass(cls)}
                            className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-brand-605" />
                                  {cls.name} {cls.subject_name ? -  : ''}
                                </h4>
                                {cls.meet_date && cls.start_time && (
                                  <CountdownTimer meetDate={cls.meet_date} startTime={cls.start_time} />
                                )}
                              </div>
                              <p className="text-slate-500 text-xs line-clamp-3 leading-normal">{cls.description || 'No description provided.'}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>{cls.duration_mins ? ${cls.duration_mins} mins : 'Live Class'}</span>
                              <span className="text-brand-600 hover:underline">Join Meet &rarr;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}"""

new_content, count = pattern.subn(new_block, content)
if count > 0:
    with open('frontend/src/pages/StudentDashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Sessions refactored successfully.")
else:
    print("Pattern not found.")
