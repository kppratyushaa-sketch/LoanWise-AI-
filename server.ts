import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { Applicant, Assessment, DashboardStats } from './src/types';
import { calculateFinancialMetrics, calculateDeterministicRisk } from './src/utils/financialEngine';
import { SAMPLE_APPLICANTS } from './src/data/sampleApplicants';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[LoanWise AI] Gemini AI Client initialized successfully.');
  } catch (err) {
    console.error('[LoanWise AI] Failed to initialize Gemini AI:', err);
  }
} else {
  console.warn('[LoanWise AI] GEMINI_API_KEY not found in environment; running in rule-based fallback mode for AI endpoints.');
}

// MongoDB / Mongoose Setup with Fallback
let isMongoConnected = false;
const mongoUri = process.env.MONGODB_URI;

// Mongoose Schemas (Available when MongoDB is connected)
const applicantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  employmentType: { type: String, required: true },
  employmentDurationMonths: { type: Number, required: true },
  city: { type: String, required: true },
  educationLevel: String,
  monthlyIncome: { type: Number, required: true },
  additionalIncome: { type: Number, default: 0 },
  monthlyExpenses: { type: Number, required: true },
  existingEmi: { type: Number, default: 0 },
  totalOutstandingDebt: { type: Number, default: 0 },
  savingsAmount: { type: Number, default: 0 },
  creditScore: { type: Number, required: true },
  repaymentHistory: { type: String, required: true },
  numPreviousLoans: { type: Number, default: 0 },
  delayedPayments: { type: Number, default: 0 },
  previousDefaults: { type: Number, default: 0 },
  creditHistoryMonths: { type: Number, default: 12 },
  requestedAmount: { type: Number, required: true },
  loanPurpose: { type: String, required: true },
  tenureMonths: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const assessmentSchema = new mongoose.Schema({
  applicantId: { type: String, required: true },
  applicantName: { type: String, required: true },
  applicant: { type: Object, required: true },
  metrics: { type: Object, required: true },
  riskCategory: { type: String, required: true },
  riskScore: { type: Number, required: true },
  eligibilityAssessment: { type: String, required: true },
  summary: { type: String, required: true },
  strengths: [String],
  weaknesses: [String],
  riskFactors: [String],
  factorBreakdown: [Object],
  recommendations: [String],
  createdAt: { type: String, default: () => new Date().toISOString() },
  modelUsed: { type: String, default: 'deterministic-engine' },
});

let ApplicantModel: any = null;
let AssessmentModel: any = null;

if (mongoUri && mongoUri.trim() !== '') {
  mongoose
    .connect(mongoUri)
    .then(() => {
      isMongoConnected = true;
      ApplicantModel = mongoose.model('Applicant', applicantSchema);
      AssessmentModel = mongoose.model('Assessment', assessmentSchema);
      console.log('[LoanWise AI] Connected to MongoDB database successfully.');
    })
    .catch((err) => {
      console.warn('[LoanWise AI] MongoDB connection failed; operating in resilient local/demo storage mode:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('[LoanWise AI] No MONGODB_URI specified. Operating in high-performance local demo storage mode.');
}

// In-Memory Storage Pre-Seeded with 5 Fictional Applicants & Assessments
let inMemoryApplicants: Applicant[] = JSON.parse(JSON.stringify(SAMPLE_APPLICANTS));
let inMemoryAssessments: Assessment[] = [];

// Seed assessments for sample applicants
function seedAssessments() {
  inMemoryAssessments = inMemoryApplicants.map((applicant, idx) => {
    const metrics = calculateFinancialMetrics(applicant);
    const risk = calculateDeterministicRisk(applicant, metrics);
    return {
      id: `asmt-seed-00${idx + 1}`,
      applicantId: applicant.id,
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
      createdAt: applicant.createdAt || new Date().toISOString(),
      modelUsed: 'deterministic-engine',
    };
  });
}
seedAssessments();

// ================= API ENDPOINTS =================

// 1. System Health & Config Status
app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'mongodb' : 'local-demo',
    databaseMessage: isMongoConnected
      ? 'Connected to Live MongoDB Cluster'
      : 'Local Demo Storage Mode (Fast in-memory with pre-seeded datasets)',
    geminiConfigured: !!ai,
    model: 'gemini-3.8-flash',
    applicantCount: inMemoryApplicants.length,
    assessmentCount: inMemoryAssessments.length,
  });
});

