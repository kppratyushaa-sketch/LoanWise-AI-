import React, { useState, useEffect } from 'react';
import {
  User,
  DollarSign,
  CreditCard,
  Building2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { Applicant, EmploymentType, LoanPurpose, RepaymentHistory } from '../types';
import { SAMPLE_APPLICANTS } from '../data/sampleApplicants';
import { calculateFinancialMetrics, formatINR } from '../utils/financialEngine';

interface AssessmentFormProps {
  initialApplicant?: Applicant | null;
  onSubmit: (applicant: Applicant) => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialApplicant,
  onSubmit,
  isLoading,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<Applicant>({
    id: `app-${Date.now()}`,
    fullName: 'Rajesh Kumar',
    age: 32,
    employmentType: 'Salaried - Private',
    employmentDurationMonths: 48,
    city: 'Bengaluru',
    educationLevel: 'Post Graduate (M.Tech)',

    // Financial
    monthlyIncome: 80000,
    additionalIncome: 10000,
    monthlyExpenses: 20000,
    existingEmi: 5000,
    totalOutstandingDebt: 120000,
    savingsAmount: 450000,

    // Credit
    creditScore: 790,
    repaymentHistory: 'Excellent (0 missed)',
    numPreviousLoans: 2,
    delayedPayments: 0,
    previousDefaults: 0,
    creditHistoryMonths: 60,

    // Loan Details
    requestedAmount: 500000,
    loanPurpose: 'Home Purchase / Renovation',
    tenureMonths: 36,
    interestRate: 10.5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationNotice, setValidationNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialApplicant) {
      setFormData(initialApplicant);
      setErrors({});
      setValidationNotice(null);
    }
  }, [initialApplicant]);

  const handleChange = (field: keyof Applicant, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_APPLICANTS.find((a) => a.id === sampleId);
    if (found) {
      setFormData({
        ...found,
        id: `app-${Date.now()}`,
      });
      setErrors({});
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.age || formData.age < 18 || formData.age > 80) newErrors.age = 'Age must be between 18 and 80';
      if (formData.employmentDurationMonths < 0) newErrors.employmentDurationMonths = 'Duration cannot be negative';
      if (!formData.city.trim()) newErrors.city = 'City is required';
    }

    if (step === 2) {
      if (formData.monthlyIncome <= 0) newErrors.monthlyIncome = 'Monthly income must be greater than 0';
      if (formData.additionalIncome < 0) newErrors.additionalIncome = 'Cannot be negative';
      if (formData.monthlyExpenses < 0) newErrors.monthlyExpenses = 'Expenses cannot be negative';
      if (formData.existingEmi < 0) newErrors.existingEmi = 'Existing EMI cannot be negative';
      if (formData.totalOutstandingDebt < 0) newErrors.totalOutstandingDebt = 'Debt cannot be negative';
      if (formData.savingsAmount < 0) newErrors.savingsAmount = 'Savings cannot be negative';
    }

    if (step === 3) {
      if (formData.creditScore < 300 || formData.creditScore > 900) {
        newErrors.creditScore = 'Credit score must be between 300 and 900';
      }
      if (formData.delayedPayments < 0) newErrors.delayedPayments = 'Cannot be negative';
      if (formData.previousDefaults < 0) newErrors.previousDefaults = 'Cannot be negative';
      if (formData.creditHistoryMonths < 0) newErrors.creditHistoryMonths = 'Cannot be negative';
    }

    if (step === 4) {
      if (formData.requestedAmount <= 0) newErrors.requestedAmount = 'Requested amount must be greater than 0';
      if (formData.tenureMonths <= 0 || formData.tenureMonths > 360) newErrors.tenureMonths = 'Tenure must be between 1 and 360 months';
      if (formData.interestRate < 0 || formData.interestRate > 50) newErrors.interestRate = 'Interest rate must be between 0% and 50%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = (): { isValid: boolean; firstFailedStep: number; errors: Record<string, string> } => {
    const allErrors: Record<string, string> = {};
    let firstFailed = 0;

    // Step 1
    if (!formData.fullName || !formData.fullName.trim()) allErrors.fullName = 'Full name is required';
    if (!formData.age || formData.age < 18 || formData.age > 80) allErrors.age = 'Age must be between 18 and 80';
    if (formData.employmentDurationMonths < 0) allErrors.employmentDurationMonths = 'Duration cannot be negative';
    if (!formData.city || !formData.city.trim()) allErrors.city = 'City is required';
    if (Object.keys(allErrors).length > 0 && firstFailed === 0) firstFailed = 1;

    // Step 2
    if (!formData.monthlyIncome || formData.monthlyIncome <= 0) allErrors.monthlyIncome = 'Monthly income must be greater than 0';
    if (formData.additionalIncome < 0) allErrors.additionalIncome = 'Cannot be negative';
    if (formData.monthlyExpenses < 0) allErrors.monthlyExpenses = 'Expenses cannot be negative';
    if (formData.existingEmi < 0) allErrors.existingEmi = 'Existing EMI cannot be negative';
    if (formData.totalOutstandingDebt < 0) allErrors.totalOutstandingDebt = 'Debt cannot be negative';
    if (formData.savingsAmount < 0) allErrors.savingsAmount = 'Savings cannot be negative';
    if (Object.keys(allErrors).length > 0 && firstFailed === 0) firstFailed = 2;

    // Step 3
    if (formData.creditScore < 300 || formData.creditScore > 900) {
      allErrors.creditScore = 'Credit score must be between 300 and 900';
    }
    if (formData.delayedPayments < 0) allErrors.delayedPayments = 'Cannot be negative';
    if (formData.previousDefaults < 0) allErrors.previousDefaults = 'Cannot be negative';
    if (formData.creditHistoryMonths < 0) allErrors.creditHistoryMonths = 'Cannot be negative';
    if (Object.keys(allErrors).length > 0 && firstFailed === 0) firstFailed = 3;

    // Step 4
    if (!formData.requestedAmount || formData.requestedAmount <= 0) allErrors.requestedAmount = 'Requested amount must be greater than 0';
    if (!formData.tenureMonths || formData.tenureMonths <= 0 || formData.tenureMonths > 360) allErrors.tenureMonths = 'Tenure must be between 1 and 360 months';
    if (formData.interestRate < 0 || formData.interestRate > 50) allErrors.interestRate = 'Interest rate must be between 0% and 50%';
    if (Object.keys(allErrors).length > 0 && firstFailed === 0) firstFailed = 4;

    return {
      isValid: Object.keys(allErrors).length === 0,
      firstFailedStep: firstFailed,
      errors: allErrors,
    };
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setValidationNotice(null);
      setCurrentStep((prev) => Math.min(4, prev + 1));
    } else {
      setValidationNotice('Please complete required fields highlighted below before advancing.');
    }
  };

  const handlePrev = () => {
    setValidationNotice(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = validateAll();
    if (!result.isValid) {
      setErrors(result.errors);
      setValidationNotice('Validation error: Please review the highlighted fields to continue.');
      if (result.firstFailedStep > 0) {
        setCurrentStep(result.firstFailedStep);
      }
      return;
    }
    setValidationNotice(null);
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      id: `app-${Date.now()}`,
      fullName: 'Rajesh Kumar',
      age: 32,
      employmentType: 'Salaried - Private',
      employmentDurationMonths: 48,
      city: 'Bengaluru',
      educationLevel: 'Post Graduate (M.Tech)',
      monthlyIncome: 80000,
      additionalIncome: 10000,
      monthlyExpenses: 20000,
      existingEmi: 5000,
      totalOutstandingDebt: 120000,
      savingsAmount: 450000,
      creditScore: 790,
      repaymentHistory: 'Excellent (0 missed)',
      numPreviousLoans: 2,
      delayedPayments: 0,
      previousDefaults: 0,
      creditHistoryMonths: 60,
      requestedAmount: 500000,
      loanPurpose: 'Home Purchase / Renovation',
      tenureMonths: 36,
      interestRate: 10.5,
    });
    setErrors({});
    setValidationNotice(null);
    setCurrentStep(1);
  };

  // Real-time live metrics
  const liveMetrics = calculateFinancialMetrics(formData);

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Financial Profile', icon: DollarSign },
    { num: 3, title: 'Credit History', icon: CreditCard },
    { num: 4, title: 'Loan Parameters', icon: Building2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Demo Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#173B70] flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Loan Application Underwriting Form</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete the 4-step financial dossier to evaluate risk, DTI, and eligibility.
          </p>
        </div>

        {/* Demo profile quick filler */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Pre-fill demo:</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleSelectSample(e.target.value);
            }}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="" disabled>
              Select fictional applicant...
            </option>
            {SAMPLE_APPLICANTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.employmentType.split('-')[0]}, Score {s.creditScore})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Reset Form"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#2878E5] hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Underwriting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Notice Banner */}
      {validationNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center space-x-2 font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validationNotice}</span>
        </div>
      )}

      {/* Real-Time Live Preview Bar */}
      <div className="bg-gradient-to-r from-[#173B70] to-[#122F5A] rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
          <span className="flex items-center space-x-1.5">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Calculation Preview</span>
          </span>
          <span className="text-cyan-300 font-mono">Deterministic Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200">Total Monthly Income</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">
              {formatINR(liveMetrics.totalMonthlyIncome)}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200">Projected New EMI</div>
            <div className="text-base sm:text-lg font-bold text-cyan-300 mt-0.5 font-mono">
              {formatINR(liveMetrics.newEmi)}
              <span className="text-[10px] text-blue-200 font-normal">/mo</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200">Post-Loan FOIR</div>
            <div
              className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${
                liveMetrics.postLoanDebtBurden <= 45
                  ? 'text-emerald-400'
                  : liveMetrics.postLoanDebtBurden <= 60
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {liveMetrics.postLoanDebtBurden}%
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
            <div className="text-[11px] text-blue-200">Disposable Post-EMI</div>
            <div
              className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${
                liveMetrics.disposableIncomePostEmi >= 0 ? 'text-white' : 'text-red-400'
              }`}
            >
              {formatINR(liveMetrics.disposableIncomePostEmi)}
            </div>
          </div>
        </div>
      </div>

      {/* Step Stepper Tabs */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                // Allow jumping backwards freely, forward only if validated
                if (step.num < currentStep || validateStep(currentStep)) {
                  setCurrentStep(step.num);
                }
              }}
              className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 border-[#2878E5] text-[#173B70] shadow-xs'
                  : isDone
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-white/60 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-[#2878E5] text-white'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <div className="hidden sm:block overflow-hidden">
                <div className="text-xs font-bold truncate">{step.title}</div>
                <div className="text-[10px] text-slate-400 truncate">Step {step.num} of 4</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Form Content Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#173B70]">Section 1: Personal & Employment Background</h3>
              <p className="text-xs text-slate-500">Provide verified demographic and career history.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.fullName ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value, 10) || 0)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.age ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value as EmploymentType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Salaried - Private">Salaried - Private</option>
                  <option value="Salaried - Public / Govt">Salaried - Public / Govt</option>
                  <option value="Self-Employed Professional">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Freelancer / Gig">Freelancer / Gig</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employment Duration (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.employmentDurationMonths}
                  onChange={(e) => handleChange('employmentDurationMonths', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400">
                  Approx. {(formData.employmentDurationMonths / 12).toFixed(1)} years with current employer/business
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. Bengaluru, New Delhi, Mumbai"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.city ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Education Level (Optional)
                </label>
                <input
                  type="text"
                  value={formData.educationLevel || ''}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                  placeholder="e.g. Graduate, Post Graduate"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FINANCIAL INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#173B70]">Section 2: Income & Existing Financial Obligations</h3>
              <p className="text-xs text-slate-500">
                Accurate figures are critical for computing Debt-to-Income (DTI) and net disposable cashflow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Monthly Income (INR ₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleChange('monthlyIncome', Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.monthlyIncome ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                  />
                </div>
                {errors.monthlyIncome && <p className="text-xs text-red-500 mt-1">{errors.monthlyIncome}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Monthly Income (Rent, Consulting, Bonuses)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.additionalIncome}
                    onChange={(e) => handleChange('additionalIncome', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Monthly Living Expenses (Rent, Utilities, Food) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyExpenses}
                    onChange={(e) => handleChange('monthlyExpenses', Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.monthlyExpenses ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Existing Monthly EMI Payments (Active Loans) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.existingEmi}
                    onChange={(e) => handleChange('existingEmi', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Current DTI Burden: {liveMetrics.debtToIncomeRatio}%
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Outstanding Debt (Principal balance across all lenders)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalOutstandingDebt}
                    onChange={(e) => handleChange('totalOutstandingDebt', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Liquid Savings & Fixed Deposits
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.savingsAmount}
                    onChange={(e) => handleChange('savingsAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CREDIT INFORMATION */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#173B70]">Section 3: Credit History & Bureau Record</h3>
              <p className="text-xs text-slate-500">
                Credit track record accounts for 35% of the risk weighting model.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Credit Score (300 – 900) <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      formData.creditScore >= 750
                        ? 'bg-emerald-100 text-emerald-800'
                        : formData.creditScore >= 650
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formData.creditScore >= 750 ? 'Prime' : formData.creditScore >= 650 ? 'Fair' : 'Subprime'}
                  </span>
                </div>
                <input
                  type="number"
                  min="300"
                  max="900"
                  value={formData.creditScore}
                  onChange={(e) => handleChange('creditScore', parseInt(e.target.value, 10) || 300)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.creditScore ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                />
                {errors.creditScore && <p className="text-xs text-red-500 mt-1">{errors.creditScore}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Repayment Track Record <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.repaymentHistory}
                  onChange={(e) => handleChange('repaymentHistory', e.target.value as RepaymentHistory)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Excellent (0 missed)">Excellent (0 missed)</option>
                  <option value="Good (1-2 delays)">Good (1-2 delays)</option>
                  <option value="Fair (Frequent delays)">Fair (Frequent delays)</option>
                  <option value="Poor (Default history)">Poor (Default history)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Number of Previous Loans Serviced
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.numPreviousLoans}
                  onChange={(e) => handleChange('numPreviousLoans', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delayed Payments in Last 24 Months
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.delayedPayments}
                  onChange={(e) => handleChange('delayedPayments', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Historical Loan Defaults or Settlements
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.previousDefaults}
                  onChange={(e) => handleChange('previousDefaults', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">0 indicates clean settlement history</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Credit History Age (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.creditHistoryMonths}
                  onChange={(e) => handleChange('creditHistoryMonths', parseInt(e.target.value, 10) || 12)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  ~{(formData.creditHistoryMonths / 12).toFixed(1)} years credit vintage
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LOAN DETAILS */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#173B70]">Section 4: Proposed Loan Parameters</h3>
              <p className="text-xs text-slate-500">
                Specify loan amount, tenure, and purpose to compute monthly obligation and post-loan FOIR.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requested Loan Principal (INR ₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={formData.requestedAmount}
                    onChange={(e) => handleChange('requestedAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border ${
                      errors.requestedAmount ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                  />
                </div>
                {errors.requestedAmount && <p className="text-xs text-red-500 mt-1">{errors.requestedAmount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loan Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.loanPurpose}
                  onChange={(e) => handleChange('loanPurpose', e.target.value as LoanPurpose)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Home Purchase / Renovation">Home Purchase / Renovation</option>
                  <option value="Personal / Medical Emergency">Personal / Medical Emergency</option>
                  <option value="Education">Education</option>
                  <option value="Vehicle Purchase">Vehicle Purchase</option>
                  <option value="Debt Consolidation">Debt Consolidation</option>
                  <option value="Business Expansion">Business Expansion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loan Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="6"
                  max="360"
                  step="6"
                  value={formData.tenureMonths}
                  onChange={(e) => handleChange('tenureMonths', parseInt(e.target.value, 10) || 12)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.tenureMonths ? 'border-red-400 bg-red-50/40' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                />
                <span className="text-[10px] text-slate-400">
                  {(formData.tenureMonths / 12).toFixed(1)} years ({formData.tenureMonths} monthly installments)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Annual Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.25"
                    value={formData.interestRate}
                    onChange={(e) => handleChange('interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">% p.a.</span>
                </div>
              </div>
            </div>

            {/* Quick Final Summary Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800">Calculated Loan Commitments:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>
                  Estimated EMI: <strong className="text-slate-900">{formatINR(liveMetrics.newEmi)}/mo</strong>
                </div>
                <div>
                  Total Interest: <strong className="text-slate-900">{formatINR(liveMetrics.totalInterest)}</strong>
                </div>
                <div>
                  Total Repayment: <strong className="text-slate-900">{formatINR(liveMetrics.totalRepayment)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation & Action Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isLoading}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Run Assessment Now</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#173B70] hover:bg-[#122F5A] text-white text-sm font-semibold shadow-md shadow-blue-900/10 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-[#2878E5] hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running AI Underwriting Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Loan Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
