import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-high mt-auto">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
        <div className="flex flex-col gap-1">
          <Logo showTagline={false} className="h-6 w-auto" />
          <p className="text-on-surface-variant font-body-sm text-body-sm max-w-lg">
            Ozhuk Civic Reporting Platform — Canal & storm-drain blockage reporting and triage.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-0.5">
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Prototype • ANAVANDI 2026
          </span>
          <span className="text-on-surface-variant font-body-sm text-[12px]">
            Civic technology initiative for urban waterlogging resilience.
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-sm border-t border-surface-container flex flex-col sm:flex-row justify-between items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
        <p>© 2026 Ozhuk Civic Reporting Platform</p>
        <div className="flex gap-space-md">
          <span>Community Reporting</span>
          <span>•</span>
          <span>Open Civic Project</span>
        </div>
      </div>
    </footer>
  );
};
