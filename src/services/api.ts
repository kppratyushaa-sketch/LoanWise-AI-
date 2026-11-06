import { Applicant, Assessment, DashboardStats, ChatMessage } from '../types';
import { SAMPLE_APPLICANTS } from '../data/sampleApplicants';
import { calculateFinancialMetrics, calculateDeterministicRisk } from '../utils/financialEngine';

export async function fetchSystemStatus(): Promise<{
  database: 'mongodb' | 'local-demo';
  databaseMessage: string;
  geminiConfigured: boolean;
  model: string;
  applicantCount: number;
  assessmentCount: number;
}> {
  try {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err) {
    return {
      database: 'local-demo',
      databaseMessage: 'Local Storage Mode',
      geminiConfigured: false,
      model: 'deterministic-engine',
      applicantCount: 5,
      assessmentCount: 5,
    };
  }
}

export async function fetchApplicants(): Promise<Applicant[]> {
  try {
    const res = await fetch('/api/applicants');
    if (!res.ok) throw new Error('Failed to fetch applicants');
    return await res.json();
  } catch (err) {
    console.warn('API error, using cached applicants:', err);
    const stored = localStorage.getItem('loanwise_applicants');
    return stored ? JSON.parse(stored) : SAMPLE_APPLICANTS;
  }
}

export async function createApplicant(applicant: Omit<Applicant, 'id'>): Promise<Applicant> {
  const res = await fetch('/api/applicants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicant),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create applicant');
  }
  return await res.json();
}

export async function deleteApplicant(id: string): Promise<void> {
  const res = await fetch(`/api/applicants/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete applicant');
}

export async function fetchAssessments(): Promise<Assessment[]> {
  try {
    const res = await fetch('/api/assessments');
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return await res.json();
  } catch (err) {
    console.warn('API error, falling back to local storage assessments:', err);
    const stored = localStorage.getItem('loanwise_assessments');
    if (stored) return JSON.parse(stored);

    // Compute for sample applicants
    return SAMPLE_APPLICANTS.map((app, idx) => {
      const metrics = calculateFinancialMetrics(app);
      const risk = calculateDeterministicRisk(app, metrics);
      return {
        id: `local-asmt-${idx + 1}`,
        applicantId: app.id,
        applicantName: app.fullName,
        applicant: app,
        metrics,
        riskCategory: risk.riskCategory,
        riskScore: risk.riskScore,
        eligibilityAssessment: risk.eligibilityAssessment,
        summary: risk.summary,
        strengths: risk.strengths,
        weaknesses: risk.weaknesses,
        riskFactors: risk.riskFactors,
        factorBreakdown: risk.factorBreakdown,
        recommendations: risk.recommendations,
        createdAt: app.createdAt || new Date().toISOString(),
        modelUsed: 'deterministic-engine',
      };
    });
  }
}

export async function fetchAssessmentById(id: string): Promise<Assessment> {
  const res = await fetch(`/api/assessments/${id}`);
  if (!res.ok) throw new Error('Assessment not found');
  return await res.json();
}

export async function deleteAssessment(id: string): Promise<void> {
  const res = await fetch(`/api/assessments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete assessment');
}

export async function analyzeApplication(applicant: Applicant): Promise<Assessment> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicant),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server returned an error');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('[LoanWise AI] Backend analyze unavailable or timed out, executing deterministic client calculation:', err);
    const metrics = calculateFinancialMetrics(applicant);
    const risk = calculateDeterministicRisk(applicant, metrics);

    const fallbackAssessment: Assessment = {
      id: `asmt-${Date.now()}`,
      applicantId: applicant.id || `app-${Date.now()}`,
      applicantName: applicant.fullName,
      applicant,
      metrics,
      riskCategory: risk.riskCategory,
      riskScore: risk.riskScore,
      eligibilityAssessment: risk.eligibilityAssessment,
      summary: risk.summary,
      strengths: risk.strengths,
      weaknesses: risk.weaknesses,
      riskFactors: risk.riskFactors,
      factorBreakdown: risk.factorBreakdown,
      recommendations: risk.recommendations,
      createdAt: new Date().toISOString(),
      modelUsed: 'deterministic-engine',
    };

    // Store in localStorage so history preserves it
    try {
      const stored = localStorage.getItem('loanwise_assessments');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(fallbackAssessment);
      localStorage.setItem('loanwise_assessments', JSON.stringify(list));
    } catch (e) {
      // ignore storage errors
    }

    return fallbackAssessment;
  }
}

export async function askAdvisor(
  message: string,
  history: ChatMessage[],
  applicantContext?: Applicant,
  assessmentContext?: Assessment
): Promise<{ reply: string; modelUsed: string }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map((h) => ({ role: h.role, content: h.content })),
      applicantContext,
      assessmentContext,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Advisor service unavailable');
  }
  return await res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return await res.json();
}

export async function resetSampleData(): Promise<void> {
  const res = await fetch('/api/reset-data', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset dataset');
}
