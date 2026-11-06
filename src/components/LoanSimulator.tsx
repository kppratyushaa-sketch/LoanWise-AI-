import React, { useState } from 'react';
import {
  Calculator,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatINR } from '../utils/financialEngine';

export const LoanSimulator: React.FC = () => {
  // Scenario A
  const [amountA, setAmountA] = useState<number>(500000);
  const [tenureA, setTenureA] = useState<number>(36);
  const [rateA, setRateA] = useState<number>(10.5);

  // Scenario B (Comparison)
  const [amountB, setAmountB] = useState<number>(500000);
  const [tenureB, setTenureB] = useState<number>(60);
  const [rateB, setRateB] = useState<number>(10.5);

  // Income reference for FOIR calculations
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);

  // Calculate Scenario Math
  const computeScenario = (principal: number, tenureMonths: number, annualRate: number) => {
    const monthlyRate = annualRate / 12 / 100;
    let emi = 0;
    if (monthlyRate === 0) {
      emi = principal / tenureMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      emi = (principal * monthlyRate * factor) / (factor - 1);
    }
    const roundedEmi = Math.round(emi);
    const totalRepay = roundedEmi * tenureMonths;
    const totalInterest = Math.max(0, totalRepay - principal);
    const foir = monthlyIncome > 0 ? Number(((roundedEmi / monthlyIncome) * 100).toFixed(1)) : 0;

    return {
      emi: roundedEmi,
      totalInterest,
      totalRepay,
      foir,
    };
  };

  const scenA = computeScenario(amountA, tenureA, rateA);
  const scenB = computeScenario(amountB, tenureB, rateB);

  const interestDiff = scenB.totalInterest - scenA.totalInterest;
  const emiDiff = scenA.emi - scenB.emi;

  // Comparison Chart Data
  const comparisonChartData = [
    {
      name: 'Scenario A',
      Principal: amountA,
      Interest: scenA.totalInterest,
      MonthlyEMI: scenA.emi,
    },
    {
      name: 'Scenario B',
      Principal: amountB,
      Interest: scenB.totalInterest,
      MonthlyEMI: scenB.emi,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-[#2878E5] mb-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>Multi-Scenario Financial Modeler</span>
            </div>
            <h2 className="text-2xl font-bold text-[#173B70]">
              Interactive Loan & Tenure Simulator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust loan principal, tenure, and APR to immediately preview monthly EMI, total interest, and debt burden.
            </p>
          </div>

          {/* Income Baseline Input */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center space-x-3 shrink-0">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Net Monthly Income:
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-28 text-sm font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario A Card */}
        <div className="bg-white rounded-2xl border-2 border-blue-500/80 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#2878E5] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Scenario A (Base)
          </div>

          <h3 className="text-base font-bold text-[#173B70] mb-4">Option A: Standard Option</h3>

          <div className="space-y-4">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Loan Amount (Principal):</span>
                <span className="text-[#173B70] font-bold font-mono">{formatINR(amountA)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="25000"
                value={amountA}
                onChange={(e) => setAmountA(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Loan Tenure:</span>
                <span className="text-[#173B70] font-bold font-mono">
                  {tenureA} Months ({(tenureA / 12).toFixed(1)} yrs)
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="120"
                step="6"
                value={tenureA}
                onChange={(e) => setTenureA(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Annual Interest Rate (%):</span>
                <span className="text-[#173B70] font-bold font-mono">{rateA.toFixed(2)}% p.a.</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.25"
                value={rateA}
                onChange={(e) => setRateA(parseFloat(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly EMI</span>
              <div className="text-xl font-extrabold text-[#173B70] font-mono mt-0.5">
                {formatINR(scenA.emi)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Debt Burden (FOIR)</span>
              <div
                className={`text-xl font-extrabold font-mono mt-0.5 ${
                  scenA.foir <= 45 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {scenA.foir}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Interest</span>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {formatINR(scenA.totalInterest)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Outflow</span>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {formatINR(scenA.totalRepay)}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario B Card */}
        <div className="bg-white rounded-2xl border-2 border-indigo-400/80 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Scenario B (Alternative)
          </div>

          <h3 className="text-base font-bold text-[#173B70] mb-4">Option B: Alternate Tenure / APR</h3>

          <div className="space-y-4">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Loan Amount (Principal):</span>
                <span className="text-indigo-900 font-bold font-mono">{formatINR(amountB)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="25000"
                value={amountB}
                onChange={(e) => setAmountB(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Loan Tenure:</span>
                <span className="text-indigo-900 font-bold font-mono">
                  {tenureB} Months ({(tenureB / 12).toFixed(1)} yrs)
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="120"
                step="6"
                value={tenureB}
                onChange={(e) => setTenureB(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rate Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Annual Interest Rate (%):</span>
                <span className="text-indigo-900 font-bold font-mono">{rateB.toFixed(2)}% p.a.</span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.25"
                value={rateB}
                onChange={(e) => setRateB(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-indigo-50/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly EMI</span>
              <div className="text-xl font-extrabold text-indigo-900 font-mono mt-0.5">
                {formatINR(scenB.emi)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Debt Burden (FOIR)</span>
              <div
                className={`text-xl font-extrabold font-mono mt-0.5 ${
                  scenB.foir <= 45 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {scenB.foir}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Interest</span>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {formatINR(scenB.totalInterest)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Outflow</span>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {formatINR(scenB.totalRepay)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Analysis & Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#173B70] mb-1">
          Scenario Comparison & Repayment Breakdown
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Compare total interest paid and monthly cashflow obligations.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison Insights */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#173B70] uppercase">
                <Sparkles className="w-4 h-4 text-[#2878E5]" />
                <span>AI Recommendation</span>
              </div>
              <p className="mt-2 text-xs text-slate-700 leading-relaxed font-normal">
                {scenA.emi < scenB.emi ? (
                  <>
                    <strong>Scenario A</strong> offers a lower monthly EMI by{' '}
                    <strong>{formatINR(scenB.emi - scenA.emi)}/month</strong>, reducing monthly cashflow stress.
                  </>
                ) : (
                  <>
                    <strong>Scenario B</strong> reduces monthly debt obligation by{' '}
                    <strong>{formatINR(scenA.emi - scenB.emi)}/month</strong> (FOIR down to {scenB.foir}%), making it easier to qualify for bank approval.
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Interest Difference:</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatINR(Math.abs(interestDiff))}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {interestDiff > 0
                  ? `Scenario A saves ${formatINR(interestDiff)} in cumulative interest due to shorter tenure.`
                  : `Scenario B saves ${formatINR(Math.abs(interestDiff))} in cumulative interest due to shorter tenure.`}
              </p>
            </div>
          </div>

          {/* Recharts Bar Comparison */}
          <div className="lg:col-span-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [formatINR(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Principal" fill="#2878E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Interest" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
