import React, { useState, useEffect } from 'react';
import { WageCalculateRequest, WageCalculateResponse, Industry } from '../types';
import { api } from '../services/api';
import { 
  Calculator, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, RefreshCw, FileText, Check
} from 'lucide-react';

interface FairPayViewProps {
  selectedIndustry: Industry;
}

export const FairPayView: React.FC<FairPayViewProps> = ({ selectedIndustry }) => {
  // Form State
  const [workerName, setWorkerName] = useState('Raman K.');
  const [industry, setIndustry] = useState<string>(selectedIndustry === 'All' ? 'Construction' : selectedIndustry);
  const [siteName, setSiteName] = useState('Apex Heights Metro Tower (Tower B)');
  const [period, setPeriod] = useState('Oct 20-26, 2026');
  const [rateType, setRateType] = useState<'DAILY' | 'HOURLY'>('DAILY');
  const [baseRate, setBaseRate] = useState<number>(750);
  const [regularHours, setRegularHours] = useState<number>(48);
  const [overtimeHours, setOvertimeHours] = useState<number>(14);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(2.0);
  const [recordedPay, setRecordedPay] = useState<number>(5500);

  // Results & History State
  const [result, setResult] = useState<WageCalculateResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentChecks, setRecentChecks] = useState<WageCalculateResponse[]>([]);
  const [historyFilter, setHistoryFilter] = useState('All');

  // Sync industry when prop changes
  useEffect(() => {
    if (selectedIndustry !== 'All') {
      setIndustry(selectedIndustry);
      if (selectedIndustry === 'Construction') {
        setSiteName('Apex Heights Metro Tower (Tower B)');
      } else {
        setSiteName('SRM Tech Park & Engineering Complex');
      }
    }
  }, [selectedIndustry]);

  const loadChecks = async () => {
    try {
      const data = await api.getWageChecks(selectedIndustry, historyFilter);
      setRecentChecks(data);
    } catch (err) {
      console.error('Failed to load past wage checks', err);
    }
  };

  useEffect(() => {
    loadChecks();
  }, [selectedIndustry, historyFilter]);

  // Demonstration Presets
  const applyPreset = (preset: 'raman' | 'selvam' | 'lakshmi' | 'karthik') => {
    setSaveSuccess(false);
    if (preset === 'raman') {
      setWorkerName('Raman K.');
      setIndustry('Construction');
      setSiteName('Apex Heights Metro Tower (Tower B)');
      setRateType('DAILY');
      setBaseRate(750);
      setRegularHours(48);
      setOvertimeHours(14);
      setOvertimeMultiplier(2.0);
      setRecordedPay(5500);
    } else if (preset === 'selvam') {
      setWorkerName('Selvam P.');
      setIndustry('Construction');
      setSiteName('Coromandel Infrastructure Overpass');
      setRateType('HOURLY');
      setBaseRate(95);
      setRegularHours(40);
      setOvertimeHours(6);
      setOvertimeMultiplier(2.0);
      setRecordedPay(4940);
    } else if (preset === 'lakshmi') {
      setWorkerName('Lakshmi N.');
      setIndustry('College Facilities');
      setSiteName('SRM Campus Hostels & Dining Hall 3');
      setRateType('DAILY');
      setBaseRate(550);
      setRegularHours(48);
      setOvertimeHours(12);
      setOvertimeMultiplier(2.0);
      setRecordedPay(3800);
    } else if (preset === 'karthik') {
      setWorkerName('Karthik V.');
      setIndustry('College Facilities');
      setSiteName('SRM Tech Park & Engineering Complex');
      setRateType('HOURLY');
      setBaseRate(85);
      setRegularHours(44);
      setOvertimeHours(4);
      setOvertimeMultiplier(2.0);
      setRecordedPay(4420);
    }
  };

  const handleCalculate = async (save = false) => {
    try {
      setCalculating(true);
      setSaveSuccess(false);
      const payload: WageCalculateRequest = {
        worker_name: workerName,
        industry: industry,
        site_name: siteName,
        period: period,
        rate_type: rateType,
        base_rate: Number(baseRate),
        regular_hours: Number(regularHours),
        overtime_hours: Number(overtimeHours),
        overtime_multiplier: Number(overtimeMultiplier),
        recorded_pay: Number(recordedPay),
        save_record: save,
      };

      const res = await api.calculateWage(payload);
      setResult(res);
      if (save) {
        setSaveSuccess(true);
        loadChecks();
      }
    } catch (err: any) {
      alert(`Calculation error: ${err?.message || 'Server error'}`);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sleek Top Banner & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A31C1B]/15 text-[#A31C1B] border border-[#A31C1B]/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2]">
                FairPay AI — Transparent Wage Intelligence
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Deterministic calculation engine for Indian industrial &amp; contracted workforce standards.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Presets Chips */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-[#171717] p-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-neutral-400 px-2 uppercase font-medium">Demo Presets:</span>
          <button
            onClick={() => applyPreset('raman')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 transition-all cursor-pointer"
          >
            Raman (₹1,625 Underpaid)
          </button>
          <button
            onClick={() => applyPreset('selvam')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1FB882]/15 hover:bg-[#1FB882]/25 text-[#1FB882] border border-[#1FB882]/30 transition-all cursor-pointer"
          >
            Selvam (Consistent)
          </button>
          <button
            onClick={() => applyPreset('lakshmi')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
          >
            Lakshmi (College Shortfall)
          </button>
        </div>
      </div>

      {/* Main Grid: Form Inputs (5 cols) & Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-display font-semibold text-sm text-[#F8F7F2]">
              Shift &amp; Pay Slip Details
            </span>
            <span className="text-[10px] font-mono text-[#1FB882] bg-[#1FB882]/10 px-2 py-0.5 rounded border border-[#1FB882]/20">
              ₹ INR Standard
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Worker Name & Sector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Worker Name</label>
                <input
                  type="text"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B] focus:ring-1 focus:ring-[#A31C1B]"
                  placeholder="e.g. Raman K."
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B] focus:ring-1 focus:ring-[#A31C1B]"
                >
                  <option value="Construction">Construction</option>
                  <option value="College Facilities">College Facilities</option>
                </select>
              </div>
            </div>

            {/* Site & Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Work Location / Site</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B] focus:ring-1 focus:ring-[#A31C1B]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Pay Period</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B] focus:ring-1 focus:ring-[#A31C1B]"
                />
              </div>
            </div>

            {/* Rate Type Pill Switcher */}
            <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-medium">Rate Structure</span>
                <div className="flex items-center gap-1 bg-[#1c1c1c] p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => { setRateType('DAILY'); setBaseRate(750); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      rateType === 'DAILY' ? 'bg-[#A31C1B] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Daily Wage
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRateType('HOURLY'); setBaseRate(95); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      rateType === 'HOURLY' ? 'bg-[#A31C1B] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1">
                    {rateType === 'DAILY' ? 'Base Daily Rate (₹/day)' : 'Base Hourly Rate (₹/hr)'}
                  </label>
                  <input
                    type="number"
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  />
                  {rateType === 'DAILY' && (
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Effective ₹{(baseRate / 8).toFixed(2)}/hr (8h shift)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1">
                    Overtime Multiplier
                  </label>
                  <select
                    value={overtimeMultiplier}
                    onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                    className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  >
                    <option value={2.0}>2.0x (Factories Act Double)</option>
                    <option value={1.5}>1.5x (Commercial Standard)</option>
                    <option value={1.0}>1.0x (Flat Rate)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hours Worked */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Regular Hours</label>
                <input
                  type="number"
                  value={regularHours}
                  onChange={(e) => setRegularHours(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-medium mb-1">Overtime Hours</label>
                <input
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono text-xs bg-[#121212] border border-amber-500/30 text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Amount Actually Paid */}
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Amount Actually Disbursed / Paid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-neutral-400 font-mono text-xs">₹</span>
                <input
                  type="number"
                  value={recordedPay}
                  onChange={(e) => setRecordedPay(Number(e.target.value))}
                  className="w-full rounded-xl pl-7 pr-3 py-2 font-mono font-bold text-sm bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleCalculate(false)}
                disabled={calculating}
                className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A31C1B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {calculating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Calculations...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Check My Pay</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCalculate(true)}
                disabled={calculating}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Save to Audit Ledger</span>
              </button>

              {saveSuccess && (
                <div className="p-2 rounded-lg bg-[#1FB882]/15 border border-[#1FB882]/30 text-xs text-[#1FB882] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Check saved to permanent database record!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Calculation Breakdown */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-5 shadow-xl">
              {/* Status Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider block">
                    Entitlement Audit
                  </span>
                  <h3 className="font-display font-bold text-base text-[#F8F7F2]">
                    {result.worker_name} • {result.period}
                  </h3>
                </div>

                <div className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  result.status === 'POTENTIAL_DISCREPANCY'
                    ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/40'
                    : result.status === 'NEEDS_REVIEW'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/40'
                }`}>
                  {result.status === 'POTENTIAL_DISCREPANCY' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {result.status === 'LOOKS_CONSISTENT' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{result.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* 4 Key Figures Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Expected Pay</span>
                  <div className="text-lg font-display font-bold text-[#F8F7F2]">
                    ₹{result.expected_pay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-[#1FB882]">Statutory baseline</span>
                </div>

                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Actual Disbursed</span>
                  <div className="text-lg font-display font-bold text-[#F8F7F2]">
                    ₹{result.recorded_pay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-neutral-400">Paid amount</span>
                </div>

                <div className={`p-3 rounded-xl bg-[#121212] border space-y-0.5 ${
                  result.discrepancy > 1 ? 'border-[#A31C1B]/50' : 'border-white/10'
                }`}>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Net Difference</span>
                  <div className={`text-lg font-display font-bold ${
                    result.discrepancy > 1 ? 'text-[#A31C1B]' :
                    result.discrepancy < -1 ? 'text-amber-300' : 'text-[#1FB882]'
                  }`}>
                    {result.discrepancy > 0 ? `+₹${result.discrepancy.toLocaleString('en-IN')}` :
                     result.discrepancy < 0 ? `-₹${Math.abs(result.discrepancy).toLocaleString('en-IN')}` : '₹0.00'}
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {result.discrepancy > 1 ? 'Underpaid' : result.discrepancy < -1 ? 'Over Variance' : 'Consistent'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-0.5">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Overtime Share</span>
                  <div className="text-lg font-display font-bold text-amber-300">
                    ₹{result.overtime_pay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-neutral-400">{result.overtime_hours}h @ {result.overtime_multiplier}x</span>
                </div>
              </div>

              {/* Verified Deterministic Breakdown Steps */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#1FB882] tracking-wider flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verified Deterministic Calculation</span>
                </span>

                <div className="p-3 rounded-xl bg-[#06110C] border border-[#1FB882]/20 font-mono text-xs text-neutral-200 space-y-1">
                  {result.calculation_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#1FB882] select-none text-[11px]">▸</span>
                      <span className="text-[11px] leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plain Language Explanation */}
              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 text-xs space-y-1">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why was this flagged?</span>
                </span>
                <p className="text-neutral-300 text-[11px] leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Demo Assumption Disclaimer */}
              <p className="text-[10px] text-neutral-400 italic leading-tight pt-1">
                {result.disclaimer}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#171717] border border-white/10 p-10 text-center space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A31C1B] mx-auto">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-base text-[#F8F7F2]">
                No Active Pay Check
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Select one of the demo presets on top or input custom values on the left, then click <strong>“Check My Pay”</strong>.
              </p>
              <button
                onClick={() => applyPreset('raman')}
                className="px-3.5 py-1.5 rounded-lg bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Load Raman K. Preset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-sm text-[#F8F7F2]">
              Recent Wage Verification Ledger
            </h2>
            <p className="text-[11px] text-neutral-400">All historical wage audits recorded in database.</p>
          </div>

          <div className="flex items-center gap-1 text-xs bg-[#121212] p-1 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono text-neutral-400 px-1 uppercase">Filter:</span>
            {['All', 'POTENTIAL_DISCREPANCY', 'LOOKS_CONSISTENT', 'NEEDS_REVIEW'].map((st) => (
              <button
                key={st}
                onClick={() => setHistoryFilter(st)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  historyFilter === st ? 'bg-[#A31C1B] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st === 'POTENTIAL_DISCREPANCY' ? 'Discrepant' :
                 st === 'LOOKS_CONSISTENT' ? 'Consistent' :
                 st === 'NEEDS_REVIEW' ? 'Review' : 'All'}
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
                <th className="py-2 px-3">Period</th>
                <th className="py-2 px-3">Hours (Reg + OT)</th>
                <th className="py-2 px-3">Disbursed</th>
                <th className="py-2 px-3">Expected</th>
                <th className="py-2 px-3">Variance</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-xs">
              {recentChecks.length > 0 ? (
                recentChecks.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 font-sans font-medium text-[#F8F7F2]">{row.worker_name}</td>
                    <td className="py-2 px-3 text-neutral-400">{row.industry}</td>
                    <td className="py-2 px-3 text-neutral-400">{row.period}</td>
                    <td className="py-2 px-3 text-neutral-300">{row.regular_hours}h + {row.overtime_hours}h</td>
                    <td className="py-2 px-3 text-neutral-400">₹{row.recorded_pay.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-[#1FB882] font-bold">₹{row.expected_pay.toLocaleString('en-IN')}</td>
                    <td className={`py-2 px-3 font-bold ${
                      row.discrepancy > 1 ? 'text-[#A31C1B]' :
                      row.discrepancy < -1 ? 'text-amber-300' : 'text-[#1FB882]'
                    }`}>
                      {row.discrepancy > 0 ? `+₹${row.discrepancy.toLocaleString('en-IN')}` :
                       row.discrepancy < 0 ? `-₹${Math.abs(row.discrepancy).toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'POTENTIAL_DISCREPANCY' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                        row.status === 'NEEDS_REVIEW' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                      }`}>
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-400">
                    No historical checks found.
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
