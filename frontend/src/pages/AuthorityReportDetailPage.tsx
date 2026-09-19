import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReportItem, OfficerRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusTimeline } from '../components/common/StatusTimeline';

export const AuthorityReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<OfficerRecord[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [resolutionNotesInput, setResolutionNotesInput] = useState<string>('');
  const [resolutionPhotoFile, setResolutionPhotoFile] = useState<File | null>(null);
  const [escalationNotesInput, setEscalationNotesInput] = useState<string>('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active prototype officer profile from session
  const storedOfficer = localStorage.getItem('ozhuk_demo_officer');
  const currentOfficer = storedOfficer
    ? JSON.parse(storedOfficer)
    : { name: 'Insp. K. Menon', role: 'Ward 14 Lead', wardNumber: '14' };

  const fetchReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getReportById(id);
      setReport(data);
      if (data.assignedTo) {
        setSelectedOfficer(data.assignedTo);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ text: `Failed to load report: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    api.getOfficers()
      .then((res) => {
        if (res && res.length > 0) {
          setOfficers(res);
          if (!selectedOfficer) setSelectedOfficer(res[0].name);
        }
      })
      .catch(() => {});
  }, [id]);

  // 1. Assign Officer (REPORTED -> ASSIGNED or ESCALATED -> ASSIGNED)
  const handleAssign = async () => {
    if (!report) return;
    if (!selectedOfficer) {
      setMessage({ text: 'Please select an officer from the prototype list.', type: 'error' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await api.assignReport(report.id, {
        assignedTo: selectedOfficer,
        actor: `${currentOfficer.name} (${currentOfficer.role})`,
        notes: `Assigned to ${selectedOfficer} for immediate field clearing.`,
      });
      setReport(updated);
      setMessage({ text: `Successfully assigned to ${selectedOfficer}. Status is now ASSIGNED.`, type: 'success' });
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Start Field Work (ASSIGNED -> IN_PROGRESS)
  const handleStartWork = async () => {
    if (!report) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await api.updateStatus(report.id, {
        status: 'IN_PROGRESS',
        actor: `${currentOfficer.name} (${currentOfficer.role})`,
        notes: 'Field crew mobilized on site. Desilting and drainage clearance in progress.',
      });
      setReport(updated);
      setMessage({ text: 'Work started! Status transitioned to IN_PROGRESS.', type: 'success' });
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Resolve Blockage (IN_PROGRESS -> RESOLVED)
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    if (!resolutionNotesInput.trim() || resolutionNotesInput.trim().length < 3) {
      setMessage({ text: 'Resolution notes are required (minimum 3 characters).', type: 'error' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      let uploadedResolutionPhotoUrl: string | undefined = undefined;
      if (resolutionPhotoFile) {
        try {
          const uploadRes = await api.uploadPhoto(resolutionPhotoFile);
          uploadedResolutionPhotoUrl = uploadRes.url;
        } catch (uploadErr: unknown) {
          const uErr = uploadErr as Error;
          setMessage({ text: `Failed to upload resolution proof: ${uErr.message}`, type: 'error' });
          setActionLoading(false);
          return;
        }
      }

      const updated = await api.resolveReport(
        report.id,
        `${currentOfficer.name} (${currentOfficer.role})`,
        resolutionNotesInput.trim(),
        uploadedResolutionPhotoUrl
      );
      setReport(updated);
      setShowResolveModal(false);
      setResolutionNotesInput('');
      setResolutionPhotoFile(null);
      setMessage({ text: 'Report successfully RESOLVED with recorded clearance notes.', type: 'success' });
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Escalate Ticket (REPORTED / ASSIGNED / IN_PROGRESS -> ESCALATED)
  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    const notes = escalationNotesInput.trim() || 'Urgent escalation: Severe waterlogging or SLA threshold requires supervisory action.';

    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await api.escalateReport(
        report.id,
        `${currentOfficer.name} (${currentOfficer.role})`,
        notes
      );
      setReport(updated);
      setShowEscalateModal(false);
      setEscalationNotesInput('');
      setMessage({ text: 'Ticket escalated to supervisory queue with recorded reason.', type: 'success' });
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-margin py-space-xl text-center">
        <p className="text-on-surface-variant font-label-md">Loading incident details from MongoDB Atlas...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-[640px] mx-auto px-margin py-space-xl text-center">
        <h2 className="font-headline-sm text-primary font-bold">Report Not Found</h2>
        <Link to="/authority" className="mt-2 inline-block text-secondary font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isResolved = report.status === 'RESOLVED';
  const isEscalated = report.status === 'ESCALATED';
  const canAssign = report.status === 'REPORTED' || report.status === 'ESCALATED';
  const canStartWork = report.status === 'ASSIGNED';
  const canResolve = report.status === 'IN_PROGRESS';
  const canEscalate = !isResolved && !isEscalated;

  // Photo presentation: never show Stitch mock images as citizen evidence
  const isEvidencePending = !report.photoUrl || report.photoUrl.startsWith('pending_upload:');

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin-desktop py-space-md flex flex-col gap-space-lg">
      {/* Prototype Authority Notification Bar */}
      <div className="p-2.5 px-3 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between text-body-sm text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">admin_panel_settings</span>
          <span>
            <span className="font-semibold text-primary">Prototype Authority Terminal: </span>
            Operating as {currentOfficer.name} ({currentOfficer.role})
          </span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container font-mono text-outline">
          Ward {report.ward.wardNumber}
        </span>
      </div>

      {/* Breadcrumb & Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
        <div className="flex items-center gap-space-xs font-label-md text-label-md">
          <Link
            to="/authority"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface-variant">Ward {report.ward.wardNumber}</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-bold">{report.ticketId}</span>
        </div>

        <div className="flex items-center gap-space-sm">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      {message && (
        <div
          className={`p-space-sm rounded-lg font-label-md font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-[14px] ml-2">✕</button>
        </div>
      )}

      {/* 50/50 Investigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg items-start">
        {/* LEFT COLUMN: Citizen Field Evidence & Incident Details */}
        <div className="flex flex-col gap-space-md min-w-0">
          {/* Photographic Evidence Card */}
          <div className="rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col">
            <div className="relative w-full h-80 bg-surface-container overflow-hidden flex flex-col items-center justify-center">
              {isEvidencePending ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant p-space-md text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">image</span>
                  </div>
                  <div className="font-label-md font-semibold text-on-surface">
                    {report.photoFileName || 'Evidence Staged on Client Device'}
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded bg-surface-container-high text-on-surface-variant">
                    Cloud Object Storage Pending (Demo Phase)
                  </span>
                </div>
              ) : (
                <img
                  src={report.photoUrl}
                  alt="Blockage evidence"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-primary/90 text-on-primary font-label-sm backdrop-blur flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                <span>Citizen Evidence Photo</span>
              </div>
              {report.photoFileName && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-mono text-[11px] text-primary">
                  {report.photoFileName}
                </div>
              )}
            </div>

            {/* Resident Observation Quote */}
            <div className="p-space-md bg-surface-container-lowest border-t border-surface-container">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
                Citizen Observation
              </span>
              <p className="font-body-md text-on-surface italic bg-surface-container-low/60 p-3 rounded-lg border border-surface-container-low">
                "{report.description}"
              </p>
            </div>

            {/* Resolution Proof Card if Resolved */}
            {isResolved && (
              <div className="p-space-md bg-secondary-container/20 border-t border-secondary-container">
                <span className="font-label-sm uppercase tracking-wider text-secondary font-bold block mb-1">
                  Verified Resolution Proof
                </span>
                {report.resolutionPhotoUrl && !report.resolutionPhotoUrl.startsWith('pending_upload:') ? (
                  <div className="h-48 rounded-lg overflow-hidden border border-secondary-container mb-2">
                    <img
                      src={report.resolutionPhotoUrl}
                      alt="Resolved clean drain"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded bg-secondary-container/30 text-on-secondary-container font-label-sm mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Site verified clear & hydro-flushed</span>
                  </div>
                )}
                {report.resolutionNotes && (
                  <div className="text-body-sm text-on-surface">
                    <span className="font-semibold text-secondary">Resolution Notes: </span>
                    <span>{report.resolutionNotes}</span>
                  </div>
                )}
                {report.resolvedAt && (
                  <div className="text-body-sm text-on-surface-variant mt-1 text-[12px]">
                    Resolved on {new Date(report.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location & Metadata Card */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container flex flex-col gap-space-md">
            <div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">Incident Location</span>
              <p className="font-label-sm text-on-surface-variant">
                Jurisdiction: Ward {report.ward.wardNumber} ({report.ward.wardName})
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-on-surface-variant uppercase">Reported At</span>
                <span className="font-label-md font-semibold text-primary mt-0.5">
                  {new Date(report.reportedAt).toLocaleDateString()} {new Date(report.reportedAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-on-surface-variant uppercase">Category</span>
                <span className="font-label-md font-semibold text-primary mt-0.5">
                  {report.category}
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col">
                <span className="font-label-sm text-on-surface-variant uppercase">Severity</span>
                <span className="font-label-md font-semibold text-error mt-0.5">
                  {report.severity}
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col md:col-span-3">
                <span className="font-label-sm text-on-surface-variant uppercase">Landmark / Coordinates</span>
                <span className="font-label-md font-semibold text-primary mt-0.5">
                  {report.location.landmark} ({report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket Info, Actions, and Timeline */}
        <div className="flex flex-col gap-space-md min-w-0">
          {/* Status Timeline */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container flex flex-col gap-space-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                  Ticket #{report.ticketId}
                </h2>
                <p className="font-body-md text-on-surface-variant font-medium">
                  {report.category} Blockage • Ward {report.ward.wardNumber}
                </p>
              </div>
              <StatusBadge status={report.status} size="md" />
            </div>

            <div className="mt-space-sm pt-space-sm border-t border-surface-container-low">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-sm block">
                Status Lifecycle Timeline (MongoDB Atlas)
              </span>
              <StatusTimeline report={report} />
            </div>
          </div>

          {/* Officer Operational Workflow Controls */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
                Operational Workflow Controls
              </span>
              <span className="font-label-sm text-on-surface-variant">
                Current: <strong className="text-primary">{report.status}</strong>
              </span>
            </div>

            {/* Terminal State Alert */}
            {isResolved && (
              <div className="p-3 rounded-lg bg-secondary-container/50 border border-secondary-container text-on-secondary-container font-label-md flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <span>This ticket has reached final resolution. Status transitions from RESOLVED are terminal.</span>
              </div>
            )}

            {!isResolved && (
              <div className="flex flex-col gap-space-md">
                {/* 1. Assignment Action */}
                <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">person_pin</span>
                      Officer Assignment
                    </span>
                    {report.assignedTo && (
                      <span className="text-[12px] font-mono font-semibold text-secondary">
                        Assigned to {report.assignedTo}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedOfficer}
                      disabled={!canAssign || actionLoading}
                      onChange={(e) => setSelectedOfficer(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-surface-container focus:outline-none disabled:opacity-50"
                    >
                      {officers.map((off) => (
                        <option key={off.id} value={off.name}>
                          {off.name} ({off.role} - Ward {off.wardNumber})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!canAssign || actionLoading}
                      className="h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                      <span>{report.assignedTo ? 'Reassign' : 'Assign Officer'}</span>
                    </button>
                  </div>
                  {!canAssign && (
                    <span className="text-[11px] text-outline">
                      Assignment only allowed when status is REPORTED or ESCALATED.
                    </span>
                  )}
                </div>

                {/* 2. Action Flow: Start Work, Resolve, Escalate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Start Work */}
                  <button
                    onClick={handleStartWork}
                    disabled={!canStartWork || actionLoading}
                    className="h-11 rounded-lg bg-secondary text-on-secondary font-label-md font-semibold hover:bg-on-secondary-container transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
                    title={canStartWork ? 'Start field desilting work' : 'Requires status ASSIGNED'}
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>Start Work</span>
                  </button>

                  {/* Resolve Report */}
                  <button
                    onClick={() => setShowResolveModal(true)}
                    disabled={!canResolve || actionLoading}
                    className="h-11 rounded-lg bg-secondary-container text-on-secondary-container font-label-md font-semibold hover:bg-secondary-container/80 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
                    title={canResolve ? 'Record clearance notes and mark resolved' : 'Requires status IN_PROGRESS'}
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Resolve</span>
                  </button>

                  {/* Escalate */}
                  <button
                    onClick={() => setShowEscalateModal(true)}
                    disabled={!canEscalate || actionLoading}
                    className="h-11 rounded-lg bg-error-container text-on-error-container font-label-md font-semibold hover:bg-error hover:text-on-error transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm"
                    title={canEscalate ? 'Escalate for supervisor review' : 'Already escalated or resolved'}
                  >
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>Escalate</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audit History Timeline List */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container flex flex-col gap-space-sm">
            <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              Historical Audit Events ({report.auditLog.length})
            </span>
            <div className="flex flex-col gap-space-xs max-h-64 overflow-y-auto pr-1">
              {report.auditLog.map((log, idx) => (
                <div key={idx} className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md font-semibold text-primary">{log.actor}</span>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-semibold">
                      {log.action}
                    </span>
                    {log.previousStatus && log.newStatus && (
                      <span className="text-[11px] text-outline">
                        {log.previousStatus} → {log.newStatus}
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="font-body-sm text-on-surface mt-0.5 text-[12px]">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">task_alt</span>
                Resolve Blockage Incident
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="text-on-surface-variant">✕</button>
            </div>

            <form onSubmit={handleResolveSubmit} className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
                  Resolution Notes <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={3}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="Describe field clearance work (e.g. Silt removed with backhoe, grates flushed and restored flow)..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none"
                />
                <span className="text-[11px] text-outline">Minimum 3 characters. Persisted to MongoDB Atlas.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
                  Clearance Proof Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResolutionPhotoFile(e.target.files[0]);
                    } else {
                      setResolutionPhotoFile(null);
                    }
                  }}
                  className="p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm border border-surface-container file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-label-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
                />
                <span className="text-[11px] text-outline">
                  {resolutionPhotoFile
                    ? `Selected: ${resolutionPhotoFile.name} (${(resolutionPhotoFile.size / 1024).toFixed(1)} KB)`
                    : 'Attach post-clearance photo to stream directly to MongoDB Atlas GridFS'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-space-xs border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || resolutionNotesInput.trim().length < 3}
                  className="px-5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md font-semibold hover:bg-on-secondary-container disabled:opacity-50"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-error font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Escalate Incident Ticket
              </h3>
              <button onClick={() => setShowEscalateModal(false)} className="text-on-surface-variant">✕</button>
            </div>

            <form onSubmit={handleEscalateSubmit} className="flex flex-col gap-space-sm">
              <p className="text-body-sm text-on-surface-variant">
                Escalating flags this incident as critical, triggers the SLA breach indicator, and routes it to the supervisory command queue.
              </p>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
                  Escalation Reason / Notes
                </label>
                <textarea
                  rows={3}
                  value={escalationNotesInput}
                  onChange={(e) => setEscalationNotesInput(e.target.value)}
                  placeholder="Reason for escalation (e.g. Backflow flooding roadway; requires heavy pump deployment)..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-space-xs border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-error text-on-error font-label-md font-semibold hover:bg-on-error-container disabled:opacity-50"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
