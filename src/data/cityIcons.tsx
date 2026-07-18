export interface CityIconProps {
  size?: number;
}

export type CityIconComponent = (props: CityIconProps) => JSX.Element;

/** Paris — Eiffel Tower. Iron-grey lattice tower with a gold top accent. */
export function EiffelTowerIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2.2c-.5 1-.9 2.1-1.1 3.2h2.2c-.2-1.1-.6-2.2-1.1-3.2Z"
        fill="#fbbf24"
      />
      <path
        d="M10.6 6.4h2.8l.6 3.1H10l.6-3.1Z"
        fill="#71717a"
      />
      <path
        d="M9.6 10.5h4.8l.9 4.4c-1.1-.5-2.3-.8-3.3-.8s-2.2.3-3.3.8l.9-4.4Z"
        fill="#71717a"
      />
      <path
        d="M7.8 21 9 15.6c.9-.4 1.9-.6 3-.6s2.1.2 3 .6L16.2 21h-2.1l-.8-3.4a5 5 0 0 0-2.6 0L9.9 21H7.8Z"
        fill="#71717a"
      />
      <rect x="6.5" y="20.2" width="11" height="1.4" rx="0.3" fill="#52525b" />
    </svg>
  );
}

/** Tokyo — Torii gate. Vermillion-red posts and beams with charcoal cap ends. */
export function ToriiGateIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="3" y="6.2" width="18" height="2.2" rx="0.4" fill="#dc2626" />
      <rect x="2.4" y="4.2" width="19.2" height="1.6" rx="0.4" fill="#1f2937" />
      <rect x="2" y="4.2" width="1.6" height="1.6" rx="0.3" fill="#1f2937" />
      <rect x="20.4" y="4.2" width="1.6" height="1.6" rx="0.3" fill="#1f2937" />
      <rect x="6.2" y="8.4" width="1.9" height="12.6" rx="0.3" fill="#dc2626" />
      <rect x="15.9" y="8.4" width="1.9" height="12.6" rx="0.3" fill="#dc2626" />
      <rect x="5.9" y="19.7" width="2.5" height="1.4" rx="0.3" fill="#1f2937" />
      <rect x="15.6" y="19.7" width="2.5" height="1.4" rx="0.3" fill="#1f2937" />
      <rect x="10.5" y="9.4" width="3" height="1.5" rx="0.3" fill="#1f2937" />
    </svg>
  );
}

/** New York — Statue of Liberty's torch. Gold flame on a verdigris-green arm. */
export function LibertyTorchIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2c-1.6 1.3-2.1 2.9-1.4 4.3.5.9 1.4 1.4 1.4 1.4s.9-.5 1.4-1.4C14.1 4.9 13.6 3.3 12 2Z"
        fill="#f59e0b"
      />
      <path
        d="M10.6 7.7h2.8v1.6h-2.8V7.7Z"
        fill="#fbbf24"
      />
      <rect x="10.9" y="9.3" width="2.2" height="2" rx="0.3" fill="#4d7c68" />
      <path
        d="M8.4 21c.2-4.8 1.6-8.3 3.6-9.7 2 1.4 3.4 4.9 3.6 9.7H8.4Z"
        fill="#4d7c68"
      />
      <rect x="7.6" y="20.2" width="8.8" height="1.4" rx="0.3" fill="#3f6a58" />
    </svg>
  );
}

/** London — Big Ben. Stone-tan tower, cream clock face, patina-green roof point. */
export function BigBenIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2 9.6 6h4.8L12 2Z" fill="#4d7c68" />
      <rect x="9" y="6" width="6" height="2.2" rx="0.3" fill="#a8a29e" />
      <rect x="8.4" y="8.2" width="7.2" height="11.8" rx="0.4" fill="#a8a29e" />
      <circle cx="12" cy="12.6" r="2.6" fill="#fef3c7" />
      <rect x="11.6" y="10.9" width="0.8" height="2" rx="0.3" fill="#1f2937" />
      <rect x="12" y="12.2" width="1.7" height="0.7" rx="0.3" fill="#1f2937" />
      <rect x="9.6" y="17.4" width="4.8" height="1" rx="0.2" fill="#78716c" />
      <rect x="7.6" y="20" width="8.8" height="1.4" rx="0.3" fill="#78716c" />
    </svg>
  );
}

/** Hong Kong — Victoria Harbour skyline. Blue-toned buildings over a teal wave. */
export function VictoriaHarbourIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="4" y="12" width="2.6" height="6.4" rx="0.3" fill="#60a5fa" />
      <rect x="7.2" y="8.6" width="2.8" height="9.8" rx="0.3" fill="#3b82f6" />
      <rect x="10.6" y="10.6" width="2.6" height="7.8" rx="0.3" fill="#60a5fa" />
      <rect x="13.8" y="6.6" width="3" height="11.8" rx="0.3" fill="#1e40af" />
      <rect x="17.4" y="9.6" width="2.6" height="8.8" rx="0.3" fill="#3b82f6" />
      <path
        d="M3 19.4q2.2-1.6 4.5 0t4.5 0 4.5 0 4.5 0v1.6H3v-1.6Z"
        fill="#0891b2"
      />
    </svg>
  );
}