// 2. Applicants CRUD
app.get('/api/applicants', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected && ApplicantModel) {
      const docs = await ApplicantModel.find().sort({ createdAt: -1 });
      return res.json(docs.map((d: any) => ({ ...d.toObject(), id: d._id.toString() })));
    }
    res.json(inMemoryApplicants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applicants', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.monthlyIncome || !body.requestedAmount) {
      return res.status(400).json({ error: 'Missing required applicant fields.' });
    }

    const newApplicant: Applicant = {
      ...body,
      id: body.id || `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected && ApplicantModel) {
      const doc = new ApplicantModel(newApplicant);
      await doc.save();
      newApplicant.id = doc._id.toString();
    }

    inMemoryApplicants.unshift(newApplicant);
    res.status(201).json(newApplicant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/applicants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && ApplicantModel && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await ApplicantModel.findById(id);
      if (doc) return res.json({ ...doc.toObject(), id: doc._id.toString() });
    }
    const found = inMemoryApplicants.find((a) => a.id === id);
    if (!found) {
      return res.status(404).json({ error: 'Applicant not found' });
    }
    res.json(found);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/applicants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && ApplicantModel && mongoose.Types.ObjectId.isValid(id)) {
      await ApplicantModel.findByIdAndDelete(id);
    }
    inMemoryApplicants = inMemoryApplicants.filter((a) => a.id !== id);
    inMemoryAssessments = inMemoryAssessments.filter((a) => a.applicantId !== id);
    res.json({ success: true, message: 'Applicant deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Assessments CRUD
app.get('/api/assessments', async (_req: Request, res: Response) => {
  try {
    if (isMongoConnected && AssessmentModel) {
      const docs = await AssessmentModel.find().sort({ createdAt: -1 });
      return res.json(docs.map((d: any) => ({ ...d.toObject(), id: d._id.toString() })));
    }
    res.json(inMemoryAssessments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assessments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && AssessmentModel && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await AssessmentModel.findById(id);
      if (doc) return res.json({ ...doc.toObject(), id: doc._id.toString() });
    }
    const found = inMemoryAssessments.find((a) => a.id === id);
    if (!found) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.json(found);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assessments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && AssessmentModel && mongoose.Types.ObjectId.isValid(id)) {
      await AssessmentModel.findByIdAndDelete(id);
    }
    inMemoryAssessments = inMemoryAssessments.filter((a) => a.id !== id);
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. AI Loan Assessment Engine
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const applicant: Applicant = req.body;
    if (!applicant || !applicant.fullName || !applicant.monthlyIncome) {
      return res.status(400).json({ error: 'Valid applicant data is required.' });
    }

    // 1. Calculate deterministic numerical financial metrics
    const metrics = calculateFinancialMetrics(applicant);

    // 2. Calculate rule-based credit risk baseline
    const deterministic = calculateDeterministicRisk(applicant, metrics);

    let summary = deterministic.summary;
    let strengths = deterministic.strengths;
    let weaknesses = deterministic.weaknesses;
    let riskFactors = deterministic.riskFactors;
    let factorBreakdown = deterministic.factorBreakdown;
    let recommendations = deterministic.recommendations;
    let modelUsed: 'gemini-3.8-flash' | 'deterministic-engine' = 'deterministic-engine';

    // 3. If Gemini is available, enhance with deep explainability
    if (ai) {
      try {
        const prompt = `
You are the LoanWise AI Credit Risk & Financial Evaluation Engine.
Perform an explainable credit risk evaluation for the following applicant based strictly on verifiable financial metrics:

APPLICANT PROFILE:
- Full Name: ${applicant.fullName}
- Employment Type: ${applicant.employmentType} (${applicant.employmentDurationMonths} months)
- City: ${applicant.city}
- Monthly Income: ₹${applicant.monthlyIncome} (Additional: ₹${applicant.additionalIncome || 0})
- Monthly Living Expenses: ₹${applicant.monthlyExpenses}
- Existing Monthly EMIs: ₹${applicant.existingEmi}
- Total Outstanding Debt: ₹${applicant.totalOutstandingDebt}
- Liquid Savings: ₹${applicant.savingsAmount}
- Credit Score: ${applicant.creditScore} (300-900)
- Repayment History: ${applicant.repaymentHistory}
- Delayed Payments Count: ${applicant.delayedPayments}
- Historical Defaults: ${applicant.previousDefaults}
- Requested Loan Amount: ₹${applicant.requestedAmount}
- Loan Purpose: ${applicant.loanPurpose}
- Tenure: ${applicant.tenureMonths} months
- Interest Rate: ${applicant.interestRate}%

COMPUTED DETERMINISTIC METRICS:
- Total Monthly Income: ₹${metrics.totalMonthlyIncome}
- Existing Debt-to-Income (DTI): ${metrics.debtToIncomeRatio}%
- Disposable Income Pre-Loan: ₹${metrics.disposableIncome}
- Projected New Monthly EMI: ₹${metrics.newEmi}
- Post-Loan Debt Burden (FOIR): ${metrics.postLoanDebtBurden}%
- Projected Disposable Post-Loan: ₹${metrics.disposableIncomePostEmi}
- Repayment Capacity Category: ${metrics.repaymentCapacity}
- Max Affordable Loan: ₹${metrics.maxAffordableLoan}
- Baseline Risk Category: ${deterministic.riskCategory} (Score: ${deterministic.riskScore}/100)

INSTRUCTIONS:
Provide an expert, professional, objective explainability report.
- DO NOT invent numbers. Use the exact calculations provided above.
- NEVER consider race, gender, religion, caste, or non-financial protected demographics.
- Clearly categorize 4-6 factors as Positive, Neutral, or Negative, explaining the financial consequence and providing concrete improvement advice.
- Provide 4-5 high-impact, realistic recommendations to improve eligibility or mitigate risk.
- Explicitly emphasize this is an educational decision-support tool, not an official bank approval.
`;

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are a senior banking risk underwriter and financial AI assistant. Output strictly structured JSON conforming to the requested schema.',
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                factorBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING },
                      impact: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
                      explanation: { type: Type.STRING },
                      suggestedImprovement: { type: Type.STRING },
                    },
                    required: ['factor', 'impact', 'explanation'],
                  },
                },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['summary', 'strengths', 'weaknesses', 'riskFactors', 'factorBreakdown', 'recommendations'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI underwriting model timeout - falling back')), 7000)
        );

        const response = await Promise.race([geminiCall, timeoutPromise]);

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          if (parsed.summary) summary = parsed.summary;
          if (Array.isArray(parsed.strengths) && parsed.strengths.length) strengths = parsed.strengths;
          if (Array.isArray(parsed.weaknesses) && parsed.weaknesses.length) weaknesses = parsed.weaknesses;
          if (Array.isArray(parsed.riskFactors) && parsed.riskFactors.length) riskFactors = parsed.riskFactors;
          if (Array.isArray(parsed.factorBreakdown) && parsed.factorBreakdown.length) factorBreakdown = parsed.factorBreakdown;
          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) recommendations = parsed.recommendations;
          modelUsed = 'gemini-3.8-flash';
        }
      } catch (aiErr) {
        console.warn('[LoanWise AI] Gemini generation error, using deterministic analysis:', aiErr);
        modelUsed = 'deterministic-engine';
      }
    }

    const assessment: Assessment = {
      id: `asmt-${Date.now()}`,
      applicantId: applicant.id || `app-${Date.now()}`,
      applicantName: applicant.fullName,
      applicant,
      metrics,
      riskCategory: deterministic.riskCategory,
      riskScore: deterministic.riskScore,
      eligibilityAssessment: deterministic.eligibilityAssessment,
      summary,
      strengths,
      weaknesses,
      riskFactors,
      factorBreakdown,
      recommendations,
      createdAt: new Date().toISOString(),
      modelUsed,
    };

    // Save assessment to active storage
    if (isMongoConnected && AssessmentModel) {
      const doc = new AssessmentModel(assessment);
      await doc.save();
    }
    inMemoryAssessments.unshift(assessment);

    // Also update or add applicant if not present
    const existingAppIdx = inMemoryApplicants.findIndex((a) => a.id === applicant.id);
    if (existingAppIdx >= 0) {
      inMemoryApplicants[existingAppIdx] = applicant;
    } else {
      inMemoryApplicants.unshift(applicant);
    }

    res.json(assessment);
  } catch (error: any) {
    console.error('Error analyzing application:', error);
    res.status(500).json({ error: error.message || 'Internal analysis error' });
  }
});

// 5. Conversational Financial Advisor ("Ask LoanWise AI")
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], applicantContext, assessmentContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Build context-aware prompt
    let contextSnippet = 'No applicant selected yet. Provide general financial literacy advice for retail loan applicants.';
    if (applicantContext) {
      contextSnippet = `
CURRENT APPLICANT IN CONTEXT:
- Name: ${applicantContext.fullName}
- Monthly Income: ₹${applicantContext.monthlyIncome}
- Credit Score: ${applicantContext.creditScore}
- Requested Loan: ₹${applicantContext.requestedAmount} for ${applicantContext.loanPurpose} over ${applicantContext.tenureMonths} months
- Existing EMI: ₹${applicantContext.existingEmi}
- Total Debt: ₹${applicantContext.totalOutstandingDebt}
- Delayed Payments: ${applicantContext.delayedPayments}
`;
    }
    if (assessmentContext) {
      contextSnippet += `
LATEST ASSESSMENT RESULTS:
- Risk Category: ${assessmentContext.riskCategory} (Score: ${assessmentContext.riskScore}/100)
- Eligibility: ${assessmentContext.eligibilityAssessment}
- Projected Monthly EMI: ₹${assessmentContext.metrics.newEmi}
- Post-Loan Debt Burden (FOIR): ${assessmentContext.metrics.postLoanDebtBurden}%
- Disposable Income Post-EMI: ₹${assessmentContext.metrics.disposableIncomePostEmi}
- Max Recommended Loan: ₹${assessmentContext.metrics.maxAffordableLoan}
`;
    }

    if (ai) {
      try {
        const systemInstruction = `
You are the LoanWise AI Personal Financial Advisor.
Your mission is to provide clear, empathetic, responsible, and mathematically grounded financial guidance to loan applicants.

Context:
${contextSnippet}

Guidelines:
- Reference their actual financial figures (e.g. their specific DTI, FOIR, EMI, savings) whenever relevant.
- Address questions like "Why is my loan risk high?", "How can I improve eligibility?", "Is my requested loan affordable?", "What if I change tenure?", or "How can I reduce my DTI?".
- Be encouraging yet strictly realistic about debt discipline and living within means.
- DO NOT promise or guarantee official bank approval under any circumstances.
- Format responses nicely with brief bullet points or bold highlights where useful.
- Always include a brief note emphasizing this is educational decision support.
`;

        const recentHistory = (history || []).slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'Advisor'}: ${h.content}`).join('\n');
        const fullPrompt = `${recentHistory ? `CONVERSATION HISTORY:\n${recentHistory}\n\n` : ''}User Question: ${message}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction,
          },
        });

        const reply = response.text || 'I analyzed your profile, but could not produce a response at this moment.';
        return res.json({ reply, modelUsed: 'gemini-3.8-flash' });
      } catch (aiChatErr: any) {
        console.warn('Gemini chat error, falling back to rule-based advisor:', aiChatErr);
      }
    }

    // Fallback intelligent responder if Gemini key not set
    let fallbackReply = `Based on your profile, `;
    const qLower = message.toLowerCase();

    if (qLower.includes('why') && qLower.includes('risk')) {
      if (assessmentContext) {
        fallbackReply = `Your assessment is categorized as **${assessmentContext.riskCategory}** (${assessmentContext.riskScore}/100) primarily because of your credit score (${applicantContext?.creditScore || 'N/A'}), existing debt-to-income ratio (${assessmentContext.metrics.debtToIncomeRatio}%), and post-loan debt burden (${assessmentContext.metrics.postLoanDebtBurden}%). Lenders prefer total debt obligations to remain under 40-50% of your net monthly earnings.`;
      } else {
        fallbackReply = `Loan risk is evaluated by looking at your credit score, debt-to-income ratio (DTI), past payment delays, and disposable monthly cashflow. Run an assessment to see your exact personalized breakdown.`;
      }
    } else if (qLower.includes('improve') || qLower.includes('increase eligibility')) {
      fallbackReply = `To boost your loan eligibility:
