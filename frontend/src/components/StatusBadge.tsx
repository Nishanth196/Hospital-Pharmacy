import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (status || '').toUpperCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';
  let Icon = HelpCircle;

  switch (norm) {
    case 'APPROVED':
    case 'PASS':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-600/20';
      Icon = CheckCircle2;
      break;
    case 'BLOCKED':
    case 'FAIL':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 ring-rose-600/20';
      Icon = XCircle;
      break;
    case 'ESCALATED':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-600/20';
      Icon = AlertOctagon;
      break;
    case 'REVIEW_REQUIRED':
    case 'REVIEW REQUIRED':
    case 'WARNING':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-indigo-600/20';
      Icon = AlertTriangle;
      break;
    case 'CRITICAL':
      colorClasses = 'bg-red-100 text-red-800 border-red-300 ring-red-600/20';
      Icon = AlertOctagon;
      break;
    case 'HIGH':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-300 ring-orange-600/20';
      Icon = AlertTriangle;
      break;
    case 'MEDIUM':
      colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-300 ring-yellow-600/20';
      Icon = AlertTriangle;
      break;
    case 'LOW':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-300 ring-blue-600/20';
      Icon = CheckCircle2;
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3.5 py-1.5 text-sm font-bold tracking-wider',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ring-1 ring-inset ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{norm.replace(/_/g, ' ')}</span>
    </span>
  );
};
