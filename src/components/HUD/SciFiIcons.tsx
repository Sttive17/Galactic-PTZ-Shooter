import { useId } from 'react';
import type { ReactNode } from 'react';

export interface SciFiIconProps {
  size?: number;
  className?: string;
}

export type BadgeAccent = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';

interface IconBadgeProps {
  accent?: BadgeAccent;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'hex' | 'rounded';
  children: ReactNode;
  className?: string;
}

const BADGE_ACCENT_STYLES: Record<
  BadgeAccent,
  { shell: string; inner: string; text: string; sheen: string }
> = {
  cyan: {
    shell:
      'from-cyan-400/35 via-sky-500/18 to-blue-600/30 border-cyan-300/55 shadow-[0_0_16px_rgba(34,211,238,0.28)]',
    inner: 'bg-slate-950/65',
    text: 'text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]',
    sheen: 'from-cyan-200/35',
  },
  violet: {
    shell:
      'from-violet-400/35 via-fuchsia-500/18 to-purple-700/30 border-violet-300/55 shadow-[0_0_16px_rgba(167,139,250,0.28)]',
    inner: 'bg-slate-950/65',
    text: 'text-violet-200 drop-shadow-[0_0_8px_rgba(192,132,252,0.75)]',
    sheen: 'from-fuchsia-200/35',
  },
  emerald: {
    shell:
      'from-emerald-400/35 via-teal-500/18 to-emerald-700/30 border-emerald-300/55 shadow-[0_0_16px_rgba(52,211,153,0.28)]',
    inner: 'bg-slate-950/65',
    text: 'text-emerald-200 drop-shadow-[0_0_8px_rgba(52,211,153,0.75)]',
    sheen: 'from-emerald-200/35',
  },
  amber: {
    shell:
      'from-amber-400/35 via-orange-500/18 to-amber-700/30 border-amber-300/55 shadow-[0_0_16px_rgba(251,191,36,0.28)]',
    inner: 'bg-slate-950/65',
    text: 'text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.75)]',
    sheen: 'from-amber-200/35',
  },
  rose: {
    shell:
      'from-rose-400/35 via-red-500/18 to-rose-700/30 border-rose-300/55 shadow-[0_0_16px_rgba(251,113,133,0.28)]',
    inner: 'bg-slate-950/65',
    text: 'text-rose-200 drop-shadow-[0_0_8px_rgba(251,113,133,0.75)]',
    sheen: 'from-rose-200/35',
  },
  slate: {
    shell:
      'from-slate-300/25 via-slate-500/15 to-slate-700/30 border-slate-400/45 shadow-[0_0_12px_rgba(148,163,184,0.18)]',
    inner: 'bg-slate-950/65',
    text: 'text-slate-200 drop-shadow-[0_0_6px_rgba(226,232,240,0.45)]',
    sheen: 'from-white/25',
  },
};

const BADGE_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-6 h-6',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

const HEX_CLIP = 'polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)';

export const IconBadge = ({
  accent = 'cyan',
  size = 'md',
  shape = 'rounded',
  children,
  className = '',
}: IconBadgeProps) => {
  const palette = BADGE_ACCENT_STYLES[accent];
  const radiusClass = shape === 'rounded' ? 'rounded-lg' : '';

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 border bg-gradient-to-br overflow-hidden ${palette.shell} ${BADGE_SIZE_CLASSES[size]} ${radiusClass} ${className}`}
      style={shape === 'hex' ? { clipPath: HEX_CLIP } : undefined}
    >
      <span
        className={`absolute inset-[1px] ${palette.inner} ${radiusClass}`}
        style={shape === 'hex' ? { clipPath: HEX_CLIP } : undefined}
      />
      <span
        className={`pointer-events-none absolute inset-x-1 top-0 h-1/2 bg-gradient-to-b ${palette.sheen} to-transparent opacity-60 ${radiusClass}`}
      />
      <span className={`relative z-10 inline-flex items-center justify-center ${palette.text}`}>
        {children}
      </span>
    </span>
  );
};

export const CampaignIcon = ({ size = 20, className = '' }: SciFiIconProps) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `camp-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8.5" stroke={`url(#${gradId})`} strokeWidth="1.4" strokeOpacity="0.45" strokeDasharray="4 2.5" />
      <path d="M12 2.5V6M12 18V21.5M2.5 12H6M18 12H21.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M12 7.2L16.8 12L12 16.8L7.2 12Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
    </svg>
  );
};

export const StarMapIcon = ({ size = 20, className = '' }: SciFiIconProps) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `map-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-24 12 12)" stroke={`url(#${gradId})`} strokeWidth="1.4" strokeOpacity="0.7" />
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.28" strokeDasharray="2.5 2.5" />
      <path d="M5.5 15L10 9.5L14.8 13.8L18.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="15" r="1.7" fill="currentColor" />
      <circle cx="10" cy="9.5" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.8" cy="13.8" r="1.6" fill="currentColor" />
      <circle cx="18.5" cy="7.5" r="2" fill="#67e8f9" />
    </svg>
  );
};

