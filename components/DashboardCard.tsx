
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  description?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, unit, icon, color, description }) => {
  return (
    <div className="glass p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] border-l-4" style={{ borderColor: color }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-1">
            {value}
            <span className="text-lg font-normal text-slate-500 ml-1">{unit}</span>
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          <i className={`${icon} text-2xl`} style={{ color }}></i>
        </div>
      </div>
      {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
    </div>
  );
};

export default DashboardCard;
