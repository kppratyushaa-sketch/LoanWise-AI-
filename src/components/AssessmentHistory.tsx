import React, { useState } from 'react';
import {
  History,
  Search,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Assessment } from '../types';
import { formatINR } from '../utils/financialEngine';
import { generateAssessmentPDF } from '../utils/pdfGenerator';

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onViewAssessment: (asmt: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  assessments,
  onViewAssessment,
  onDeleteAssessment,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = assessments.filter((asmt) => {
    const matchesSearch =
      asmt.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asmt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asmt.applicant?.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'All' || asmt.riskCategory === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const handleDelete = (id: string) => {
    onDeleteAssessment(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2878E5] mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Records</span>
          </div>
          <h2 className="text-2xl font-bold text-[#173B70]">Assessment Dossier History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical catalog of all institutional loan risk evaluations and generated AI dossiers.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Dossiers: <span className="font-mono text-[#173B70]">{assessments.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {['All', 'Low Risk', 'Moderate Risk', 'High Risk'].map((cat) => (
            <button
              key={cat}
              onClick={() => setRiskFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex-1 sm:flex-initial ${
                riskFilter === cat
                  ? 'bg-white text-[#173B70] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Applicant / ID</th>
                <th className="px-5 py-3">Requested Loan</th>
                <th className="px-5 py-3">Credit Score</th>
                <th className="px-5 py-3">Post-Loan FOIR</th>
                <th className="px-5 py-3">Risk Category</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No assessment history records found.
                  </td>
                </tr>
              ) : (
                filtered.map((asmt) => {
                  let badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (asmt.riskCategory === 'Moderate Risk') badge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (asmt.riskCategory === 'High Risk') badge = 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <tr key={asmt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{asmt.applicantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {asmt.id} •{' '}
                          {new Date(asmt.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-medium text-slate-800">
                        {formatINR(asmt.applicant?.requestedAmount || 0)}
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {asmt.applicant?.tenureMonths} mos @ {asmt.applicant?.interestRate}%
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                        {asmt.applicant?.creditScore}
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                        <span
                          className={
                            asmt.metrics.postLoanDebtBurden <= 45
                              ? 'text-emerald-600'
                              : asmt.metrics.postLoanDebtBurden <= 60
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }
                        >
                          {asmt.metrics.postLoanDebtBurden}%
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          EMI: {formatINR(asmt.metrics.newEmi)}/mo
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                          {asmt.riskCategory} ({asmt.riskScore}/100)
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[11px] font-mono text-slate-500 uppercase">
                        {asmt.modelUsed === 'gemini-3.8-flash' ? (
                          <span className="text-cyan-700 font-bold flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-[#2878E5]" />
                            <span>Gemini</span>
                          </span>
                        ) : (
                          <span>Rule Engine</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onViewAssessment(asmt)}
                          className="p-1.5 rounded-lg bg-blue-50 text-[#173B70] hover:bg-blue-100 transition-colors"
                          title="View Full Report"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#2878E5]" />
                        </button>

                        <button
                          onClick={() => generateAssessmentPDF(asmt)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(asmt.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Assessment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Delete Assessment Dossier?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this assessment record? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
