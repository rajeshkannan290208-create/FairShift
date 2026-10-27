import React, { useState, useEffect } from 'react';
import { SafetyReport, Industry, UserRole } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, Mic, MicOff, CheckCircle, 
  Search, Lock, RefreshCw, Send, Sparkles, Check
} from 'lucide-react';

interface SilentShieldViewProps {
  selectedIndustry: Industry;
  userRole: UserRole;
}

export const SilentShieldView: React.FC<SilentShieldViewProps> = ({
  selectedIndustry,
  userRole
}) => {
  // Report Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Electrical' | 'PPE' | 'Machinery' | 'Sanitation' | 'Harassment/Concern' | 'Other'>('Electrical');
  const [siteName, setSiteName] = useState(
    selectedIndustry === 'College Facilities'
      ? 'SRM Tech Park & Engineering Complex'
      : 'Apex Heights Metro Tower (Tower B)'
  );
  const [locationDesc, setLocationDesc] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [isConfidential, setIsConfidential] = useState(false);
  const [reporterName, setReporterName] = useState('Raman K.');
  const [reporterRole, setReporterRole] = useState('Mason & Scaffolder');

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Status & Reports State
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<SafetyReport | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Tracking State
  const [trackingId, setTrackingId] = useState('');
  const [trackedReport, setTrackedReport] = useState<SafetyReport | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Status Update State for Employer
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [selectedIndustry, priorityFilter, statusFilter]);

  const loadReports = async () => {
    try {
      const data = await api.getSafetyReports({
        industry: selectedIndustry,
        priority: priorityFilter,
        status: statusFilter
      });
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. You can type directly in the field.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failure', err);
      setIsListening(false);
    }
  };

  const applyHazardPreset = (preset: 'exposed-wire' | 'missing-ppe' | 'water-switchboard' | 'chiller-leak') => {
    if (preset === 'exposed-wire') {
      setTitle('Exposed live electrical conduit near walkway');
      setCategory('Electrical');
      setSiteName('Apex Heights Metro Tower (Tower B)');
      setLocationDesc('Tower B Level 3 corridor pedestrian ramp');
      setDescription('Uninsulated bare wire sparking near temporary pedestrian bridge. Water from rainfall pooling right underneath.');
      setLanguage('en');
      setIsConfidential(false);
    } else if (preset === 'missing-ppe') {
      setTitle('Missing safety harness & perimeter barriers');
      setCategory('PPE');
      setSiteName('Apex Heights Metro Tower (Tower B)');
      setLocationDesc('7th Floor slab exterior shuttering');
      setDescription('Workers operating along high open edge without tethered harness or guardrail protection.');
      setLanguage('en');
      setIsConfidential(false);
    } else if (preset === 'water-switchboard') {
      setTitle('Water seepage directly onto main switchboard 2');
      setCategory('Electrical');
      setSiteName('SRM Tech Park & Engineering Complex');
      setLocationDesc('Basement Substation Room B-04');
      setDescription('Overhead AC condensation line cracked and dripping water directly onto 440V electrical breaker box.');
      setLanguage('en');
      setIsConfidential(false);
    } else if (preset === 'chiller-leak') {
      setTitle('மின்சார பெட்டி அருகில் தண்ணீர் கசிவு');
      setCategory('Electrical');
      setSiteName('SRM Tech Park & Engineering Complex');
      setLocationDesc('கட்டட அடித்தள மின் அறை');
      setDescription('மின்சார கம்பி அருகில் தண்ணீர் தேங்கி நிற்கிறது, தீப்பொறி பறக்கிறது.');
      setLanguage('ta');
      setIsConfidential(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please provide a report title and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createSafetyReport({
        title,
        category,
        site_name: siteName,
        location_description: locationDesc,
        description,
        language,
        is_confidential: isConfidential,
        reporter_name: isConfidential ? 'Confidential Worker' : reporterName,
        reporter_role: reporterRole,
      });

      setLastSubmitted(res);
      setTitle('');
      setLocationDesc('');
      setDescription('');
      loadReports();
    } catch (err: any) {
      alert(`Submission error: ${err?.message || 'Server error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;

    try {
      setTrackingLoading(true);
      setTrackingError(null);
      const res = await api.trackSafetyReport(trackingId.trim());
      setTrackedReport(res);
    } catch (err: any) {
      setTrackingError(err?.message || 'Report not found. Please verify reference ID.');
      setTrackedReport(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: number, newStatus: string) => {
    try {
      setUpdatingId(reportId);
      await api.updateReportStatus(
        reportId,
        newStatus,
        `Supervisor (${userRole} Demo)`,
        `Transitioned status to ${newStatus} in operational safety review.`
      );
      loadReports();
      if (trackedReport && trackedReport.id === reportId) {
        const refreshed = await api.trackSafetyReport(trackedReport.reference_id);
        setTrackedReport(refreshed);
      }
    } catch (err: any) {
      alert(`Status update error: ${err?.message || 'Server error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Demo Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#A31C1B]/15 text-[#A31C1B] border border-[#A31C1B]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F8F7F2]">
                SilentShield — Worker Voice &amp; Safety Reporting
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Accessible hazard reporting with browser-native speech, compound risk heuristics, and status tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Hazards Chips */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-[#171717] p-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-neutral-400 px-2 uppercase font-medium">Demo Hazards:</span>
          <button
            onClick={() => applyHazardPreset('exposed-wire')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 transition-all cursor-pointer"
          >
            Exposed Wiring (Const)
          </button>
          <button
            onClick={() => applyHazardPreset('water-switchboard')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#A31C1B]/15 hover:bg-[#A31C1B]/25 text-[#A31C1B] border border-[#A31C1B]/30 transition-all cursor-pointer"
          >
            Water on Breaker (College)
          </button>
          <button
            onClick={() => applyHazardPreset('chiller-leak')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1FB882]/15 hover:bg-[#1FB882]/25 text-[#1FB882] border border-[#1FB882]/30 transition-all cursor-pointer"
          >
            தமிழ் Tamil Voice/Text
          </button>
        </div>
      </div>

      {/* Grid: Form (7 cols) + Tracker (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-7 rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-display font-semibold text-sm text-[#F8F7F2] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A31C1B]" />
              <span>Report Workplace Hazard</span>
            </span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#A31C1B] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  language === 'ta' ? 'bg-[#A31C1B] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Category & Site */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Hazard Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                >
                  <option value="Electrical">Electrical (Conduit, Sparks, High Voltage)</option>
                  <option value="PPE">PPE (Harness, Helmet, Barriers)</option>
                  <option value="Machinery">Machinery (Unguarded, Vibration)</option>
                  <option value="Sanitation">Sanitation (Contamination, Sewage)</option>
                  <option value="Harassment/Concern">Harassment/Concern (Unsafe Shift, Threat)</option>
                  <option value="Other">Other Occupational Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Work Facility / Site</label>
                <select
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                >
                  <option value="Apex Heights Metro Tower (Tower B)">Apex Heights Metro Tower (Tower B) - Construction</option>
                  <option value="Coromandel Infrastructure Overpass">Coromandel Infrastructure Overpass - Construction</option>
                  <option value="SRM Tech Park & Engineering Complex">SRM Tech Park & Engineering Complex - College</option>
                  <option value="SRM Campus Hostels & Dining Hall 3">SRM Campus Hostels & Dining Hall 3 - College</option>
                </select>
              </div>
            </div>

            {/* Title & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {language === 'ta' ? 'அபாய தலைப்பு (Title)' : 'Hazard Summary'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா: மின் கம்பி தீப்பொறி' : 'e.g., Exposed live conduit near walkway'}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Specific Location</label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  placeholder="e.g., Level 3 scaffolding ramp"
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                />
              </div>
            </div>

            {/* Description + Speech Mic */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 font-medium">
                  {language === 'ta' ? 'விவரம் (Description)' : 'Detailed Description'}
                </label>
                
                {/* Speech Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-[#A31C1B] text-white border-[#A31C1B] animate-pulse shadow-md shadow-[#A31C1B]/30'
                      : 'bg-white/5 hover:bg-white/10 text-[#1FB882] border-white/10'
                  }`}
                  title={speechSupported ? 'Record speech via microphone' : 'Speech recognition not supported in this browser'}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...') : (language === 'ta' ? 'குரல் உள்ளீடு' : 'Speak')}</span>
                </button>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={
                  language === 'ta'
                    ? 'அபாயத்தை விரிவாக விவரிக்கவும் (எ.கா: தண்ணீர் தேங்கிய இடத்தில் மின் கம்பி அறுந்து தீப்பொறி பறக்கிறது)...'
                    : 'Describe what you saw, equipment involved, and any immediate danger...'
                }
                className="w-full rounded-xl px-3 py-2 text-xs leading-relaxed bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                required
              />
            </div>

            {/* Confidentiality Toggle */}
            <div className="p-3 rounded-xl bg-[#121212] border border-white/10 space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="confidentialityCheck"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="mt-0.5 rounded text-[#A31C1B] focus:ring-[#A31C1B] cursor-pointer"
                />
                <div>
                  <label htmlFor="confidentialityCheck" className="text-xs font-semibold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Submit as Confidential Worker Voice</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Identity is hidden from public logs. Report data is stored securely in workspace database and never sent to external AI providers.
                  </p>
                </div>
              </div>

              {!isConfidential && (
                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-white/10 text-[11px]">
                  <div>
                    <label className="block text-neutral-400 mb-0.5">Reporter Name</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full rounded-lg px-2.5 py-1 text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-0.5">Reporter Role</label>
                    <input
                      type="text"
                      value={reporterRole}
                      onChange={(e) => setReporterRole(e.target.value)}
                      className="w-full rounded-lg px-2.5 py-1 text-xs bg-[#171717] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A31C1B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Priority &amp; Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Safety Report</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Card */}
          {lastSubmitted && (
            <div className="p-3.5 rounded-xl bg-[#06110C] border border-[#1FB882]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1FB882] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Report Registered</span>
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1FB882]/15 text-[#1FB882] border border-[#1FB882]/30 font-bold">
                  {lastSubmitted.reference_id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-lg bg-[#121212]">
                  <span className="text-neutral-400 text-[10px] block">Detected Priority</span>
                  <span className={`font-mono font-bold ${
                    lastSubmitted.priority === 'CRITICAL' ? 'text-[#A31C1B]' :
                    lastSubmitted.priority === 'HIGH' ? 'text-amber-300' : 'text-[#1FB882]'
                  }`}>
                    {lastSubmitted.priority}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#121212]">
                  <span className="text-neutral-400 text-[10px] block">Status</span>
                  <span className="font-mono font-bold text-neutral-200">{lastSubmitted.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Track Report by Reference ID */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-3.5 shadow-xl">
            <span className="font-display font-semibold text-sm text-[#F8F7F2] flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#1FB882]" />
              <span>Track Report Status</span>
            </span>
            <p className="text-xs text-neutral-400">
              Enter your unique reference ID to verify investigation progress.
            </p>

            <form onSubmit={handleTrack} className="flex gap-2">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. FS-2026-E4912"
                className="flex-1 rounded-xl px-3 py-2 text-xs font-mono uppercase bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-[#A31C1B]"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-3.5 py-2 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-[#A31C1B]/20"
              >
                {trackingLoading ? '...' : 'Track'}
              </button>
            </form>

            {trackingError && (
              <div className="p-2.5 rounded-lg bg-[#A31C1B]/10 border border-[#A31C1B]/30 text-xs text-[#A31C1B]">
                {trackingError}
              </div>
            )}

            {trackedReport && (
              <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <span className="font-mono font-bold text-[#1FB882]">{trackedReport.reference_id}</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    trackedReport.priority === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                    trackedReport.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                    'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                  }`}>
                    {trackedReport.priority}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-200">{trackedReport.title}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{trackedReport.description}</p>
                </div>

                <div className="p-2 rounded-lg bg-[#171717] border border-white/10 text-[11px]">
                  <span className="text-amber-300 font-semibold block">Directive:</span>
                  <p className="text-neutral-300">{trackedReport.recommended_action}</p>
                </div>

                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase">Audit Timeline:</span>
                  {trackedReport.audits.map((a) => (
                    <div key={a.id} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                      <span className="text-[#1FB882]">•</span>
                      <span><strong>{a.new_status}</strong>: {a.notes || 'Status updated'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explainability Callout */}
          <div className="rounded-2xl bg-[#06110C] border border-[#1FB882]/20 p-4 space-y-2 text-xs shadow-xl">
            <span className="font-semibold text-[#1FB882] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Compound Heuristics</span>
            </span>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Priorities are derived deterministically based on trigger combinations (e.g., Electrical + Water presence = CRITICAL priority). No private audio is exported to external AI clouds.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Report Queue for Employers & Supervisors */}
      <div className="rounded-2xl bg-[#171717] border border-white/10 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="font-display font-bold text-sm text-[#F8F7F2] flex items-center gap-2">
              <span>Operational Safety Reports Queue</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                {reports.length}
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-neutral-400 px-1">Priority:</span>
              {['All', 'CRITICAL', 'HIGH', 'MEDIUM'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    priorityFilter === p ? 'bg-[#A31C1B] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-white/10">
              <span className="text-[10px] font-mono text-neutral-400 px-1">Status:</span>
              {['All', 'OPEN', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    statusFilter === s ? 'bg-[#A31C1B] text-white font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Queue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className={`p-4 rounded-xl bg-[#121212] border space-y-3 transition-all ${
                  report.priority === 'CRITICAL'
                    ? 'border-[#A31C1B]/60 shadow-md shadow-[#A31C1B]/15'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        report.priority === 'CRITICAL' ? 'bg-[#A31C1B]/20 text-[#A31C1B] border border-[#A31C1B]/30' :
                        report.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        'bg-[#1FB882]/20 text-[#1FB882] border border-[#1FB882]/30'
                      }`}>
                        {report.priority}
                      </span>
                      <span className="font-mono text-xs font-semibold text-neutral-400">{report.reference_id}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-xs text-neutral-400">{report.category}</span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-[#F8F7F2]">
                      {report.title}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] font-semibold uppercase text-neutral-300">
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {report.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#171717] border border-white/10 text-[11px] space-y-0.5">
                  <span className="text-amber-300 font-semibold block">Directive:</span>
                  <p className="text-neutral-300">{report.recommended_action}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-1.5 border-t border-white/10 gap-2">
                  <span className="text-neutral-400 text-[11px]">📍 {report.site_name}</span>

                  <div className="flex items-center gap-1.5">
                    {report.status === 'OPEN' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'ACKNOWLEDGED')}
                        disabled={updatingId === report.id}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}
                    {report.status === 'ACKNOWLEDGED' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'UNDER_INVESTIGATION')}
                        disabled={updatingId === report.id}
                        className="px-2.5 py-1 rounded-lg bg-[#1FB882]/20 hover:bg-[#1FB882]/30 text-[#1FB882] border border-[#1FB882]/30 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        Start Investigation
                      </button>
                    )}
                    {report.status === 'UNDER_INVESTIGATION' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                        disabled={updatingId === report.id}
                        className="px-2.5 py-1 rounded-lg bg-[#1FB882] hover:bg-[#199d6e] text-[#06110C] font-bold text-[11px] transition-all cursor-pointer shadow-md shadow-[#1FB882]/20"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {report.status === 'RESOLVED' && (
                      <span className="text-[11px] text-[#1FB882] font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Remediated</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-8 text-center text-xs text-neutral-400">
              No safety reports found matching selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
