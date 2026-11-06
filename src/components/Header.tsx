import React from 'react';
import {
  Menu,
  PlusCircle,
  Sparkles,
  Info,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Applicant } from '../types';
import { SAMPLE_APPLICANTS } from '../data/sampleApplicants';

interface HeaderProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onStartNewAssessment: () => void;
  onSelectSampleApplicant: (applicant: Applicant) => void;
  onOpenLanding: () => void;
  systemStatus: {
    database: string;
    geminiConfigured: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onStartNewAssessment,
  onSelectSampleApplicant,
  onOpenLanding,
  systemStatus,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Risk Dashboard', subtitle: 'Portfolio credit risk analytics, loan volumes, and distribution' };
      case 'new-assessment':
        return { title: 'Underwriting Assessment Engine', subtitle: 'Evaluate applicant repayment capacity, DTI, FOIR, and credit risk' };
      case 'applicants':
        return { title: 'Applicant Directory', subtitle: 'View and manage registered applicant profiles and credentials' };
      case 'analytics':
        return { title: 'Advanced Risk Analytics', subtitle: 'Deep-dive risk correlation, credit tiers, and loan purpose exposure' };
      case 'simulator':
        return { title: 'Interactive Loan Simulator', subtitle: 'Compare loan tenures, interest rates, and debt burden projections' };
      case 'advisor':
        return { title: 'Ask LoanWise AI Advisor', subtitle: 'Real-time contextual advisory on affordability, score optimization, and DTI' };
      case 'history':
        return { title: 'Assessment Dossier History', subtitle: 'Browse, export, and print previous institutional risk evaluations' };
      case 'settings':
        return { title: 'System Configuration', subtitle: 'Database connectivity, AI model telemetry, and benchmark calibration' };
      default:
        return { title: 'LoanWise AI', subtitle: 'Credit risk assessment & loan eligibility' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#173B70] tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Sample Profile Quick Select */}
        <div className="relative hidden md:block">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                const found = SAMPLE_APPLICANTS.find((a) => a.id === e.target.value);
                if (found) onSelectSampleApplicant(found);
                e.target.value = '';
              }
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="" disabled>
              ⚡ Quick Demo Profiles...
            </option>
            {SAMPLE_APPLICANTS.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.fullName} (Score: {sample.creditScore}, ₹{(sample.requestedAmount / 100000).toFixed(1)}L)
              </option>
            ))}
          </select>
        </div>

        {/* System Pill */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{systemStatus.geminiConfigured ? 'Gemini 3.8 Flash' : 'Hybrid AI Engine'}</span>
        </div>

        {/* Landing Page Trigger */}
        <button
          onClick={onOpenLanding}
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-[#173B70] hover:bg-blue-100 transition-colors border border-blue-200/60"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Overview</span>
        </button>

        {/* CTA: New Assessment */}
        <button
          onClick={onStartNewAssessment}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2878E5] hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Assess Loan</span>
        </button>
      </div>
    </header>
  );
};
