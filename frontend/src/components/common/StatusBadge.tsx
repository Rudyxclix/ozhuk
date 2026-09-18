import React from 'react';
import { ReportStatus } from '../../types';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-label-sm' : 'px-2.5 py-1 text-label-sm';

  switch (status) {
    case 'REPORTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-surface-container text-on-surface-variant ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
          Reported
        </span>
      );
    case 'ASSIGNED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-surface-container-high text-primary ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
          Assigned
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-secondary-container text-on-secondary-container ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          In Progress
        </span>
      );
    case 'ESCALATED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-error-container text-on-error-container ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
          Escalated
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider bg-secondary-container/60 text-secondary border border-secondary-container ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Resolved
        </span>
      );
    default:
      return null;
  }
};
