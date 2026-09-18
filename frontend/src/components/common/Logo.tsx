import React from 'react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto', showTagline = false }) => {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 84 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M10 28C14 20 20 12 30 12C40 12 42 26 52 26C60 26 64 18 68 12"
          stroke="#0A3641"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 36C22 30 26 24 34 24C42 24 46 36 56 36C62 36 66 30 70 24"
          stroke="#2A9D8F"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="30" cy="12" r="3" fill="#0A3641" />
        <circle cx="52" cy="26" r="2.5" fill="#2A9D8F" />
      </svg>
      <div className="flex flex-col">
        <span className="font-display text-headline-sm font-bold tracking-tight text-primary leading-none">
          Ozhuk
        </span>
        {showTagline && (
          <span className="text-[9px] font-semibold text-secondary tracking-widest uppercase mt-0.5">
            Report • Track • Resolve
          </span>
        )}
      </div>
    </div>
  );
};
