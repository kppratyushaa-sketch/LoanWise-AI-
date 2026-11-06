import { jsPDF } from 'jspdf';
import { Assessment } from '../types';
import { formatINR } from './financialEngine';

export function generateAssessmentPDF(assessment: Assessment): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Header Banner
  doc.setFillColor(23, 59, 112); // #173B70 Deep Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LOANWISE AI - CREDIT RISK ASSESSMENT REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Institutional Decision-Support & Explainable AI Underwriting Dossier', margin, 18);
  doc.text(`Generated: ${new Date(assessment.createdAt).toLocaleString()} | ID: ${assessment.id}`, margin, 24);

  y = 36;

  // Section 1: Applicant & Loan Information
  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. APPLICANT & LOAN OVERVIEW', margin, y);
  y += 5;

  doc.setDrawColor(220, 226, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 60, 75);

  const col1 = margin;
  const col2 = margin + 90;

  doc.text(`Applicant Name: ${assessment.applicantName}`, col1, y);
  doc.text(`City: ${assessment.applicant.city || 'N/A'}`, col2, y);
  y += 5;

  doc.text(`Employment: ${assessment.applicant.employmentType} (${assessment.applicant.employmentDurationMonths} mos)`, col1, y);
  doc.text(`Age: ${assessment.applicant.age} yrs`, col2, y);
  y += 5;

  doc.text(`Monthly Income: ${formatINR(assessment.metrics.totalMonthlyIncome)}`, col1, y);
  doc.text(`Credit Bureau Score: ${assessment.applicant.creditScore}`, col2, y);
  y += 5;

  doc.text(`Requested Loan: ${formatINR(assessment.applicant.requestedAmount)}`, col1, y);
  doc.text(`Loan Purpose: ${assessment.applicant.loanPurpose}`, col2, y);
  y += 5;

  doc.text(`Tenure: ${assessment.applicant.tenureMonths} Months @ ${assessment.applicant.interestRate}% p.a.`, col1, y);
  doc.text(`Existing Obligations (EMI): ${formatINR(assessment.applicant.existingEmi)}/mo`, col2, y);
  y += 10;

  // Section 2: Financial Metrics & Affordability Box
  doc.setFillColor(245, 247, 251);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'F');

  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('KEY FINANCIAL METRICS & AFFORDABILITY', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 60, 75);

  const metricY = y + 13;
  doc.text(`Projected Monthly EMI:`, margin + 4, metricY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatINR(assessment.metrics.newEmi)}`, margin + 4, metricY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Post-Loan Debt Burden (FOIR):`, margin + 50, metricY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${assessment.metrics.postLoanDebtBurden}%`, margin + 50, metricY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Debt-to-Income (DTI):`, margin + 105, metricY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${assessment.metrics.debtToIncomeRatio}%`, margin + 105, metricY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Max Recommended Loan:`, margin + 145, metricY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatINR(assessment.metrics.maxAffordableLoan)}`, margin + 145, metricY + 5);

  y += 36;

  // Section 3: Assessment Decision & Risk Score
  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. RISK ASSESSMENT & ELIGIBILITY VERDICT', margin, y);
  y += 5;
  doc.setDrawColor(220, 226, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Badge background based on risk
  let badgeColor: [number, number, number] = [16, 185, 129]; // Green
  if (assessment.riskCategory === 'Moderate Risk') badgeColor = [245, 158, 11]; // Amber
  if (assessment.riskCategory === 'High Risk') badgeColor = [239, 68, 68]; // Red

  doc.setFillColor(...badgeColor);
  doc.roundedRect(margin, y, 70, 16, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(assessment.riskCategory.toUpperCase(), margin + 6, y + 7);
  doc.setFontSize(8);
  doc.text(`Risk Score: ${assessment.riskScore}/100`, margin + 6, y + 12);

  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Eligibility Status: ${assessment.eligibilityAssessment}`, margin + 80, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 95);
  doc.text(`Evaluation Model: ${assessment.modelUsed.toUpperCase()}`, margin + 80, y + 12);

  y += 22;

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(23, 59, 112);
  doc.text('Executive Summary:', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 70, 85);
  const splitSummary = doc.splitTextToSize(assessment.summary, pageWidth - margin * 2);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.5 + 4;

  // Section 4: Explainability Breakdown
  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. AI EXPLAINABILITY & FACTOR ANALYSIS', margin, y);
  y += 5;
  doc.setDrawColor(220, 226, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  (assessment.factorBreakdown || []).slice(0, 5).forEach((item) => {
    if (y > 250) {
      doc.addPage();
      y = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (item.impact === 'Positive') doc.setTextColor(16, 185, 129);
    else if (item.impact === 'Negative') doc.setTextColor(239, 68, 68);
    else doc.setTextColor(245, 158, 11);

    doc.text(`[${item.impact.toUpperCase()}] ${item.factor}`, margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 70, 85);
    const splitExplanation = doc.splitTextToSize(item.explanation, pageWidth - margin * 2 - 4);
    doc.text(splitExplanation, margin + 4, y);
    y += splitExplanation.length * 3.8 + 2;

    if (item.suggestedImprovement) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(40, 120, 229);
      const splitImp = doc.splitTextToSize(`Action: ${item.suggestedImprovement}`, pageWidth - margin * 2 - 4);
      doc.text(splitImp, margin + 4, y);
      y += splitImp.length * 3.8 + 3;
    }
  });

  // Section 5: Recommendations
  if (y > 230) {
    doc.addPage();
    y = 16;
  } else {
    y += 4;
  }

  doc.setTextColor(23, 59, 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. PERSONALIZED RECOMMENDATIONS', margin, y);
  y += 5;
  doc.setDrawColor(220, 226, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  (assessment.recommendations || []).slice(0, 4).forEach((rec, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 16;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 120, 229);
    doc.text(`${idx + 1}.`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 85);
    const splitRec = doc.splitTextToSize(rec, pageWidth - margin * 2 - 8);
    doc.text(splitRec, margin + 6, y);
    y += splitRec.length * 4 + 2;
  });

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 140, 155);
  const disclaimer = 'DISCLAIMER: LoanWise AI is an educational decision-support platform designed to assist applicants in understanding credit metrics and debt burden. This report does not represent an official credit bureau inquiry, formal credit sanction, or binding commitment from any banking institution.';
  const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(splitDisc, margin, 282);

  // Download File
  const safeName = assessment.applicantName.replace(/\s+/g, '_');
  doc.save(`LoanWiseAI_Report_${safeName}_${assessment.id.slice(-6)}.pdf`);
}
