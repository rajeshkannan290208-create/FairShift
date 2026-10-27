import React, { useState } from 'react';
import { ActiveTab, Industry, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { FairPayView } from './components/FairPayView';
import { SilentShieldView } from './components/SilentShieldView';
import { ShiftGuardianView } from './components/ShiftGuardianView';
import { WorkerWorkspace } from './components/WorkerWorkspace';
import { EmployerWorkspace } from './components/EmployerWorkspace';
import { AuditLogView } from './components/AuditLogView';
import { ResetModal } from './components/ResetModal';
import { api } from './services/api';
import { Check } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('landing');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('All');
  const [userRole, setUserRole] = useState<UserRole>('Worker');
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      await api.resetDemoData();
      setIsResetModalOpen(false);
      showToast('FairShift demo data successfully restored to benchmark state!');
      window.location.reload();
    } catch (err: any) {
      alert(`Reset error: ${err?.message || 'Server error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#171717] text-[#f8fafc] selection:bg-[#A31C1B]/40 selection:text-white relative overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-[#06110C] border border-[#1FB882]/40 text-[#1FB882] text-xs font-semibold shadow-2xl flex items-center gap-2 glow-forest animate-bounce">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Compact Unified Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedIndustry={selectedIndustry}
        onSelectIndustry={setSelectedIndustry}
        userRole={userRole}
        onSelectRole={setUserRole}
        onResetDemo={() => setIsResetModalOpen(true)}
        isResetting={isResetting}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={setCurrentTab}
            onSelectIndustry={setSelectedIndustry}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            selectedIndustry={selectedIndustry}
            onSelectIndustry={setSelectedIndustry}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'worker-terminal' && (
          <WorkerWorkspace
            onNavigate={setCurrentTab}
            selectedIndustry={selectedIndustry}
          />
        )}

        {currentTab === 'employer-terminal' && (
          <EmployerWorkspace
            onNavigate={setCurrentTab}
            selectedIndustry={selectedIndustry}
            onSelectIndustry={setSelectedIndustry}
          />
        )}

        {currentTab === 'fairpay' && (
          <FairPayView
            selectedIndustry={selectedIndustry}
          />
        )}

        {currentTab === 'silentshield' && (
          <SilentShieldView
            selectedIndustry={selectedIndustry}
            userRole={userRole}
          />
        )}

        {currentTab === 'shiftguardian' && (
          <ShiftGuardianView
            selectedIndustry={selectedIndustry}
          />
        )}

        {currentTab === 'activity' && (
          <AuditLogView
            onResetDemo={() => setIsResetModalOpen(true)}
            isResetting={isResetting}
          />
        )}
      </main>

      {/* 8. Compact Footer */}
      <footer className="border-t border-white/10 bg-[#06110C]/95 py-4 px-4 sm:px-6 lg:px-8 mt-10 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#F8F7F2]">
              Fair<span className="text-[#A31C1B]">Shift</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#1FB882]">
              UN SDG 8
            </span>
            <span className="text-neutral-600 hidden md:inline">•</span>
            <span className="text-[11px] text-neutral-400 hidden md:inline">
              Every hour counts. Every voice matters.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <button 
              onClick={() => setCurrentTab('fairpay')}
              className="hover:text-[#A31C1B] transition-colors cursor-pointer"
            >
              FairPay AI
            </button>
            <span className="text-neutral-600">•</span>
            <button 
              onClick={() => setCurrentTab('silentshield')}
              className="hover:text-[#A31C1B] transition-colors cursor-pointer"
            >
              SilentShield
            </button>
            <span className="text-neutral-600">•</span>
            <button 
              onClick={() => setCurrentTab('shiftguardian')}
              className="hover:text-[#1FB882] transition-colors cursor-pointer"
            >
              ShiftGuardian
            </button>
            <span className="text-neutral-600">•</span>
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span className="text-neutral-600">•</span>
            <button 
              onClick={() => setCurrentTab('activity')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Audit Trail
            </button>
          </div>

          <div className="text-[10px] font-mono text-neutral-500">
            PromptWars 2026 × SRM ACM • MIT License
          </div>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        isResetting={isResetting}
      />
    </div>
  );
}

export default App;
