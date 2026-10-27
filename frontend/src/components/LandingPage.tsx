import React, { useEffect, useState } from 'react';
import { ActiveTab, Industry, DashboardMetrics } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, Calculator, Clock, HardHat, GraduationCap, 
  ArrowRight, CheckCircle2, Lock, 
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectIndustry: (ind: Industry) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectIndustry }) => {
  const [liveMetrics, setLiveMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getDashboardMetrics()
      .then((data) => {
        if (isMounted) {
          setLiveMetrics(data);
          setLoadingMetrics(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingMetrics(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-14 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Visually Striking Hero Section */}
      <section className="text-center space-y-5 pt-4 sm:pt-8 max-w-4xl mx-auto">
        {/* UN SDG 8 Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06110C] border border-[#1FB882]/40 text-[#1FB882] text-xs font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1FB882] animate-pulse" />
          <span>UN SDG 8 • Decent Work & Economic Growth</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-[#f8f7f2] leading-[1.12]">
          Work should be fair.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f8f7f2] via-[#1FB882] to-[#A31C1B]">
            Safety should never be silent.
          </span>
        </h1>

        {/* Tagline & Purpose */}
        <p className="text-base sm:text-lg text-stone-300 font-normal max-w-2xl mx-auto leading-relaxed">
          <strong className="text-[#f8f7f2] font-semibold">“Every hour counts. Every voice matters.”</strong>
          <br className="hidden sm:inline" />
          {' '}A worker-first intelligence platform detecting wage discrepancies, reporting workplace hazards with browser speech, and preventing fatigue-induced shift risks.
        </p>

        {/* Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A31C1B] hover:bg-[#b82322] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#A31C1B]/25 transition-all cursor-pointer"
          >
            <span>Launch Interactive Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('worker-terminal')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer"
          >
            <span>Worker Mobile View</span>
          </button>

          <button
            onClick={() => onNavigate('employer-terminal')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#06110C] hover:bg-[#0c1f17] text-[#1FB882] font-semibold text-sm border border-[#1FB882]/30 transition-all cursor-pointer"
          >
            <span>Employer Console</span>
          </button>
        </div>
      </section>

      {/* 2. Compact Live Dashboard Preview (Using Actual Backend Data) */}
      <section className="max-w-5xl mx-auto rounded-2xl forest-card p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A31C1B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1FB882]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Preview Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A31C1B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1FB882]" />
            <span className="ml-2 font-mono text-stone-400 text-[11px] hidden sm:inline">
              fairshift-telemetry.local/dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#1FB882] bg-[#06110C] px-2 py-0.5 rounded border border-[#1FB882]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1FB882] animate-ping" />
              <span>LIVE DATABASE SYNC</span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-[11px] text-stone-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid from Backend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          {/* Card 1: Wage Audits */}
          <div 
            onClick={() => onNavigate('fairpay')}
            className="p-4 rounded-xl bg-[#171717] border border-white/10 hover:border-[#A31C1B]/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
              <span className="font-medium text-stone-200">FairPay AI Variance</span>
              <Calculator className="w-4 h-4 text-[#A31C1B] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#A31C1B]">
              {loadingMetrics ? '...' : `₹${liveMetrics?.wage_discrepancy_total_inr.toLocaleString('en-IN') || '0'} Shortfall`}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              {loadingMetrics ? 'Syncing...' : `${liveMetrics?.wage_discrepancies_count || 0} checks requiring overtime review`}
            </div>
          </div>

          {/* Card 2: Open Safety Reports */}
          <div 
            onClick={() => onNavigate('silentshield')}
            className="p-4 rounded-xl bg-[#171717] border border-white/10 hover:border-[#1FB882]/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
              <span className="font-medium text-stone-200">SilentShield Queue</span>
              <ShieldCheck className="w-4 h-4 text-[#1FB882] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#f8f7f2] flex items-center gap-2">
              <span>{loadingMetrics ? '...' : `${liveMetrics?.open_safety_reports || 0} Open`}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#A31C1B]/20 text-[#A31C1B] font-mono font-bold">
                {liveMetrics?.critical_safety_reports || 0} CRITICAL
              </span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Water + Electrical compound hazard detected
            </div>
          </div>

          {/* Card 3: Shift Fatigue Alerts */}
          <div 
            onClick={() => onNavigate('shiftguardian')}
            className="p-4 rounded-xl bg-[#171717] border border-white/10 hover:border-[#f59e0b]/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
              <span className="font-medium text-stone-200">ShiftGuardian Roster</span>
              <Clock className="w-4 h-4 text-[#f59e0b] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#f59e0b]">
              {loadingMetrics ? '...' : `${liveMetrics?.schedule_risks_count || 0} Fatigue Breaches`}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Double shifts (&gt;12h) &amp; restricted rest (&lt;8h) flagged
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Concise Module Cards */}
      <section className="space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1FB882]">
            Modular Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#f8f7f2]">
            Three Integrated Intelligence Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1: FairPay AI */}
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 flex flex-col justify-between hover:border-[#A31C1B]/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#A31C1B]/15 border border-[#A31C1B]/30 flex items-center justify-center text-[#A31C1B]">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#f8f7f2]">
                FairPay AI
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Deterministic statutory wage calculation engine in Indian Rupees (₹). Reconciles regular earnings, overtime multipliers (1.5x / 2.0x double rate), and actual disbursements without black-box scores.
              </p>
              <ul className="text-[11px] text-stone-400 space-y-1.5 font-mono pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A31C1B] shrink-0" />
                  <span>Transparent step-by-step math formulas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A31C1B] shrink-0" />
                  <span>Flagged discrepancy explanations in plain text</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('fairpay')}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-white text-xs font-semibold border border-[#A31C1B]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open FairPay AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 2: SilentShield */}
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 flex flex-col justify-between hover:border-[#1FB882]/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#06110C] border border-[#1FB882]/30 flex items-center justify-center text-[#1FB882]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#f8f7f2]">
                SilentShield
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Accessible safety reporting via browser speech or text in English and தமிழ் (Tamil). Evaluates compound hazards (e.g. electrical cables + water puddles) and issues trackable reference codes.
              </p>
              <ul className="text-[11px] text-stone-400 space-y-1.5 font-mono pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB882] shrink-0" />
                  <span>Browser-native Web Speech in English/Tamil</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1FB882] shrink-0" />
                  <span>Confidential mode + Unique tracking ID</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('silentshield')}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#06110C] hover:bg-[#0e241b] text-[#1FB882] text-xs font-semibold border border-[#1FB882]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open SilentShield</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Module 3: ShiftGuardian */}
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 flex flex-col justify-between hover:border-[#f59e0b]/50 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#f8f7f2]">
                ShiftGuardian
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Deterministic fatigue risk evaluation based on occupational sleep science and labour norms. Flags shifts exceeding 12 hours, insufficient recovery rest (&lt;11h), and consecutive work stretches.
              </p>
              <ul className="text-[11px] text-stone-400 space-y-1.5 font-mono pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Consecutive-duty &amp; rest breach alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Direct mitigation instructions for supervisors</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('shiftguardian')}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Open ShiftGuardian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Construction & College Facilities Use-Case Cards */}
      <section className="space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1FB882]">
            Demonstration Environments
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#f8f7f2]">
            Tested Across Two Industrial Contexts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Construction Sites */}
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#A31C1B]/15 text-[#A31C1B]">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#f8f7f2]">
                    Construction Infrastructure
                  </h3>
                  <span className="text-[11px] text-stone-400">Apex Heights Metro Tower (Tower B)</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectIndustry('Construction');
                  onNavigate('dashboard');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#A31C1B]/20 hover:bg-[#A31C1B]/30 text-white text-xs font-semibold border border-[#A31C1B]/40 transition-all cursor-pointer"
              >
                Filter Demo
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Daily-wage scaffolders, rebar specialists, and site electricians navigating unrecorded overtime, missing fall-arrest harnesses, and exposed live wiring near rain corridors.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-lg bg-[#141414] border border-white/5 text-stone-300">
                <span className="font-semibold text-[#A31C1B] block">Wage Discrepancy</span>
                Raman K. (14 OT hrs • ₹1,625 short)
              </div>
              <div className="p-2.5 rounded-lg bg-[#141414] border border-white/5 text-stone-300">
                <span className="font-semibold text-amber-400 block">Compound Hazard</span>
                Scaffolding Level 3 live conduit
              </div>
            </div>
          </div>

          {/* College Facilities */}
          <div className="rounded-2xl bg-[#1a1a1a] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#06110C] text-[#1FB882] border border-[#1FB882]/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#f8f7f2]">
                    College Facilities
                  </h3>
                  <span className="text-[11px] text-stone-400">SRM Tech Park &amp; Campus Hostels</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectIndustry('College Facilities');
                  onNavigate('dashboard');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#06110C] hover:bg-[#0c1f17] text-[#1FB882] text-xs font-semibold border border-[#1FB882]/30 transition-all cursor-pointer"
              >
                Filter Demo
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Campus custodians, security guards, and utilities technicians facing back-to-back night shifts, faulty equipment, and dangerous chiller water leakage over electrical distribution breakers.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-lg bg-[#141414] border border-white/5 text-stone-300">
                <span className="font-semibold text-[#A31C1B] block">Critical Hazard</span>
                Substation 2 water on main panel
              </div>
              <div className="p-2.5 rounded-lg bg-[#141414] border border-white/5 text-stone-300">
                <span className="font-semibold text-[#1FB882] block">Fatigue Alert</span>
                Anbu R. (15h shift • 9-day streak)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Concise Four-Step Workflow */}
      <section className="space-y-5">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1FB882]">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#f8f7f2]">
            The FairShift Resolution Cycle
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-2">
            <span className="font-mono text-xs font-bold text-[#A31C1B] bg-[#A31C1B]/15 px-2 py-0.5 rounded">
              01 • Check Pay
            </span>
            <h4 className="font-display font-semibold text-sm text-[#f8f7f2]">Hours Entitlement</h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Worker inputs regular hours, overtime, and pay received to run verified deterministic statutory math.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-2">
            <span className="font-mono text-xs font-bold text-[#1FB882] bg-[#06110C] px-2 py-0.5 rounded border border-[#1FB882]/20">
              02 • Voice Hazard
            </span>
            <h4 className="font-display font-semibold text-sm text-[#f8f7f2]">Confidential Report</h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Worker speaks or types hazard in English or Tamil. A unique tracking ID (`FS-2026-XXXXX`) is generated.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
              03 • Heuristic Triage
            </span>
            <h4 className="font-display font-semibold text-sm text-[#f8f7f2]">Compound Analysis</h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Deterministic rules automatically evaluate compound risks (e.g. Electrical + Water = CRITICAL).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/10 space-y-2">
            <span className="font-mono text-xs font-bold text-stone-300 bg-white/10 px-2 py-0.5 rounded">
              04 • Audit &amp; Remediate
            </span>
            <h4 className="font-display font-semibold text-sm text-[#f8f7f2]">Supervisor Action</h4>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Employers acknowledge and resolve issues with an immutable audit trail visible on the ledger.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Short Explainability, Privacy & Trust Section */}
      <section className="rounded-2xl forest-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#1FB882]" />
          <h3 className="font-display font-bold text-base text-[#f8f7f2]">
            Explainability, Privacy &amp; Trust Commitments
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1">
            <span className="font-semibold text-[#A31C1B] block">Deterministic Formulas</span>
            <p className="text-stone-400 text-[11px]">
              Every calculation discloses its mathematical steps. No hallucinated AI scores or arbitrary black boxes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1">
            <span className="font-semibold text-[#1FB882] block">Zero External Audio Export</span>
            <p className="text-stone-400 text-[11px]">
              Voice transcription uses browser-native APIs. Reports are never dispatched to commercial cloud LLMs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1">
            <span className="font-semibold text-amber-400 block">Balanced Due Process</span>
            <p className="text-stone-400 text-[11px]">
              System highlights flags for human verification without making unilateral legal judgments against workers or employers.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Closing Compact CTA */}
      <section className="text-center space-y-4 pt-2 pb-6">
        <h3 className="text-xl sm:text-2xl font-display font-bold text-[#f8f7f2]">
          Explore the FairShift Platform
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#b82322] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#A31C1B]/20"
          >
            Open Live Dashboard
          </button>
          <button
            onClick={() => onNavigate('fairpay')}
            className="px-5 py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
          >
            Check Pay
          </button>
          <button
            onClick={() => onNavigate('silentshield')}
            className="px-5 py-2.5 rounded-xl bg-[#06110C] hover:bg-[#0c1f17] text-[#1FB882] font-semibold text-xs border border-[#1FB882]/30 transition-all cursor-pointer"
          >
            Report Hazard
          </button>
        </div>
      </section>
    </div>
  );
};
