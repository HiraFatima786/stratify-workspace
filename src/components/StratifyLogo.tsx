import React from 'react';

export default function StratifyLogo({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Layer */}
      <path d="M12 3L3 8l9 5 9-5-9-5z" fill={color} opacity="0.9" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Middle Layer */}
      <path d="M3 13l9 5 9-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* Bottom Layer */}
      <path d="M3 18l9 5 9-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </svg>
  );
}