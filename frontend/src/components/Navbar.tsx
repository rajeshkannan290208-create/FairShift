import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Industry, UserRole, ActiveTab } from '../types';
import { 
  Building2, HardHat, GraduationCap, RefreshCw, 
  ShieldCheck, Calculator, Clock, 
  Smartphone, Briefcase, History, Menu, X, ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedIndustry: Industry;
  onSelectIndustry: (ind: Industry) => void;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedIndustry,
  onSelectIndustry,
  userRole,
  onSelectRole,
  onResetDemo,
  isResetting,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Building2 },
    { id: 'fairpay' as ActiveTab, label: 'FairPay AI', icon: Calculator },
    { id: 'silentshield' as ActiveTab, label: 'SilentShield', icon: ShieldCheck },
    { id: 'shiftguardian' as ActiveTab, label: 'ShiftGuardian', icon: Clock },
    { id: 'worker-terminal' as ActiveTab, label: 'Worker Mobile', icon: Smartphone },
    { id: 'employer-terminal' as ActiveTab, label: 'Employer Console', icon: Briefcase },
    { id: 'activity' as ActiveTab, label: 'Audit Trail', icon: History },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#171717]/95 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <button 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2 cursor-pointer focus:outline-none shrink-0"
            title="FairShift Homepage"
          >
            <BrandLogo size={32} showTagline={false} />
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#06110C] text-[#1FB882] font-semibold border border-[#1FB882]/30 shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1FB882]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Subnav for Medium Screens */}
          <div className="hidden md:flex xl:hidden items-center space-x-1 text-xs">
            <button
              onClick={() => handleNavClick('fairpay')}
              className={`px-2 py-1 rounded-md transition-colors ${currentTab === 'fairpay' ? 'text-[#A31C1B] font-semibold' : 'text-stone-400'}`}
            >
              FairPay
            </button>
            <button
              onClick={() => handleNavClick('silentshield')}
              className={`px-2 py-1 rounded-md transition-colors ${currentTab === 'silentshield' ? 'text-[#A31C1B] font-semibold' : 'text-stone-400'}`}
            >
              SilentShield
            </button>
            <button
              onClick={() => handleNavClick('shiftguardian')}
              className={`px-2 py-1 rounded-md transition-colors ${currentTab === 'shiftguardian' ? 'text-[#1FB882] font-semibold' : 'text-stone-400'}`}
            >
              ShiftGuardian
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-2 py-1 rounded-md transition-colors ${currentTab === 'dashboard' ? 'text-white font-semibold' : 'text-stone-400'}`}
            >
              Dashboard
            </button>
          </div>

          {/* Right Controls: Industry + Demo Role + Launch CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Industry Selector */}
            <div className="flex items-center bg-[#1f1f1f] p-1 rounded-lg border border-white/10 text-xs">
              <select
                value={selectedIndustry}
                onChange={(e) => onSelectIndustry(e.target.value as Industry)}
                aria-label="Select industry sector"
                className="bg-transparent text-stone-300 font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="All" className="bg-[#171717] text-white">All Sectors</option>
                <option value="Construction" className="bg-[#171717] text-white">🏗️ Construction</option>
                <option value="College Facilities" className="bg-[#171717] text-white">🎓 College Facilities</option>
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-[#1f1f1f] p-1 rounded-lg border border-white/10 text-xs">
              <span className="text-[10px] font-mono text-stone-400 px-1 uppercase hidden lg:inline">
                Role:
              </span>
              <button
                onClick={() => {
                  onSelectRole('Worker');
                  if (currentTab !== 'worker-terminal') onSelectTab('worker-terminal');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  userRole === 'Worker'
                    ? 'bg-[#1FB882] text-[#06110C]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => {
                  onSelectRole('Employer');
                  if (currentTab !== 'employer-terminal') onSelectTab('employer-terminal');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  userRole === 'Employer'
                    ? 'bg-[#A31C1B] text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Employer
              </button>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="p-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#1FB882] border border-white/10 transition-all cursor-pointer"
              title="Reset baseline demonstration data"
              aria-label="Reset baseline demonstration data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

            {/* Launch Platform CTA with Crimson Red */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A31C1B] hover:bg-[#b82322] text-white font-bold text-xs shadow-md shadow-[#A31C1B]/20 transition-all cursor-pointer shrink-0"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="px-2.5 py-1 rounded bg-[#A31C1B] text-white font-bold text-xs"
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#1a1a1a] border-b border-white/10 px-4 pt-3 pb-5 space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left ${
                    currentTab === item.id
                      ? 'bg-[#06110C] border-[#1FB882]/40 text-[#1FB882] font-semibold'
                      : 'bg-[#1f1f1f] border-white/5 text-stone-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Selectors */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">Sector:</span>
              <select
                value={selectedIndustry}
                onChange={(e) => onSelectIndustry(e.target.value as Industry)}
                aria-label="Mobile industry selector"
                className="bg-[#1f1f1f] border border-white/10 rounded px-2 py-1 text-stone-200 text-xs"
              >
                <option value="All">All</option>
                <option value="Construction">Construction</option>
                <option value="College Facilities">College Facilities</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#1f1f1f] p-1 rounded border border-white/10">
              <button
                onClick={() => {
                  onSelectRole('Worker');
                  handleNavClick('worker-terminal');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  userRole === 'Worker' ? 'bg-[#1FB882] text-[#06110C]' : 'text-stone-400'
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => {
                  onSelectRole('Employer');
                  handleNavClick('employer-terminal');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  userRole === 'Employer' ? 'bg-[#A31C1B] text-white' : 'text-stone-400'
                }`}
              >
                Employer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
