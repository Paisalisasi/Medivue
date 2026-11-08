import React from 'react';
import { HeartPulse } from 'lucide-react';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

const MARK_SIZE: Record<LogoSize, string> = {
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-11 w-11 rounded-2xl',
};

const ICON_SIZE: Record<LogoSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-[1.05rem] w-[1.05rem]',
  lg: 'h-5 w-5',
};

const TEXT_SIZE: Record<LogoSize, string> = {
  sm: 'text-[15px]',
  md: 'text-[16px]',
  lg: 'text-xl',
};

export default function Logo({
  size = 'md',
  showTagline = false,
  inverted = false,
  className = '',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center shadow-sm ${MARK_SIZE[size]} ${
          inverted ? 'bg-lime-300 text-emerald-950' : 'bg-emerald-900 text-lime-200'
        }`}
      >
        <HeartPulse className={ICON_SIZE[size]} strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span
          className={`block font-bold tracking-[-0.035em] ${TEXT_SIZE[size]} ${
            inverted ? 'text-white' : 'text-emerald-950'
          }`}
        >
          Medivue
        </span>
        {showTagline && (
          <span
            className={`mt-1 block text-[10px] font-medium tracking-wide ${
              inverted ? 'text-emerald-100/70' : 'text-slate-500'
            }`}
          >
            Pahami keluhan. Tentukan langkah.
          </span>
        )}
      </span>
    </span>
  );
}
