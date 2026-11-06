import {
  Applicant,
  FinancialMetrics,
  RiskCategory,
  EligibilityStatus,
  FactorDetail,
  Assessment,
} from '../types';

export function calculateFinancialMetrics(applicant: Applicant): FinancialMetrics {
  const totalMonthlyIncome = Math.max(0, (applicant.monthlyIncome || 0) + (applicant.additionalIncome || 0));
  const existingEmi = Math.max(0, applicant.existingEmi || 0);
  const expenses = Math.max(0, applicant.monthlyExpenses || 0);
  const requestedLoan = Math.max(0, applicant.requestedAmount || 0);
  const tenure = Math.max(1, applicant.tenureMonths || 12);
  const annualRate = Math.max(0, applicant.interestRate || 10.5);

  // 1. Debt-to-Income (DTI)
  const debtToIncomeRatio = totalMonthlyIncome > 0
    ? Number(((existingEmi / totalMonthlyIncome) * 100).toFixed(2))
    : 100;

  // 2. Disposable Income (pre-loan)
  const disposableIncome = totalMonthlyIncome - expenses - existingEmi;

  // 3. Loan-to-Income (LTI)
  const annualIncome = totalMonthlyIncome * 12;
  const loanToIncomeRatio = annualIncome > 0
    ? Number((requestedLoan / annualIncome).toFixed(2))
    : 99;

  // 4. Estimated New EMI (standard amortized formula)
  let newEmi = 0;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    newEmi = requestedLoan / tenure;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenure);
    newEmi = (requestedLoan * monthlyRate * factor) / (factor - 1);
  }
  newEmi = Math.round(newEmi);

  const totalRepayment = Math.round(newEmi * tenure);
  const totalInterest = Math.max(0, totalRepayment - requestedLoan);

  // 5. Post-Loan Debt Burden (FOIR)
  const postLoanDebtBurden = totalMonthlyIncome > 0
    ? Number((((existingEmi + newEmi) / totalMonthlyIncome) * 100).toFixed(2))
    : 100;

  // 6. Disposable income post new EMI
  const disposableIncomePostEmi = disposableIncome - newEmi;

  // 7. Repayment Capacity Category
  let repaymentCapacity: FinancialMetrics['repaymentCapacity'] = 'Comfortable';
  if (disposableIncomePostEmi < 0) {
    repaymentCapacity = 'Insolvent';
  } else if (disposableIncomePostEmi < totalMonthlyIncome * 0.15) {
    repaymentCapacity = 'Tight / Strained';
  } else if (disposableIncomePostEmi < totalMonthlyIncome * 0.30) {
    repaymentCapacity = 'Manageable';
  } else {
    repaymentCapacity = 'Comfortable';
  }

  // 8. Max Affordable EMI (safe standard is 50% FOIR limit)
  const maxSafeFoirRatio = 0.50;
  const maxAffordableEmi = Math.max(0, Math.round((totalMonthlyIncome * maxSafeFoirRatio) - existingEmi));

  // 9. Max Affordable Loan calculation based on max affordable EMI
  let maxAffordableLoan = 0;
  if (monthlyRate === 0) {
    maxAffordableLoan = maxAffordableEmi * tenure;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenure);
    maxAffordableLoan = Math.round((maxAffordableEmi * (factor - 1)) / (monthlyRate * factor));
  }

  return {
    totalMonthlyIncome,
    debtToIncomeRatio,
    disposableIncome,
    loanToIncomeRatio,
    newEmi,
    totalInterest,
    totalRepayment,
    postLoanDebtBurden,
    repaymentCapacity,
    disposableIncomePostEmi,
    maxAffordableEmi,
    maxAffordableLoan,
  };
}

