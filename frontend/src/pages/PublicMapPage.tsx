import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PublicReportItem, WardRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const PublicMapPage: React.FC = () => {
  const [reports, setReports] = useState<PublicReportItem[]>([]);
  const [wards, setWards] = useState<WardRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<PublicReportItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [reportsData, wardsData] = await Promise.all([
        api.getPublicReports(),
        api.getWards(),
      ]);
      setReports(reportsData);
      setWards(wardsData);
      if (reportsData.length > 0) {
        setSelectedReport(reportsData[0]);
      }
    } catch (err) {
      console.error('Failed to load public map reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
      const matchesWard = selectedWard === 'all' || rep.ward.wardNumber === selectedWard;
      const matchesSeverity = severityFilter === 'all' || rep.severity === severityFilter;
      const matchesSearch =
        !ticketSearch.trim() ||
        rep.ticketId.toLowerCase().includes(ticketSearch.trim().toLowerCase()) ||
        rep.location.landmark?.toLowerCase().includes(ticketSearch.trim().toLowerCase()) ||
        rep.description.toLowerCase().includes(ticketSearch.trim().toLowerCase());
      return matchesStatus && matchesWard && matchesSeverity && matchesSearch;
    });
  }, [reports, statusFilter, selectedWard, severityFilter, ticketSearch]);

  // Coordinate bounding box & normalization for SVG canvas
  // Validates coordinates safely (ignores missing/NaN)
  const validReportsWithCoords = useMemo(() => {
    return filteredReports.filter(
      (r) =>
        typeof r.location?.latitude === 'number' &&
        typeof r.location?.longitude === 'number' &&
        !isNaN(r.location.latitude) &&
        !isNaN(r.location.longitude)
    );
  }, [filteredReports]);

  // Compute dynamic min/max with fallback to Kochi drainage basin [76.25 - 76.35, 9.94 - 10.04]
  const bounds = useMemo(() => {
    if (validReportsWithCoords.length === 0) {
      return { minLng: 76.25, maxLng: 76.35, minLat: 9.94, maxLat: 10.04 };
    }
    const lngs = validReportsWithCoords.map((r) => r.location.longitude);
    const lats = validReportsWithCoords.map((r) => r.location.latitude);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Padding
    const dLng = Math.max(maxLng - minLng, 0.04);
    const dLat = Math.max(maxLat - minLat, 0.04);

    return {
      minLng: minLng - dLng * 0.15,
      maxLng: maxLng + dLng * 0.15,
      minLat: minLat - dLat * 0.15,
      maxLat: maxLat + dLat * 0.15,
    };
  }, [validReportsWithCoords]);

  // Project geographic coordinate to canvas percentage
  const getMarkerPosition = (lng: number, lat: number) => {
    const xPct = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // Invert Y because latitude increases northward while CSS top increases downward
    const yPct = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    // Constrain within safe padding [8%, 92%]
    const safeX = Math.max(8, Math.min(92, xPct));
    const safeY = Math.max(8, Math.min(92, yPct));
    return { left: `${safeX.toFixed(2)}%`, top: `${safeY.toFixed(2)}%` };
  };

  // Open Report Count Summary
  const statsSummary = useMemo(() => {
    const totalVisible = filteredReports.length;
    const openCount = filteredReports.filter((r) => r.status !== 'RESOLVED').length;
    const escalatedCount = filteredReports.filter((r) => r.status === 'ESCALATED').length;
    const resolvedCount = filteredReports.filter((r) => r.status === 'RESOLVED').length;
    return { totalVisible, openCount, escalatedCount, resolvedCount };
  }, [filteredReports]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
      {/* Top Filter and Ward Bar */}
      <div className="w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-sm border-b border-surface-container">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-sm">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-space-xs overflow-x-auto py-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>All Reports</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface font-label-sm">
                {reports.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('REPORTED')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'REPORTED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-outline"></span>
              <span>Reported</span>
            </button>

            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
              <span>Assigned</span>
            </button>

            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>In Progress</span>
            </button>

            <button
              onClick={() => setStatusFilter('ESCALATED')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'ESCALATED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span>Escalated</span>
            </button>

            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`inline-flex items-center gap-space-xs px-space-md py-1 rounded-full font-label-md text-label-md transition-all ${
                statusFilter === 'RESOLVED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Resolved</span>
            </button>
          </div>

          {/* Ward Selector, Severity, and Search */}
          <div className="flex items-center gap-space-sm flex-wrap">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-surface-container-lowest text-on-surface font-label-md px-space-md py-1.5 rounded-lg border border-surface-container shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.wardNumber} value={w.wardNumber}>
                  Ward {w.wardNumber} — {w.wardName}
                </option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-surface-container-lowest text-on-surface font-label-md px-space-md py-1.5 rounded-lg border border-surface-container shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search ticket or landmark..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-surface-container focus:outline-none"
              />
              <span className="material-symbols-outlined absolute right-2 text-on-surface-variant text-[18px]">
                search
              </span>
            </div>

            <button
              onClick={loadMapData}
              className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md flex items-center gap-1 transition-colors"
              title="Refresh Map Data"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Map Summary Bar (Open vs Resolved Breakdown) */}
      <div className="w-full bg-surface-container-lowest border-b border-surface-container px-margin md:px-margin-desktop py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-sm text-body-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-on-surface-variant font-label-md uppercase font-semibold">
              Open-Report Transparency Map:
            </span>
            <span className="font-semibold text-primary">
              {statsSummary.totalVisible} Total Visible
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-semibold text-secondary">
              {statsSummary.openCount} Open Incidents
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-semibold text-error">
              {statsSummary.escalatedCount} Escalated
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-semibold text-on-surface-variant">
              {statsSummary.resolvedCount} Resolved
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span>Civic Transparency Mode • Anonymized Community Data</span>
          </div>
        </div>
      </div>

      {/* Main Map & Incident Stream Grid */}
      <div className="max-w-[1440px] w-full mx-auto px-margin md:px-margin-desktop py-space-md flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Interactive Map Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="relative w-full h-[580px] rounded-xl overflow-hidden shadow-md bg-surface-container-lowest border border-surface-container">
              {/* Cartographic Texture Background */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, #f0f3ff 0%, #d8e3fb 100%)',
                }}
              />

              {/* Waterway Canal Grid Overlay (Preserved from Stitch design) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" preserveAspectRatio="none" viewBox="0 0 1000 660">
                <defs>
                  <linearGradient id="canalGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2A9D8F" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0A3641" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path d="M 40,20 C 140,90 190,160 210,270 C 230,370 290,430 350,520 C 400,590 420,620 460,660" fill="none" stroke="url(#canalGrad)" strokeLinecap="round" strokeWidth="8" />
                <path d="M 210,270 C 320,290 430,260 520,310 C 600,360 670,410 740,430 C 840,460 930,420 990,400" fill="none" stroke="url(#canalGrad)" strokeDasharray="6 4" strokeLinecap="round" strokeWidth="6" />
                <path d="M 520,310 C 540,210 590,140 680,100 C 740,70 820,50 920,30" fill="none" stroke="url(#canalGrad)" strokeLinecap="round" strokeWidth="4" />
                <path d="M 350,520 C 440,500 560,540 620,580 C 700,640 760,650 820,660" fill="none" stroke="url(#canalGrad)" strokeLinecap="round" strokeWidth="4" />
              </svg>

              {/* Map Title Card */}
              <div className="absolute top-space-md left-space-md z-20">
                <div className="bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-lg shadow-sm border border-surface-container max-w-xs">
                  <div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">map</span>
                    <span className="font-bold">Public Waterway Map</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Live civic reporting across municipal canal and storm drainage channels.
                  </p>
                </div>
              </div>

              {/* Empty State when no reports match */}
              {validReportsWithCoords.length === 0 && !loading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm p-4 text-center">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2">
                    travel_explore
                  </span>
                  <h3 className="font-headline-sm text-primary font-bold">No Public Reports Available</h3>
                  <p className="text-body-sm text-on-surface-variant max-w-xs mt-1">
                    No active drainage blockage reports match the current filter selection.
                  </p>
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSelectedWard('all');
                      setSeverityFilter('all');
                      setTicketSearch('');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Dynamic Map Pins positioned via real MongoDB Atlas GeoCoordinates */}
              {validReportsWithCoords.map((report) => {
                const pos = getMarkerPosition(report.location.longitude, report.location.latitude);
                const isSelected = selectedReport?.ticketId === report.ticketId;

                return (
                  <div
                    key={report.ticketId}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedReport(report)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                    title={`Ticket #${report.ticketId} (${report.status})`}
                  >
                    <div className="relative flex items-center justify-center">
                      {report.status === 'ESCALATED' && (
                        <span className="absolute w-9 h-9 rounded-full bg-error/30 animate-ping" />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                          report.status === 'ESCALATED'
                            ? 'bg-error text-on-error'
                            : report.status === 'RESOLVED'
                            ? 'bg-secondary text-on-secondary'
                            : report.status === 'IN_PROGRESS'
                            ? 'bg-primary text-on-primary ring-2 ring-secondary-container'
                            : report.status === 'ASSIGNED'
                            ? 'bg-secondary-container text-on-secondary-container ring-1 ring-primary'
                            : 'bg-primary-container text-on-primary'
                        } ${isSelected ? 'ring-4 ring-tertiary-fixed scale-115' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {report.status === 'ESCALATED'
                            ? 'priority_high'
                            : report.status === 'RESOLVED'
                            ? 'check'
                            : report.status === 'IN_PROGRESS'
                            ? 'engineering'
                            : report.status === 'ASSIGNED'
                            ? 'person_pin'
                            : 'location_on'}
                        </span>
                      </div>
                    </div>
                    {/* Hover Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap bg-primary text-on-primary text-[11px] px-2 py-0.5 rounded font-mono shadow-md z-40">
                      #{report.ticketId} • Ward {report.ward.wardNumber} ({report.status})
                    </div>
                  </div>
                );
              })}

              {/* Map Footer Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-space-xs flex flex-wrap items-center justify-between text-on-surface-variant font-label-sm text-label-sm z-20 border-t border-surface-container">
                <div className="flex items-center gap-space-md">
                  <span className="font-semibold text-primary">Civic Privacy Protected</span>
                  <span className="text-outline-variant">•</span>
                  <span>Personal reporter credentials kept strictly confidential</span>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-space-xs">
                Incident Map Legend
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-sm">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <div className="w-3 h-3 rounded-full bg-primary-container" />
                  <span className="font-label-sm">Reported</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <div className="w-3 h-3 rounded-full bg-secondary-container" />
                  <span className="font-label-sm">Assigned</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-label-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-error-container/50">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <span className="font-label-sm text-error font-semibold">Escalated</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary-container/50">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="font-label-sm text-secondary font-semibold">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Ticket Inspection Card & Feed */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            {selectedReport ? (
              <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-md flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm tracking-wider uppercase font-semibold">
                    Selected Incident
                  </span>
                  <span className="text-on-surface-variant font-mono text-label-sm">
                    Ward {selectedReport.ward.wardNumber} ({selectedReport.ward.wardName})
                  </span>
                </div>

                <div className="flex items-start justify-between gap-space-sm">
                  <div>
                    <h2 className="font-headline-md text-headline-md font-bold text-primary font-mono">
                      #{selectedReport.ticketId}
                    </h2>
                    <p className="font-body-md text-on-surface font-semibold">
                      {selectedReport.category} Blockage
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={selectedReport.status} size="sm" />
                    <SeverityBadge severity={selectedReport.severity} />
                  </div>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1 text-body-sm">
                  <div className="flex items-center gap-1 text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                    <span>{selectedReport.location.landmark}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant text-[11px] font-mono">
                    <span>{selectedReport.location.latitude.toFixed(4)}, {selectedReport.location.longitude.toFixed(4)}</span>
                    <span>Reported: {new Date(selectedReport.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Public Incident Transparency Notice */}
                <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5 text-body-sm">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified_user</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm font-semibold text-on-surface">Privacy-Safe Civic Record</span>
                    <span className="text-[12px] text-on-surface-variant leading-relaxed">
                      Incident coordinates and status are public for community awareness. Personal citizen evidence and identity remain protected.
                    </span>
                  </div>
                </div>

                {/* Observation */}
                <div className="p-2.5 rounded-lg bg-surface-container-low text-body-sm">
                  <span className="font-semibold text-on-surface text-[12px] block mb-0.5">Observation:</span>
                  <p className="italic text-on-surface-variant">"{selectedReport.description}"</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-surface-container-low">
                  <Link
                    to={`/track/${selectedReport.ticketId}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">track_changes</span>
                    <span>View Ticket</span>
                  </Link>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                    <span>{copied ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-surface-container-lowest text-center text-on-surface-variant">
                Select an incident marker on the map to inspect details.
              </div>
            )}

            {/* Live Verified Incident List */}
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-low">
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">stream</span>
                  <span>Filtered Incidents ({filteredReports.length})</span>
                </div>
                <span className="text-label-sm text-secondary font-semibold">Open-Report</span>
              </div>

              <div className="flex flex-col gap-space-xs max-h-[260px] overflow-y-auto">
                {filteredReports.map((rep) => (
                  <div
                    key={rep.ticketId}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-space-sm rounded-lg transition-colors cursor-pointer flex flex-col gap-1 border ${
                      selectedReport?.ticketId === rep.ticketId
                        ? 'bg-surface-container-high border-primary/20'
                        : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-primary text-label-sm">
                        #{rep.ticketId}
                      </span>
                      <StatusBadge status={rep.status} size="sm" />
                    </div>
                    <p className="font-body-sm text-on-surface truncate">{rep.location.landmark}</p>
                    <div className="flex justify-between text-label-sm text-on-surface-variant text-[11px]">
                      <span>Ward {rep.ward.wardNumber} ({rep.category})</span>
                      <span>{new Date(rep.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
