import React, { useState } from 'react';
import { ActiveTab, Industry } from '../types';
import { 
  Calculator, ShieldCheck, Clock, Search, CheckCircle2, Lock
} from 'lucide-react';
import { api } from '../services/api';

interface WorkerWorkspaceProps {
  onNavigate: (tab: ActiveTab) => void;
  selectedIndustry: Industry;
}

export const WorkerWorkspace: React.FC<WorkerWorkspaceProps> = ({
  onNavigate,
  selectedIndustry
}) => {
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [activeAction, setActiveAction] = useState<'pay' | 'report' | 'track'>('pay');

  // Quick Pay State
  const [dailyRate, setDailyRate] = useState(750);
  const [regularHours, setRegularHours] = useState(48);
  const [otHours, setOtHours] = useState(14);
  const [receivedPay, setReceivedPay] = useState(5500);
  const [quickPayResult, setQuickPayResult] = useState<any>(null);

  // Quick Report State
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Electrical');
  const [reportDesc, setReportDesc] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Track State
  const [trackRef, setTrackRef] = useState('FS-2026-E4912');
  const [trackedReport, setTrackedReport] = useState<any>(null);
  const [trackErr, setTrackErr] = useState<string | null>(null);

  const t = {
    en: {
      title: "Worker Voice & Dignity Terminal",
      subtitle: "Simple, confidential tools to verify your earnings and report workplace hazards.",
      checkPay: "Check Pay",
      reportHazard: "Report Hazard",
      trackReport: "Track Status",
      checkFatigue: "Shift Safety",
      dailyRateLabel: "Daily Wage (₹/day)",
      regHoursLabel: "Regular Hours",
      otHoursLabel: "Overtime Hours",
      receivedLabel: "Amount Paid in Hand (₹)",
      verifyBtn: "Verify Earnings",
      hazardCategory: "Hazard Category",
      hazardDesc: "What happened? (Describe hazard)",
      submitHazard: "Submit Hazard Report",
      trackInput: "Reference Code (e.g. FS-2026-E4912)",
      trackBtn: "Lookup Status",
    },
    ta: {
      title: "தொழிலாளர் குரல் மற்றும் பாதுகாப்பு தளம்",
      subtitle: "உங்கள் ஊதியத்தை சரிபார்க்கவும், பணியிடத்தில் ஆபத்தை தெரிவிக்கவும் உதவும் எளிய தளம்.",
      checkPay: "சம்பள சரிபார்ப்பு",
      reportHazard: "அபாய தகவல்",
      trackReport: "புகார் நிலை",
      checkFatigue: "பணி நேர ஆய்வு",
      dailyRateLabel: "தினசரி கூலி (₹/நாள்)",
      regHoursLabel: "வழக்கமான மணிநேரம்",
      otHoursLabel: "கூடுதல் நேரம் (ஓவர் டைம்)",
      receivedLabel: "கையில் பெற்ற தொகை (₹)",
      verifyBtn: "சம்பளத்தை சரிபார்க்க",
      hazardCategory: "அபாய வகை",
      hazardDesc: "அபாய விவரம் (விவரிக்கவும்)",
      submitHazard: "அபாய தகவலை பதிவிட",
      trackInput: "குறிப்பு எண் (எ.கா: FS-2026-E4912)",
      trackBtn: "நிலையை அறிய",
    }
  }[lang];

  const handleQuickPay = async () => {
    try {
      const res = await api.calculateWage({
        worker_name: lang === 'ta' ? 'தொழிலாளர் (Worker)' : 'Frontline Worker',
        industry: selectedIndustry === 'All' ? 'Construction' : selectedIndustry,
        period: 'Current Week',
        rate_type: 'DAILY',
        base_rate: Number(dailyRate),
        regular_hours: Number(regularHours),
        overtime_hours: Number(otHours),
        overtime_multiplier: 2.0,
        recorded_pay: Number(receivedPay),
        save_record: false
      });
      setQuickPayResult(res);
    } catch (e: any) {
      alert(e?.message || 'Error calculating pay');
    }
  };

  const handleQuickReport = async () => {
    if (!reportTitle || !reportDesc) {
      alert(lang === 'ta' ? 'தயவுசெய்து தலைப்பு மற்றும் விவரத்தை நிரப்பவும்' : 'Please provide title and description');
      return;
    }
    try {
      const res = await api.createSafetyReport({
        title: reportTitle,
        category: reportCategory,
        site_name: selectedIndustry === 'College Facilities' ? 'SRM Tech Park Complex' : 'Apex Heights Metro Tower (Tower B)',
        description: reportDesc,
        language: lang,
        is_confidential: isConfidential,
        reporter_name: isConfidential ? 'Confidential Worker' : 'Mobile Worker',
      });
      setSubmittedRef(res.reference_id);
      setReportTitle('');
      setReportDesc('');
    } catch (e: any) {
      alert(e?.message || 'Error submitting report');
    }
  };

  const handleQuickTrack = async () => {
    if (!trackRef) return;
    try {
      setTrackErr(null);
      const res = await api.trackSafetyReport(trackRef.trim());
      setTrackedReport(res);
    } catch (e: any) {
      setTrackErr(e?.message || 'Report not found');
      setTrackedReport(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Sleek Mobile Card Container */}
      <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1FB882] animate-ping" />
            <span className="font-mono text-xs text-[#1FB882] font-bold uppercase tracking-wider">
              {lang === 'ta' ? 'தொழிலாளர் தளம்' : 'Worker Interface'}
            </span>
          </div>

          {/* Language Switch */}
          <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'en' ? 'bg-[#A31C1B] text-white' : 'text-neutral-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                lang === 'ta' ? 'bg-[#A31C1B] text-white' : 'text-neutral-400'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-display font-bold text-[#F8F7F2]">
            {t.title}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {/* 3 Mobile Action Tabs */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setActiveAction('pay')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAction === 'pay'
                ? 'bg-[#1FB882]/15 border-[#1FB882] text-[#1FB882] font-semibold'
                : 'bg-[#121212] border-white/10 text-neutral-300 hover:border-white/20'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span className="text-[11px]">{t.checkPay}</span>
          </button>

          <button
            onClick={() => setActiveAction('report')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAction === 'report'
                ? 'bg-[#A31C1B]/15 border-[#A31C1B] text-[#A31C1B] font-semibold'
                : 'bg-[#121212] border-white/10 text-neutral-300 hover:border-white/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px]">{t.reportHazard}</span>
          </button>

          <button
            onClick={() => setActiveAction('track')}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeAction === 'track'
                ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-semibold'
                : 'bg-[#121212] border-white/10 text-neutral-300 hover:border-white/20'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-[11px]">{t.trackReport}</span>
          </button>
        </div>
      </div>

      {/* Action 1: Check Pay */}
      {activeAction === 'pay' && (
        <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
          <span className="font-display font-semibold text-sm text-[#F8F7F2] flex items-center gap-1.5 pb-2 border-b border-white/10">
            <Calculator className="w-4 h-4 text-[#1FB882]" />
            <span>{t.checkPay}</span>
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">{t.dailyRateLabel}</label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2 font-mono bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">{t.regHoursLabel}</label>
                <input
                  type="number"
                  value={regularHours}
                  onChange={(e) => setRegularHours(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-medium mb-1">{t.otHoursLabel}</label>
                <input
                  type="number"
                  value={otHours}
                  onChange={(e) => setOtHours(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 font-mono bg-[#121212] border border-amber-500/30 text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">{t.receivedLabel}</label>
              <input
                type="number"
                value={receivedPay}
                onChange={(e) => setReceivedPay(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2 font-mono font-bold text-sm bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
            </div>

            <button
              onClick={handleQuickPay}
              className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#A31C1B]/20 transition-all cursor-pointer"
            >
              {t.verifyBtn}
            </button>

            {quickPayResult && (
              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-2 mt-2">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="font-semibold text-neutral-200">
                    {lang === 'ta' ? 'முடிவு' : 'Result'}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    quickPayResult.status === 'POTENTIAL_DISCREPANCY'
                      ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30'
                      : 'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                  }`}>
                    {quickPayResult.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-[#171717] border border-white/10">
                    <span className="text-[10px] text-neutral-400 block">
                      {lang === 'ta' ? 'வர வேண்டியது' : 'Expected'}
                    </span>
                    <span className="font-bold text-[#1FB882]">
                      ₹{quickPayResult.expected_pay.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#171717] border border-white/10">
                    <span className="text-[10px] text-neutral-400 block">
                      {lang === 'ta' ? 'வித்தியாசம்' : 'Difference'}
                    </span>
                    <span className={`font-bold ${
                      quickPayResult.discrepancy > 1 ? 'text-[#A31C1B]' : 'text-[#1FB882]'
                    }`}>
                      {quickPayResult.discrepancy > 0 ? `₹${quickPayResult.discrepancy.toLocaleString('en-IN')} Short` : '₹0'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {quickPayResult.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action 2: Report Hazard */}
      {activeAction === 'report' && (
        <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
          <span className="font-display font-semibold text-sm text-[#F8F7F2] flex items-center gap-1.5 pb-2 border-b border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
            <span>{t.reportHazard}</span>
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">{t.hazardCategory}</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              >
                <option value="Electrical">Electrical (மின்சாரம்)</option>
                <option value="PPE">PPE (தலைக்கவசம் / பெல்ட்)</option>
                <option value="Machinery">Machinery (இயந்திரம்)</option>
                <option value="Sanitation">Sanitation (சுகாதாரம்)</option>
                <option value="Harassment/Concern">Harassment (துன்புறுத்தல்)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                {lang === 'ta' ? 'அபாய தலைப்பு' : 'Brief Title'}
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder={lang === 'ta' ? 'எ.கா: மின் கம்பி தீப்பொறி' : 'e.g., Sparking wire near walkway'}
                className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">{t.hazardDesc}</label>
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                rows={3}
                placeholder={lang === 'ta' ? 'விவரமாக கூறவும்...' : 'Describe what happened...'}
                className="w-full rounded-xl px-3 py-2 text-xs leading-relaxed bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-[#121212] rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="mobConfidential"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="rounded text-[#A31C1B] focus:ring-[#A31C1B] cursor-pointer"
              />
              <label htmlFor="mobConfidential" className="text-xs text-neutral-300 cursor-pointer flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ta' ? 'எனது பெயரை மறைக்கவும் (ரகசிய புகார்)' : 'Keep my name confidential'}</span>
              </label>
            </div>

            <button
              onClick={handleQuickReport}
              className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#A31C1B]/20 transition-all cursor-pointer"
            >
              {t.submitHazard}
            </button>

            {submittedRef && (
              <div className="p-3.5 rounded-xl bg-[#06110C] border border-[#1FB882]/30 space-y-1.5 text-xs">
                <span className="text-[#1FB882] font-bold block">
                  {lang === 'ta' ? 'புகார் பதிவு செய்யப்பட்டது!' : 'Report Created!'}
                </span>
                <p className="text-neutral-400 text-[11px]">
                  {lang === 'ta' ? 'குறிப்பு எண்:' : 'Reference ID:'}
                </p>
                <div className="p-2 rounded-lg bg-[#171717] font-mono text-sm font-bold text-[#1FB882] text-center border border-[#1FB882]/30">
                  {submittedRef}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action 3: Track Report */}
      {activeAction === 'track' && (
        <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
          <span className="font-display font-semibold text-sm text-[#F8F7F2] flex items-center gap-1.5 pb-2 border-b border-white/10">
            <Search className="w-4 h-4 text-amber-400" />
            <span>{t.trackReport}</span>
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">{t.trackInput}</label>
              <input
                type="text"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-xs font-mono uppercase bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
            </div>

            <button
              onClick={handleQuickTrack}
              className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#A31C1B]/20 transition-all cursor-pointer"
            >
              {t.trackBtn}
            </button>

            {trackErr && (
              <div className="p-2.5 rounded-lg bg-[#A31C1B]/10 border border-[#A31C1B]/30 text-xs text-[#A31C1B]">
                {trackErr}
              </div>
            )}

            {trackedReport && (
              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#1FB882] font-bold">{trackedReport.reference_id}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-200 font-mono text-[10px]">
                    {trackedReport.status}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-[#F8F7F2]">{trackedReport.title}</h4>
                <p className="text-[11px] text-neutral-400">{trackedReport.description}</p>
                <div className="pt-1 border-t border-white/10 text-[11px] text-amber-300">
                  Directive: {trackedReport.recommended_action}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
