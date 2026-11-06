import React, { useState } from 'react';
import {
  Download,
  Printer,
  BotMessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Assessment } from '../types';
import { CreditScoreGauge } from './CreditScoreGauge';
import { RiskScoreGauge } from './RiskScoreGauge';
import { formatINR, formatPercent } from '../utils/financialEngine';
import { generateAssessmentPDF } from '../utils/pdfGenerator';

interface AssessmentReportViewProps {
  assessment: Assessment;
  onBack: () => void;
  onAskAi: (assessment: Assessment) => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  assessment,
  onBack,
  onAskAi,
}) => {
  const [filterImpact, setFilterImpact] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');

  const applicant = assessment.applicant || {
    id: 'app-default',
    fullName: assessment.applicantName || 'Applicant',
    age: 30,
    employmentType: 'Salaried - Private',
    employmentDurationMonths: 24,
    city: 'N/A',
    monthlyIncome: 50000,
    additionalIncome: 0,
    monthlyExpenses: 20000,
    existingEmi: 5000,
    totalOutstandingDebt: 50000,
    savingsAmount: 100000,
    creditScore: 750,
    repaymentHistory: 'Good (1-2 delays)',
    numPreviousLoans: 1,
    delayedPayments: 0,
    previousDefaults: 0,
    creditHistoryMonths: 36,
    requestedAmount: 500000,
    loanPurpose: 'Home Purchase / Renovation',
    tenureMonths: 36,
    interestRate: 10.5,
  };

  const metrics = assessment.metrics || {
    totalMonthlyIncome: 50000,
    debtToIncomeRatio: 10,
    disposableIncome: 25000,
    loanToIncomeRatio: 0.8,
    newEmi: 15000,
    totalInterest: 40000,
    totalRepayment: 540000,
    postLoanDebtBurden: 40,
    repaymentCapacity: 'Manageable' as const,
    disposableIncomePostEmi: 10000,
    maxAffordableEmi: 20000,
    maxAffordableLoan: 600000,
  };

  // Chart data: Monthly Cashflow Outflow Breakdown
  const cashflowData = [
    { name: 'Living Expenses', amount: applicant.monthlyExpenses || 0, color: '#94A3B8' },
    { name: 'Existing EMIs', amount: applicant.existingEmi || 0, color: '#F59E0B' },
    { name: 'Proposed EMI', amount: metrics.newEmi || 0, color: '#2878E5' },
    {
      name: 'Net Buffer Surplus',
      amount: Math.max(0, metrics.disposableIncomePostEmi || 0),
      color: '#10B981',
    },
  ];

  // Affordability Comparison: Proposed EMI vs Max Affordable EMI
  const affordabilityData = [
    {
      name: 'Monthly Commitment',
      ProposedEMI: metrics.newEmi || 0,
      MaxSafeEMI: metrics.maxAffordableEmi || 0,
    },
  ];

  const filteredFactors = (assessment.factorBreakdown || []).filter((item) => {
    if (filterImpact === 'All') return true;
    return item.impact === filterImpact;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateAssessmentPDF(assessment);
  };

  // Eligibility Pill Styling
  let eligibilityPill = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    badge: 'Likely Eligible',
  };
  if (assessment.eligibilityAssessment === 'Needs Financial Review') {
    eligibilityPill = {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      badge: 'Needs Financial Review',
    };
  } else if (assessment.eligibilityAssessment === 'Potentially Not Affordable') {
    eligibilityPill = {
      bg: 'bg-red-50 text-red-800 border-red-300',
      icon: XCircle,
      badge: 'Potentially Not Affordable',
    };
  }

  const StatusIcon = eligibilityPill.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 print:p-0">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onAskAi(assessment)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
          >
            <BotMessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Ask LoanWise AI</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#2878E5] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2878E5]">
                Loan Underwriting Dossier
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">ID: {assessment.id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {new Date(assessment.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B70] mt-1.5">
              {assessment.applicantName}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>
                <strong>Purpose:</strong> {applicant.loanPurpose}
              </span>
              <span>•</span>
              <span>
                <strong>Requested:</strong> {formatINR(applicant.requestedAmount)}
              </span>
              <span>•</span>
              <span>
                <strong>Tenure:</strong> {applicant.tenureMonths} Months @ {applicant.interestRate}% p.a.
              </span>
              <span>•</span>
              <span>
                <strong>Location:</strong> {applicant.city}
              </span>
            </div>
          </div>

          {/* Eligibility Badge */}
          <div className="flex flex-col items-start lg:items-end">
            <div className={`px-4 py-2 rounded-xl border flex items-center space-x-2 text-sm font-bold ${eligibilityPill.bg}`}>
              <StatusIcon className="w-4.5 h-4.5" />
              <span>{eligibilityPill.badge}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              Model: <strong className="text-slate-600 uppercase">{assessment.modelUsed}</strong>
            </span>
          </div>
        </div>

        {/* Structured Core Underwriting Evaluation: Dual-Gauge Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel 1: Credit Bureau Assessment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#173B70]">Credit Bureau Standing</h3>
                    <p className="text-[11px] text-slate-500">Official retail bureau creditworthiness</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Scale: 300 – 900
                </span>
              </div>

              {/* Polished Speedometer Gauge */}
              <div className="py-5 flex items-center justify-center">
                <CreditScoreGauge score={applicant.creditScore || 700} showDetails={true} />
              </div>
            </div>

            {/* Structured Credit Sub-indicators */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Credit Vintage</span>
                <span className="font-bold text-slate-800 font-mono">
                  {((applicant.creditHistoryMonths || 24) / 12).toFixed(1)} Yrs
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Past Delays</span>
                <span className={`font-bold font-mono ${applicant.delayedPayments > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {applicant.delayedPayments || 0} Missed
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Defaults</span>
                <span className={`font-bold font-mono ${applicant.previousDefaults > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {applicant.previousDefaults || 0} Default
                </span>
              </div>
            </div>
          </div>

          {/* Panel 2: AI Credit Risk Index */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#173B70]">AI Risk Assessment</h3>
                    <p className="text-[11px] text-slate-500">Multivariate default risk index</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Index: 0 – 100
                </span>
              </div>

              {/* Polished Risk Gauge */}
              <div className="py-5 flex items-center justify-center">
                <RiskScoreGauge score={assessment.riskScore || 0} showDetails={true} />
              </div>
            </div>

            {/* Structured Underwriting Indicators */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Default Risk</span>
                <span className={`font-bold ${assessment.riskCategory === 'Low Risk' ? 'text-emerald-600' : assessment.riskCategory === 'Moderate Risk' ? 'text-amber-600' : 'text-red-600'}`}>
                  {assessment.riskCategory === 'Low Risk' ? '< 2.5%' : assessment.riskCategory === 'Moderate Risk' ? '2.5% – 7.5%' : '> 7.5%'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Repayment Buffer</span>
                <span className="font-bold text-slate-800 truncate block">
                  {metrics.repaymentCapacity}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="text-[10px] text-slate-400 block font-medium">Underwriting</span>
                <span className="font-bold text-indigo-700">
                  {assessment.modelUsed === 'gemini-3.8-flash' ? 'Gemini AI' : 'Rule Model'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Financial Capacity & Burden Metric Cards */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Proposed Monthly EMI */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proposed Monthly EMI</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#173B70] font-mono mt-1">
                {formatINR(metrics.newEmi)}
                <span className="text-xs text-slate-400 font-normal">/mo</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between">
              <span>Total Interest:</span>
              <strong className="text-slate-800 font-mono">{formatINR(metrics.totalInterest)}</strong>
            </div>
          </div>

          {/* Card 2: Post-Loan FOIR */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Post-Loan FOIR</span>
                <span className="text-[10px] text-slate-400">Safe: &le; 50%</span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                    metrics.postLoanDebtBurden <= 45
                      ? 'text-emerald-600'
                      : metrics.postLoanDebtBurden <= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {metrics.postLoanDebtBurden}%
                </span>
                <span className="text-xs text-slate-400 font-normal">of income</span>
              </div>
            </div>

            {/* Visual Bar with 50% Threshold Marker */}
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2 relative overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    metrics.postLoanDebtBurden <= 45
                      ? 'bg-emerald-500'
                      : metrics.postLoanDebtBurden <= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.postLoanDebtBurden)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Total EMI: {formatINR((applicant.existingEmi || 0) + metrics.newEmi)}/mo</span>
              </div>
            </div>
          </div>

          {/* Card 3: Debt-to-Income (DTI) */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pre-Loan DTI Ratio</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono mt-1">
                {metrics.debtToIncomeRatio}%
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between">
              <span>Existing Debt Outflow:</span>
              <strong className="text-slate-800 font-mono">{formatINR(applicant.existingEmi || 0)}/mo</strong>
            </div>
          </div>

          {/* Card 4: Maximum Safe Borrowing Headroom */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Max Safe Loan Limit</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-1">
                {formatINR(metrics.maxAffordableLoan)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between">
              <span>Net Buffer Post-EMI:</span>
              <strong className={metrics.disposableIncomePostEmi >= 0 ? 'text-slate-900 font-mono' : 'text-red-600 font-mono'}>
                {formatINR(metrics.disposableIncomePostEmi)}
              </strong>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#173B70] mb-1">
            <Sparkles className="w-4 h-4 text-[#2878E5]" />
            <span>AI Underwriting Executive Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {assessment.summary}
          </p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Cashflow Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider mb-1">
            Monthly Income Allocation
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            How total monthly earnings ({formatINR(metrics.totalMonthlyIncome)}) are consumed.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {cashflowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Affordability Benchmark */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider mb-1">
              Affordability Safety Benchmark
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Proposed EMI vs. institutional maximum safe limit (50% FOIR ceiling).
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Proposed New EMI:</span>
                  <span className="text-[#2878E5] font-bold font-mono">{formatINR(metrics.newEmi)}/mo</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#2878E5] h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (metrics.newEmi / Math.max(1, metrics.maxAffordableEmi)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Max Safe Affordable EMI:</span>
                  <span className="text-emerald-600 font-bold font-mono">{formatINR(metrics.maxAffordableEmi)}/mo</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-3 rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <strong>Capacity Verdict:</strong>{' '}
            {metrics.newEmi <= metrics.maxAffordableEmi ? (
              <span className="text-emerald-700 font-medium">
                Proposed loan EMI is within conservative retail debt tolerance limits.
              </span>
            ) : (
              <span className="text-red-700 font-medium">
                Proposed EMI exceeds safe disposable limits by{' '}
                {formatINR(metrics.newEmi - metrics.maxAffordableEmi)}/month. Consider extending tenure or lowering principal.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 7: Explainability Module ("Why This Assessment?") */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#173B70] flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <span>Why This Assessment? (AI Explainability Module)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent breakdown of exact credit, cashflow, and debt burden factors influencing the verdict.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {(['All', 'Positive', 'Neutral', 'Negative'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterImpact(filter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterImpact === filter
                    ? 'bg-white text-[#173B70] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Explainability Factor Cards */}
        <div className="mt-5 space-y-3">
          {filteredFactors.map((item, idx) => {
            const isPos = item.impact === 'Positive';
            const isNeg = item.impact === 'Negative';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isPos
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : isNeg
                    ? 'bg-red-50/40 border-red-200/80'
                    : 'bg-amber-50/40 border-amber-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isPos
                          ? 'bg-emerald-100 text-emerald-800'
                          : isNeg
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.impact}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.factor}</h4>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-700 leading-relaxed">{item.explanation}</p>

                {item.suggestedImprovement && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-start space-x-1.5 text-xs text-[#2878E5]">
                    <span className="font-bold shrink-0">Action Tip:</span>
                    <span className="italic text-slate-700">{item.suggestedImprovement}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Recommendations & Action Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-[#173B70] flex items-center space-x-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#2878E5]" />
          <span>Personalized AI Financial Recommendations</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Steps to optimize your borrowing capacity, reduce risk scores, and negotiate better bank terms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(assessment.recommendations || []).map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-[#173B70] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Disclaimer Footer Box */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
        <div className="font-bold flex items-center space-x-1.5 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Decision-Support Educational Disclaimer</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          LoanWise AI calculations reflect standard mathematical formulas (FOIR, DTI, amortized EMI) and explainable Gemini AI heuristics. This report does not access actual credit bureau databases or guarantee loan disbursement or interest rates from commercial banks.
        </p>
      </div>
    </div>
  );
};
