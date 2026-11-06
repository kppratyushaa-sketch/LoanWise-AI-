import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Trash2,
  FileCheck2,
  Eye,
  Building2,
  MapPin,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Applicant } from '../types';
import { formatINR } from '../utils/financialEngine';

interface ApplicantsListProps {
  applicants: Applicant[];
  onAssessApplicant: (applicant: Applicant) => void;
  onNewApplicant: () => void;
  onDeleteApplicant: (id: string) => void;
}

export const ApplicantsList: React.FC<ApplicantsListProps> = ({
  applicants,
  onAssessApplicant,
  onNewApplicant,
  onDeleteApplicant,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [employmentFilter, setEmploymentFilter] = useState<string>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.loanPurpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployment =
      employmentFilter === 'All' || app.employmentType === employmentFilter;

    return matchesSearch && matchesEmployment;
  });

  const handleDelete = (id: string) => {
    onDeleteApplicant(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2878E5] mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Applicant Registry</span>
          </div>
          <h2 className="text-2xl font-bold text-[#173B70]">Applicant Profiles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage applicant personal details, income statements, and credit files.
          </p>
        </div>

        <button
          onClick={onNewApplicant}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#2878E5] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Applicant</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, city, purpose..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Employment:</span>
          <select
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Salaried - Private">Salaried - Private</option>
            <option value="Salaried - Public / Govt">Salaried - Public / Govt</option>
            <option value="Self-Employed Professional">Self-Employed Professional</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Freelancer / Gig">Freelancer / Gig</option>
          </select>
        </div>
      </div>

      {/* Grid of Applicants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApplicants.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No applicants match your search criteria.
          </div>
        ) : (
          filteredApplicants.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#173B70]">{app.fullName}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{app.city}</span>
                      <span>•</span>
                      <span>{app.age} yrs</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.creditScore >= 750
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.creditScore >= 650
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Score: {app.creditScore}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Monthly Income</span>
                    <strong className="text-slate-800 font-mono">{formatINR(app.monthlyIncome)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Requested Loan</span>
                    <strong className="text-blue-700 font-mono">{formatINR(app.requestedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Existing EMI</span>
                    <span className="text-slate-700 font-mono">{formatINR(app.existingEmi)}/mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Delays / Defaults</span>
                    <span className="text-slate-700 font-mono">
                      {app.delayedPayments} delays, {app.previousDefaults} def
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg truncate">
                  Purpose: <span className="font-medium text-slate-700">{app.loanPurpose}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setDeleteConfirmId(app.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onAssessApplicant(app)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#173B70] hover:bg-[#122F5A] text-white text-xs font-bold transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Run Assessment</span>
                </button>
              </div>

              {/* Delete confirmation overlay */}
              {deleteConfirmId === app.id && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                  <div className="flex items-center space-x-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Delete this applicant?</span>
                  </div>
                  <p className="text-[11px]">This will also remove associated assessment records.</p>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-bold"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
