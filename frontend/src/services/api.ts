import { ReportItem, PublicReportItem, CreateReportDTO, UpdateReportStatusDTO, AssignReportDTO, WardRecord, OfficerRecord, SummaryStats, UploadPhotoResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  async getReports(params?: { ward?: string; status?: string; severity?: string }): Promise<ReportItem[]> {
    const query = new URLSearchParams();
    if (params?.ward) query.append('ward', params.ward);
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);

    const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    const json = await res.json();
    return json.data;
  },

  async getPublicReports(params?: { ward?: string; status?: string; severity?: string }): Promise<PublicReportItem[]> {
    const query = new URLSearchParams();
    if (params?.ward) query.append('ward', params.ward);
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);

    const res = await fetch(`${API_BASE}/reports/public?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch public reports');
    const json = await res.json();
    return json.data;
  },

  async getStats(): Promise<SummaryStats> {
    const res = await fetch(`${API_BASE}/reports/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    const json = await res.json();
    return json.data;
  },

  async getReportById(id: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    const json = await res.json();
    return json.data;
  },

  async getReportByTicketId(ticketId: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/ticket/${encodeURIComponent(ticketId)}`);
    if (!res.ok) throw new Error('Ticket not found');
    const json = await res.json();
    return json.data;
  },

  // Prepared for JSON payload or FormData (multipart upload)
  async createReport(payload: CreateReportDTO | FormData): Promise<ReportItem> {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit report' }));
      throw new Error(err.error || 'Failed to submit report');
    }
    const json = await res.json();
    return json.data;
  },

  async assignReport(id: string, dto: AssignReportDTO): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to assign report' }));
      throw new Error(err.message || err.error || 'Failed to assign report');
    }
    const json = await res.json();
    return json.data;
  },

  async updateStatus(id: string, dto: UpdateReportStatusDTO): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update status' }));
      throw new Error(err.message || err.error || 'Failed to update status');
    }
    const json = await res.json();
    return json.data;
  },

  async escalateReport(id: string, actor: string, notes?: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/${id}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to escalate report' }));
      throw new Error(err.message || err.error || 'Failed to escalate report');
    }
    const json = await res.json();
    return json.data;
  },

  async resolveReport(id: string, actor: string, notes: string, resolutionPhotoUrl?: string): Promise<ReportItem> {
    const res = await fetch(`${API_BASE}/reports/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor, notes, resolutionPhotoUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to resolve report' }));
      throw new Error(err.message || err.error || 'Failed to resolve report');
    }
    const json = await res.json();
    return json.data;
  },

  async getWards(): Promise<WardRecord[]> {
    const res = await fetch(`${API_BASE}/wards`);
    if (!res.ok) throw new Error('Failed to fetch wards');
    const json = await res.json();
    return json.data;
  },

  async getOfficers(): Promise<OfficerRecord[]> {
    const res = await fetch(`${API_BASE}/wards/officers`);
    if (!res.ok) throw new Error('Failed to fetch officers');
    const json = await res.json();
    return json.data;
  },

  async uploadPhoto(file: File): Promise<UploadPhotoResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header so browser computes multipart boundary
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to upload photo' }));
      throw new Error(err.message || err.error || 'Failed to upload photo');
    }

    return await res.json();
  },
};
