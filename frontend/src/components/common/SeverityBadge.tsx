import React from 'react';
import { SeverityLevel } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm font-bold uppercase bg-error text-on-error shadow-sm">
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm font-bold uppercase bg-error-container text-on-error-container">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold uppercase bg-surface-container-high text-on-surface-variant">
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold uppercase bg-surface-container-low text-outline">
          Low
        </span>
      );
    default:
      return null;
  }
};
