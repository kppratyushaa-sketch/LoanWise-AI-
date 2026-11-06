import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  LineChart,
  Calculator,
  BotMessageSquare,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'new-assessment'
  | 'applicants'
  | 'analytics'
  | 'simulator'
  | 'advisor'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  systemStatus: {
    database: string;
    geminiConfigured: boolean;
  };
  onOpenLanding: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  onOpenLanding,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.FC<any>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-assessment', label: 'New Assessment', icon: FileCheck2, badge: 'AI' },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'analytics', label: 'Risk Analytics', icon: LineChart },
    { id: 'simulator', label: 'Loan Simulator', icon: Calculator },
    { id: 'advisor', label: 'AI Financial Advisor', icon: BotMessageSquare, badge: 'Gemini' },
    { id: 'history', label: 'Assessment History', icon: History },
    { id: 'settings', label: 'Settings & Status', icon: Settings },
  ];

  const handleNavClick = (id: TabType) => {
    onSelectTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#173B70] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-18 px-5 flex items-center justify-between border-b border-blue-900/50 bg-[#122F5A]">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight flex items-center space-x-1">
                  <span>LoanWise</span>
                  <span className="text-cyan-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-700/50">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-blue-200 tracking-wider font-medium uppercase">
                  Risk & Eligibility
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#2878E5] text-white shadow-md shadow-blue-900/30 font-semibold'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-blue-900'
                          : 'bg-blue-900/60 text-cyan-300 border border-cyan-400/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status & Landing Link */}
        <div className="p-4 border-t border-blue-900/60 bg-[#122F5A]/60 space-y-3">
          {/* Quick Landing Page link */}
          <button
            onClick={onOpenLanding}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg bg-blue-900/50 hover:bg-blue-800/80 text-blue-200 hover:text-white border border-blue-700/40 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Platform Overview</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
          </button>

          {/* Backend Status Indicators */}
          <div className="p-2.5 rounded-lg bg-[#0F264A] border border-blue-900/50 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-blue-300 flex items-center space-x-1.5">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Data Engine:</span>
              </span>
              <span className="font-semibold text-emerald-400">
                {systemStatus.database === 'mongodb' ? 'MongoDB Cluster' : 'Demo LocalDB'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-blue-300 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>AI Reasoner:</span>
              </span>
              <span className="font-semibold text-cyan-300">
                {systemStatus.geminiConfigured ? 'Gemini 3.8 Flash' : 'Hybrid Rule Model'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-center text-blue-300/80">
            LoanWise AI v2.4 • Educational FinTech
          </div>
        </div>
      </aside>
    </>
  );
};
