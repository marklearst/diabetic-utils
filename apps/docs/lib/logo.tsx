import type { JSX } from 'react'

/**
 * The GlucoseIQ mark: a blood-drop outline holding the zone-gradient ring
 * (in-range green → elevated amber → high orange → red). Pure inline SVG.
 */
export function LogoMark(props: { size?: number }): JSX.Element {
  const s = props.size ?? 28
  return (
    <svg width={s} height={s} viewBox="0 0 64 84" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="giq-ring" x1="20" y1="38" x2="46" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#30D158" />
          <stop offset="0.45" stopColor="#FFD60A" />
          <stop offset="0.75" stopColor="#FF9F0A" />
          <stop offset="1" stopColor="#FF453A" />
        </linearGradient>
      </defs>
      <path
        d="M32 7C32 7 9 36.5 9 52a23 23 0 0 0 46 0C55 36.5 32 7 32 7Z"
        stroke="#FF453A"
        strokeWidth="7.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="32" cy="52" r="11.5" stroke="url(#giq-ring)" strokeWidth="7" />
    </svg>
  )
}

/** Mark + wordmark lockup. */
export function LogoLockup(props: { size?: number }): JSX.Element {
  const s = props.size ?? 24
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(s * 0.42) }}>
      <LogoMark size={s} />
      <span
        style={{
          fontWeight: 700,
          fontSize: s * 0.82,
          letterSpacing: '-0.02em',
          color: 'currentColor',
          lineHeight: 1,
        }}
      >
        GlucoseIQ
      </span>
    </span>
  )
}
