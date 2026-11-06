import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  TrendingUp,
  CreditCard,
  DollarSign,
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  BotMessageSquare,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Assessment, DashboardStats, Applicant } from '../types';
import { formatINR } from '../utils/financialEngine';
import { SAMPLE_APPLICANTS } from '../data/sampleApplicants';

interface DashboardProps {
  stats: DashboardStats;
  onNewAssessment: () => void;
  onViewAssessment: (assessment: Assessment) => void;
  onAskAi: (assessment: Assessment) => void;
  onSelectSampleApplicant: (applicant: Applicant) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  onNewAssessment,
  onViewAssessment,
  onAskAi,
  onSelectSampleApplicant,
}) => {
  const {
    totalAssessed = 0,
    lowRiskCount = 0,
    moderateRiskCount = 0,
    highRiskCount = 0,
    avgRiskScore = 0,
    avgCreditScore = 700,
    totalLoanVolume = 0,
    riskDistribution = [],
    monthlyAssessments = [],
    creditScoreTiers = [],
    recentAssessments = [],
  } = stats;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome & Fast Action Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#173B70] via-[#1A4482] to-[#2878E5] p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Underwriting Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Credit Decision Support
          </h2>
          <p className="mt-1 text-sm text-blue-100 max-w-xl">
            Real-time evaluation of applicant repayment capacity, debt burden (FOIR), and credit bureau risk factors.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onNewAssessment}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-[#173B70] hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#2878E5]" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Assessed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Assessed</span>
            <FileText className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#173B70] font-mono">
            {totalAssessed}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {formatINR(totalLoanVolume)} volume
          </div>
        </div>

        {/* Card 2: Low Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Risk</span>
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
            {lowRiskCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {totalAssessed > 0 ? `${Math.round((lowRiskCount / totalAssessed) * 100)}% of pipeline` : '0%'}
          </div>
        </div>

        {/* Card 3: Moderate Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
            {moderateRiskCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Needs review</div>
        </div>

        {/* Card 4: High Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High Risk</span>
            <XCircle className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
            {highRiskCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">High leverage</div>
        </div>

        {/* Card 5: Avg Bureau Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Bureau Score</span>
            <CreditCard className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#173B70] font-mono">
            {avgCreditScore}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Avg Risk Index: <strong className="text-slate-700">{avgRiskScore}/100</strong>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Loan Risk Distribution Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider">
              Risk Profile Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Underwriting risk category allocation</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} applications`, name]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            {riskDistribution.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 font-medium">{d.name.split(' ')[0]}</span>
                </div>
                <div className="font-bold text-slate-900 font-mono mt-0.5">{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Monthly Assessment Volume */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider">
                Monthly Assessments Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Assessed applications segmented by risk category</p>
            </div>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAssessments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="low" name="Low Risk" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="moderate" name="Moderate Risk" fill="#F59E0B" stackId="a" />
                <Bar dataKey="high" name="High Risk" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Portfolio Quality: Healthy low-risk concentration</span>
            <span className="text-blue-600 font-semibold cursor-pointer" onClick={onNewAssessment}>
              Run new test +
            </span>
          </div>
        </div>
      </div>

      {/* Credit Score Tiers Distribution Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider">
              Credit Score Segment Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bureau distribution across all assessed applicants</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Benchmark: 300 to 900</span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {creditScoreTiers.map((tier, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-xs font-bold text-slate-800">{tier.tier}</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{tier.count}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {totalAssessed > 0 ? `${Math.round((tier.count / totalAssessed) * 100)}% of total` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Demo Profiles Grid */}
      <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#173B70] uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#2878E5]" />
              <span>Instant Demo Profiles (One-Click Evaluations)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any fictional applicant to instantly load their data into the underwriting wizard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SAMPLE_APPLICANTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSampleApplicant(sample)}
              className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173B70] truncate">{sample.fullName}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      sample.creditScore >= 750
                        ? 'bg-emerald-100 text-emerald-800'
                        : sample.creditScore >= 650
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {sample.creditScore}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{sample.employmentType}</div>
                <div className="mt-2 text-xs font-mono font-semibold text-slate-700">
                  Loan: {formatINR(sample.requestedAmount)}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                <span>Evaluate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#173B70]">Recent Assessment Dossiers</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live history of evaluated applications and calculated risk indexes
            </p>
          </div>

          <button
            onClick={onNewAssessment}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>+ Assess Another Applicant</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Requested Loan</th>
                <th className="px-5 py-3">Bureau Score</th>
                <th className="px-5 py-3">Post-Loan FOIR</th>
                <th className="px-5 py-3">Risk Category</th>
                <th className="px-5 py-3">Eligibility Verdict</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAssessments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No assessments evaluated yet. Click "New Assessment" to begin.
                  </td>
                </tr>
              ) : (
                recentAssessments.map((asmt) => {
                  let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (asmt.riskCategory === 'Moderate Risk') badge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (asmt.riskCategory === 'High Risk') badge = 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <tr key={asmt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{asmt.applicantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(asmt.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-medium text-slate-800">
                        {formatINR(asmt.applicant?.requestedAmount || 0)}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                        {asmt.applicant?.creditScore}
                      </td>

                      <td className="px-5 py-3.5 font-mono">
                        <span
                          className={`font-bold ${
                            asmt.metrics.postLoanDebtBurden <= 45
                              ? 'text-emerald-600'
                              : asmt.metrics.postLoanDebtBurden <= 60
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {asmt.metrics.postLoanDebtBurden}%
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                          {asmt.riskCategory} ({asmt.riskScore}/100)
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {asmt.eligibilityAssessment}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onViewAssessment(asmt)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#173B70] hover:bg-blue-100 font-semibold transition-colors"
                          title="View Full Report"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2878E5]" />
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={() => onAskAi(asmt)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
                          title="Ask AI Advisor"
                        >
                          <BotMessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Ask AI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
