import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const TrackSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [ticketInput, setTicketInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (ticketCode: string) => {
    const cleanId = ticketCode.trim().toUpperCase();
    if (!cleanId) return;

    setSearching(true);
    setErrorMessage(null);

    try {
      const report = await api.getReportByTicketId(cleanId);
      if (report) {
        navigate(`/track/${report.ticketId}`);
      }
    } catch {
      setErrorMessage(
        `Ticket "${cleanId}" was not found in the drainage registry. Please verify the ticket reference and try again.`
      );
    } finally {
      setSearching(false);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(ticketInput);
  };

  return (
    <div className="max-w-[680px] mx-auto px-margin py-space-xl">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Public Incident Status Lookup
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            Track Drainage Report
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Enter your 8-digit tracking reference code to check real-time triage, crew assignment, and verified clearance.
          </p>
        </div>

        <form onSubmit={onSubmitForm} className="flex flex-col gap-space-sm mt-space-xs">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => {
                setTicketInput(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Enter reference (e.g. OZH-260916-001)..."
              className="w-full pl-10 pr-3 py-2.5 text-on-surface bg-surface-container-low rounded-lg font-body-md border border-surface-container focus:bg-surface focus:outline-none"
              required
            />
          </div>

          {errorMessage && (
            <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-error shrink-0">error</span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Ticket Not Found</span>
                <span className="text-[13px]">{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-space-sm pt-space-xs">
            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant flex-wrap">
              <span className="text-[12px]">Recent Demo Samples:</span>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('OZH-260916-001');
                  handleSearch('OZH-260916-001');
                }}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono text-[11px] text-primary transition-colors"
              >
                OZH-260916-001
              </button>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('OZH-260915-084');
                  handleSearch('OZH-260915-084');
                }}
                className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high font-mono text-[11px] text-primary transition-colors"
              >
                OZH-260915-084
              </button>
            </div>

            <button
              type="submit"
              disabled={searching || !ticketInput.trim()}
              className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              {searching ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Ticket</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
