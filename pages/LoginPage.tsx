
import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-700 ${isAdminMode ? 'bg-[#1a0a0d]' : 'bg-[#020617]'} overflow-hidden relative`}>
      {/* Dynamic Background Effects */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-700 ${isAdminMode ? 'bg-rose-600/20' : 'bg-blue-600/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-700 ${isAdminMode ? 'bg-amber-600/10' : 'bg-purple-600/20'}`}></div>

      <div className={`w-full max-w-md auth-card p-8 rounded-[2.5rem] shadow-2xl relative z-10 border transition-all duration-500 ${isAdminMode ? 'border-rose-500/30' : 'border-white/5'}`}>
        
        {/* Admin/User Toggle - High Visibility */}
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl mb-8 border border-slate-800 shadow-inner">
          <button 
            onClick={() => setIsAdminMode(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-[0.2em] ${!isAdminMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-user-circle mr-2"></i> User
          </button>
          <button 
            onClick={() => setIsAdminMode(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-[0.2em] ${isAdminMode ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-shield-halved mr-2"></i> Admin
          </button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 transition-all duration-500 ${isAdminMode ? 'bg-rose-600 shadow-rose-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}>
            <i className={`fas ${isAdminMode ? 'fa-terminal' : 'fa-wind'} text-white text-3xl`}></i>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-white">
            AeroCast <span className={isAdminMode ? 'text-rose-500' : 'text-blue-500'}>{isAdminMode ? 'Admin' : 'Pro'}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">{isAdminMode ? 'Infrastructure Command Console' : 'Precision Atmospheric Intelligence'}</p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center">
          {isLogin ? (isAdminMode ? 'Privileged Login' : 'Welcome Back') : 'New Deployment'}
        </h2>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-3 animate-pulse">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Identity</label>
            <div className="relative">
              <i className="fas fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                placeholder={isAdminMode ? "admin@aerocast.pro" : "analyst@example.com"}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Secure Passkey</label>
            <div className="relative">
              <i className="fas fa-fingerprint absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg mt-4 disabled:opacity-50 flex items-center justify-center gap-3 ${isAdminMode ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>{isLogin ? 'Establish Connection' : 'Register Core ID'}</>
            )}
          </button>
        </form>

        {!isAdminMode && (
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "No active ID?" : "Already registered?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 font-bold hover:underline"
              >
                {isLogin ? 'Apply for Access' : 'Sign In'}
              </button>
            </p>
          </div>
        )}

        {isAdminMode && (
          <p className="mt-8 text-[10px] text-slate-600 text-center uppercase font-bold tracking-[0.2em] leading-relaxed">
            Infrastructure access is monitored. <br/>Log out after session termination.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
