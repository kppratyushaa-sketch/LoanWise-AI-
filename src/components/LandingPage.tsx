import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Calculator,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronRight,
  BarChart3,
  Users,
} from 'lucide-react';
import { SAMPLE_APPLICANTS } from '../data/sampleApplicants';
import { Applicant } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onSelectSample: (applicant: Applicant) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
  onSelectSample,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onExploreDemo}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#173B70] to-[#2878E5] flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#173B70]">LoanWise</span>
              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#2878E5]">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onExploreDemo}
              className="text-sm font-semibold text-slate-600 hover:text-[#173B70] px-3 py-2 transition-colors"
            >
              Live Dashboard
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center space-x-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-[#2878E5] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#173B70] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#2878E5]" />
              <span>Institutional-Grade Risk Underwriting & Explainable AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#173B70] leading-[1.15]">
              Understand Your Loan Eligibility <span className="text-[#2878E5]">Before You Apply</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Analyze your debt-to-income ratio, post-loan burden, and credit profile with verified financial math and transparent AI reasoning—protecting your credit score from premature rejections.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-xl bg-[#173B70] hover:bg-[#122F5A] text-white shadow-xl shadow-blue-950/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>Assess My Loan Eligibility</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Explore Demo Dashboard</span>
              </button>
            </div>

            {/* Quick Demo Applicant Selector Chips */}
            <div className="mt-10 pt-8 border-t border-slate-200/70">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Try one-click demo applicant evaluations:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SAMPLE_APPLICANTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-blue-900 shadow-2xs transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{sample.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({sample.creditScore})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Feature Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900">1. Exact Calculations</span>
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">EMI & FOIR Math</div>
                <p className="mt-2 text-xs text-slate-600 leading-normal">
                  Strictly deterministic formulas for Fixed Obligation to Income (FOIR) and Debt-to-Income (DTI). Never hallucinated.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">2. Explainable AI</span>
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">Why This Result?</div>
                <p className="mt-2 text-xs text-slate-600 leading-normal">
                  Gemini AI identifies exact positive & negative credit factors, explaining why lenders approve or decline.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">3. Actionable Dossier</span>
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">Instant PDF & Advice</div>
                <p className="mt-2 text-xs text-slate-600 leading-normal">
                  Export institutional reports and chat with the AI Advisor to adjust tenures and optimize debt burden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2878E5]">System Architecture</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#173B70]">How LoanWise AI Works</p>
            <p className="mt-3 text-sm text-slate-600">
              A hybrid architecture combining institutional banking mathematical models with Google Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Input Financial Data',
                desc: 'Enter monthly income, obligations, bureau credit score, and requested loan parameters in our 4-step wizard.',
              },
              {
                step: '02',
                title: 'Deterministic Engine',
                desc: 'Calculates exact new EMI, post-loan debt burden (FOIR), pre/post disposable income, and baseline risk.',
              },
              {
                step: '03',
                title: 'Explainable AI Underwriting',
                desc: 'Gemini AI evaluates holistic cashflow stability, historical delays, and highlights positive & negative factors.',
              },
              {
                step: '04',
                title: 'Dossier & AI Advisory',
                desc: 'Review interactive gauges, export formatted PDF reports, and simulate alternative tenures with the advisor.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#F5F7FB] border border-slate-200/80 relative">
                <span className="text-3xl font-black text-blue-200/80 font-mono">{item.step}</span>
                <h3 className="mt-3 text-lg font-bold text-[#173B70]">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2878E5]">FinTech Value</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#173B70]">Benefits of AI-Powered Risk Assessment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Bureau Inquiries</h3>
              <p className="mt-2 text-sm text-slate-600">
                Official bank applications register "hard inquiries" on your bureau file, depressing your score if rejected. LoanWise AI lets you test viability completely risk-free.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Accurate Affordability Bounds</h3>
              <p className="mt-2 text-sm text-slate-600">
                Instead of guessing, understand your exact maximum affordable EMI and reverse-calculated loan principal based on a 50% FOIR regulatory safety benchmark.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Contextual AI Advisory</h3>
              <p className="mt-2 text-sm text-slate-600">
                Ask targeted questions to our conversational AI financial advisor to discover how adjusting loan tenure from 36 to 60 months alters your risk classification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Regulatory & Educational Disclaimer */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Important Decision-Support Notice</span>
          </div>
          <h4 className="text-xl font-bold mb-3">Educational FinTech Demonstration</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl mx-auto">
            LoanWise AI is an educational decision-support application built to showcase AI/ML financial analysis patterns. It does not access confidential credit bureau records, initiate real financial underwriting, or guarantee loan approval or interest rates from commercial banks or NBFCs. All calculations follow standard retail credit benchmarks and should be treated as guidance only.
          </p>

          <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-slate-400">
            <span>© 2026 LoanWise AI</span>
            <span>•</span>
            <button onClick={onExploreDemo} className="hover:text-white underline">
              Dashboard
            </button>
            <span>•</span>
            <button onClick={onGetStarted} className="hover:text-white underline">
              New Assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
