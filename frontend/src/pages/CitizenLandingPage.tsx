import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ReportItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const CitizenLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [ticketInput, setTicketInput] = useState('');
  const [searchResult, setSearchResult] = useState<ReportItem | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const handleTicketLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const found = await api.getReportByTicketId(ticketInput.trim());
      setSearchResult(found);
    } catch {
      setSearchError(`No active ticket found matching "${ticketInput.trim()}". Please check your 8-digit ticket reference.`);
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-xl md:py-margin-desktop overflow-hidden border-b border-surface-container">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="inline-flex items-center gap-space-xs self-start px-space-md py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
              Civic Canal & Stormwater Drainage Platform
            </div>

            <div className="flex flex-col gap-space-sm">
              <h1 className="font-display text-display-lg text-primary tracking-tight font-bold">
                Keep your neighbourhood flowing.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Report clogged storm drains, canals, and culverts with a quick photo. Our spatial routing identifies your municipal ward and alerts local authority response teams.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-md">
              <button
                onClick={() => navigate('/report')}
                className="inline-flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all group"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                  photo_camera
                </span>
                Report a Blockage
              </button>
              <button
                onClick={() => navigate('/track')}
                className="inline-flex items-center justify-center gap-space-sm px-space-lg py-space-md rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">track_changes</span>
                Track a Report
              </button>
            </div>

            {/* Direct Ticket Status Check Box */}
            <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs max-w-xl border border-surface-container" id="track-widget">
              <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between" htmlFor="ticket-input">
                <span className="font-semibold">Direct Ticket Status Check</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">e.g. OZH-260916-001</span>
              </label>

              <form className="flex gap-space-xs" onSubmit={handleTicketLookup}>
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    id="ticket-input"
                    className="w-full pl-10 pr-3 py-2 text-on-surface bg-surface-container-low rounded-lg font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest border border-surface-container"
                    placeholder="Enter Ticket ID (e.g. OZH-260916-001)..."
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-space-md py-2 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md flex items-center gap-1 hover:bg-on-secondary-container transition-colors disabled:opacity-50"
                >
                  {searching ? 'Checking...' : 'Verify'}
                </button>
              </form>

              {searchError && (
                <div className="mt-2 p-space-sm rounded-lg bg-error-container/40 text-on-error-container text-body-sm">
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div
                  onClick={() => navigate(`/track/${searchResult.ticketId}`)}
                  className="mt-space-xs p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <div>
                      <div className="font-label-md text-label-md text-primary font-semibold">
                        Ticket #{searchResult.ticketId} (Ward {searchResult.ward.wardNumber})
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-sm">
                        {searchResult.description}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={searchResult.status} size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Feed Card */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">dynamic_feed</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">Recent Citizen Reports</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  Live
                </span>
              </div>

              <div className="flex flex-col gap-space-sm">
                <div
                  onClick={() => navigate('/map')}
                  className="p-space-sm rounded-lg bg-surface-container-low flex gap-space-sm items-center cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <img
                    className="w-20 h-16 rounded-lg object-cover shadow-sm shrink-0"
                    alt="Blocked culvert"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF5HknzmwPu0HiDkUfsKk0keUNW_PxZkYjvkJjlUy3mZY86fVwzMJX8dI2wtKNXoOTOKOVsXXufyS1HSQPQof3lgkRb3uPcd5cQSd3tU8J1dg7A34XUdszJw1to9cO6A3M4PWKoqSg5NtaW60guZdsGluFesP5aHSTQ32IJhkoJYGxQjBAq6Hk3rJIy7RQ5-xRBA-ETwjwzSaWVBPXui6eaDFUbMMp-hahqkAAU75zbrsPx6SQkUI1OA"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-primary">Ward 14 • Culvert</span>
                      <StatusBadge status="REPORTED" size="sm" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Runoff debris choking intake channel
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">Logged 12 mins ago</span>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/map')}
                  className="p-space-sm rounded-lg bg-surface-container-low flex gap-space-sm items-center cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <img
                    className="w-20 h-16 rounded-lg object-cover shadow-sm shrink-0"
                    alt="Clearing storm drain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmE6uzfa2iABqoGZ4ZFDwlsfd4enFDV0980HCqMoHoPnlmEnbZhm1yny0111R_UojNvI2L7xYZNQmOO3gJe_0VjuRohhwSinGmK4jOTJBWAkXj0XklZ-xtXe1ABk02uLRx4xx0r26tPDYH_t-G68RfCljjj8XzWMJzDfLPQAiWm_zGVi1W2SCjG0ENGC5mowK4bR0wOOlbrHuOMD0yn6eYssgHbx3UMTA-Z3i9JdRZykYPvvRO8Q-FQg"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-primary">Ward 08 • Storm Drain</span>
                      <StatusBadge status="IN_PROGRESS" size="sm" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Field desilting team on-site
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">Updated 25 mins ago</span>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/map')}
                  className="p-space-sm rounded-lg bg-surface-container-low flex gap-space-sm items-center cursor-pointer hover:bg-surface-container transition-colors"
                >
                  <img
                    className="w-20 h-16 rounded-lg object-cover shadow-sm shrink-0"
                    alt="Cleared canal"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd-2gxZv--_qHoBK5OnbyO9jDU6XBWkf92-5io1BAh8zGAJiS4UWgExE5YJt4tK4JbMoUv0RW8YGt1ocn8htdRsDqmlPBRrVFFYIAg88DwXMGceF494pTUQ8oRdO6jiDFoOzSKek7UmEpySXX_HhPcKPhTxT9ImQkEyGE2PxVaOK63V0QT0EmdyeAmYvpdpc4fQqP8FWcl3_Lul8eJOMGp09Q_bOlArIMNWHy711ZyjoU-hLNRbH9wVw"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm font-semibold text-primary">Ward 21 • Canal</span>
                      <StatusBadge status="RESOLVED" size="sm" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      Lateral bypass cleared and flow verified
                    </p>
                    <span className="font-label-sm text-label-sm text-outline">Verified 45 mins ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="w-full bg-primary text-on-primary py-space-xl px-margin md:px-margin-desktop">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-display-lg font-bold text-primary-fixed">1,842</span>
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
            </div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary-container">
              Issues Resolved
            </span>
            <span className="font-body-sm text-body-sm text-surface-container-high opacity-80">
              Canals & storm gutters cleared
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-display-lg font-bold text-secondary-fixed">94.2%</span>
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">trending_up</span>
            </div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary-container">
              Ward Response Rate
            </span>
            <span className="font-body-sm text-body-sm text-surface-container-high opacity-80">
              Within 24h SLA target
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-display-lg font-bold text-primary-fixed">48</span>
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">domain</span>
            </div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary-container">
              Wards Monitored
            </span>
            <span className="font-body-sm text-body-sm text-surface-container-high opacity-80">
              City drainage divisions
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-display-lg font-bold text-secondary-fixed">6.4h</span>
              <span className="material-symbols-outlined text-secondary-fixed text-[20px]">bolt</span>
            </div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary-container">
              Median Resolution Time
            </span>
            <span className="font-body-sm text-body-sm text-surface-container-high opacity-80">
              Intake to verified clean-out
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