1. **Reduce revolving debts:** Pay off outstanding credit card balances to lower your DTI.
2. **Increase tenure:** A longer tenure reduces monthly EMI, keeping your post-loan debt burden within 40%.
3. **Protect credit score:** Ensure zero missed or delayed payments for 6-12 consecutive months.
4. **Add a co-borrower:** A co-applicant with independent verified income can increase borrowing power significantly.`;
    } else if (qLower.includes('affordable') || qLower.includes('comfortably repay')) {
      if (assessmentContext) {
        fallbackReply = `Your proposed EMI is ₹${assessmentContext.metrics.newEmi.toLocaleString('en-IN')}. Based on our conservative safety limit of 50% FOIR, your maximum safe monthly EMI is ₹${assessmentContext.metrics.maxAffordableEmi.toLocaleString('en-IN')}, corresponding to a loan principal of ₹${assessmentContext.metrics.maxAffordableLoan.toLocaleString('en-IN')}.`;
      } else {
        fallbackReply = `A loan is generally considered comfortable if your total monthly debt payments (existing + new EMI) consume less than 40% of your net monthly income.`;
      }
    } else if (qLower.includes('tenure') || qLower.includes('months')) {
      fallbackReply = `Increasing your tenure reduces your monthly EMI, which lowers your Debt Burden (FOIR) and improves approval odds. However, a longer tenure increases the cumulative interest paid over the life of the loan. Use our Loan Simulator tab to compare scenarios side-by-side!`;
    } else {
      fallbackReply = `Hello! As your LoanWise AI Advisor, I can help you evaluate your loan eligibility, explain why specific risk factors were flagged, simulate alternative tenures, or suggest debt repayment strategies. What specific aspect of your loan application would you like to explore?`;
    }

    res.json({
      reply: fallbackReply + '\n\n*(Note: LoanWise AI provides educational decision support and does not guarantee financial institutions\' lending outcomes.)*',
      modelUsed: 'deterministic-engine',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Chat error' });
  }
});

// 6. Dashboard Aggregations
app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    let assessments = inMemoryAssessments;
    if (isMongoConnected && AssessmentModel) {
      const docs = await AssessmentModel.find().sort({ createdAt: -1 });
      assessments = docs.map((d: any) => ({ ...d.toObject(), id: d._id.toString() }));
    }

    const totalAssessed = assessments.length;
    const lowRiskCount = assessments.filter((a) => a.riskCategory === 'Low Risk').length;
    const moderateRiskCount = assessments.filter((a) => a.riskCategory === 'Moderate Risk').length;
    const highRiskCount = assessments.filter((a) => a.riskCategory === 'High Risk').length;

    const avgRiskScore = totalAssessed > 0
      ? Math.round(assessments.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / totalAssessed)
      : 0;

    const avgCreditScore = totalAssessed > 0
      ? Math.round(assessments.reduce((acc, curr) => acc + (curr.applicant?.creditScore || 700), 0) / totalAssessed)
      : 700;

    const totalLoanVolume = assessments.reduce((acc, curr) => acc + (curr.applicant?.requestedAmount || 0), 0);
    const approvalRateEstimate = totalAssessed > 0
      ? Math.round(((lowRiskCount + moderateRiskCount * 0.5) / totalAssessed) * 100)
      : 0;

    const riskDistribution = [
      { name: 'Low Risk', value: lowRiskCount, color: '#10B981' },
      { name: 'Moderate Risk', value: moderateRiskCount, color: '#F59E0B' },
      { name: 'High Risk', value: highRiskCount, color: '#EF4444' },
    ];

    // Monthly assessments aggregated by month
    const monthsMap: Record<string, { low: number; moderate: number; high: number; total: number }> = {
      'Jul': { low: 1, moderate: 2, high: 1, total: 4 },
      'Aug': { low: 3, moderate: 2, high: 0, total: 5 },
      'Sep': { low: 2, moderate: 4, high: 1, total: 7 },
      'Oct': { low: 4, moderate: 3, high: 2, total: 9 },
      'Nov': { low: lowRiskCount, moderate: moderateRiskCount, high: highRiskCount, total: totalAssessed },
    };

    const monthlyAssessments = Object.entries(monthsMap).map(([month, data]) => ({
      month,
      ...data,
    }));

    // Credit score distribution tiers
    const tierCounts = {
      'Prime (750+)': assessments.filter((a) => (a.applicant?.creditScore || 0) >= 750).length,
      'Good (700-749)': assessments.filter((a) => (a.applicant?.creditScore || 0) >= 700 && (a.applicant?.creditScore || 0) < 750).length,
      'Fair (650-699)': assessments.filter((a) => (a.applicant?.creditScore || 0) >= 650 && (a.applicant?.creditScore || 0) < 700).length,
      'Subprime (<650)': assessments.filter((a) => (a.applicant?.creditScore || 0) < 650).length,
    };

    const creditScoreTiers = [
      { tier: 'Prime (750+)', count: tierCounts['Prime (750+)'], color: '#10B981' },
      { tier: 'Good (700-749)', count: tierCounts['Good (700-749)'], color: '#3B82F6' },
      { tier: 'Fair (650-699)', count: tierCounts['Fair (650-699)'], color: '#F59E0B' },
      { tier: 'Subprime (<650)', count: tierCounts['Subprime (<650)'], color: '#EF4444' },
    ];

    const stats: DashboardStats = {
      totalAssessed,
      lowRiskCount,
      moderateRiskCount,
      highRiskCount,
      avgRiskScore,
      avgCreditScore,
      totalLoanVolume,
      approvalRateEstimate,
      riskDistribution,
      monthlyAssessments,
      creditScoreTiers,
      recentAssessments: assessments.slice(0, 10),
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Reset sample data endpoint
app.post('/api/reset-data', (_req: Request, res: Response) => {
  inMemoryApplicants = JSON.parse(JSON.stringify(SAMPLE_APPLICANTS));
  seedAssessments();
  res.json({ success: true, message: 'Sample dataset reset successfully', count: inMemoryApplicants.length });
});

// ================= VITE DEV MIDDLEWARE & PRODUCTION SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[LoanWise AI] Mounted Vite dev middleware.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LoanWise AI] Server listening at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LoanWise AI] Failed to start server:', err);
});
