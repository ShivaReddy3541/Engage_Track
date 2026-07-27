import re

with open('frontend/src/pages/StudentDashboard.jsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"\{\s*activeMenu === 'browse' && \(\s*<div className=\"space-y-6\">\s*<h3 className=\"text-sm font-extrabold text-slate-900 tracking-tight\">University Catalog</h3>.*?</div>\s*\)\}", re.DOTALL)

new_block = r"""{activeMenu === 'browse' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4">Previous Recorded Sessions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:border-brand-300 transition-colors">
                          <div className="aspect-video bg-slate-200 relative flex items-center justify-center">
                            <Play className="h-10 w-10 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">45:20</div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-slate-800 text-xs mb-1 line-clamp-1">Lecture {i}: Advanced Concepts</h4>
                            <p className="text-[10px] text-slate-500">Recorded on {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4">University Catalog</h3>
                    <div className="relative max-w-md mb-6">
                      <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search for classrooms (e.g. AI, Math)..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {filteredCatalogClasses.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-550 text-xs">
                        No classrooms match your search parameters.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCatalogClasses.map((cls) => {
                          const isEnrolled = enrolledClasses.some(ec => ec.id === cls.id);
                          return (
                            <div 
                              key={cls.id}
                              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]"
                            >
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-slate-400" />
                                  {cls.name}
                                </h4>
                                <p className="text-slate-500 text-xs line-clamp-3 leading-normal">{cls.description || 'No description provided.'}</p>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4">
                                {isEnrolled ? (
                                  <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">Already Enrolled</span>
                                ) : (
                                  <button
                                    onClick={() => handleJoinClass(cls.id)}
                                    disabled={joiningClass === cls.id}
                                    className="text-[10px] bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white px-4 py-2 rounded-lg font-extrabold uppercase tracking-widest transition-colors flex items-center gap-2"
                                  >
                                    {joiningClass === cls.id ? 'Joining...' : 'Enroll Now'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}"""

new_content, count = pattern.subn(new_block, content)
if count > 0:
    with open('frontend/src/pages/StudentDashboard.jsx', 'w') as f:
        f.write(new_content)
    print("Browse refactored successfully.")
else:
    print("Pattern not found.")
