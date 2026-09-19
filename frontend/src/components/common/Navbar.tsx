import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(10,54,65,0.04)]">
        <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-margin md:px-margin-desktop flex items-center justify-between gap-2 sm:gap-gutter">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="cursor-pointer shrink-0"
            title="Return to Ozhuk Home"
          >
            <Logo showTagline={false} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-space-xs p-1 rounded-xl bg-surface-container-low">
            <Link
              to="/report"
              className={`px-space-md py-space-sm font-label-lg text-label-lg rounded-lg transition-colors ${
                isActive('/report')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Report Blockage
            </Link>
            <Link
              to="/track"
              className={`px-space-md py-space-sm font-label-lg text-label-lg rounded-lg transition-colors ${
                isActive('/track')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Track Ticket
            </Link>
            <Link
              to="/map"
              className={`px-space-md py-space-sm font-label-lg text-label-lg rounded-lg transition-colors ${
                isActive('/map')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Public Map
            </Link>
            <Link
              to="/authority"
              className={`px-space-md py-space-sm font-label-lg text-label-lg rounded-lg transition-colors ${
                isActive('/authority')
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Authority Portal
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-space-md">
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Report Clog</span>
            </button>
          </div>

          {/* Mobile Right Controls: Compact CTA + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate('/report')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <span>Report</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-surface-container hover:bg-surface-container-high transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-down Menu Container */}
          <nav
            aria-label="Mobile Navigation"
            className="relative top-16 w-full bg-surface-container-lowest border-b border-surface-container shadow-xl p-4 flex flex-col gap-1 z-50 animate-in slide-in-from-top duration-200"
          >
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-colors ${
                isActive('/report')
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-secondary">photo_camera</span>
              <div className="flex flex-col">
                <span>Report Blockage</span>
                <span className={`text-[11px] font-normal ${isActive('/report') ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                  Photo & location evidence intake
                </span>
              </div>
            </Link>

            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-colors ${
                isActive('/track')
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-secondary">track_changes</span>
              <div className="flex flex-col">
                <span>Track Ticket</span>
                <span className={`text-[11px] font-normal ${isActive('/track') ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                  Check live field triage status
                </span>
              </div>
            </Link>

            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-colors ${
                isActive('/map')
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-secondary">map</span>
              <div className="flex flex-col">
                <span>Public Map</span>
                <span className={`text-[11px] font-normal ${isActive('/map') ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                  Community open-report canal map
                </span>
              </div>
            </Link>

            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-colors ${
                isActive('/authority')
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] text-secondary">admin_panel_settings</span>
              <div className="flex flex-col">
                <span>Authority Portal</span>
                <span className={`text-[11px] font-normal ${isActive('/authority') ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                  Municipal dispatch & triage command
                </span>
              </div>
            </Link>

            <div className="pt-2 mt-1 border-t border-surface-container">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/report');
                }}
                className="w-full h-11 rounded-xl bg-secondary text-on-secondary font-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-on-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>Report Blockage Now</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