export const WavesIcon = ({ size = 20, className = '' }: SciFiIconProps) => {
  const uid = useId().replace(/:/g, '');
  const gradId = `wave-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M2.5 12H5.5L8 6.5L11.2 17.5L14.2 8.5L16.8 14L18.5 12H21.5" stroke={`url(#${gradId})`} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 5.5C7 3.7 10 3.2 12 3.2C14 3.2 17 3.7 19.5 5.5" stroke="currentColor" strokeWidth="1.35" strokeOpacity="0.45" strokeLinecap="round" />
      <path d="M4.5 18.5C7 20.3 10 20.8 12 20.8C14 20.8 17 20.3 19.5 18.5" stroke="currentColor" strokeWidth="1.35" strokeOpacity="0.45" strokeLinecap="round" />
    </svg>
  );
};

export const OrbitalLinkIcon = ({ size = 16, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6.2 17.8A8.2 8.2 0 0 1 6.2 6.2M17.8 6.2A8.2 8.2 0 0 1 17.8 17.8" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
    <path d="M8.8 15.2A4.6 4.6 0 0 1 8.8 8.8M15.2 8.8A4.6 4.6 0 0 1 15.2 15.2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

export const GalaxySparkIcon = ({ size = 16, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.2L14.2 9.8L21.8 12L14.2 14.2L12 21.8L9.8 14.2L2.2 12L9.8 9.8Z"
      fill="currentColor"
      fillOpacity="0.28"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="18.2" cy="5.8" r="1.2" fill="currentColor" />
    <circle cx="5.8" cy="18.2" r="1" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

export const KeyboardGlyph = ({ size = 15, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.5 9.5H8.5M11 9.5H13M15.5 9.5H17.5M6.5 12.5H9M11.5 12.5H13.5M16 12.5H17.5M8 15.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const MouseGlyph = ({ size = 15, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="6.5" y="2.8" width="11" height="18.4" rx="5.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 3V9.5M6.8 9.5H17.2" stroke="currentColor" strokeWidth="1.4" />
    <rect x="11.1" y="5.2" width="1.8" height="3.2" rx="0.9" fill="currentColor" />
  </svg>
);

export const GamepadGlyph = ({ size = 15, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6.5 7.5H17.5C19.8 7.5 21.4 9.5 21.2 12L20.6 16.5C20.3 18.2 18.4 18.8 17.2 17.5L15 15.2H9L6.8 17.5C5.6 18.8 3.7 18.2 3.4 16.5L2.8 12C2.6 9.5 4.2 7.5 6.5 7.5Z"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M7.5 10V13M6 11.5H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="15.5" cy="10.8" r="0.9" fill="currentColor" />
    <circle cx="17.5" cy="12.2" r="0.9" fill="currentColor" />
  </svg>
);

export const ShieldCoreIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.5L20 5.8V11.8C20 16.6 16.6 20.4 12 21.8C7.4 20.4 4 16.6 4 11.8V5.8L12 2.5Z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M12 7.5L15.2 10.7L12 15.5L8.8 10.7Z" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

export const VitalCoreIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 20.5L4.4 13.1C2.5 11.2 2.5 8 4.4 6.1C6.2 4.3 9.2 4.4 11 6.3L12 7.3L13 6.3C14.8 4.4 17.8 4.3 19.6 6.1C21.5 8 21.5 11.2 19.6 13.1L12 20.5Z"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M6.8 11.8H9.5L11 9.2L13 14.2L14.5 11.8H17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SprintBoltIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M13.5 2.5L5.2 13.2H11.5L10.3 21.5L18.8 10.8H12.4L13.5 2.5Z"
      fill="currentColor"
      fillOpacity="0.28"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinejoin="round"
    />
  </svg>
);

export const AmmoCellIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3.5" y="7" width="14.5" height="10" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.65" />
    <path d="M18.5 10H20.5V14H18.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.2 10.2V13.8M10.7 10.2V13.8M14.2 10.2V13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const BossSkullIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3L19.2 6.8V12.5C19.2 15.8 16.5 18.2 14.5 19V21H9.5V19C7.5 18.2 4.8 15.8 4.8 12.5V6.8L12 3Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M8 11.2L10.5 12.2L8.2 13.2Z" fill="currentColor" />
    <path d="M16 11.2L13.5 12.2L15.8 13.2Z" fill="currentColor" />
    <path d="M11 16.2H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const LockHexIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M8.5 10V7.5A3.5 3.5 0 0 1 15.5 7.5V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <rect x="5" y="10" width="14" height="10.5" rx="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.65" />
    <circle cx="12" cy="15.2" r="1.4" fill="currentColor" />
  </svg>
);

export const MissionDoneIcon = ({ size = 14, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <polygon
      points="12 2.5 20.2 7.2 20.2 16.8 12 21.5 3.8 16.8 3.8 7.2"
      fill="currentColor"
      fillOpacity="0.22"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M8.5 12.2L11 14.7L15.8 9.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AudioWaveIcon = ({ size = 15, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 9.5H8L12.8 5.2V18.8L8 14.5H4.5Z" fill="currentColor" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
    <path d="M16.2 8.8A4.8 4.8 0 0 1 16.2 15.2M18.8 6.4A8.2 8.2 0 0 1 18.8 17.6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
  </svg>
);

export const AudioMutedIcon = ({ size = 15, className = '' }: SciFiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 9.5H8L12.8 5.2V18.8L8 14.5H4.5Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
    <path d="M16 9.5L20.5 14.5M20.5 9.5L16 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
