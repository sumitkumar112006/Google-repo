
import React, { useState, useEffect } from 'react';
import { SensorStation } from '../types';
import { db, ref, onValue, analytics, logEvent, push, set } from '../services/firebase';

const MOCK_STATIONS: SensorStation[] = [
  { id: 'ST-001', location: 'Downtown Manhattan', status: 'active', lastPing: '2 mins ago', battery: 88 },
  { id: 'ST-002', location: 'Queens Airport', status: 'maintenance', lastPing: '1 hour ago', battery: 42 },
  { id: 'ST-003', location: 'Central Park', status: 'active', lastPing: '5 mins ago', battery: 95 },
  { id: 'ST-004', location: 'Brooklyn Harbor', status: 'offline', lastPing: '2 days ago', battery: 0 },
];

const AdminDashboard: React.FC = () => {
  const [stations, setStations] = useState<SensorStation[]>([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Analytics
    if (analytics) {
      logEvent(analytics, 'screen_view', { screen_name: 'AdminDashboard' });
    }

    // Connect to Realtime Database
    const stationsRef = ref(db, 'stations');
    const unsubscribe = onValue(stationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transform object to array if needed, or handle as object
        const stationsList: SensorStation[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setStations(stationsList);
      } else {
        // Seed with mock data if DB is empty for demonstration
        MOCK_STATIONS.forEach(s => {
          const newStationRef = push(ref(db, 'stations'));
          set(newStationRef, s);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertMessage) {
      alert(`SYSTEM BROADCAST: ${alertMessage}`);
      if (analytics) {
        logEvent(analytics, 'admin_broadcast', { message_length: alertMessage.length });
      }
      setAlertMessage('');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header>
        <h1 className="text-4xl font-extrabold text-white">System Administration</h1>
        <p className="text-slate-400 mt-1">Global infrastructure & sensor management (Realtime DB Sync)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-bold">Network Stations</h3>
            <button className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors">Export Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Seen</th>
                  <th className="px-6 py-4">Power</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stations.map(station => (
                  <tr key={station.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-400 text-xs truncate max-w-[80px]">{station.id}</td>
                    <td className="px-6 py-4 font-medium">{station.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        station.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                        station.status === 'maintenance' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {station.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{station.lastPing}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${station.battery > 30 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${station.battery}%` }}></div>
                        </div>
                        <span className="text-xs font-bold">{station.battery}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {stations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Connecting to Realtime Database...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-4">Emergency Broadcast</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Push a high-priority alert to all connected user devices in specified regions.
            </p>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Type emergency message..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 h-32"
              ></textarea>
              <button className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                <i className="fas fa-bullhorn"></i> Send Alert
              </button>
            </form>
          </div>

          <div className="glass p-6 rounded-3xl bg-blue-600/10 border-blue-500/20">
            <h3 className="font-bold mb-2">System Diagnostics</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">API Health</span>
                <span className="text-emerald-400 font-bold">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">DB Status</span>
                <span className="text-emerald-400 font-bold">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sensor Traffic</span>
                <span className="text-blue-400 font-bold">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
