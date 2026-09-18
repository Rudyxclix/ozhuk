import { ReportModel, ReportDocument } from '../models/Report.js';
import { ReportEventModel } from '../models/ReportEvent.js';
import { isDatabaseConnected } from '../config/database.js';
import { OFFICERS_LIST } from '../routes/wards.js';
import { PublicReportItem } from '../types/public.js';
import {
  ReportItem,
  CreateReportDTO,
  AssignReportDTO,
  UpdateReportStatusDTO,
  ReportStatus,
} from '../types/index.js';

class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ReportService {
  private nextSequence = 100;

  private generateCandidateTicketId(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;

    this.nextSequence += 1;
    return `OZH-${datePrefix}-${String(this.nextSequence).padStart(3, '0')}`;
  }

  private async generateUniqueTicketId(): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
      const candidate = this.generateCandidateTicketId();
      const existing = await ReportModel.findOne({ ticketId: candidate }).lean();
      if (!existing) {
        return candidate;
      }
      attempts++;
    }
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    return `OZH-${yy}${mm}${dd}-${randSuffix}`;
  }

  private ensureDatabaseConnected() {
    if (!isDatabaseConnected()) {
      const err = new Error('Database service unavailable. MongoDB connection is not established.');
      (err as unknown as { statusCode: number }).statusCode = 503;
      throw err;
    }
  }

  private async hydrateAuditLog(reportDoc: ReportDocument): Promise<ReportItem> {
    const json = reportDoc.toJSON() as unknown as ReportItem;

    const events = await ReportEventModel.find({ ticketId: reportDoc.ticketId })
      .sort({ timestamp: 1 })
      .lean();

    if (events.length > 0) {
      json.auditLog = events.map((ev) => ({
        timestamp: ev.timestamp instanceof Date ? ev.timestamp.toISOString() : String(ev.timestamp),
        action: ev.action,
        actor: ev.actor,
        notes: ev.notes,
        previousStatus: (ev.previousStatus as ReportStatus) || undefined,
        newStatus: (ev.newStatus as ReportStatus) || undefined,
      }));
    } else {
      json.auditLog = [
        {
          timestamp: json.createdAt || new Date().toISOString(),
          action: 'REPORT_SUBMITTED',
          actor: 'Citizen',
          notes: 'Report submitted via citizen reporting wizard',
          newStatus: 'REPORTED',
        },
      ];
    }

    return json;
  }

  async listReports(filter?: { ward?: string; status?: string; severity?: string }): Promise<ReportItem[]> {
    this.ensureDatabaseConnected();

    const query: Record<string, unknown> = {};
    if (filter?.ward && filter.ward !== 'all') {
      query['ward.number'] = filter.ward;
    }
    if (filter?.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    if (filter?.severity && filter.severity !== 'all') {
      query.severity = filter.severity;
    }

    const docs = await ReportModel.find(query).sort({ createdAt: -1 });
    const results: ReportItem[] = [];
    for (const doc of docs) {
      results.push(await this.hydrateAuditLog(doc));
    }
    return results;
  }

  // Public safe projection for open-report map and community tracking
  async listPublicReports(filter?: { ward?: string; status?: string; severity?: string }): Promise<PublicReportItem[]> {
    this.ensureDatabaseConnected();

    const query: Record<string, unknown> = {};
    if (filter?.ward && filter.ward !== 'all') {
      query['ward.number'] = filter.ward;
    }
    if (filter?.status && filter.status !== 'all') {
      query.status = filter.status;
    }
    if (filter?.severity && filter.severity !== 'all') {
      query.severity = filter.severity;
    }

    const docs = await ReportModel.find(query).sort({ createdAt: -1 });
    return docs.map((doc) => {
      const coords = doc.location?.coordinates || [0, 0];
      return {
        ticketId: doc.ticketId,
        category: doc.category,
        severity: doc.severity,
        status: doc.status,
        ward: {
          wardNumber: doc.ward.number,
          wardName: doc.ward.name,
        },
        location: {
          longitude: coords[0],
          latitude: coords[1],
          landmark: doc.landmark,
        },
        description: doc.description,
        reportedAt: doc.reportedAt instanceof Date ? doc.reportedAt.toISOString() : String(doc.reportedAt),
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
        resolvedAt: doc.resolvedAt instanceof Date ? doc.resolvedAt.toISOString() : undefined,
      };
    });
  }

  async getReportById(id: string): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    let doc: ReportDocument | null = null;
    try {
      doc = await ReportModel.findById(id);
    } catch {
      doc = null;
    }

    if (!doc) return null;
    return this.hydrateAuditLog(doc);
  }

  async getReportByTicketId(rawTicketId: string): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    const cleanTicketId = rawTicketId.trim().toUpperCase();
    const doc = await ReportModel.findOne({ ticketId: cleanTicketId });
    if (!doc) return null;

    return this.hydrateAuditLog(doc);
  }

  async createReport(dto: CreateReportDTO): Promise<ReportItem> {
    this.ensureDatabaseConnected();

    const now = new Date();
    const ticketId = await this.generateUniqueTicketId();

    let photoUrl = '';
    if (dto.photoUrl && !dto.photoUrl.startsWith('blob:') && !dto.photoUrl.includes('googleusercontent.com')) {
      photoUrl = dto.photoUrl;
    } else if (dto.photoFileName) {
      photoUrl = `pending_upload:${dto.photoFileName}`;
    }

    const slaDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const reportDoc = new ReportModel({
      ticketId,
      category: dto.category,
      severity: dto.severity || 'MEDIUM',
      status: 'REPORTED',
      ward: {
        number: dto.wardNumber,
        name: dto.wardName,
        localBody: null,
      },
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      },
      landmark: dto.landmark,
      description: dto.description,
      photoFileName: dto.photoFileName || undefined,
      photoUrl,
      reportedAt: now,
      slaDeadline,
      isSlaBreached: false,
    });

    try {
      await reportDoc.save();
    } catch (err: unknown) {
      const error = err as { code?: number };
      if (error.code === 11000) {
        reportDoc.ticketId = await this.generateUniqueTicketId();
        await reportDoc.save();
      } else {
        throw err;
      }
    }

    await ReportEventModel.create({
      reportId: reportDoc._id,
      ticketId: reportDoc.ticketId,
      action: 'REPORT_SUBMITTED',
      previousStatus: null,
      newStatus: 'REPORTED',
      actorId: null,
      actor: 'Citizen',
      notes: 'Report submitted via citizen reporting wizard',
      timestamp: now,
      metadata: {
        category: dto.category,
        severity: dto.severity || 'MEDIUM',
        wardNumber: dto.wardNumber,
      },
    });

    return this.hydrateAuditLog(reportDoc);
  }

  async assignReport(id: string, dto: AssignReportDTO): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    const report = await ReportModel.findById(id);
    if (!report) return null;

    if (report.status === 'RESOLVED') {
      throw new ValidationError('Cannot reassign a resolved report. RESOLVED is terminal.');
    }

    if (report.status !== 'REPORTED' && report.status !== 'ESCALATED') {
      throw new ValidationError(`Cannot assign officer when status is ${report.status}. Allowed from REPORTED or ESCALATED.`);
    }

    const matchedOfficer = OFFICERS_LIST.find(
      (off) => off.id === dto.assignedTo || off.name.toLowerCase() === dto.assignedTo.toLowerCase()
    );
    if (!matchedOfficer) {
      throw new ValidationError(`Invalid officer '${dto.assignedTo}'. Officer must match an existing prototype officer record.`);
    }

    const previousStatus = report.status;
    report.status = 'ASSIGNED';
    report.assignedTo = matchedOfficer.name;
    report.assignedOfficerId = matchedOfficer.id;
    report.assignedAt = new Date();
    await report.save();

    await ReportEventModel.create({
      reportId: report._id,
      ticketId: report.ticketId,
      action: 'OFFICER_ASSIGNED',
      previousStatus,
      newStatus: 'ASSIGNED',
      actorId: null,
      actor: dto.actor,
      notes: dto.notes || `Assigned to ${matchedOfficer.name} (${matchedOfficer.role})`,
      timestamp: new Date(),
    });

    return this.hydrateAuditLog(report);
  }

  async updateStatus(id: string, dto: UpdateReportStatusDTO): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    const report = await ReportModel.findById(id);
    if (!report) return null;

    if (report.status === 'RESOLVED') {
      throw new ValidationError('Cannot transition status from RESOLVED. RESOLVED is terminal.');
    }

    const previousStatus = report.status;
    const targetStatus = dto.status;

    if (targetStatus === 'IN_PROGRESS') {
      if (previousStatus !== 'ASSIGNED') {
        throw new ValidationError(`Cannot start work (IN_PROGRESS) from ${previousStatus}. Work can only begin once an officer is ASSIGNED.`);
      }
    } else if (targetStatus === 'ASSIGNED') {
      if (previousStatus !== 'REPORTED' && previousStatus !== 'ESCALATED') {
        throw new ValidationError(`Cannot transition directly to ASSIGNED from ${previousStatus}. Use officer assignment endpoint.`);
      }
    } else if (targetStatus === 'RESOLVED') {
      throw new ValidationError('Direct resolution via status endpoint is not allowed. Use the resolution endpoint with required resolution notes.');
    } else if (targetStatus === 'REPORTED') {
      throw new ValidationError(`Cannot revert status to REPORTED from ${previousStatus}.`);
    } else if (targetStatus === 'ESCALATED') {
      throw new ValidationError('Use the dedicated escalation endpoint with escalation notes.');
    }

    report.status = targetStatus;
    if (dto.resolutionPhotoUrl) {
      report.resolutionPhotoUrl = dto.resolutionPhotoUrl;
    }
    await report.save();

    await ReportEventModel.create({
      reportId: report._id,
      ticketId: report.ticketId,
      action: 'STATUS_UPDATED',
      previousStatus,
      newStatus: targetStatus,
      actorId: null,
      actor: dto.actor,
      notes: dto.notes || `Status transitioned from ${previousStatus} to ${targetStatus}`,
      timestamp: new Date(),
    });

    return this.hydrateAuditLog(report);
  }

  async escalateReport(id: string, actor: string, notes?: string): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    const report = await ReportModel.findById(id);
    if (!report) return null;

    if (report.status === 'RESOLVED') {
      throw new ValidationError('Cannot escalate a resolved report. RESOLVED is terminal.');
    }

    if (report.status === 'ESCALATED') {
      throw new ValidationError('Report is already ESCALATED.');
    }

    const previousStatus = report.status;
    report.status = 'ESCALATED';
    report.isSlaBreached = true;
    report.escalatedAt = new Date();
    await report.save();

    const escalationNotes = notes && notes.trim().length > 0
      ? notes.trim()
      : 'Ticket escalated for supervisor review due to SLA threshold or priority urgency.';

    await ReportEventModel.create({
      reportId: report._id,
      ticketId: report.ticketId,
      action: 'REPORT_ESCALATED',
      previousStatus,
      newStatus: 'ESCALATED',
      actorId: null,
      actor,
      notes: escalationNotes,
      timestamp: new Date(),
    });

    return this.hydrateAuditLog(report);
  }

  async resolveReport(
    id: string,
    actor: string,
    notes: string,
    resolutionPhotoUrl?: string
  ): Promise<ReportItem | null> {
    this.ensureDatabaseConnected();

    const report = await ReportModel.findById(id);
    if (!report) return null;

    if (report.status === 'RESOLVED') {
      throw new ValidationError('Report is already RESOLVED.');
    }

    if (report.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot resolve report from ${report.status}. Report must be IN_PROGRESS before it can be resolved.`);
    }

    if (!notes || notes.trim().length < 3) {
      throw new ValidationError('Resolution notes are required and must be at least 3 characters long.');
    }

    const previousStatus = report.status;
    const now = new Date();
    report.status = 'RESOLVED';
    report.resolvedAt = now;
    report.resolutionNotes = notes.trim();
    if (resolutionPhotoUrl) {
      report.resolutionPhotoUrl = resolutionPhotoUrl;
    }
    await report.save();

    await ReportEventModel.create({
      reportId: report._id,
      ticketId: report.ticketId,
      action: 'REPORT_RESOLVED',
      previousStatus,
      newStatus: 'RESOLVED',
      actorId: null,
      actor,
      notes: report.resolutionNotes,
      timestamp: now,
    });

    return this.hydrateAuditLog(report);
  }

  async getSummaryStats() {
    this.ensureDatabaseConnected();

    const [total, reported, assigned, inProgress, escalated, resolved] = await Promise.all([
      ReportModel.countDocuments(),
      ReportModel.countDocuments({ status: 'REPORTED' }),
      ReportModel.countDocuments({ status: 'ASSIGNED' }),
      ReportModel.countDocuments({ status: 'IN_PROGRESS' }),
      ReportModel.countDocuments({ status: 'ESCALATED' }),
      ReportModel.countDocuments({ status: 'RESOLVED' }),
    ]);

    return {
      total,
      reported,
      assigned,
      inProgress,
      escalated,
      resolved,
    };
  }
}

export const reportService = new ReportService();
