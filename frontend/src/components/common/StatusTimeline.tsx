import React from 'react';
import { ReportItem } from '../../types';

interface StatusTimelineProps {
  report: ReportItem;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ report }) => {
  const isReportedDone = true;
  const isAssignedDone = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'].includes(report.status);
  const isInProgressDone = ['IN_PROGRESS', 'RESOLVED'].includes(report.status);
  const isResolvedDone = report.status === 'RESOLVED';
  const isEscalated = report.status === 'ESCALATED' || report.isSlaBreached;

  return (
    <div className="relative flex flex-col gap-space-md pl-6">
      {/* Connecting Rail */}
      <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-surface-container-highest" />

      {/* Step 1: Reported */}
      <div className="relative flex items-start gap-space-sm">
        <div
          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
            isReportedDone ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">check</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-label-lg text-label-lg font-semibold text-on-surface">Reported</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {new Date(report.reportedAt).toLocaleString()}
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Logged via citizen reporting portal
          </span>
        </div>
      </div>

      {/* Step 2: Assigned */}
      <div className={`relative flex items-start gap-space-sm ${!isAssignedDone ? 'opacity-60' : ''}`}>
        <div
          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
            isAssignedDone ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isAssignedDone ? 'check' : 'radio_button_unchecked'}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-label-lg text-label-lg font-semibold text-on-surface">Assigned</span>
            {report.assignedAt && (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {new Date(report.assignedAt).toLocaleString()}
              </span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {report.assignedTo ? `Assigned to ${report.assignedTo}` : 'Pending assignment to field team'}
          </span>
        </div>
      </div>

      {/* Step 3: In Progress */}
      <div className={`relative flex items-start gap-space-sm ${!isInProgressDone ? 'opacity-60' : ''}`}>
        <div
          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
            report.status === 'IN_PROGRESS'
              ? 'bg-primary text-on-primary animate-pulse'
              : isInProgressDone
              ? 'bg-secondary text-on-secondary'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isInProgressDone ? 'check' : 'engineering'}
          </span>
        </div>
        <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-low w-full">
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg font-bold text-primary">In Progress</span>
            {report.status === 'IN_PROGRESS' && (
              <span className="font-label-sm text-label-sm font-semibold text-secondary">Active Field Work</span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface mt-0.5">
            Maintenance crew engaged in desilting and clearing canal blockage.
          </span>
        </div>
      </div>

      {/* Escalation Warning (if applicable) */}
      {isEscalated && (
        <div className="relative flex items-start gap-space-sm">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center shadow-sm animate-bounce">
            <span className="material-symbols-outlined text-[14px]">warning</span>
          </div>
          <div className="flex flex-col p-space-sm rounded-lg bg-error-container/40 border border-error/30 w-full">
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wide text-error">
              Escalation Alert
            </span>
            <span className="font-body-sm text-body-sm text-on-error-container mt-0.5">
              Ticket escalated to municipal supervisor for expedited resolution.
            </span>
          </div>
        </div>
      )}

      {/* Step 4: Resolved */}
      <div className={`relative flex items-start gap-space-sm ${!isResolvedDone ? 'opacity-60' : ''}`}>
        <div
          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
            isResolvedDone ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isResolvedDone ? 'check' : 'radio_button_unchecked'}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-label-lg text-label-lg font-semibold text-on-surface">Resolved</span>
            {report.resolvedAt && (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {new Date(report.resolvedAt).toLocaleString()}
              </span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {isResolvedDone
              ? report.resolutionNotes || 'Culvert cleared and water flow verified.'
              : 'Pending clearance verification and photo upload'}
          </span>
        </div>
      </div>
    </div>
  );
};
