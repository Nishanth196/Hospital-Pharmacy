import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  badge,
}) => {
  const schemeClasses = {
    blue: {
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
      borderAccent: 'border-l-sky-500',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      borderAccent: 'border-l-emerald-500',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      borderAccent: 'border-l-rose-500',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      borderAccent: 'border-l-amber-500',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      borderAccent: 'border-l-indigo-500',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
      borderAccent: 'border-l-slate-400',
    },
  }[colorScheme];

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm border-l-4 ${schemeClasses.borderAccent} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${schemeClasses.iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
};
