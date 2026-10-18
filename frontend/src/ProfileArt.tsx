import type { LucideIcon } from 'lucide-react'
import { BookOpen, BriefcaseBusiness, Compass, GraduationCap } from 'lucide-react'

/**
 * Decorative, purely presentational artwork for the Student Profile page.
 * Everything here is inline SVG (no extra network requests, no new
 * dependencies) so it stays light on low-end devices.
 */

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 43V24"
        stroke="#6BE7B2"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M24 26C13 27 7 19 7 9c11-1 17 6 17 17Z"
        fill="#6BE7B2"
      />
      <path
        d="M24 21C24 11 30 4 41 4c1 9-4 16-14 17.5-1 .2-2 .3-3-.5Z"
        fill="#2FB583"
      />
      <path
        d="M24 33c-6 .6-11-2-13-8 6-.8 11 1.700 13 8Z"
        fill="#9DE8C9"
        opacity=".85"
      />
    </svg>
  )
}

type TileProps = {
  icon: LucideIcon
  x: number
  y: number
  w: number
  h: number
  size?: number
  tone?: 'light' | 'dark'
  rotate?: number
}

/** A small rounded icon tile positioned by viewBox coordinates. */
function Tile({
  icon: Icon,
  x,
  y,
  w,
  h,
  size = 52,
  tone = 'light',
  rotate = 0,
}: TileProps) {
  return (
    <span
      className={`art-tile art-tile--${tone}`}
      style={{
        left: `${(x / w) * 100}%`,
        top: `${(y / h) * 100}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      }}
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.7} />
    </span>
  )
}

function Pine({
  x,
  y,
  s = 1,
  fill,
}: {
  x: number
  y: number
  s?: number
  fill: string
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M0 -34 L9 -16 H4 L12 -2 H-12 L-4 -16 H-9 Z" />
      <rect x="-1.500" y="-2" width="3" height="5" />
    </g>
  )
}

function RoundTree({
  x,
  y,
  s = 1,
  fill,
}: {
  x: number
  y: number
  s?: number
  fill: string
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx="0" cy="-20" rx="13" ry="18" />
      <rect x="-1.500" y="-4" width="3" height="8" />
    </g>
  )
}

/** Forest + winding path scene at the foot of the left sidebar. */
export function SidebarScene() {
  return (
    <svg
      className="side-scene"
      viewBox="0 0 274 360"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sb-road" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#d4ffe9" />
          <stop offset="1" stopColor="#4fd9a0" />
        </linearGradient>
        <filter id="sb-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* far hills */}
      <path
        d="M0 120 C50 84 96 112 146 92 C196 72 236 100 274 84 V360 H0Z"
        fill="#0A4A39"
      />
      <path
        d="M0 176 C60 140 112 176 170 148 C214 128 250 150 274 140 V360 H0Z"
        fill="#0C5642"
      />

      {/* tree line, back */}
      <Pine x={196} y={150} s={0.9} fill="#0B6049" />
      <Pine x={216} y={146} s={1.2} fill="#0D6B51" />
      <Pine x={240} y={150} s={0.95} fill="#0B6049" />
      <Pine x={258} y={146} s={1.15} fill="#0D6B51" />
      <RoundTree x={30} y={178} s={0.9} fill="#0B6049" />
      <RoundTree x={54} y={172} s={1.1} fill="#0D6B51" />

      {/* mid hill */}
      <path
        d="M0 232 C40 206 92 232 150 214 C206 196 244 214 274 204 V360 H0Z"
        fill="#0E6249"
      />
      <Pine x={228} y={214} s={1.4} fill="#117A5B" />
      <Pine x={252} y={210} s={1.7} fill="#0F6D52" />

      {/* glowing path */}
      <path
        d="M196 196 C150 206 70 204 92 236 C112 262 28 282 20 360 H140 C132 318 220 296 174 260 C150 240 188 226 204 200 Z"
        fill="url(#sb-road)"
        opacity=".55"
        filter="url(#sb-glow)"
      />
      <path
        d="M196 196 C150 206 70 204 92 236 C112 262 28 282 20 360 H140 C132 318 220 296 174 260 C150 240 188 226 204 200 Z"
        fill="url(#sb-road)"
        opacity=".9"
      />

      {/* foreground leaves */}
      <path
        d="M-6 360 C-8 316 14 282 56 268 C60 306 38 340 -6 360Z"
        fill="#14815F"
      />
      <path
        d="M18 360 C22 326 52 306 92 304 C86 336 58 356 18 360Z"
        fill="#1B9C73"
      />
      <path
        d="M274 360 C276 330 258 308 236 300 C226 328 244 352 274 360Z"
        fill="#117A5B"
      />
    </svg>
  )
}

/** Soft misty hills with a glowing path linking four icon tiles. */
export function HeroScene() {
  const W = 640
  const H = 300

  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" focusable="false">
        <defs>
          <linearGradient id="hero-path" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7be8b8" stopOpacity=".2" />
            <stop offset=".5" stopColor="#3fd39a" />
            <stop offset="1" stopColor="#6BE7B2" stopOpacity=".85" />
          </linearGradient>
          <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <linearGradient id="hero-fade-x" x1="0" y1="0" x2="1" y2="0">
            <stop offset=".12" stopColor="#000" />
            <stop offset=".48" stopColor="#fff" />
          </linearGradient>
          <linearGradient id="hero-fade-y" x1="0" y1="0" x2="0" y2="1">
            <stop offset=".55" stopColor="#fff" />
            <stop offset=".98" stopColor="#000" />
          </linearGradient>
          <mask id="hero-mask-x">
            <rect width={W} height={H} fill="url(#hero-fade-x)" />
          </mask>
          <mask id="hero-mask-y">
            <rect width={W} height={H} fill="url(#hero-fade-y)" />
          </mask>
        </defs>

        <g mask="url(#hero-mask-y)">
        <g className="hero-hills" mask="url(#hero-mask-x)">
          <path
            d="M120 210 C200 150 280 190 360 140 C440 92 520 140 640 90 V300 H120Z"
            fill="#E3EBDD"
          />
          <path
            d="M220 250 C300 196 380 236 450 186 C520 140 580 170 640 150 V300 H220Z"
            fill="#D3E1D2"
          />
          <path
            d="M320 290 C400 246 480 270 560 232 C600 214 624 218 640 212 V300 H320Z"
            fill="#C2D6C6"
          />
          <Pine x={430} y={196} s={1.3} fill="#A9C7B2" />
          <Pine x={456} y={192} s={1.7} fill="#9BBFA9" />
          <Pine x={488} y={198} s={1.2} fill="#A9C7B2" />
          <Pine x={560} y={176} s={1.5} fill="#A9C7B2" />
          <Pine x={590} y={172} s={1.9} fill="#9BBFA9" />
          <Pine x={620} y={178} s={1.4} fill="#A9C7B2" />
          <RoundTree x={330} y={188} s={1.1} fill="#B3CFBB" />
          <RoundTree x={352} y={184} s={0.9} fill="#A9C7B2" />
        </g>
        </g>

        {/* Ambient layers: mist drifts slowly inside the drawing only. */}
        <g className="hero-mist" mask="url(#hero-mask-x)">
          <ellipse cx="430" cy="196" rx="170" ry="16" fill="#ffffff" opacity=".55" />
          <ellipse cx="560" cy="234" rx="130" ry="12" fill="#ffffff" opacity=".45" />
        </g>

        <g fill="none" strokeLinecap="round" className="hero-trail">
          <path
            d="M70 134 C80 214 170 238 222 196 C262 164 340 168 372 112"
            stroke="#6BE7B2"
            strokeWidth="9"
            opacity=".5"
            filter="url(#hero-glow)"
            pathLength={1}
          />
          <path
            d="M70 134 C80 214 170 238 222 196 C262 164 340 168 372 112"
            stroke="url(#hero-path)"
            strokeWidth="3"
            pathLength={1}
          />
          <path
            d="M96 100 C130 60 160 52 190 50"
            stroke="url(#hero-path)"
            strokeWidth="2.200"
          />
        </g>

        <g className="hero-fireflies" fill="#3fd39a">
          <circle cx="300" cy="150" r="2.4" />
          <circle cx="470" cy="126" r="2" />
          <circle cx="586" cy="150" r="2.2" />
        </g>
      </svg>

      <Tile icon={BookOpen} x={70} y={104} w={W} h={H} size={54} rotate={-4} />
      <Tile icon={GraduationCap} x={228} y={44} w={W} h={H} size={58} rotate={3} />
      <Tile icon={Compass} x={398} y={86} w={W} h={H} size={54} rotate={-3} />
      <Tile icon={BriefcaseBusiness} x={236} y={172} w={W} h={H} size={52} rotate={4} />
    </div>
  )
}

/**
 * Night landscape for the dark right panel: a winding path climbs from the
 * valley to a glowing sprout on the ridge. The lit part of the path follows
 * the real profile completion passed in as `progress` (0–100).
 */
export function JourneyScene({ progress }: { progress: number }) {
  const W = 340
  const H = 236
  const trail =
    'M 34 222 C 70 200, 40 176, 92 166 C 150 156, 120 128, 176 118 C 226 110, 210 86, 246 72'

  return (
    <div className="info-art journey-art" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} focusable="false">
        <defs>
          <radialGradient id="js-moon" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#9DE8C9" stopOpacity=".45" />
            <stop offset="1" stopColor="#9DE8C9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="js-trail" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#1B9C73" />
            <stop offset="1" stopColor="#B8F5DA" />
          </linearGradient>
          <filter id="js-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* sky */}
        <circle cx="262" cy="64" r="70" fill="url(#js-moon)" />
        <g fill="#B8F5DA" className="journey-stars">
          <circle cx="40" cy="36" r="1.4" opacity=".7" />
          <circle cx="96" cy="22" r="1.1" opacity=".55" />
          <circle cx="150" cy="44" r="1.3" opacity=".6" />
          <circle cx="210" cy="18" r="1" opacity=".5" />
          <circle cx="318" cy="30" r="1.3" opacity=".65" />
          <circle cx="306" cy="104" r="1" opacity=".5" />
        </g>

        {/* layered hills */}
        <path d="M0 150 C60 118 120 132 180 104 C230 82 280 92 340 70 V236 H0Z" fill="#0b4a3a" opacity=".55" />
        <path d="M0 186 C70 160 140 176 210 148 C260 128 300 136 340 124 V236 H0Z" fill="#0b4a3a" opacity=".85" />
        <path d="M0 214 C80 196 160 210 240 190 C290 178 318 182 340 178 V236 H0Z" fill="#063b2e" />
        <Pine x={286} y={176} s={1.4} fill="#0e6b52" />
        <Pine x={306} y={172} s={1.8} fill="#0b5a45" />
        <Pine x={58} y={200} s={1.3} fill="#0e6b52" />
        <RoundTree x={124} y={180} s={1} fill="#0e6b52" />

        {/* the path: dim full route, lit up to the current completion */}
        <path d={trail} fill="none" stroke="#9DE8C9" strokeOpacity=".18" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 6" />
        <path
          className="journey-art-glow"
          d={trail}
          fill="none"
          stroke="#6BE7B2"
          strokeWidth="8"
          strokeLinecap="round"
          opacity=".45"
          filter="url(#js-glow)"
          pathLength={1}
          style={{ strokeDashoffset: 1 - progress / 100 }}
        />
        <path
          className="journey-art-trail"
          d={trail}
          fill="none"
          stroke="url(#js-trail)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          style={{ strokeDashoffset: 1 - progress / 100 }}
        />

        {/* sprout on the ridge, the destination */}
        <g transform="translate(246 72)">
          <circle r="16" fill="#3FD39A" opacity=".18" />
          <path d="M0 8 V-6" stroke="#9DE8C9" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 -4 C-2 -14 -12 -16 -16 -12 C-12 -6 -6 -4 0 -4Z" fill="#6BE7B2" />
          <path d="M0 -6 C2 -16 12 -20 18 -15 C14 -8 7 -6 0 -6Z" fill="#2FB583" />
        </g>
      </svg>

      <Tile icon={GraduationCap} x={96} y={156} w={W} h={H} size={42} tone="dark" rotate={-5} />
      <Tile icon={Compass} x={182} y={112} w={W} h={H} size={42} tone="dark" rotate={4} />
    </div>
  )
}
