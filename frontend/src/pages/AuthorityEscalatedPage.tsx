import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ReportItem } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusBadge } from '../components/common/StatusBadge';

export const AuthorityEscalatedPage: React.FC = () => {
  const navigate = useNavigate();
  const [escalatedReports, setEscalatedReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscalated = async () => {
    setLoading(true);
    try {
      // Query MongoDB Atlas for reports with status ESCALATED
      const data = await api.getReports({ status: 'ESCALATED' });
      setEscalatedReports(data);
    } catch (err) {
      console.error('Error fetching escalated reports from MongoDB Atlas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalated();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin-desktop py-space-md flex flex-col gap-space-lg">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
        <div className="flex items-center gap-space-xs font-label-md">
          <Link
            to="/authority"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-error font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Escalated Triage Queue ({escalatedReports.length})
          </span>
        </div>

        <button
          onClick={fetchEscalated}
          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh Queue</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-on-surface-variant">Loading escalated tickets from MongoDB Atlas...</div>
      ) : escalatedReports.length === 0 ? (
        <div className="p-space-xl rounded-xl bg-surface-container-lowest text-center border border-surface-container">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
          <h2 className="font-headline-sm text-primary font-bold">No Escalated Reports</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            All reported drainage issues are within SLA response windows.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {escalatedReports.map((report) => (
            <div
              key={report.id}
              className="p-space-md rounded-xl bg-error-container/20 border border-error-container shadow-sm flex flex-col gap-space-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-error text-label-md">
                      #{report.ticketId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-error text-on-error text-[10px] font-bold uppercase tracking-wider">
                      SLA Alert
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                    {report.category} Blockage
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <SeverityBadge severity={report.severity} />
                  <StatusBadge status={report.status} size="sm" />
                </div>
              </div>

              <p className="font-body-sm text-on-surface italic bg-surface-container-lowest/70 p-2 rounded">
                "{report.description}"
              </p>

              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Ward {report.ward.wardNumber} ({report.ward.wardName})</span>
                <span>{report.location.landmark}</span>
              </div>

              <div className="flex items-center justify-between pt-space-xs border-t border-error-container/40 text-[12px] text-on-surface-variant">
                <span>
                  {report.assignedTo ? (
                    <span>Assigned: <strong>{report.assignedTo}</strong></span>
                  ) : (
                    <span className="text-error font-semibold">Unassigned</span>
                  )}
                </span>
                <button
                  onClick={() => navigate(`/authority/reports/${report.id}`)}
                  className="px-space-md py-1.5 rounded-lg bg-error text-on-error font-label-sm font-semibold hover:bg-on-error-container transition-colors shadow-sm"
                >
                  Inspect & Re-triage →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
