import React, { useEffect, useState } from 'react';
import { DashboardMetrics, Industry, ActiveTab } from '../types';
import { api } from '../services/api';
import { 
  Users, AlertTriangle, Calculator, Clock, ShieldCheck, 
  ArrowRight, HardHat, GraduationCap, RefreshCw
} from 'lucide-react';

interface DashboardViewProps {
  selectedIndustry: Industry;
  onSelectIndustry: (ind: Industry) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedIndustry,
  onSelectIndustry,
  onNavigate,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardMetrics(selectedIndustry);
      setMetrics(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedIndustry]);

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-7 h-7 text-[#1FB882] animate-spin" />
        <p className="text-xs text-neutral-400">Loading live workforce telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-[#A31C1B]/10 border border-[#A31C1B]/30 text-center space-y-2.5 max-w-md mx-auto my-12">
        <AlertTriangle className="w-6 h-6 text-[#A31C1B] mx-auto" />
        <h3 className="font-display font-bold text-sm text-[#F8F7F2]">Unable to Load Metrics</h3>
        <p className="text-xs text-neutral-400">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-3.5 py-1.5 rounded-lg bg-[#A31C1B] hover:bg-[#851615] text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-[#A31C1B]/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header & Industry Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2] flex items-center gap-2.5">
            <span>Workforce Intelligence Overview</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1FB882]/10 text-[#1FB882] border border-[#1FB882]/30">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time monitoring across wage consistency, physical safety reports, and schedule fatigue.
          </p>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#171717] p-1.5 rounded-xl border border-white/10 text-xs self-start md:self-auto">
          <button
            onClick={() => onSelectIndustry('All')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'All'
                ? 'bg-[#A31C1B] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Sectors
          </button>
          <button
            onClick={() => onSelectIndustry('Construction')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'Construction'
                ? 'bg-[#A31C1B] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Construction</span>
          </button>
          <button
            onClick={() => onSelectIndustry('College Facilities')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'College Facilities'
                ? 'bg-[#A31C1B] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>College Facilities</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase text-[10px]">Active Workers</span>
            <Users className="w-4 h-4 text-[#1FB882]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F8F7F2]">
            {metrics?.total_workers || 0}
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Rostered personnel</span>
            <span className="text-[#1FB882] font-medium">100% Verified</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase text-[10px]">Open Safety Reports</span>
            <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#F8F7F2]">
              {metrics?.open_safety_reports || 0}
            </span>
            {(metrics?.critical_safety_reports || 0) > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30 font-mono font-bold">
                {metrics?.critical_safety_reports} CRITICAL
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>SilentShield Queue</span>
            <button
              onClick={() => onNavigate('silentshield')}
              className="text-[#A31C1B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase text-[10px]">Wage Discrepancies</span>
            <Calculator className="w-4 h-4 text-[#A31C1B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-[#A31C1B]">
              {metrics?.wage_discrepancies_count || 0}
            </span>
            <span className="text-xs font-mono text-[#A31C1B] font-semibold">
              ₹{metrics?.wage_discrepancy_total_inr.toLocaleString('en-IN') || 0}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>FairPay Review</span>
            <button
              onClick={() => onNavigate('fairpay')}
              className="text-[#A31C1B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Audit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase text-[10px]">Fatigue Alerts</span>
            <Clock className="w-4 h-4 text-[#1FB882]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F8F7F2]">
            {metrics?.schedule_risks_count || 0}
          </div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>ShiftGuardian</span>
            <button
              onClick={() => onNavigate('shiftguardian')}
              className="text-[#1FB882] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Roster</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Hazards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-bold text-[#F8F7F2] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
              <span>Priority Hazard Reports</span>
            </h2>
            <button
              onClick={() => onNavigate('silentshield')}
              className="text-xs text-[#1FB882] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Reports</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics?.recent_reports && metrics.recent_reports.length > 0 ? (
              metrics.recent_reports.slice(0, 4).map((report) => (
                <div
                  key={report.id}
                  className={`p-3.5 rounded-xl bg-[#171717] border transition-all ${
                    report.priority === 'CRITICAL'
                      ? 'border-[#A31C1B]/60 hover:border-[#A31C1B] shadow-md shadow-[#A31C1B]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded font-mono font-bold text-[10px] ${
                        report.priority === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                        report.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        'bg-white/5 text-neutral-300 border border-white/10'
                      }`}>
                        {report.priority}
                      </span>
                      <span className="font-mono text-neutral-400 text-xs">{report.reference_id}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-neutral-400 text-xs">{report.category}</span>
                    </div>

                    <span className="px-2 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-300 font-mono text-[10px] uppercase">
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-[#F8F7F2] mb-1">
                    {report.title}
                  </h3>

                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2 border-t border-white/10 mt-2">
                    <span>📍 {report.site_name}</span>
                    <span>{report.is_confidential ? 'Confidential' : report.reporter_name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-neutral-400 bg-[#171717] rounded-xl border border-white/10">
                No active safety reports found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Wage Audits & Shift Risks */}
        <div className="space-y-5">
          {/* Wage Audits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-display font-bold text-[#F8F7F2] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#A31C1B]" />
                <span>Recent FairPay Checks</span>
              </h2>
              <button
                onClick={() => onNavigate('fairpay')}
                className="text-xs text-[#A31C1B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Check Wages</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {metrics?.recent_wage_checks && metrics.recent_wage_checks.length > 0 ? (
                metrics.recent_wage_checks.slice(0, 3).map((check) => (
                  <div
                    key={check.id}
                    className="p-3 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-[#F8F7F2]">
                        <span>{check.worker_name}</span>
                        <span className="text-neutral-400 font-mono text-[10px]">({check.industry})</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {check.regular_hours}h reg + {check.overtime_hours}h OT • Paid: ₹{check.recorded_pay.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.2 rounded font-mono font-bold text-[10px] ${
                        check.status === 'POTENTIAL_DISCREPANCY'
                          ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30'
                          : check.status === 'NEEDS_REVIEW'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                      }`}>
                        {check.status === 'POTENTIAL_DISCREPANCY' ? `₹${check.discrepancy.toLocaleString('en-IN')} Short` :
                         check.status === 'NEEDS_REVIEW' ? 'Review' : 'Consistent'}
                      </span>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        Exp: ₹{check.expected_pay.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-neutral-400 bg-[#171717] rounded-xl border border-white/10">
                  No wage checks found.
                </div>
              )}
            </div>
          </div>

          {/* Shift Risks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-display font-bold text-[#F8F7F2] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#1FB882]" />
                <span>Roster Fatigue Alerts</span>
              </h2>
              <button
                onClick={() => onNavigate('shiftguardian')}
                className="text-xs text-[#1FB882] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Shift Evaluator</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {metrics?.recent_shifts && metrics.recent_shifts.length > 0 ? (
                metrics.recent_shifts.slice(0, 3).map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#F8F7F2]">{shift.worker_name}</span>
                        <span className={`px-2 py-0.2 rounded font-mono font-bold text-[10px] ${
                          shift.risk_level === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                          shift.risk_level === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                          'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                        }`}>
                          {shift.risk_level}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {shift.start_time} - {shift.end_time} ({shift.total_hours}h duty) • {shift.rest_hours_before}h rest
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-neutral-400">
                      Streak: {shift.consecutive_days} days
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-neutral-400 bg-[#171717] rounded-xl border border-white/10">
                  No shift schedules found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
