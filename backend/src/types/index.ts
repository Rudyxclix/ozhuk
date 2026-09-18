export type ReportStatus =
  | 'REPORTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED';

export type SeverityLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type DrainageCategory =
  | 'STORM_DRAIN'
  | 'CANAL'
  | 'CULVERT'
  | 'OTHER';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
}

export interface WardInfo {
  wardNumber: string;
  wardName: string;
  division?: string;
  officerInCharge?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
  previousStatus?: ReportStatus;
  newStatus?: ReportStatus;
}

export interface ReportItem {
  id: string;
  ticketId: string;
  category: DrainageCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  ward: WardInfo;
  location: GeoLocation;
  description: string;
  photoUrl: string;
  photoFileName?: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  slaDeadline?: string;
  isSlaBreached?: boolean;
  resolutionPhotoUrl?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  auditLog: AuditLogEntry[];
}

export interface CreateReportDTO {
  category: DrainageCategory;
  severity?: SeverityLevel;
  wardNumber: string;
  wardName: string;
  latitude: number;
  longitude: number;
  landmark: string;
  description: string;
  photoUrl?: string;
  photoFileName?: string;
}

export interface UpdateReportStatusDTO {
  status: ReportStatus;
  actor: string;
  notes?: string;
  resolutionPhotoUrl?: string;
}

export interface AssignReportDTO {
  assignedTo: string;
  actor: string;
  notes?: string;
}
