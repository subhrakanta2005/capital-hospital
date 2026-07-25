import React from 'react'

/**
 * An original, stylized spoked-wheel motif inspired by the Sun Temple
 * chariot wheel of Konark, Odisha — used decoratively throughout the site.
 */
export default function KonarkWheel({ size = 48, className = '' }) {
  const spokes = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      {spokes.map((deg) => (
        <line
          key={deg}
          x1="50" y1="50"
          x2={50 + 44 * Math.cos((deg * Math.PI) / 180)}
          y2={50 + 44 * Math.sin((deg * Math.PI) / 180)}
          stroke="currentColor" strokeWidth="2.5"
        />
      ))}
      {spokes.map((deg) => (
        <circle
          key={`bead-${deg}`}
          cx={50 + 44 * Math.cos((deg * Math.PI) / 180)}
          cy={50 + 44 * Math.sin((deg * Math.PI) / 180)}
          r="2.5" fill="currentColor"
        />
      ))}
    </svg>
  )
}
