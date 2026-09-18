import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReportItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { StatusTimeline } from '../components/common/StatusTimeline';

export const TicketTrackDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);

    const cleanTicketId = ticketId.trim();
    api.getReportByTicketId(cleanTicketId)
      .then((data) => {
        setReport(data);
      })
      .catch((err) => {
        setError(err.message || `No incident record found matching "${cleanTicketId}".`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticketId]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-[1024px] mx-auto px-margin py-space-xl flex flex-col items-center justify-center min-h-[400px] gap-space-sm">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-on-surface-variant font-label-md">Fetching ticket status from registry...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-[640px] mx-auto px-margin py-space-xl">
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container text-center flex flex-col items-center gap-space-sm">
          <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <h2 className="font-headline-sm text-primary font-bold">Ticket Not Found</h2>
          <p className="font-body-md text-on-surface-variant">
            {error || `No active blockage report found matching reference "${ticketId}".`}
          </p>
          <div className="flex gap-2 mt-2">
            <Link
              to="/track"
              className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              Search Another Ticket
            </Link>
            <Link
              to="/report"
              className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-colors"
            >
              File New Report
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayPhotoUrl = report.photoUrl;

  return (
    <div className="max-w-[1024px] mx-auto px-margin md:px-gutter py-space-xl flex flex-col gap-space-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
        <div className="flex items-center gap-space-xs font-label-md">
          <Link
            to="/track"
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Ticket Lookup
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary font-bold">#{report.ticketId}</span>
        </div>

        <div className="flex items-center gap-space-sm">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm font-semibold transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Photos & Incident Details */}
        <div className="lg:col-span-6 flex flex-col gap-space-md">
          {/* Photographic Evidence Card */}
          <div className="rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col">
            <div className="relative h-64 bg-surface-container overflow-hidden">
              {displayPhotoUrl && !displayPhotoUrl.startsWith('pending_upload:') ? (
                <img
                  src={displayPhotoUrl}
                  alt="Reported blockage evidence"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant p-space-md text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">image</span>
                  </div>
                  <div className="font-label-md font-semibold text-on-surface">
                    {report.photoFileName || 'No Photo Evidence Provided'}
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                    {displayPhotoUrl?.startsWith('pending_upload:') ? 'Cloud Storage Staged' : 'No Image Attached'}
                  </span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-primary/90 text-on-primary font-label-sm backdrop-blur flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                <span>Citizen Evidence Photo</span>
              </div>
              {report.photoFileName && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-mono text-[11px] text-primary">
                  {report.photoFileName}
                </div>
              )}
            </div>
          </div>

          {/* Resolution Photo if Resolved */}
          {report.resolutionPhotoUrl && (
            <div className="rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm border border-secondary-container p-space-md">
              <span className="font-label-sm uppercase tracking-wider text-secondary font-bold block mb-2">
                Clearance Verification Proof
              </span>
              <div className="h-56 rounded-lg overflow-hidden border border-secondary-container">
                <img src={report.resolutionPhotoUrl} alt="Resolved drainage" className="w-full h-full object-cover" />
              </div>
              {report.resolutionNotes && (
                <p className="font-body-sm text-on-surface-variant mt-2">{report.resolutionNotes}</p>
              )}
            </div>
          )}

          {/* Detailed Metadata Breakdown */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container flex flex-col gap-2 text-body-sm">
            <span className="font-label-sm text-secondary uppercase font-bold tracking-wider">
              Incident Metadata
            </span>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Ticket Reference:</span>
              <span className="font-mono font-bold text-primary">#{report.ticketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Jurisdiction:</span>
              <span className="font-semibold text-on-surface">
                Ward {report.ward.wardNumber} ({report.ward.wardName})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Drainage Type:</span>
              <span className="font-semibold text-on-surface">{report.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Severity Level:</span>
              <span className="font-semibold text-on-surface">{report.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Location Landmark:</span>
              <span className="font-semibold text-on-surface">{report.location.landmark}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Coordinates:</span>
              <span className="font-mono text-on-surface text-[12px]">
                {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Submitted Date:</span>
              <span className="font-mono text-on-surface">
                {new Date(report.reportedAt).toLocaleString()}
              </span>
            </div>
            <div className="mt-1 pt-2 border-t border-surface-container-low">
              <span className="font-label-sm font-semibold text-on-surface block mb-1">
                Citizen Observation:
              </span>
              <p className="text-on-surface-variant italic bg-surface-container-low p-2 rounded">
                "{report.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Progress Timeline */}
        <div className="lg:col-span-6 flex flex-col gap-space-md">
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container">
            <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-space-md flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[22px]">timeline</span>
              Live Status Progress
            </h3>
            <StatusTimeline report={report} />
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-xs text-on-surface-variant font-body-sm">
            <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
            <span>Status updates reflect official recorded field maintenance actions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
