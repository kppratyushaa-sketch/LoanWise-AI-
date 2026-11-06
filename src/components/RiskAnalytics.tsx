import React from 'react';
import {
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Assessment } from '../types';
import { formatINR } from '../utils/financialEngine';

interface RiskAnalyticsProps {
  assessments: Assessment[];
  onViewAssessment: (asmt: Assessment) => void;
}

export const RiskAnalytics: React.FC<RiskAnalyticsProps> = ({
  assessments,
  onViewAssessment,
}) => {
  // 1. Group by Loan Purpose
  const purposeMap: Record<string, { count: number; volume: number }> = {};
  assessments.forEach((a) => {
    const p = a.applicant?.loanPurpose || 'Other';
    if (!purposeMap[p]) purposeMap[p] = { count: 0, volume: 0 };
    purposeMap[p].count += 1;
    purposeMap[p].volume += a.applicant?.requestedAmount || 0;
  });

  const purposeData = Object.entries(purposeMap).map(([purpose, val]) => ({
    purpose: purpose.split('/')[0].trim(),
    count: val.count,
    volume: val.volume,
  }));

  // 2. FOIR vs DTI scatter data
  const foirDtiData = assessments.map((a) => ({
    name: a.applicantName,
    DTI: a.metrics.debtToIncomeRatio,
    FOIR: a.metrics.postLoanDebtBurden,
    creditScore: a.applicant?.creditScore || 700,
    riskCategory: a.riskCategory,
    riskScore: a.riskScore,
  }));

  // 3. Requested vs Affordable loan comparison
  const loanComparisonData = assessments.slice(0, 6).map((a) => ({
    name: a.applicantName.split(' ')[0],
    Requested: a.applicant?.requestedAmount || 0,
    MaxAffordable: a.metrics.maxAffordableLoan || 0,
  }));

  // 4. Portfolio averages
  const totalCount = assessments.length;
  const avgFOIR =
    totalCount > 0
      ? Number(
          (
            assessments.reduce((acc, curr) => acc + (curr.metrics.postLoanDebtBurden || 0), 0) /
            totalCount
          ).toFixed(1)
        )
      : 0;

  const avgDTI =
    totalCount > 0
      ? Number(
          (
            assessments.reduce((acc, curr) => acc + (curr.metrics.debtToIncomeRatio || 0), 0) /
            totalCount
          ).toFixed(1)
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2878E5] mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Underwriting Intelligence</span>
        </div>
        <h2 className="text-2xl font-bold text-[#173B70]">Portfolio Risk Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Correlation between Debt-to-Income (DTI), post-loan burden (FOIR), and loan purpose exposure.
        </p>

        {/* Aggregate KPI Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Post-Loan FOIR</span>
            <div className="text-xl font-bold font-mono text-[#173B70] mt-0.5">{avgFOIR}%</div>
            <span className="text-[10px] text-slate-400">Tolerance limit: 50%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Pre-Loan DTI</span>
            <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">{avgDTI}%</div>
            <span className="text-[10px] text-slate-400">Existing obligation</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Low Risk Ratio</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
              {totalCount > 0
                ? `${Math.round(
                    (assessments.filter((a) => a.riskCategory === 'Low Risk').length / totalCount) * 100
                  )}%`
                : '0%'}
            </div>
            <span className="text-[10px] text-slate-400">Prime borrower health</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Stress Deficit Ratio</span>
            <div className="text-xl font-bold font-mono text-red-600 mt-0.5">
              {totalCount > 0
                ? `${Math.round(
                    (assessments.filter((a) => a.metrics.disposableIncomePostEmi < 0).length / totalCount) * 100
                  )}%`
                : '0%'}
            </div>
            <span className="text-[10px] text-slate-400">Negative cashflow post-loan</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart 1: FOIR vs DTI Correlation Scatter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#173B70] mb-1">
          Debt Burden (FOIR) vs Existing DTI Correlation Matrix
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Assessed applicants mapped by existing debt obligations (X-axis) vs. projected post-loan burden (Y-axis).
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <XAxis
                type="number"
                dataKey="DTI"
                name="Existing DTI"
                unit="%"
                domain={[0, 60]}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="FOIR"
                name="Post-Loan FOIR"
                unit="%"
                domain={[0, 90]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(val: any, name: any) => [`${val}%`, name]}
                contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Scatter name="Applicants" data={foirDtiData}>
                {foirDtiData.map((entry, index) => {
                  let fillColor = '#10B981';
                  if (entry.riskCategory === 'Moderate Risk') fillColor = '#F59E0B';
                  if (entry.riskCategory === 'High Risk') fillColor = '#EF4444';
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center space-x-6 pt-3 border-t border-slate-100 text-xs font-semibold">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Low Risk (FOIR &lt; 40%)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate Risk (40-60%)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>High Risk (&gt; 60%)</span>
          </span>
        </div>
      </div>

      {/* Row: Purpose Exposure & Requested vs Affordable Loan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purpose Exposure */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#173B70] mb-1">Loan Purpose Exposure</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregate loan requested volume across purposes</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purposeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="purpose" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Volume']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="volume" fill="#2878E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requested vs Affordable */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#173B70] mb-1">Requested vs. Max Safe Principal</h3>
          <p className="text-xs text-slate-500 mb-6">
            Comparing requested loan size against 50% FOIR capacity limit
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => [formatINR(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Requested" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MaxAffordable" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
