      {/* Auth Modal */}
      {authModalClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 animate-scaleIn">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-600" />
              Authentication Required
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Please enter your Roll Number and Password to join the live session for <b>{authModalClass.name}</b>.
            </p>
            
            {authError && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 border border-red-100">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyJoin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Roll Number</label>
                <input
                  type="text"
                  required
                  value={authRollNo}
                  onChange={(e) => setAuthRollNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. 26CS001"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalClass(null);
                    setAuthError('');
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  {isVerifying ? 'Verifying...' : 'Join Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}