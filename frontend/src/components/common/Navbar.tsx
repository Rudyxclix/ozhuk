import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(10,54,65,0.04)]">
      <div className="h-16 max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex items-center justify-between gap-gutter">
        {/* Brand */}
        <Link to="/" className="cursor-pointer" title="Return to Ozhuk Home">
          <Logo showTagline={false} />
        </Link>

        {/* Navigation Links */}
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

        {/* Right CTA */}
        <div className="flex items-center gap-space-md">
          <button
            onClick={() => navigate('/report')}
            className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>Report Clog</span>
          </button>
        </div>
      </div>
    </header>
  );
};
