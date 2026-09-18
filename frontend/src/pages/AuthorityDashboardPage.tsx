import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ReportItem, SummaryStats } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const AuthorityDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<SummaryStats>({
    total: 0,
    reported: 0,
    assigned: 0,
    inProgress: 0,
    escalated: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Read active prototype officer session
  const storedOfficer = localStorage.getItem('ozhuk_demo_officer');
  const currentOfficer = storedOfficer
    ? JSON.parse(storedOfficer)
    : { name: 'Insp. K. Menon', role: 'Ward 14 Lead', wardNumber: '14' };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, st] = await Promise.all([api.getReports(), api.getStats()]);
      setReports(reps);
      setStats(st);
    } catch (err) {
      console.error('Error loading dashboard data from MongoDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReports = reports.filter((rep) => {
    const matchesStatus = statusFilter === 'all' || rep.status === statusFilter;
    const matchesWard = wardFilter === 'all' || rep.ward.wardNumber === wardFilter;
    const matchesSeverity = severityFilter === 'all' || rep.severity === severityFilter;
    const matchesQuery =
      !searchQuery ||
      rep.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.ward.wardNumber.includes(searchQuery) ||
      rep.location.landmark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesWard && matchesSeverity && matchesQuery;
  });

  // Unique wards for filter
  const wards = Array.from(new Set(reports.map((r) => r.ward.wardNumber))).sort();

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-surface">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-high hidden md:flex flex-col justify-between flex-shrink-0">
        <div className="flex flex-col">
          <div className="p-space-md border-b border-surface-container flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[20px]">water_voc</span>
            </div>
            <div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Ozhuk</span>
              <p className="font-label-sm text-on-surface-variant">Authority Operations</p>
            </div>
          </div>

          <nav className="p-space-sm flex flex-col gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-space-sm px-3 py-2 rounded-lg font-label-md transition-colors text-left ${
                statusFilter === 'all'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-body-lg">dashboard</span>
              <span>All Queue ({stats.total})</span>
            </button>

            <button
              onClick={() => setStatusFilter('REPORTED')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-label-md transition-colors text-left ${
                statusFilter === 'REPORTED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-body-lg">inbox</span>
                <span>Unassigned</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm font-semibold">
                {stats.reported}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('ASSIGNED')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-label-md transition-colors text-left ${
                statusFilter === 'ASSIGNED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-body-lg">person_add</span>
                <span>Assigned</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm font-semibold">
                {stats.assigned}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-label-md transition-colors text-left ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-body-lg">engineering</span>
                <span>In Progress</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                {stats.inProgress}
              </span>
            </button>

            <Link
              to="/authority/escalated"
              className="flex items-center justify-between px-3 py-2 rounded-lg font-label-md transition-colors text-left text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-error text-body-lg">warning</span>
                <span>Escalated Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm font-semibold">
                {stats.escalated}
              </span>
            </Link>

            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-label-md transition-colors text-left ${
                statusFilter === 'RESOLVED'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-body-lg">task_alt</span>
                <span>Resolved</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm font-semibold">
                {stats.resolved}
              </span>
            </button>
          </nav>
        </div>

        {/* Active Officer Status Box */}
        <div className="p-space-md border-t border-surface-container bg-surface-container-low flex flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-label-md">
              {currentOfficer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md font-semibold text-on-surface truncate">{currentOfficer.name}</span>
              <span className="font-label-sm text-on-surface-variant text-[11px] truncate">{currentOfficer.role}</span>
            </div>
          </div>
          <Link
            to="/authority/login"
            className="text-[11px] text-primary hover:underline mt-1 self-start"
          >
            Switch Profile →
          </Link>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="w-full bg-surface-container-lowest border-b border-surface-container px-space-lg py-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-label-sm uppercase tracking-wider font-semibold">
                Ward Drainage Administration
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-semibold text-on-surface-variant">
                Prototype Mode
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold mt-0.5">
              Operations Command Center
            </h1>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={loadData}
              className="h-10 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md flex items-center gap-1.5 transition-colors"
              title="Refresh queue from MongoDB Atlas"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/report')}
              className="h-10 px-space-md rounded-lg bg-primary text-on-primary font-label-md flex items-center gap-space-xs hover:bg-primary-container shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-body-lg">add_task</span>
              <span>New Incident Report</span>
            </button>
          </div>
        </header>

        {/* 4 KPI Metric Cards */}
        <div className="p-space-lg flex flex-col gap-gutter max-w-[1440px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter-sm">
            <div
              onClick={() => setStatusFilter('REPORTED')}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Open Reports
                </span>
                <span className="p-2 rounded-lg bg-surface-container-low text-primary">
                  <span className="material-symbols-outlined">assignment_late</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-display text-display-lg text-on-surface font-bold">{stats.reported}</span>
                  <span className="font-label-md text-on-surface-variant">Pending triage</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mt-1">Awaiting field officer assignment</p>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  In Progress
                </span>
                <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined">engineering</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-display text-display-lg text-on-surface font-bold">{stats.inProgress}</span>
                  <span className="font-label-md text-secondary font-semibold">Active Work</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mt-1">Field clearing squads deployed</p>
              </div>
            </div>

            <div
              onClick={() => navigate('/authority/escalated')}
              className="bg-error-container/30 border border-error-container p-space-md rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="font-label-sm uppercase tracking-wider text-on-error-container font-semibold">
                  Escalated Reports
                </span>
                <span className="p-2 rounded-lg bg-error text-on-error">
                  <span className="material-symbols-outlined">warning</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-display text-display-lg text-on-error-container font-bold">
                    {stats.escalated}
                  </span>
                  <span className="font-label-sm px-2 py-0.5 rounded bg-error text-on-error uppercase font-semibold">
                    Critical
                  </span>
                </div>
                <p className="font-body-sm text-on-error-container font-semibold mt-1">SLA alert or priority blockage</p>
              </div>
            </div>

            <div
              onClick={() => setStatusFilter('RESOLVED')}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Resolved
                </span>
                <span className="p-2 rounded-lg bg-surface-container-low text-secondary">
                  <span className="material-symbols-outlined">verified</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-display text-display-lg text-on-surface font-bold">{stats.resolved}</span>
                  <span className="font-label-md text-secondary font-semibold">Completed</span>
                </div>
                <p className="font-body-sm text-on-surface-variant mt-1">Resolution verified in MongoDB</p>
              </div>
            </div>
          </div>

          {/* Incident Dispatch Grid */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
            <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-space-md border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Incident Dispatch Grid
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm">
                  {filteredReports.length} Records
                </span>
              </div>

              {/* Multi-facet Filters */}
              <div className="flex flex-wrap items-center gap-space-xs">
                {/* Ward Filter */}
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-surface-container focus:outline-none"
                >
                  <option value="all">All Wards</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>Ward {w}</option>
                  ))}
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm border border-surface-container focus:outline-none"
                >
                  <option value="all">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                {/* Search */}
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-body-md">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket, landmark..."
                    className="h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-sm border border-surface-container focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Filter Pills for Status */}
            <div className="px-space-md py-space-sm bg-surface-container-lowest flex items-center gap-space-xs overflow-x-auto border-b border-surface-container-low">
              {['all', 'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {st === 'all' ? `All (${reports.length})` : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Issue & Location</th>
                    <th className="py-3 px-4">Ward</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low text-on-surface">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        Loading incident records from MongoDB Atlas...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        No incident reports found matching this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className={`hover:bg-surface-container-low/60 transition-colors ${
                          report.status === 'ESCALATED' ? 'bg-error-container/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary font-mono">{report.ticketId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-on-surface">{report.category} Blockage</div>
                          <div className="text-on-surface-variant text-label-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                            {report.location.landmark}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-surface-container font-semibold text-on-surface font-label-sm">
                            Ward {report.ward.wardNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <SeverityBadge severity={report.severity} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={report.status} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-on-surface">
                            {report.assignedTo || <span className="text-outline italic">Unassigned</span>}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/authority/reports/${report.id}`)}
                            className="px-3 py-1 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-label-sm font-semibold transition-colors shadow-sm"
                          >
                            Inspect & Act →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
