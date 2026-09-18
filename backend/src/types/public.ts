import { DrainageCategory, SeverityLevel, ReportStatus } from './index.js';

export interface PublicReportItem {
  ticketId: string;
  category: DrainageCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  ward: {
    wardNumber: string;
    wardName: string;
  };
  location: {
    latitude: number;
    longitude: number;
    landmark?: string;
  };
  description: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
