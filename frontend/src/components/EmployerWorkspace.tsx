import React, { useState, useEffect } from 'react';
import { ActiveTab, Industry, SafetyReport, WageCalculateResponse, ShiftEvaluateResponse } from '../types';
import { api } from '../services/api';
import { 
  Briefcase, ShieldCheck, Calculator, Clock, 
  ArrowRight, Check, HardHat, GraduationCap
} from 'lucide-react';

interface EmployerWorkspaceProps {
  onNavigate: (tab: ActiveTab) => void;
  selectedIndustry: Industry;
  onSelectIndustry: (ind: Industry) => void;
}

export const EmployerWorkspace: React.FC<EmployerWorkspaceProps> = ({
  onNavigate,
  selectedIndustry,
  onSelectIndustry
}) => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [wageChecks, setWageChecks] = useState<WageCalculateResponse[]>([]);
  const [shifts, setShifts] = useState<ShiftEvaluateResponse[]>([]);
  const [activeSection, setActiveSection] = useState<'hazards' | 'wages' | 'shifts'>('hazards');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadAll = async () => {
    try {
      const [r, w, s] = await Promise.all([
        api.getSafetyReports({ industry: selectedIndustry }),
        api.getWageChecks(selectedIndustry, 'POTENTIAL_DISCREPANCY'),
        api.getShiftSchedules(selectedIndustry, 'CRITICAL'),
      ]);
      setReports(r);
      setWageChecks(w);
      setShifts(s);
    } catch (e) {
      console.error('Error loading employer workspace', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedIndustry]);

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      setUpdatingId(reportId);
      await api.updateReportStatus(
        reportId,
        newStatus,
        'Employer Supervisor Demo',
        `Operational status changed to ${newStatus}`
      );
      loadAll();
    } catch (e: any) {
      alert(e?.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A31C1B]/15 text-[#A31C1B] border border-[#A31C1B]/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2]">
                Employer Workforce Risk Console
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Supervisory review center for physical hazards, wage compliance variances, and schedule fatigue.
              </p>
            </div>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-1.5 bg-[#171717] p-1.5 rounded-xl border border-white/10 text-xs self-start md:self-auto">
          <span className="text-[10px] font-mono text-neutral-400 px-2 uppercase font-medium">Filter Sector:</span>
          <button
            onClick={() => onSelectIndustry('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'All' ? 'bg-[#A31C1B] text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSelectIndustry('Construction')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'Construction' ? 'bg-[#A31C1B] text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Construction</span>
          </button>
          <button
            onClick={() => onSelectIndustry('College Facilities')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedIndustry === 'College Facilities' ? 'bg-[#A31C1B] text-white font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>College Facilities</span>
          </button>
        </div>
      </div>

      {/* 3 Overview Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          onClick={() => setActiveSection('hazards')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSection === 'hazards'
              ? 'bg-[#171717] border-[#A31C1B]/60 shadow-lg shadow-[#A31C1B]/10'
              : 'bg-[#171717] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Active Safety Queue</span>
            <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F8F7F2]">
            {reports.length} Reports
          </div>
          <div className="text-[11px] text-[#A31C1B] mt-0.5 font-medium">
            {reports.filter(r => r.priority === 'CRITICAL').length} Critical flags
          </div>
        </button>

        <button
          onClick={() => setActiveSection('wages')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSection === 'wages'
              ? 'bg-[#171717] border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'bg-[#171717] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Wage Discrepancies</span>
            <Calculator className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-bold text-amber-300">
            {wageChecks.length} Flagged
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Total delta: ₹{wageChecks.reduce((acc, c) => acc + c.discrepancy, 0).toLocaleString('en-IN')}
          </div>
        </button>

        <button
          onClick={() => setActiveSection('shifts')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSection === 'shifts'
              ? 'bg-[#171717] border-[#1FB882]/60 shadow-lg shadow-[#1FB882]/10'
              : 'bg-[#171717] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="font-mono uppercase font-semibold text-[10px]">Fatigue Breaches</span>
            <Clock className="w-4 h-4 text-[#1FB882]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#1FB882]">
            {shifts.length} Critical Shifts
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Overtime &gt;12h or rest &lt;8h
          </div>
        </button>
      </div>

      {/* Hazards Section */}
      {activeSection === 'hazards' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-[#F8F7F2] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
              <span>Safety Reports Requiring Supervisor Action</span>
            </h2>
            <button
              onClick={() => onNavigate('silentshield')}
              className="text-xs text-[#1FB882] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>SilentShield Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reports.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-xl bg-[#171717] border space-y-3 transition-all ${
                  r.priority === 'CRITICAL' ? 'border-[#A31C1B]/50 shadow-md shadow-[#A31C1B]/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.2 rounded font-mono font-bold text-[10px] ${
                        r.priority === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                        r.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                      }`}>
                        {r.priority}
                      </span>
                      <span className="font-mono text-xs text-neutral-400">{r.reference_id}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400">{r.category}</span>
                    </div>
                    <h3 className="font-bold text-xs text-[#F8F7F2]">{r.title}</h3>
                  </div>

                  <span className="px-2 py-0.2 rounded bg-white/5 border border-white/10 font-mono text-[10px] uppercase text-neutral-300">
                    {r.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{r.description}</p>

                <div className="p-2.5 rounded-lg bg-[#121212] border border-white/10 text-[11px] space-y-0.5">
                  <span className="text-amber-300 font-semibold block">Directive:</span>
                  <p className="text-neutral-300">{r.recommended_action}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/10">
                  <span className="text-neutral-400 text-[11px]">📍 {r.site_name}</span>

                  <div className="flex items-center gap-1.5">
                    {r.status === 'OPEN' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'ACKNOWLEDGED')}
                        disabled={updatingId === r.id}
                        className="px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {r.status === 'ACKNOWLEDGED' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'UNDER_INVESTIGATION')}
                        disabled={updatingId === r.id}
                        className="px-2.5 py-1 rounded bg-[#1FB882]/20 hover:bg-[#1FB882]/30 text-[#1FB882] border border-[#1FB882]/30 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Start Investigation
                      </button>
                    )}
                    {r.status === 'UNDER_INVESTIGATION' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                        disabled={updatingId === r.id}
                        className="px-2.5 py-1 rounded bg-[#1FB882] hover:bg-[#199d6e] text-[#06110C] font-bold text-[11px] shadow-md shadow-[#1FB882]/20 transition-all cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                    {r.status === 'RESOLVED' && (
                      <span className="text-[#1FB882] font-semibold text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wages Section */}
      {activeSection === 'wages' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-[#F8F7F2] flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#A31C1B]" />
              <span>Wage Discrepancies Requiring Payroll Reconciliation</span>
            </h2>
            <button
              onClick={() => onNavigate('fairpay')}
              className="text-xs text-[#A31C1B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>FairPay AI Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {wageChecks.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#F8F7F2]">{w.worker_name} ({w.industry})</h3>
                    <p className="text-[11px] text-neutral-400">Period: {w.period} • Site: {w.site_name}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30 font-mono font-bold text-[11px]">
                    ₹{w.discrepancy.toLocaleString('en-IN')} Shortfall
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono p-2.5 rounded-lg bg-[#121212] border border-white/10">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Regular Hours</span>
                    <span className="font-bold text-[#F8F7F2]">{w.regular_hours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-300 block">Overtime Hours</span>
                    <span className="font-bold text-amber-300">{w.overtime_hours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Disbursed</span>
                    <span className="font-bold text-[#F8F7F2]">₹{w.recorded_pay.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#1FB882] block">Statutory Baseline</span>
                    <span className="font-bold text-[#1FB882]">₹{w.expected_pay.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {w.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shifts Section */}
      {activeSection === 'shifts' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-sm text-[#F8F7F2] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1FB882]" />
              <span>Fatigue Roster Risks Requiring Schedule Adjustment</span>
            </h2>
            <button
              onClick={() => onNavigate('shiftguardian')}
              className="text-xs text-[#1FB882] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>ShiftGuardian Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {shifts.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#F8F7F2]">{s.worker_name}</h3>
                    <p className="text-[11px] text-neutral-400">{s.shift_date} • {s.site_name}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30 font-mono font-bold text-[11px]">
                    CRITICAL FATIGUE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono p-2.5 rounded-lg bg-[#121212] border border-white/10">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Duty Duration</span>
                    <span className="font-bold text-[#A31C1B]">{s.total_hours} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Prior Rest Window</span>
                    <span className="font-bold text-amber-300">{s.rest_hours_before} hrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Consecutive Days</span>
                    <span className="font-bold text-[#F8F7F2]">{s.consecutive_days} days</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#06110C] border border-[#1FB882]/20 text-[11px] space-y-0.5">
                  <span className="text-[#1FB882] font-semibold block">Roster Directive:</span>
                  <p className="text-neutral-200">{s.recommended_action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
