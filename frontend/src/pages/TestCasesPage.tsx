import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TestTube2,
  Play,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { TestCaseFixture, EvaluationResult } from '../types';

export const TestCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [testCases, setTestCases] = useState<TestCaseFixture[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  useEffect(() => {
    loadTestCases();
  }, []);

  const loadTestCases = async () => {
    setLoading(true);
    try {
      const data = await api.getTestCases();
      setTestCases(data);
    } catch (err) {
      console.error('Failed to load test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setRunning(true);
    try {
      const result = await api.runEvaluation();
      setEvaluationResult(result);
    } catch (err) {
      console.error('Failed to run evaluation suite:', err);
    } finally {
      setRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TestTube2 size={24} className="text-hospital-600" />
            Deterministic Synthetic Test Cases & Benchmark Suite
          </h1>
          <p className="text-xs text-slate-500">
            15 canonical clinical test fixtures covering safe substitutions, allergy cross-reactivities, stockouts, DAW policies, and ICU/OR acuity.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          <Play size={16} className={running ? 'animate-spin' : ''} />
          <span>{running ? 'Running Live Evaluation...' : 'Run 15-Case Benchmark'}</span>
        </button>
      </div>

      {/* Benchmark Results Summary (if evaluated) */}
      {evaluationResult && (
        <div className="bg-white rounded-2xl border border-hospital-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-hospital-600" />
              <h3 className="text-sm font-bold text-slate-900">Measured Baseline Evaluation Results</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Accuracy: {evaluationResult.accuracy}% ({evaluationResult.correct_decisions}/{evaluationResult.total_cases} Correct)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Cases</span>
              <p className="text-lg font-black text-slate-800">{evaluationResult.total_cases}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Approved</span>
              <p className="text-lg font-black text-emerald-700">{evaluationResult.approved}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <span className="text-[10px] font-bold text-rose-600 uppercase">Blocked</span>
              <p className="text-lg font-black text-rose-700">{evaluationResult.blocked}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-600 uppercase">Escalated</span>
              <p className="text-lg font-black text-amber-700">{evaluationResult.escalated}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Review Req.</span>
              <p className="text-lg font-black text-indigo-700">{evaluationResult.review_required}</p>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
              <span className="text-[10px] font-bold text-sky-600 uppercase">Human Reviews</span>
              <p className="text-lg font-black text-sky-700">{evaluationResult.human_review_count}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">False-Positive Escalation Rate:</span>
              <strong className="ml-1.5 text-emerald-700 font-mono">{evaluationResult.false_positive_escalation_rate}%</strong>
            </div>
            <div>
              <span className="text-slate-500">False-Negative Approval Rate:</span>
              <strong className="ml-1.5 text-emerald-700 font-mono">{evaluationResult.false_negative_approval_rate}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* 15 Test Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Canonical Clinical Fixtures ({testCases.length})
          </span>
          <span className="text-[11px] text-slate-400">Fixed Random Seed: 42</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading synthetic test suite...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {testCases.map((tc) => {
              const isExpanded = expandedCaseId === tc.test_id;
              // Check if benchmark evaluation result exists for this case
              const evalMatch = evaluationResult?.case_results?.find((c) => c.test_id === tc.test_id);

              return (
                <div key={tc.test_id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div
                    onClick={() => toggleExpand(tc.test_id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600 mt-0.5 sm:mt-0">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {tc.test_id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{tc.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {tc.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{tc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-semibold">Expected:</span>
                      <StatusBadge status={tc.expected_decision} size="sm" />
                      {evalMatch && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evalMatch.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {evalMatch.is_correct ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Payload & Expected Rules */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 pl-7 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-700 block">Prescription Input Attributes:</span>
                          <div className="text-slate-600 space-y-1 text-[11px]">
                            <p>Requested: <strong>{tc.payload.requested_medicine}</strong> ({tc.payload.dosage}, {tc.payload.route})</p>
                            <p>Alternative: <strong>{tc.payload.requested_alternative_id}</strong></p>
                            <p>Ward: {tc.payload.ward} | Urgency: {tc.payload.urgency}</p>
                            <p>Dispense As Written: {tc.payload.dispense_as_written ? 'YES' : 'NO'}</p>
                            <p>Patient Allergies: {tc.payload.patient_information?.allergies?.join(', ') || 'None'}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-700 block">Ground-Truth Expectations:</span>
                          <div className="text-slate-600 space-y-1 text-[11px]">
                            <p>Expected Verdict: <strong>{tc.expected_decision}</strong></p>
                            <p>Expected Failed Rules: {tc.expected_failed_rules.length > 0 ? tc.expected_failed_rules.join(', ') : 'None (Clean Clearance)'}</p>
                            <p>Human Review Expected: {tc.human_review_expected ? 'YES (Mandatory Hold)' : 'NO'}</p>
                            {evalMatch && (
                              <p className="text-hospital-700 font-bold mt-2">
                                Actual Evaluation Latency: {evalMatch.latency_ms} ms
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
