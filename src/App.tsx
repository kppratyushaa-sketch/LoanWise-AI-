import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentReportView } from './components/AssessmentReportView';
import { ApplicantsList } from './components/ApplicantsList';
import { RiskAnalytics } from './components/RiskAnalytics';
import { LoanSimulator } from './components/LoanSimulator';
import { AiFinancialAdvisor } from './components/AiFinancialAdvisor';
import { AssessmentHistory } from './components/AssessmentHistory';
import { SettingsModal } from './components/SettingsModal';
import { Applicant, Assessment, DashboardStats } from './types';
import {
  fetchSystemStatus,
  fetchApplicants,
  fetchAssessments,
  fetchDashboardStats,
  analyzeApplication,
  createApplicant,
  deleteApplicant,
  deleteAssessment,
} from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Core Data State
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessed: 0,
    lowRiskCount: 0,
    moderateRiskCount: 0,
    highRiskCount: 0,
    avgRiskScore: 0,
    avgCreditScore: 700,
    totalLoanVolume: 0,
    approvalRateEstimate: 0,
    riskDistribution: [],
    monthlyAssessments: [],
    creditScoreTiers: [],
    recentAssessments: [],
  });

  const [systemStatus, setSystemStatus] = useState({
    database: 'local-demo',
    databaseMessage: 'Local Storage Mode',
    geminiConfigured: false,
    model: 'gemini-3.8-flash',
    applicantCount: 5,
    assessmentCount: 5,
  });

  // Flow State
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [sysStatus, appList, asmtList, dashStats] = await Promise.all([
        fetchSystemStatus(),
        fetchApplicants(),
        fetchAssessments(),
        fetchDashboardStats(),
      ]);

      setSystemStatus(sysStatus);
      setApplicants(appList);
      setAssessments(asmtList);
      setStats(dashStats);
    } catch (err) {
      console.warn('Failed to load full backend state:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSelectSample = (sample: Applicant) => {
    setSelectedApplicant(sample);
    setShowLanding(false);
    setActiveAssessment(null);
    setCurrentTab('new-assessment');
  };

  const handleStartNewAssessment = () => {
    setSelectedApplicant(null);
    setActiveAssessment(null);
    setShowLanding(false);
    setCurrentTab('new-assessment');
  };

  const handleAnalyzeApplicant = async (formData: Applicant) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeApplication(formData);
      setActiveAssessment(result);
      notify('success', `Underwriting completed for ${formData.fullName}: Rated as ${result.riskCategory}`);
      // Refresh dashboard background metrics asynchronously without blocking the UI
      loadAllData().catch((syncErr) => console.warn('Background sync warning:', syncErr));
    } catch (err: any) {
      console.error('Error running assessment:', err);
      notify('error', err.message || 'Underwriting analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteApplicant = async (id: string) => {
    try {
      await deleteApplicant(id);
      notify('success', 'Applicant removed successfully.');
      await loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to delete applicant.');
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      await deleteAssessment(id);
      if (activeAssessment?.id === id) setActiveAssessment(null);
      notify('success', 'Assessment dossier removed.');
      await loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to delete assessment.');
    }
  };

  const handleAskAiAboutReport = (asmt: Assessment) => {
    setActiveAssessment(asmt);
    setCurrentTab('advisor');
  };

  // If user is viewing full landing page view
  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={handleStartNewAssessment}
        onExploreDemo={() => {
          setShowLanding(false);
          setCurrentTab('dashboard');
        }}
        onSelectSample={handleSelectSample}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex text-slate-800">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveAssessment(null);
          setCurrentTab(tab);
        }}
        systemStatus={systemStatus}
        onOpenLanding={() => setShowLanding(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onStartNewAssessment={handleStartNewAssessment}
          onSelectSampleApplicant={handleSelectSample}
          onOpenLanding={() => setShowLanding(true)}
          systemStatus={systemStatus}
        />

        {/* Global Notification Toast */}
        {notification && (
          <div className="fixed top-18 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* If Active Assessment Report is Open */}
          {activeAssessment ? (
            <AssessmentReportView
              assessment={activeAssessment}
              onBack={() => setActiveAssessment(null)}
              onAskAi={handleAskAiAboutReport}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard
                  stats={stats}
                  onNewAssessment={handleStartNewAssessment}
                  onViewAssessment={(asmt) => setActiveAssessment(asmt)}
                  onAskAi={handleAskAiAboutReport}
                  onSelectSampleApplicant={handleSelectSample}
                />
              )}

              {currentTab === 'new-assessment' && (
                <AssessmentForm
                  initialApplicant={selectedApplicant}
                  onSubmit={handleAnalyzeApplicant}
                  isLoading={isAnalyzing}
                />
              )}

              {currentTab === 'applicants' && (
                <ApplicantsList
                  applicants={applicants}
                  onAssessApplicant={(app) => {
                    setSelectedApplicant(app);
                    setCurrentTab('new-assessment');
                  }}
                  onNewApplicant={() => {
                    setSelectedApplicant(null);
                    setCurrentTab('new-assessment');
                  }}
                  onDeleteApplicant={handleDeleteApplicant}
                />
              )}

              {currentTab === 'analytics' && (
                <RiskAnalytics
                  assessments={assessments}
                  onViewAssessment={(asmt) => setActiveAssessment(asmt)}
                />
              )}

              {currentTab === 'simulator' && <LoanSimulator />}

              {currentTab === 'advisor' && (
                <AiFinancialAdvisor
                  currentApplicant={selectedApplicant}
                  currentAssessment={activeAssessment}
                  allAssessments={assessments}
                  onSelectAssessment={(asmt) => setActiveAssessment(asmt)}
                />
              )}

              {currentTab === 'history' && (
                <AssessmentHistory
                  assessments={assessments}
                  onViewAssessment={(asmt) => setActiveAssessment(asmt)}
                  onDeleteAssessment={handleDeleteAssessment}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsModal
                  systemStatus={systemStatus}
                  onRefreshData={loadAllData}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
