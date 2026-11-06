import React, { useState } from 'react';
import {
  Settings,
  Database,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { resetSampleData } from '../services/api';

interface SettingsModalProps {
  systemStatus: {
    database: string;
    databaseMessage: string;
    geminiConfigured: boolean;
    model: string;
    applicantCount: number;
    assessmentCount: number;
  };
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  systemStatus,
  onRefreshData,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetSampleData();
      setResetSuccess(true);
      onRefreshData();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2878E5] mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-[#173B70]">Configuration & Status</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend database connectivity, Google Gemini AI integration, and underwriting policy thresholds.
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Database Engine</h3>
                <span className="text-xs text-slate-500">MongoDB with Mongoose / Demo DB</span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                systemStatus.database === 'mongodb'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus.database === 'mongodb' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
              <span>{systemStatus.database === 'mongodb' ? 'MongoDB Active' : 'Local Demo Mode'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {systemStatus.database === 'mongodb'
              ? 'Connected to active MongoDB Atlas / local cluster. All applicant profiles and assessment results are permanently persisted.'
              : 'Operating in ultra-fast Local Demo Mode with in-memory persistence and 5 pre-loaded test profiles. To connect MongoDB, configure MONGODB_URI in the environment.'}
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Applicants in Memory: <strong>{systemStatus.applicantCount}</strong></span>
            <span>Assessments: <strong>{systemStatus.assessmentCount}</strong></span>
          </div>
        </div>

        {/* Gemini AI Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Gemini AI</h3>
                <span className="text-xs text-slate-500">Explainable Financial Underwriting</span>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                systemStatus.geminiConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  systemStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{systemStatus.geminiConfigured ? 'Gemini 3.8 Flash' : 'Hybrid Rule Model'}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {systemStatus.geminiConfigured
              ? 'Gemini 3.8 Flash is active via server-side @google/genai SDK. AI powers natural-language explainability, risk categorization, and conversational advisory.'
              : 'Running in rule-based underwriting mode. Numerical calculations (FOIR, DTI, EMI) remain 100% accurate and mathematically verifiable.'}
          </p>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Server User-Agent: <strong className="font-mono text-slate-700">aistudio-build</strong>
          </div>
        </div>
      </div>

      {/* Underwriting Benchmark Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#173B70] flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <span>Institutional Underwriting Policy Benchmarks</span>
        </h3>
        <p className="text-xs text-slate-500">
          The mathematical heuristics used to segment applicants into Low, Moderate, and High Risk categories.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800">Fixed Obligation (FOIR)</span>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div>&bull; &le; 40%: <strong className="text-emerald-600">Conservative / Prime</strong></div>
              <div>&bull; 40% - 50%: <strong className="text-blue-600">Standard Retail Safe</strong></div>
              <div>&bull; &gt; 50%: <strong className="text-red-600">High Burden / Stretch</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800">Credit Bureau Score</span>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div>&bull; 750+: <strong className="text-emerald-600">Tier-1 Prime</strong></div>
              <div>&bull; 650 - 749: <strong className="text-amber-600">Near-Prime / Good</strong></div>
              <div>&bull; &lt; 650: <strong className="text-red-600">Subprime / High Risk</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800">Risk Model Weights</span>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div>&bull; Credit Score: <strong>35%</strong></div>
              <div>&bull; Post-Loan FOIR: <strong>25%</strong></div>
              <div>&bull; DTI & Repayment: <strong>30%</strong></div>
              <div>&bull; Savings Liquidity: <strong>10%</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Sample Data & Testing Utility */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Restore Demonstration Dataset</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset database to the 5 standard fictional applicants (Rajesh, Priya, Vikram, Ananya, Suresh) and their pre-computed assessments.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Sample Data'}</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo dataset reset to initial state with 5 fictional applicant profiles!</span>
        </div>
      )}

      {/* Privacy & Fair Lending Statement */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-1.5">
        <div className="flex items-center space-x-2 font-bold text-white">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Privacy & Responsible AI Governance</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          LoanWise AI does not evaluate race, gender, religion, caste, national origin, or protected demographic traits. All assessments rely exclusively on verifiable financial cashflow and credit behavior indicators. No confidential bank access tokens or permanent credentials are required.
        </p>
      </div>
    </div>
  );
};
