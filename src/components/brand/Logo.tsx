import React from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  inverted?: boolean;
}

const LOGO_HEIGHT: Record<LogoSize, string> = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
};

export default function Logo({ size = 'md', className = '', inverted = false }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Medivue"
      className={`${LOGO_HEIGHT[size]} w-auto ${inverted ? 'invert' : ''} ${className}`}
    />
  );
}