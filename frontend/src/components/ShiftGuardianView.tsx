import React, { useState, useEffect } from 'react';
import { ShiftEvaluateResponse, Industry } from '../types';
import { api } from '../services/api';
import { 
  Clock, AlertTriangle, CheckCircle2, ShieldAlert, 
  Sparkles, RefreshCw, Calendar, Check
} from 'lucide-react';

interface ShiftGuardianViewProps {
  selectedIndustry: Industry;
}

export const ShiftGuardianView: React.FC<ShiftGuardianViewProps> = ({ selectedIndustry }) => {
  // Input State
  const [workerName, setWorkerName] = useState('Murugan S.');
  const [industry, setIndustry] = useState<string>(selectedIndustry === 'All' ? 'Construction' : selectedIndustry);
  const [siteName, setSiteName] = useState('Apex Heights Metro Tower (Tower B)');
  const [shiftDate, setShiftDate] = useState('2026-10-27');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('21:30');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [restHoursBefore, setRestHoursBefore] = useState(7.0);
  const [consecutiveDays, setConsecutiveDays] = useState(7);

  // Results & Table State
  const [result, setResult] = useState<ShiftEvaluateResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [schedules, setSchedules] = useState<ShiftEvaluateResponse[]>([]);
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    if (selectedIndustry !== 'All') {
      setIndustry(selectedIndustry);
    }
  }, [selectedIndustry]);

  useEffect(() => {
    loadSchedules();
  }, [selectedIndustry, riskFilter]);

  const loadSchedules = async () => {
    try {
      const data = await api.getShiftSchedules(selectedIndustry, riskFilter);
      setSchedules(data);
    } catch (err) {
      console.error('Failed to load shift schedules', err);
    }
  };

  const applyRosterPreset = (preset: 'murugan' | 'anbu' | 'selvam' | 'deepa') => {
    setSaveSuccess(false);
    if (preset === 'murugan') {
      setWorkerName('Murugan S.');
      setIndustry('Construction');
      setSiteName('Apex Heights Metro Tower (Tower B)');
      setStartTime('07:00');
      setEndTime('21:30');
      setBreakMinutes(60);
      setRestHoursBefore(7.0);
      setConsecutiveDays(7);
    } else if (preset === 'anbu') {
      setWorkerName('Anbu R.');
      setIndustry('College Facilities');
      setSiteName('SRM Tech Park & Engineering Complex');
      setStartTime('06:00');
      setEndTime('22:00');
      setBreakMinutes(60);
      setRestHoursBefore(6.5);
      setConsecutiveDays(9);
    } else if (preset === 'selvam') {
      setWorkerName('Selvam P.');
      setIndustry('Construction');
      setSiteName('Coromandel Infrastructure Overpass');
      setStartTime('08:00');
      setEndTime('17:00');
      setBreakMinutes(60);
      setRestHoursBefore(14.0);
      setConsecutiveDays(4);
    } else if (preset === 'deepa') {
      setWorkerName('Deepa S.');
      setIndustry('College Facilities');
      setSiteName('SRM Campus Hostels & Dining Hall 3');
      setStartTime('07:30');
      setEndTime('16:30');
      setBreakMinutes(60);
      setRestHoursBefore(15.0);
      setConsecutiveDays(3);
    }
  };

  const handleEvaluate = async (save = false) => {
    try {
      setEvaluating(true);
      setSaveSuccess(false);
      const payload = {
        worker_name: workerName,
        industry,
        site_name: siteName,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        break_minutes: Number(breakMinutes),
        rest_hours_before: Number(restHoursBefore),
        consecutive_days: Number(consecutiveDays),
        save_record: save,
      };

      const res = await api.evaluateShift(payload);
      setResult(res);
      if (save) {
        setSaveSuccess(true);
        loadSchedules();
      }
    } catch (err: any) {
      alert(`Shift evaluation error: ${err?.message || 'Server error'}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A31C1B]/15 text-[#A31C1B] border border-[#A31C1B]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2]">
                ShiftGuardian — Fatigue &amp; Schedule Risk
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Occupational sleep science &amp; statutory rest limits for frontline shifts.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-[#171717] p-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-neutral-400 px-2 uppercase font-medium">Demo Rosters:</span>
          <button
            onClick={() => applyRosterPreset('murugan')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 transition-all cursor-pointer"
          >
            Murugan (13.5h Double Shift)
          </button>
          <button
            onClick={() => applyRosterPreset('anbu')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 transition-all cursor-pointer"
          >
            Anbu (15h Campus Security)
          </button>
          <button
            onClick={() => applyRosterPreset('selvam')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1FB882]/15 hover:bg-[#1FB882]/25 text-[#1FB882] border border-[#1FB882]/30 transition-all cursor-pointer"
          >
            Selvam (Standard 8h)
          </button>
        </div>
      </div>

      {/* Grid: Form (5 cols) + Evaluation (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-display font-semibold text-sm text-[#F8F7F2]">
              Shift Schedule Parameters
            </span>
            <span className="text-[10px] font-mono text-[#1FB882] bg-[#1FB882]/10 px-2 py-0.5 rounded border border-[#1FB882]/20">
              ILO Guidelines
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Worker Name & Industry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Worker Name</label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                >
                  <option value="Construction">Construction</option>
                  <option value="College Facilities">College Facilities</option>
                </select>
              </div>
            </div>

            {/* Date & Site */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Shift Date</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs font-mono bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Site / Facility</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>
            </div>

            {/* Shift Hours & Break */}
            <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-2">
              <span className="text-neutral-300 font-medium block">Working Hours &amp; Meal Break</span>
              <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono">
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg px-2 py-1.5 text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg px-2 py-1.5 text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">Break (Mins)</label>
                  <input
                    type="number"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    className="w-full rounded-lg px-2 py-1.5 text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  />
                </div>
              </div>
            </div>

            {/* Rest & Streak */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-300 font-medium mb-1">
                  Rest Hours Prior to Shift
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={restHoursBefore}
                  onChange={(e) => setRestHoursBefore(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono text-xs text-amber-300 bg-[#121212] border border-amber-500/30 focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Recommended: ≥ 11 hours
                </span>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Consecutive Workdays
                </label>
                <input
                  type="number"
                  value={consecutiveDays}
                  onChange={(e) => setConsecutiveDays(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Statutory ceiling: ≤ 6 days
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleEvaluate(false)}
                disabled={evaluating}
                className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A31C1B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Fatigue Rules...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Evaluate Shift Risk</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleEvaluate(true)}
                disabled={evaluating}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Save to Roster Register</span>
              </button>

              {saveSuccess && (
                <div className="p-2 rounded-lg bg-[#1FB882]/15 border border-[#1FB882]/30 text-xs text-[#1FB882] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Shift schedule saved to register!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assessment Details */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-5 shadow-xl">
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">
                    Fatigue Risk Rating
                  </span>
                  <h3 className="font-display font-bold text-base text-[#F8F7F2]">
                    {result.worker_name} • {result.shift_date}
                  </h3>
                </div>

                <div className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  result.risk_level === 'CRITICAL'
                    ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/40'
                    : result.risk_level === 'HIGH'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : result.risk_level === 'MODERATE'
                    ? 'bg-amber-400/15 text-amber-300'
                    : 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/40'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{result.risk_level} RISK</span>
                </div>
              </div>

              {/* 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Net Work Duty</span>
                  <div className={`text-lg font-display font-bold ${
                    result.total_hours > 12 ? 'text-[#A31C1B]' :
                    result.total_hours > 10 ? 'text-amber-300' : 'text-[#F8F7F2]'
                  }`}>
                    {result.total_hours} hrs
                  </div>
                  <span className="text-[10px] text-neutral-400">Excl. breaks</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Gross Span</span>
                  <div className="text-lg font-display font-bold text-[#F8F7F2]">
                    {result.gross_hours} hrs
                  </div>
                  <span className="text-[10px] text-neutral-400">{result.start_time} - {result.end_time}</span>
                </div>

                <div className={`p-3 rounded-xl bg-[#121212] border space-y-0.5 ${
                  result.rest_hours_before < 8 ? 'border-[#A31C1B]/50' : 'border-white/10'
                }`}>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Prior Rest</span>
                  <div className={`text-lg font-display font-bold ${
                    result.rest_hours_before < 8 ? 'text-[#A31C1B]' :
                    result.rest_hours_before < 11 ? 'text-amber-300' : 'text-[#1FB882]'
                  }`}>
                    {result.rest_hours_before} hrs
                  </div>
                  <span className="text-[10px] text-neutral-400">Between shifts</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Streak</span>
                  <div className={`text-lg font-display font-bold ${
                    result.consecutive_days >= 7 ? 'text-[#A31C1B]' : 'text-[#F8F7F2]'
                  }`}>
                    {result.consecutive_days} Days
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {result.consecutive_days >= 7 ? 'Rest Overdue' : 'Normal Streak'}
                  </span>
                </div>
              </div>

              {/* Triggered Rules */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-amber-300 tracking-wider flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Triggered Fatigue Rules ({result.triggered_rules.length})</span>
                </span>

                {result.triggered_rules.length > 0 ? (
                  <div className="space-y-1.5">
                    {result.triggered_rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border space-y-0.5 text-xs ${
                          rule.severity === 'CRITICAL' ? 'bg-[#A31C1B]/10 border-[#A31C1B]/30' :
                          rule.severity === 'HIGH' ? 'bg-amber-400/10 border-amber-400/30' :
                          'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-200">{rule.rule_name}</span>
                          <span className={`px-2 py-0.2 rounded font-mono font-bold text-[10px] ${
                            rule.severity === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                            rule.severity === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                            'bg-white/10 text-neutral-300'
                          }`}>
                            {rule.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#06110C] border border-[#1FB882]/30 text-xs text-[#1FB882] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No fatigue guideline breaches detected. Schedule parameters approved.</span>
                  </div>
                )}
              </div>

              {/* Action Directive */}
              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 text-xs space-y-1">
                <span className="font-semibold text-[#1FB882] flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Supervisor Action Directive</span>
                </span>
                <p className="text-neutral-200 text-[11px] leading-relaxed">
                  {result.recommended_action}
                </p>
              </div>

              <p className="text-[10px] text-neutral-400 italic leading-tight pt-1">
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#171717] border border-white/10 p-10 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A31C1B] mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[#F8F7F2]">
                No Shift Evaluated
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Select a preset on top or enter shift times on the left, then click <strong>“Evaluate Shift Risk”</strong>.
              </p>
              <button
                onClick={() => applyRosterPreset('murugan')}
                className="px-3.5 py-1.5 rounded-lg bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Load Murugan S. Preset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roster Register Table */}
      <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-sm text-[#F8F7F2]">
              Active Shift Roster Register
            </h2>
            <p className="text-[11px] text-neutral-400">All reviewed worker shift entries.</p>
          </div>

          <div className="flex items-center gap-1 text-xs bg-[#121212] p-1 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono text-neutral-400 px-1 uppercase">Filter:</span>
            {['All', 'CRITICAL', 'HIGH', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  riskFilter === lvl ? 'bg-[#A31C1B] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 font-mono text-neutral-400 text-[10px] uppercase">
                <th className="py-2 px-3">Worker</th>
                <th className="py-2 px-3">Industry</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Duty Hours</th>
                <th className="py-2 px-3">Prior Rest</th>
                <th className="py-2 px-3">Consecutive Days</th>
                <th className="py-2 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-xs">
              {schedules.length > 0 ? (
                schedules.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 font-sans font-medium text-[#F8F7F2]">{row.worker_name}</td>
                    <td className="py-2 px-3 text-neutral-400">{row.industry}</td>
                    <td className="py-2 px-3 text-neutral-400">{row.shift_date}</td>
                    <td className="py-2 px-3 text-neutral-300">{row.start_time} - {row.end_time} ({row.total_hours}h)</td>
                    <td className={`py-2 px-3 ${row.rest_hours_before < 8 ? 'text-[#A31C1B] font-bold' : 'text-neutral-300'}`}>
                      {row.rest_hours_before} hrs
                    </td>
                    <td className={`py-2 px-3 ${row.consecutive_days >= 7 ? 'text-[#A31C1B] font-bold' : 'text-neutral-300'}`}>
                      {row.consecutive_days} days
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.risk_level === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                        row.risk_level === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                      }`}>
                        {row.risk_level}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-400">
                    No shift schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