export function calculateDeterministicRisk(applicant: Applicant, metrics: FinancialMetrics): {
  riskScore: number;
  riskCategory: RiskCategory;
  eligibilityAssessment: EligibilityStatus;
  factorBreakdown: FactorDetail[];
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  recommendations: string[];
  summary: string;
} {
  const breakdown: FactorDetail[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // --- 1. Credit Score Factor (35% weight) ---
  let csScore = 15;
  if (applicant.creditScore >= 800) {
    csScore = 5;
    strengths.push(`Tier-1 prime credit score of ${applicant.creditScore} reflects excellent creditworthiness.`);
    breakdown.push({
      factor: 'Credit Score',
      impact: 'Positive',
      explanation: `Exceptional credit score (${applicant.creditScore}) significantly strengthens loan approval confidence and favorable interest rates.`,
    });
  } else if (applicant.creditScore >= 740) {
    csScore = 18;
    strengths.push(`Strong credit score of ${applicant.creditScore} meets prime retail banking thresholds.`);
    breakdown.push({
      factor: 'Credit Score',
      impact: 'Positive',
      explanation: `Strong credit score (${applicant.creditScore}) qualifies for standard prime lending terms with low probability of default.`,
    });
  } else if (applicant.creditScore >= 680) {
    csScore = 40;
    breakdown.push({
      factor: 'Credit Score',
      impact: 'Neutral',
      explanation: `Fair credit score (${applicant.creditScore}). Meets minimum qualification standards but may result in slightly higher risk-adjusted pricing.`,
      suggestedImprovement: 'Maintain timely credit card settlements and avoid taking multiple inquiries to push score above 750.',
    });
  } else if (applicant.creditScore >= 620) {
    csScore = 70;
    weaknesses.push(`Sub-prime credit score (${applicant.creditScore}) indicates elevated default risk.`);
    riskFactors.push('Elevated credit risk due to borderline credit score.');
    recommendations.push('Focus on paying all existing dues on time for the next 6-12 months to improve your bureau score before submitting hard applications.');
    breakdown.push({
      factor: 'Credit Score',
      impact: 'Negative',
      explanation: `Credit score of ${applicant.creditScore} is below preferred institutional lending thresholds (700+).`,
      suggestedImprovement: 'Pay off revolving card balances and dispute any bureau reporting discrepancies.',
    });
  } else {
    csScore = 95;
    weaknesses.push(`Critical credit score (${applicant.creditScore}) indicates significant historical delinquency.`);
    riskFactors.push('High probability of loan rejection or unfavorable collateral requirements due to impaired credit.');
    recommendations.push('Enroll in credit repair counseling and avoid taking new unsecured debts until score recovers past 650.');
    breakdown.push({
      factor: 'Credit Score',
      impact: 'Negative',
      explanation: `Very low credit score (${applicant.creditScore}) reflects severe past credit stress.`,
      suggestedImprovement: 'Rebuild credit through a secured credit card backed by a fixed deposit.',
    });
  }

  // --- 2. Post-Loan Debt Burden FOIR (25% weight) ---
  let foirScore = 20;
  if (metrics.postLoanDebtBurden <= 30) {
    foirScore = 5;
    strengths.push(`Low total debt burden of ${metrics.postLoanDebtBurden}%, leaving ample disposable cushion.`);
    breakdown.push({
      factor: 'Post-Loan Debt Burden (FOIR)',
      impact: 'Positive',
      explanation: `Projected total EMI obligations represent only ${metrics.postLoanDebtBurden}% of monthly income, well below the 40% conservative threshold.`,
    });
  } else if (metrics.postLoanDebtBurden <= 45) {
    foirScore = 30;
    breakdown.push({
      factor: 'Post-Loan Debt Burden (FOIR)',
      impact: 'Positive',
      explanation: `Total obligations consume ${metrics.postLoanDebtBurden}% of income, which aligns with standard banking tolerance levels (up to 50%).`,
    });
  } else if (metrics.postLoanDebtBurden <= 55) {
    foirScore = 65;
    weaknesses.push(`Stretched debt obligations (${metrics.postLoanDebtBurden}% of income) leave limited buffer for emergencies.`);
    riskFactors.push('Moderate debt service strain if household expenses fluctuate.');
    recommendations.push('Consider lengthening the loan tenure to reduce monthly EMI and lower your debt burden below 45%.');
    breakdown.push({
      factor: 'Post-Loan Debt Burden (FOIR)',
      impact: 'Neutral',
      explanation: `Post-loan obligations take ${metrics.postLoanDebtBurden}% of income. Approaching the upper limit of acceptable lending exposure.`,
      suggestedImprovement: 'Increase tenure or opt for a slightly lower loan principal.',
    });
  } else {
    foirScore = 95;
    weaknesses.push(`Severe debt over-leverage (${metrics.postLoanDebtBurden}% post-loan debt-to-income).`);
    riskFactors.push('High risk of cash flow deficit or default under stress.');
    recommendations.push(`Maximum recommended loan on current income is ₹${metrics.maxAffordableLoan.toLocaleString('en-IN')}. Reduce requested principal to avoid debt entrapment.`);
    breakdown.push({
      factor: 'Post-Loan Debt Burden (FOIR)',
      impact: 'Negative',
      explanation: `Total debt commitments would consume ${metrics.postLoanDebtBurden}% of monthly income, exceeding standard regulatory and institutional safety limits.`,
      suggestedImprovement: 'Restructure existing loans or provide a co-applicant with independent verifiable income.',
    });
  }

  // --- 3. Existing DTI & Current Obligations (15% weight) ---
  let dtiScore = 15;
  if (metrics.debtToIncomeRatio <= 15) {
    dtiScore = 5;
    breakdown.push({
      factor: 'Existing Debt-to-Income (DTI)',
      impact: 'Positive',
      explanation: `Current existing EMIs account for just ${metrics.debtToIncomeRatio}% of earnings, leaving clean balance sheet runway.`,
    });
  } else if (metrics.debtToIncomeRatio <= 30) {
    dtiScore = 25;
    breakdown.push({
      factor: 'Existing Debt-to-Income (DTI)',
      impact: 'Neutral',
      explanation: `Current debt commitments at ${metrics.debtToIncomeRatio}% are moderate and manageable.`,
    });
  } else {
    dtiScore = 80;
    weaknesses.push(`Pre-existing debt service burden already consumes ${metrics.debtToIncomeRatio}% of income before this new loan.`);
    breakdown.push({
      factor: 'Existing Debt-to-Income (DTI)',
      impact: 'Negative',
      explanation: `High existing EMI outflow (${metrics.debtToIncomeRatio}% of income) constrains capacity to take on additional borrowing.`,
      suggestedImprovement: 'Prepay smaller personal loans or credit card balances to free up monthly cashflow.',
    });
  }

  // --- 4. Delinquency & Past Defaults (15% weight) ---
  let repScore = 10;
  if (applicant.previousDefaults > 0) {
    repScore = 100;
    weaknesses.push(`History contains ${applicant.previousDefaults} past loan default(s), which creates significant institutional resistance.`);
    riskFactors.push('Historical write-offs or defaults on record.');
    recommendations.push('Obtain No Objection Certificates (NOC) and settlement letters for all settled or written-off accounts.');
    breakdown.push({
      factor: 'Repayment Delinquency Record',
      impact: 'Negative',
      explanation: `Applicant record shows ${applicant.previousDefaults} default(s), representing major credit bureau flags.`,
      suggestedImprovement: 'Obtain bureau settlement disclosures and request removal of disputed marks if erroneously reported.',
    });
  } else if (applicant.delayedPayments >= 3) {
    repScore = 75;
    weaknesses.push(`Recorded ${applicant.delayedPayments} delayed payments across credit facilities.`);
    riskFactors.push('Pattern of delayed monthly repayments.');
    recommendations.push('Set up automated bank mandate (NACH / e-Mandate) to prevent accidental payment lapses.');
    breakdown.push({
      factor: 'Repayment Delinquency Record',
      impact: 'Negative',
      explanation: `${applicant.delayedPayments} instances of delayed payment recorded over the credit lifecycle.`,
      suggestedImprovement: 'Ensure 100% on-time payments for the next 12 consecutive months to re-establish prime track record.',
    });
  } else if (applicant.delayedPayments > 0) {
    repScore = 35;
    breakdown.push({
      factor: 'Repayment Delinquency Record',
      impact: 'Neutral',
      explanation: `Minor delay instances (${applicant.delayedPayments}) noted, but isolated rather than systemic.`,
    });
  } else {
    repScore = 5;
    strengths.push('Impeccable zero-delinquency repayment history with no historical defaults.');
    breakdown.push({
      factor: 'Repayment Delinquency Record',
      impact: 'Positive',
      explanation: 'Flawless track record of timely EMI repayments across all past and active credit facilities.',
    });
  }

  // --- 5. Savings & Liquidity Buffer (10% weight) ---
  const monthlyOutflow = (applicant.monthlyExpenses || 0) + (applicant.existingEmi || 0) + metrics.newEmi;
  const emergencyRunwayMonths = monthlyOutflow > 0 ? (applicant.savingsAmount || 0) / monthlyOutflow : 0;

  let liqScore = 20;
  if (emergencyRunwayMonths >= 6) {
    liqScore = 5;
    strengths.push(`Solid emergency reserve covering ${emergencyRunwayMonths.toFixed(1)} months of combined living and debt expenses.`);
    breakdown.push({
      factor: 'Emergency Liquidity Cushion',
      impact: 'Positive',
      explanation: `Liquid savings of ₹${(applicant.savingsAmount || 0).toLocaleString('en-IN')} provide over 6 months of debt service resilience against unforeseen shocks.`,
    });
  } else if (emergencyRunwayMonths >= 2.5) {
    liqScore = 30;
    breakdown.push({
      factor: 'Emergency Liquidity Cushion',
      impact: 'Neutral',
      explanation: `Savings provide ~${emergencyRunwayMonths.toFixed(1)} months of expense coverage. Adequate for routine operations.`,
    });
  } else {
    liqScore = 80;
    weaknesses.push('Low liquid savings buffer leaves vulnerable position in case of temporary income interruption.');
    recommendations.push('Build a minimum 3-month emergency liquid reserve in high-yield savings or recurring deposits.');
    breakdown.push({
      factor: 'Emergency Liquidity Cushion',
      impact: 'Negative',
      explanation: `Current savings provide less than 2 months of total post-loan commitments.`,
      suggestedImprovement: 'Earmark at least ₹50,000–₹1,00,000 in liquid funds before taking additional leveraged obligations.',
    });
  }

  // Calculate Weighted Risk Score (0 - 100)
  const weightedScore = Math.round(
    csScore * 0.35 +
    foirScore * 0.25 +
    dtiScore * 0.15 +
    repScore * 0.15 +
    liqScore * 0.10
  );
  const riskScore = Math.min(100, Math.max(0, weightedScore));

  // Determine Category & Eligibility
  let riskCategory: RiskCategory = 'Moderate Risk';
  let eligibilityAssessment: EligibilityStatus = 'Needs Financial Review';

  if (riskScore <= 35) {
    riskCategory = 'Low Risk';
    eligibilityAssessment = 'Likely Eligible';
  } else if (riskScore <= 65) {
    riskCategory = 'Moderate Risk';
    eligibilityAssessment = 'Needs Financial Review';
  } else {
    riskCategory = 'High Risk';
    eligibilityAssessment = 'Potentially Not Affordable';
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain existing debt discipline and compare bank offers for competitive interest rates.');
    recommendations.push('Keep credit utilization on revolving cards below 30% to preserve prime score status.');
  }

  const summary = `Applicant ${applicant.fullName} displays a ${riskCategory.toLowerCase()} profile with an estimated risk index of ${riskScore}/100. Post-loan debt burden is calculated at ${metrics.postLoanDebtBurden}% with disposable income after proposed EMI of ₹${metrics.disposableIncomePostEmi.toLocaleString('en-IN')}/month. Overall assessment status: ${eligibilityAssessment}.`;

  return {
    riskScore,
    riskCategory,
    eligibilityAssessment,
    factorBreakdown: breakdown,
    strengths,
    weaknesses,
    riskFactors,
    recommendations,
    summary,
  };
}

export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

export function formatPercent(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  return Number(val).toFixed(1) + '%';
}
