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
    vantage: '#4ADE80',
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
    // Just the "V" checkmark mark
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
          d="M5 19 L9 15 L15 24 L31 5 L35 9 L16 34 L13 34 Z"
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

      {/* "V" as checkmark */}
      <path
        d="M67 17 L72 11 L78 22 L89 6 L95 11 L80 31 L76 31 Z"
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
