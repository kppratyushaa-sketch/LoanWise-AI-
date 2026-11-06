export type EmploymentType =
  | 'Salaried - Private'
  | 'Salaried - Public / Govt'
  | 'Self-Employed Professional'
  | 'Business Owner'
  | 'Freelancer / Gig'
  | 'Other';

export type LoanPurpose =
  | 'Home Purchase / Renovation'
  | 'Personal / Medical Emergency'
  | 'Education'
  | 'Vehicle Purchase'
  | 'Debt Consolidation'
  | 'Business Expansion'
  | 'Other';

export type RepaymentHistory = 'Excellent (0 missed)' | 'Good (1-2 delays)' | 'Fair (Frequent delays)' | 'Poor (Default history)';

export interface Applicant {
  id: string;
  fullName: string;
  age: number;
  employmentType: EmploymentType;
  employmentDurationMonths: number;
  city: string;
  educationLevel?: string;

  // Financial details
  monthlyIncome: number;
  additionalIncome: number;
  monthlyExpenses: number;
  existingEmi: number;
  totalOutstandingDebt: number;
  savingsAmount: number;

  // Credit information
  creditScore: number;
  repaymentHistory: RepaymentHistory;
  numPreviousLoans: number;
  delayedPayments: number;
  previousDefaults: number;
  creditHistoryMonths: number;

  // Loan details
  requestedAmount: number;
  loanPurpose: LoanPurpose;
  tenureMonths: number;
  interestRate: number; // Annual %

  createdAt?: string;
}

export interface FinancialMetrics {
  totalMonthlyIncome: number;
  debtToIncomeRatio: number; // (existingEmi / totalIncome) * 100
  disposableIncome: number; // totalIncome - expenses - existingEmi
  loanToIncomeRatio: number; // requestedAmount / (totalIncome * 12)
  newEmi: number;
  totalInterest: number;
  totalRepayment: number;
  postLoanDebtBurden: number; // FOIR: ((existingEmi + newEmi) / totalIncome) * 100
  repaymentCapacity: 'Comfortable' | 'Manageable' | 'Tight / Strained' | 'Insolvent';
  disposableIncomePostEmi: number; // disposableIncome - newEmi
  maxAffordableEmi: number;
  maxAffordableLoan: number;
}

export type RiskCategory = 'Low Risk' | 'Moderate Risk' | 'High Risk';
export type EligibilityStatus = 'Likely Eligible' | 'Needs Financial Review' | 'Potentially Not Affordable';

export interface FactorDetail {
  factor: string;
  impact: 'Positive' | 'Neutral' | 'Negative';
  explanation: string;
  suggestedImprovement?: string;
}

export interface Assessment {
  id: string;
  applicantId: string;
  applicantName: string;
  applicant: Applicant;
  metrics: FinancialMetrics;
  riskCategory: RiskCategory;
  riskScore: number; // 0-100 (lower is safer)
  eligibilityAssessment: EligibilityStatus;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  factorBreakdown: FactorDetail[];
  recommendations: string[];
  createdAt: string;
  modelUsed: 'gemini-3.8-flash' | 'deterministic-engine';
}

export interface DashboardStats {
  totalAssessed: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  avgRiskScore: number;
  avgCreditScore: number;
  totalLoanVolume: number;
  approvalRateEstimate: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  monthlyAssessments: Array<{ month: string; low: number; moderate: number; high: number; total: number }>;
  creditScoreTiers: Array<{ tier: string; count: number; color: string }>;
  recentAssessments: Assessment[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LoanSimulationScenario {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  postLoanDebtBurden: number;
  affordabilityStatus: 'Optimal' | 'Stretch' | 'High Burden';
}
