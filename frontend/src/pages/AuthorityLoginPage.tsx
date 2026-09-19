import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

interface DemoProfile {
  id: string;
  name: string;
  role: string;
  badge: string;
  wardNumber: string;
}

const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 'off-1',
    name: 'Insp. K. Menon',
    role: 'Ward 14 Lead',
    badge: 'KM-W14',
    wardNumber: '14',
  },
  {
    id: 'off-2',
    name: 'Officer R. DSilva',
    role: 'Ward 03 Officer',
    badge: 'RD-W03',
    wardNumber: '03',
  },
  {
    id: 'off-3',
    name: 'Officer V. Chacko',
    role: 'Field Operations Lead',
    badge: 'VC-W11',
    wardNumber: '11',
  },
];

export const AuthorityLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProfileId, setSelectedProfileId] = useState('off-1');
  const [passcode, setPasscode] = useState('••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = DEMO_PROFILES.find((p) => p.id === selectedProfileId) || DEMO_PROFILES[0];
    localStorage.setItem(
      'ozhuk_demo_officer',
      JSON.stringify({
        id: profile.id,
        name: profile.name,
        role: profile.role,
        badge: profile.badge,
        wardNumber: profile.wardNumber,
      })
    );
    navigate('/authority');
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-margin py-space-xl">
      <div className="rounded-xl bg-surface-container-lowest p-6 sm:p-space-xl shadow-md border border-surface-container flex flex-col gap-space-md">
        {/* Prototype Notice Banner */}
        <div className="p-3 rounded-lg bg-secondary-container/40 border border-secondary-container text-on-surface-variant flex items-start gap-2 text-body-sm">
          <span className="material-symbols-outlined text-secondary text-[20px] flex-shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-primary font-label-md">
              Prototype Authority Workspace — Demonstration Mode
            </span>
            <span className="text-[12px] text-on-surface-variant">
              This portal demonstrates municipal drainage dispatch capabilities. All user profiles represent prototype field actors.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-1">
          <Logo showTagline={false} className="h-8 w-auto mb-1" />
          <h1 className="font-headline-md text-primary font-bold">Officer Sign In</h1>
          <p className="font-body-sm text-on-surface-variant">
            Select a prototype authority account to manage incident dispatch queues.
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-space-sm mt-space-xs">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
              Prototype Field Officer
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
            >
              {DEMO_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.role} (Ward {p.wardNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm font-semibold uppercase text-on-surface-variant">
              Demonstration Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:bg-surface focus:outline-none"
              required
            />
            <span className="text-[11px] text-outline">Pre-filled for prototype convenience</span>
          </div>

          <button
            type="submit"
            className="mt-space-xs h-11 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Access Command Center</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>
      </div>
    </div>
  );
};
