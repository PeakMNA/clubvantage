import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'full' | 'icon';
  colorScheme?: 'default' | 'light' | 'dark';
}

const COLORS = {
  default: {
    club: '#2D3436',
    vantage: '#1B4332',
  },
  light: {
    club: '#FFFFFF',
    vantage: '#FFFFFF',
  },
  dark: {
    club: '#2D3436',
    vantage: '#1B4332',
  },
};

export function Logo({
  className,
  width = 200,
  height,
  variant = 'full',
  colorScheme = 'default',
}: LogoProps) {
  const colors = COLORS[colorScheme];
  const aspectRatio = 200 / 40;
  const calculatedHeight = height || width / aspectRatio;

  if (variant === 'icon') {
    // Just the "V" arrow mark
    return (
      <svg
        width={calculatedHeight}
        height={calculatedHeight}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M8 32 L20 6 L32 32 L26 32 L20 16 L14 32 Z"
          fill={colors.vantage}
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={calculatedHeight}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* "Club" text */}
      <text
        x="0"
        y="30"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="28"
        fontWeight="600"
        fill={colors.club}
      >
        Club
      </text>

      {/* "V" as upward arrow */}
      <path
        d="M70 30 L78.5 8 L87 30 L82.5 30 L78.5 18 L74.5 30 Z"
        fill={colors.vantage}
      />

      {/* "antage" text */}
      <text
        x="88"
        y="30"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="28"
        fontWeight="600"
        fill={colors.vantage}
      >
        antage
      </text>
    </svg>
  );
}

// Standalone icon component for favicons, app icons, etc.
export function LogoIcon({
  className,
  size = 40,
  colorScheme = 'default',
}: {
  className?: string;
  size?: number;
  colorScheme?: 'default' | 'light' | 'dark';
}) {
  return (
    <Logo
      variant="icon"
      width={size}
      height={size}
      colorScheme={colorScheme}
      className={className}
    />
  );
}
