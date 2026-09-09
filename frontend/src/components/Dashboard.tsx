import React, { useEffect, useState } from 'react';
import { fetchMetrics, fetchPrescriptions } from '../api';
import { Prescription } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Clock, Activity, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  onSelectPrescription: (id: number) => void;
  onOpenValidation: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectPrescription, onOpenValidation }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const m = await fetchMetrics();
      const p = await fetchPrescriptions();
      setMetrics(m);
      setPrescriptions(p);
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-teal-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Pharmacy Metrics...</span>
        </div>
      </div>
    );
  }

  const COLORS = {
    RECOMMEND: '#10b981', // emerald
    BLOCK: '#ef4444',     // red
    ESCALATE: '#f59e0b',  // amber
    UNAVAILABLE: '#6b7280'// gray
  };

  const statusChartData = metrics.status_distribution.map((item: any) => ({
    name: item.name,
    value: item.count,
    color: COLORS[item.name as keyof typeof COLORS] || '#94a3b8',
  }));

  const urgentCases = prescriptions.filter(p => p.urgency === 'URGENT' || p.urgency === 'EMERGENCY').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            Hospital Pharmacy Operations Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time decision support monitoring active ward, OR, and outpatient substitution requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenValidation}
            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCircle className="w-4 h-4 text-teal-400" />
            View Baseline & Validation Results
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Cases Evaluated</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{metrics.total_cases_evaluated}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">From synthetic dataset</span>
        </div>

        <div className="bg-slate-800/60 border border-emerald-500/30 rounded-xl p-4 bg-emerald-950/10">
          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Valid Recommended
          </p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{metrics.valid_recommendations}</p>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Passed all 7 clinical checks</span>
        </div>

        <div className="bg-slate-800/60 border border-rose-500/30 rounded-xl p-4 bg-rose-950/10">
          <p className="text-xs font-medium text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Blocked Unsafe
          </p>
          <p className="text-2xl font-bold text-rose-300 mt-1">{metrics.blocked_substitutions}</p>
          <span className="text-[11px] text-rose-500/80 mt-1 block">Allergy & patient constraints</span>
        </div>

        <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-4 bg-amber-950/10">
          <p className="text-xs font-medium text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Escalations Required
          </p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{metrics.escalated_cases}</p>
          <span className="text-[11px] text-amber-500/80 mt-1 block">Prescriber or clinical ambiguity</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Pending Reviews</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">{metrics.pending_human_reviews}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Human confirmation needed</span>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Avg Decision Latency</p>
          <p className="text-2xl font-bold text-teal-300 mt-1">{metrics.avg_decision_time_ms} ms</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Automated rule engine</span>
        </div>
      </div>

      {/* Analytics Charts & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decisions Distribution Chart */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Decision Outcomes Distribution</h3>
            <p className="text-xs text-slate-400">Proportion of BLOCK, RECOMMEND, ESCALATE & UNAVAILABLE.</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {statusChartData.map((st: any) => (
              <div key={st.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                <span className="text-slate-300 font-medium">{st.name}:</span>
                <span className="text-slate-400 ml-auto font-mono">{st.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decisions by Urgency */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Prescriptions by Urgency Tier</h3>
            <p className="text-xs text-slate-400">Distribution across Routine, Urgent, and Emergency cases.</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.urgency_distribution}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center">
            * Emergency cases automatically trigger Level-4 priority escalation workflows.
          </p>
        </div>

        {/* Priority Urgent Queue */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                High Priority Cases Queue
              </h3>
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                {urgentCases.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Cases requiring urgent pharmacist or prescriber review.</p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {urgentCases.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPrescription(p.id)}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{p.prescription_code}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.urgency === 'EMERGENCY'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {p.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{p.medicine_name}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectPrescription(prescriptions[0]?.id || 1)}
            className="w-full mt-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg border border-slate-600/50 transition flex items-center justify-center gap-1"
          >
            Open Full Prescription Queue
          </button>
        </div>
      </div>
    </div>
  );
};
