import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  FileText,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { MetricsData, DecisionOutput } from '../types';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [pendingDecisions, setPendingDecisions] = useState<DecisionOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        api.getMetrics(),
        api.getPendingDecisions(),
      ]);
      setMetrics(m);
      setPendingDecisions(p);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pie chart data for decision distribution
  const pieData = metrics
    ? [
        { name: 'APPROVED', value: metrics.approved, color: '#10b981' },
        { name: 'BLOCKED', value: metrics.blocked, color: '#f43f5e' },
        { name: 'ESCALATED', value: metrics.escalated, color: '#f59e0b' },
        { name: 'REVIEW REQUIRED', value: metrics.review_required, color: '#6366f1' },
      ].filter((d) => d.value > 0)
    : [];

  // Bar chart data for rule outcomes
  const ruleData = metrics?.rule_outcomes
    ? Object.entries(metrics.rule_outcomes).map(([rule, count]) => ({
        rule,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-hospital-900 via-hospital-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-hospital-500/30 text-hospital-200 border border-hospital-400/30">
                Hospital Inpatient Pharmacy
              </span>
              <span className="text-xs text-slate-300">Live Decision Matrix</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1">Substitution Decision Support</h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Deterministic, explainable clinical evaluation pipeline enforcing hospital formulary standards, allergy safety, organ constraints, and high-impact drug safeguards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/check"
              className="inline-flex items-center gap-2 px-4 py-2 bg-hospital-500 hover:bg-hospital-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Zap size={16} />
              <span>Check Substitution</span>
            </Link>
            <Link
              to="/human-review"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
            >
              <Clock size={16} />
              <span>Review Queue ({pendingDecisions.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          title="Total Decisions"
          value={metrics?.total_decisions ?? 0}
          icon={Layers}
          colorScheme="slate"
        />
        <MetricCard
          title="Approved"
          value={metrics?.approved ?? 0}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <MetricCard
          title="Blocked"
          value={metrics?.blocked ?? 0}
          icon={XCircle}
          colorScheme="rose"
        />
        <MetricCard
          title="Escalated"
          value={metrics?.escalated ?? 0}
          icon={AlertOctagon}
          colorScheme="amber"
        />
        <MetricCard
          title="Review Req."
          value={metrics?.review_required ?? 0}
          icon={Clock}
          colorScheme="indigo"
        />
        <MetricCard
          title="Human Reviews"
          value={metrics?.human_reviews_count ?? 0}
          icon={ShieldCheck}
          colorScheme="blue"
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics?.average_latency_ms ?? 0}ms`}
          icon={TrendingUp}
          colorScheme="slate"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Decision Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Decision Outcome Distribution</h3>
              <p className="text-xs text-slate-500">Live proportion of automated clearance vs safety holds</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {metrics?.total_decisions ?? 0} Evaluated
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs">No decision data recorded yet</div>
            )}
          </div>
        </div>

        {/* Chart 2: Rule Outcomes & Frequencies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Deterministic Rule Triggers</h3>
              <p className="text-xs text-slate-500">Frequency of rule evaluations across prescriptions</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              9 Rules Monitored
            </span>
          </div>

          <div className="h-64">
            {ruleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ruleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="rule" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} name="Trigger Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">No rule data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Human Review Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Review Queue</h3>
              <p className="text-xs text-slate-500">Cases requiring pharmacist confirmation or clinical override</p>
            </div>
          </div>
          <Link
            to="/human-review"
            className="text-xs font-bold text-hospital-600 hover:text-hospital-700 flex items-center gap-1"
          >
            <span>View All ({pendingDecisions.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {pendingDecisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <ShieldCheck size={28} className="mx-auto text-emerald-500 mb-2" />
              <span>All pending substitution reviews are up to date!</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Decision ID</th>
                  <th className="py-3 px-4">Prescription</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Drug & Alternative</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Risk</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingDecisions.slice(0, 5).map((d) => (
                  <tr key={d.decision_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{d.decision_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{d.prescription_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{d.patient_id}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-semibold">{d.requested_medicine}</div>
                      <div className="text-[11px] text-slate-500">Alt: {d.alternative_name || d.alternative_id || 'Formulary Generic'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.decision} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={d.risk_level} size="sm" showIcon={false} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/human-review?id=${d.decision_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-hospital-50 hover:bg-hospital-100 text-hospital-700 font-bold rounded-lg border border-hospital-200 transition-colors"
                      >
                        <span>Review</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
