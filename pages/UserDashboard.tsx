
import React, { useState, useEffect } from 'react';
import { fetchWeatherData } from '../api/weather_api';
import { WeatherData } from '../types';
import DashboardCard from '../components/DashboardCard';
import { analytics, logEvent } from '../services/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UserDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('New Delhi');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (targetCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(targetCity);
      setWeather(data);
      if (analytics) {
        logEvent(analytics, 'view_item', {
          item_id: targetCity,
          item_name: 'weather_report',
          location_id: targetCity
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch weather data. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(city);
    if (analytics) {
      logEvent(analytics, 'screen_view', {
        screen_name: 'UserDashboard'
      });
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const target = searchQuery.trim();
      setCity(target);
      loadData(target);
      if (analytics) {
        logEvent(analytics, 'search', {
          search_term: target
        });
      }
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981'; 
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 200) return '#f97316';
    if (aqi <= 300) return '#ef4444';
    return '#7e22ce';
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('shower')) return 'fa-cloud-showers-heavy text-blue-400';
    if (c.includes('cloud')) return 'fa-cloud text-slate-400';
    if (c.includes('clear') || c.includes('sun')) return 'fa-sun text-amber-400';
    if (c.includes('storm') || c.includes('thunder')) return 'fa-cloud-bolt text-yellow-500';
    if (c.includes('snow')) return 'fa-snowflake text-white';
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return 'fa-smog text-slate-300';
    return 'fa-cloud-sun text-blue-300';
  };

  const pollutionData = weather ? [
    { name: 'PM2.5', value: weather.pollution.pm25 },
    { name: 'PM10', value: weather.pollution.pm10 },
    { name: 'NO2', value: weather.pollution.no2 },
    { name: 'O3', value: weather.pollution.o3 },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Atmospheric Intelligence</h1>
            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Live Synced
            </span>
          </div>
          <p className="text-slate-400 font-medium tracking-tight">Station: <span className="text-blue-400 font-bold">{weather?.city || city}</span></p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 group">
          <div className="relative">
             <i className="fas fa-search-location absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search City or State..."
               className="bg-slate-800/60 border border-slate-700/50 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 text-sm transition-all shadow-inner"
             />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95">
            Sync
          </button>
        </form>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] flex items-center gap-4 text-rose-400">
          <i className="fas fa-circle-exclamation text-2xl"></i>
          <div className="flex-1">
            <p className="font-bold text-sm">Synchronization Failed</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
          <button 
            onClick={() => loadData(city)}
            className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 space-y-8 glass rounded-[3rem] border border-white/5">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <i className="fas fa-cloud-sun text-blue-500 text-2xl animate-bounce"></i>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Polling Satellites...</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Retrieving density, forecast, and pollution metrics for {city}.</p>
          </div>
        </div>
      ) : weather && (
        <>
          {/* Main Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Current Temp" 
              value={weather.temperature} 
              unit="°C" 
              icon="fas fa-temperature-full" 
              color="#3b82f6" 
            />
            <DashboardCard 
              title="Air Density" 
              value={weather.airDensity.toFixed(3)} 
              unit="kg/m³" 
              icon="fas fa-atom" 
              color="#a855f7" 
            />
            <DashboardCard 
              title="Rain Prob." 
              value={weather.rainProbability} 
              unit="%" 
              icon="fas fa-cloud-showers-water" 
              color="#0ea5e9" 
            />
            <DashboardCard 
              title="Air Quality (AQI)" 
              value={weather.aqi} 
              icon="fas fa-smog" 
              color={getAQIColor(weather.aqi)} 
            />
          </div>

          {/* Hourly Forecast Section */}
          <section className="glass p-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold text-white">Hourly Projection</h3>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next 12 Hours</p>
               </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
              {weather.hourlyForecast.map((h, i) => (
                <div key={i} className="flex-shrink-0 w-28 bg-slate-900/40 border border-white/5 rounded-3xl p-5 text-center hover:bg-slate-800/60 transition-all hover:-translate-y-1 cursor-default group">
                   <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 group-hover:text-blue-400 transition-colors">{h.time}</p>
                   <div className="mb-4 flex justify-center">
                     <i className={`fas ${getWeatherIcon(h.condition)} text-2xl`}></i>
                   </div>
                   <p className="text-xl font-extrabold text-white">{h.temp}°</p>
                   <p className="text-[9px] text-slate-500 font-medium uppercase mt-1 truncate">{h.condition}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Pollution Analytics */}
              <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-white">Pollutant Density</h3>
                  <div className="text-[10px] bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 font-bold uppercase tracking-widest">
                    Live Sensor Array
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pollutionData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                        {pollutionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#60a5fa', '#34d399', '#f87171', '#fbbf24'][index % 4]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Forecast */}
              <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">7-Day Outlook</h3>
                  <i className="fas fa-calendar-days text-slate-600"></i>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {weather.forecast.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-900/40 border border-white/5 rounded-3xl hover:border-blue-500/30 hover:bg-slate-900/60 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                            <i className={`fas ${getWeatherIcon(f.condition)} text-xl`}></i>
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm uppercase tracking-tight">{f.day}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{f.condition}</p>
                          </div>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-black text-white">{f.temp}°</p>
                         <div className="w-8 h-1 bg-blue-500/20 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(f.temp/45)*100}%` }}></div>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Health Assessment */}
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6">AI Health Assessment</h3>
                <div className="flex-1 bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 mb-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                  <div className="flex gap-3 mb-4">
                    <i className="fas fa-robot text-blue-400"></i>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AeroCast Intel</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">
                    "{weather.aiInsights}"
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Atmospheric Parameters</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Humidity</p>
                      <p className="text-xl font-extrabold text-white">{weather.humidity}%</p>
                    </div>
                    <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Wind</p>
                      <p className="text-xl font-extrabold text-white">{weather.windSpeed}<span className="text-xs font-normal text-slate-500 ml-1">km/h</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Verification */}
              {weather.sources && (
                <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5 ml-1">Verification Logs</p>
                  <div className="space-y-3">
                    {weather.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl text-blue-400 border border-slate-700/30 transition-all group overflow-hidden">
                        <div className="flex items-center gap-3">
                           <i className="fas fa-link text-[10px] text-slate-600 group-hover:text-blue-500 transition-colors"></i>
                           <span className="text-[10px] font-bold truncate max-w-[140px] uppercase tracking-tighter">{s.title}</span>
                        </div>
                        <i className="fas fa-arrow-up-right-from-square text-[8px] opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
