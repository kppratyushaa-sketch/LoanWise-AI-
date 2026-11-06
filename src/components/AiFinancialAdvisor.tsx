import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Applicant, Assessment, ChatMessage } from '../types';
import { askAdvisor } from '../services/api';
import { formatINR } from '../utils/financialEngine';

interface AiFinancialAdvisorProps {
  currentApplicant?: Applicant | null;
  currentAssessment?: Assessment | null;
  allAssessments: Assessment[];
  onSelectAssessment: (asmt: Assessment) => void;
}

export const AiFinancialAdvisor: React.FC<AiFinancialAdvisorProps> = ({
  currentApplicant,
  currentAssessment,
  allAssessments,
  onSelectAssessment,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your **LoanWise AI Financial Advisor**. 

I can explain why specific risk factors were flagged in your assessment, evaluate your Debt-to-Income (DTI) ratio, simulate how changing loan tenures affects your monthly debt burden, or recommend concrete steps to improve your creditworthiness.

Select an applicant above or ask any financial question below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAsmtId, setSelectedAsmtId] = useState<string>(currentAssessment?.id || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentAssessment) {
      setSelectedAsmtId(currentAssessment.id);
    }
  }, [currentAssessment]);

  const activeAssessment = allAssessments.find((a) => a.id === selectedAsmtId) || currentAssessment;
  const activeApplicant = activeAssessment?.applicant || currentApplicant;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAdvisor(
        messageText.trim(),
        [...messages, userMsg],
        activeApplicant || undefined,
        activeAssessment || undefined
      );

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue connecting to the advisory model: ${err.message}. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptChips = [
    'Why is my loan risk rated as it is?',
    'How can I improve my loan eligibility?',
    'Is my requested loan amount affordable?',
    'How much loan can I comfortably repay?',
    'What happens if I increase my loan tenure?',
    'How can I reduce my debt-to-income ratio?',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Context Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#173B70] flex items-center space-x-1.5">
              <span>Ask LoanWise AI Financial Advisor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Context-aware financial underwriting reasoning and debt optimization advice.
            </p>
          </div>
        </div>

        {/* Applicant Context Picker */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Context:</span>
          <select
            value={selectedAsmtId}
            onChange={(e) => {
              setSelectedAsmtId(e.target.value);
              const found = allAssessments.find((a) => a.id === e.target.value);
              if (found) onSelectAssessment(found);
            }}
            className="w-full sm:w-60 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">General Financial Literacy (No Applicant)</option>
            {allAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.applicantName} ({a.riskCategory}, Score {a.applicant?.creditScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Profile Context Banner (if selected) */}
      {activeAssessment && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2 text-[#173B70]">
            <span className="font-bold">{activeAssessment.applicantName}</span>
            <span>•</span>
            <span>Score: <strong>{activeAssessment.applicant?.creditScore}</strong></span>
            <span>•</span>
            <span>Income: <strong>{formatINR(activeAssessment.metrics.totalMonthlyIncome)}</strong></span>
            <span>•</span>
            <span>Requested: <strong>{formatINR(activeAssessment.applicant?.requestedAmount || 0)}</strong></span>
          </div>

          <span
            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
              activeAssessment.riskCategory === 'Low Risk'
                ? 'bg-emerald-100 text-emerald-800'
                : activeAssessment.riskCategory === 'Moderate Risk'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {activeAssessment.riskCategory} ({activeAssessment.riskScore}/100)
          </span>
        </div>
      )}

      {/* Chat Messages Scroll Window */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#173B70] text-white'
                    : 'bg-gradient-to-tr from-[#2878E5] to-cyan-500 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#173B70] text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-normal">
                  {msg.content}
                </div>
                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? 'text-blue-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2878E5] to-cyan-500 text-white flex items-center justify-center shrink-0 animate-pulse">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 rounded-tl-xs flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-slate-500 ml-1">Analyzing financial metrics & underwriter heuristics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Recommended Financial Questions:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
              className="text-xs bg-white hover:bg-blue-50 hover:border-blue-400 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 hover:text-blue-900 transition-colors shadow-2xs font-medium cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          placeholder="Ask a question about credit scores, debt burden, EMI affordability..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-[#2878E5] hover:bg-blue-600 disabled:bg-slate-200 text-white shadow-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="text-[10px] text-center text-slate-400">
        LoanWise AI provides educational decision support. Never guarantee bank approval or take on debt beyond your repayment capacity.
      </div>
    </div>
  );
};
