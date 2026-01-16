
import React, { useState, useEffect } from 'react';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { PanelType } from './types';
import { auth, onAuthStateChanged, signOut, User } from './services/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelType>(PanelType.USER);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Auto-switch to Admin Panel if the user is an administrator
      const isAdminUser = currentUser?.email?.includes('admin') || currentUser?.email === 'alex.rivera@aerocast.pro';
      if (isAdminUser) {
        setActivePanel(PanelType.ADMIN);
      } else {
        setActivePanel(PanelType.USER);
      }
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email?.includes('admin') || user?.email === 'alex.rivera@aerocast.pro';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Initialising AeroCast Core...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f172a] text-slate-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-wind text-white"></i>
          </div>
          <span className="font-bold text-xl tracking-tight">AeroCast</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="hidden md:flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <i className="fas fa-wind text-white text-xl"></i>
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white">AeroCast <span className="text-blue-500">Pro</span></span>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => { setActivePanel(PanelType.USER); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePanel === PanelType.USER ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-chart-line w-5"></i>
              <span className="font-semibold">Weather Dashboard</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => { setActivePanel(PanelType.ADMIN); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePanel === PanelType.ADMIN ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <i className="fas fa-shield-halved w-5"></i>
                <span className="font-semibold">Admin Panel</span>
              </button>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 glass rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-slate-800">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    {isAdmin ? 'System Administrator' : 'Climate Analyst'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]"
              >
                <i className="fas fa-sign-out-alt"></i>
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        {activePanel === PanelType.USER ? <UserDashboard /> : <AdminDashboard />}
        
        <footer className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2024 AeroCast Technologies. User ID: {user.uid.substring(0, 8)}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
          </div>
        </footer>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
