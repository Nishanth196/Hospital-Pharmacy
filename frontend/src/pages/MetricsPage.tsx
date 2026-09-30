import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  ShieldAlert,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { MetricsData } from '../types';

export const MetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const decisionDistData = metrics
    ? [
        { name: 'APPROVED', count: metrics.approved, color: '#10b981' },
        { name: 'BLOCKED', count: metrics.blocked, color: '#f43f5e' },
        { name: 'ESCALATED', count: metrics.escalated, color: '#f59e0b' },
        { name: 'REVIEW REQUIRED', count: metrics.review_required, color: '#6366f1' },
      ]
    : [];

  const ruleTriggerData = metrics?.rule_outcomes
    ? Object.entries(metrics.rule_outcomes).map(([rule, count]) => ({
        rule,
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={24} className="text-hospital-600" />
            System Performance & Operational Metrics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time measured system instrumentation calculated directly from persistent SQLite decisions and audit records.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs transition-colors"
        >
          <RotateCcw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Total Evaluated"
          value={metrics?.total_decisions ?? 0}
          icon={Layers}
          colorScheme="slate"
        />
        <MetricCard
          title="Escalation Rate"
          value={`${metrics?.escalation_rate ?? 0}%`}
          icon={AlertOctagon}
          colorScheme="amber"
          subtitle="Cases escalated for review"
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics?.average_latency_ms ?? 0}ms`}
          icon={TrendingUp}
          colorScheme="blue"
          subtitle="Real-time execution speed"
        />
        <MetricCard
          title="Avg Rules/Case"
          value={metrics?.average_rules_per_decision ?? 0}
          icon={Layers}
          colorScheme="slate"
          subtitle="Checklist pipeline depth"
        />
        <MetricCard
          title="Override Rate"
          value={`${metrics?.override_rate ?? 0}%`}
          icon={Percent}
          colorScheme="rose"
          subtitle="Clinical overrides"
        />
        <MetricCard
          title="False Pos. Escalation"
          value={`${metrics?.false_positive_escalation_rate ?? 0}%`}
          icon={ShieldAlert}
          colorScheme="emerald"
          subtitle="Benchmark measured"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Decision Distribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Decision Outcome Breakdown</h3>
              <p className="text-xs text-slate-500">Classification of all evaluated substitution proposals</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Total: {metrics?.total_decisions ?? 0}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionDistData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Decisions">
                  {decisionDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rule Failure & Trigger Outcomes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rule Trigger Frequency</h3>
              <p className="text-xs text-slate-500">Distribution of individual rule outcomes across cases</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              RULE-001 to RULE-009
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ruleTriggerData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rule" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0369a1" radius={[4, 4, 0, 0]} name="Trigger Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Clinical Metrics Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Detailed Instrumentation Metrics Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Metric Indicator</th>
                <th className="py-2.5 px-4">Measured Value</th>
                <th className="py-2.5 px-4">Calculation Source / Formula</th>
                <th className="py-2.5 px-4">Clinical Governance Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Total Decisions Evaluated</td>
                <td className="py-3 px-4 font-mono font-bold text-hospital-600">{metrics?.total_decisions ?? 0}</td>
                <td className="py-3 px-4 text-slate-500">SELECT COUNT(*) FROM decisions</td>
                <td className="py-3 px-4 text-slate-600">Active institutional workload</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Average Pipeline Latency</td>
                <td className="py-3 px-4 font-mono font-bold text-hospital-600">{metrics?.average_latency_ms ?? 0} ms</td>
                <td className="py-3 px-4 text-slate-500">Real-time timer over 15 evaluation steps</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">&lt; 50 ms (Sub-second response)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Escalation Rate</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-600">{metrics?.escalation_rate ?? 0}%</td>
                <td className="py-3 px-4 text-slate-500">(Escalated / Total Decisions) * 100</td>
                <td className="py-3 px-4 text-slate-600">Expected 10% - 35% based on acuity</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">Override Authorization Rate</td>
                <td className="py-3 px-4 font-mono font-bold text-rose-600">{metrics?.override_rate ?? 0}%</td>
                <td className="py-3 px-4 text-slate-500">(Approved Overrides / Total Decisions) * 100</td>
                <td className="py-3 px-4 text-slate-600">Audited by Pharmacy Committee</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">False-Positive Escalation Rate</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">{metrics?.false_positive_escalation_rate ?? 0}%</td>
                <td className="py-3 px-4 text-slate-500">15-case synthetic ground-truth benchmark</td>
                <td className="py-3 px-4 text-emerald-600 font-bold">0.0% Verified</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