/** Guangzhou — Canton Tower. Silvery-lavender pinched-waist body, red light on top. */
export function CantonTowerIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="3.1" r="1" fill="#ef4444" />
      <path
        d="M11.5 4.1h1c.1 1.4.5 2.5 1.2 3.3-1.7 1.7-1.7 3.5 0 5.2-1.6 1.9-1.6 4-.1 6.4H10.4c1.5-2.4 1.5-4.5-.1-6.4 1.7-1.7 1.7-3.5 0-5.2.7-.8 1.1-1.9 1.2-3.3Z"
        fill="#94a3b8"
      />
      <rect x="9.6" y="19" width="4.8" height="1.2" rx="0.3" fill="#64748b" />
      <rect x="8.4" y="20.4" width="7.2" height="1.1" rx="0.3" fill="#475569" />
    </svg>
  );
}

/** Shanghai — Oriental Pearl Tower. Magenta spheres on a grey tower structure. */
export function PearlTowerIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="11.3" y="15.4" width="1.4" height="5.4" fill="#94a3b8" />
      <rect x="9.8" y="20.4" width="4.4" height="1.1" rx="0.3" fill="#64748b" />
      <circle cx="12" cy="13.4" r="2.8" fill="#ec4899" />
      <rect x="11.5" y="10.7" width="1" height="2" fill="#94a3b8" />
      <circle cx="12" cy="8.6" r="1.9" fill="#ec4899" />
      <rect x="11.7" y="6.8" width="0.6" height="1.6" fill="#94a3b8" />
      <circle cx="12" cy="4.9" r="1" fill="#f472b6" />
    </svg>
  );
}

/** Sydney — Opera House. White sail shells with grey shading, blue water base. */
export function OperaHouseIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M4.6 19.6c0-4.3 2.2-6.6 3.6-6.6-1 2.4-1.1 4.6-.6 6.6H4.6Z"
        fill="#f8fafc"
      />
      <path
        d="M8.4 19.6c0-5.4 2.7-8.2 4.2-8.2-1.5 3.1-1.5 5.7-.9 8.2H8.4Z"
        fill="#f8fafc"
      />
      <path
        d="M12.6 19.6c0-4.8 2.4-7.2 3.8-7.2-1.3 2.8-1.3 5-.8 7.2h-3Z"
        fill="#e2e8f0"
      />
      <path
        d="M16 19.6c0-3.6 1.8-5.4 2.9-5.4-1 2.1-1 3.9-.6 5.4H16Z"
        fill="#cbd5e1"
      />
      <rect x="3.4" y="19.6" width="17.2" height="1.3" rx="0.3" fill="#e2e8f0" />
      <path d="M2.6 21.6h18.8" stroke="#0ea5e9" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Fallback — classic red map-pin with a white inner circle. */
export function DefaultMarkerIcon({ size = 24 }: CityIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 21.4S5.5 14.1 5.5 9.4a6.5 6.5 0 1 1 13 0c0 4.7-6.5 12-6.5 12Z"
        fill="#ef4444"
      />
      <circle cx="12" cy="9.4" r="2.6" fill="#ffffff" />
    </svg>
  );
}

export interface CityIconEntry {
  /** Lowercase substring matched against a memory's location field. */
  matchKey: string;
  icon: CityIconComponent;
}

// Order matters only in that the first case-insensitive substring match wins.
export const CITY_ICON_MAP: CityIconEntry[] = [
  { matchKey: 'paris', icon: EiffelTowerIcon },
  { matchKey: 'tokyo', icon: ToriiGateIcon },
  { matchKey: 'new york', icon: LibertyTorchIcon },
  { matchKey: 'london', icon: BigBenIcon },
  { matchKey: 'hong kong', icon: VictoriaHarbourIcon },
  { matchKey: 'guangzhou', icon: CantonTowerIcon },
  { matchKey: 'shanghai', icon: PearlTowerIcon },
  { matchKey: 'sydney', icon: OperaHouseIcon },
];

export const DEFAULT_MARKER_ICON: CityIconComponent = DefaultMarkerIcon;

/**
 * Resolves the icon component for a given Travel_Memory location string.
 * Case-insensitive substring match; falls back to DEFAULT_MARKER_ICON.
 */
export function resolveCityIcon(location: string): CityIconComponent {
  const normalized = location.toLowerCase();
  const match = CITY_ICON_MAP.find(entry => normalized.includes(entry.matchKey));
  return match ? match.icon : DEFAULT_MARKER_ICON;
}
