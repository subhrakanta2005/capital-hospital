import React from 'react'

/**
 * A repeating geometric border strip inspired by traditional Odia temple
 * lotus-and-diamond friezes. Purely decorative, original geometric pattern.
 */
export default function CulturalBorder({ className = '' }) {
  return (
    <svg viewBox="0 0 400 20" preserveAspectRatio="xMidYMid slice" className={className} fill="none">
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i} transform={`translate(${i * 20}, 0)`}>
          <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="currentColor" opacity="0.85" />
          <circle cx="10" cy="10" r="2" fill="white" opacity="0.9" />
        </g>
      ))}
    </svg>
  )
}
