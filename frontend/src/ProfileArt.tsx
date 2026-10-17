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

        <g fill="none" strokeLinecap="round">
          <path
            d="M70 134 C80 214 170 238 222 196 C262 164 340 168 372 112"
            stroke="#6BE7B2"
            strokeWidth="9"
            opacity=".5"
            filter="url(#hero-glow)"
          />
          <path
            d="M70 134 C80 214 170 238 222 196 C262 164 340 168 372 112"
            stroke="url(#hero-path)"
            strokeWidth="3"
          />
          <path
            d="M96 100 C130 60 160 52 190 50"
            stroke="url(#hero-path)"
            strokeWidth="2.200"
          />
        </g>
      </svg>

      <Tile icon={BookOpen} x={70} y={104} w={W} h={H} size={54} rotate={-4} />
      <Tile icon={GraduationCap} x={228} y={44} w={W} h={H} size={58} rotate={3} />
      <Tile icon={Compass} x={398} y={86} w={W} h={H} size={54} rotate={-3} />
      <Tile icon={BriefcaseBusiness} x={236} y={172} w={W} h={H} size={52} rotate={4} />
    </div>
  )
}

/** Glowing sprout with floating icon tiles for the right information panel. */
export function SproutScene() {
  const W = 340
  const H = 330

  return (
    <div className="info-art" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} focusable="false">
        <defs>
          <linearGradient id="sp-stem" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#1B9C73" />
            <stop offset="1" stopColor="#9DE8C9" />
          </linearGradient>
          <linearGradient id="sp-leaf" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#16866A" />
            <stop offset="1" stopColor="#8FF0C4" />
          </linearGradient>
          <radialGradient id="sp-halo" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#3FD39A" stopOpacity=".35" />
            <stop offset="1" stopColor="#3FD39A" stopOpacity="0" />
          </radialGradient>
          <filter id="sp-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <g transform="translate(30 0)">
        <ellipse cx="190" cy="205" rx="130" ry="130" fill="url(#sp-halo)" />

        {/* ground ring */}
        <ellipse
          cx="190"
          cy="312"
          rx="86"
          ry="14"
          fill="none"
          stroke="#3FD39A"
          strokeOpacity=".55"
        />
        <ellipse
          cx="190"
          cy="312"
          rx="56"
          ry="8"
          fill="none"
          stroke="#6BE7B2"
          strokeOpacity=".8"
        />

        {/* stem */}
        <path
          d="M190 312 C186 270 176 236 192 196 C202 170 216 156 226 138"
          fill="none"
          stroke="#6BE7B2"
          strokeWidth="10"
          strokeLinecap="round"
          opacity=".55"
          filter="url(#sp-glow)"
        />
        <path
          d="M190 312 C186 270 176 236 192 196 C202 170 216 156 226 138"
          fill="none"
          stroke="url(#sp-stem)"
          strokeWidth="4.500"
          strokeLinecap="round"
        />

        {/* leaves */}
        <g filter="url(#sp-glow)" opacity=".55">
          <path
            d="M226 140 C226 96 262 66 306 70 C310 112 280 146 226 140Z"
            fill="#6BE7B2"
          />
          <path
            d="M184 214 C150 196 120 168 118 128 C158 128 190 158 184 214Z"
            fill="#6BE7B2"
          />
        </g>
        <path
          d="M226 140 C226 96 262 66 306 70 C310 112 280 146 226 140Z"
          fill="url(#sp-leaf)"
          stroke="#B8F5DA"
          strokeOpacity=".7"
        />
        <path
          d="M226 140 C240 118 262 96 290 84"
          fill="none"
          stroke="#E6FFF3"
          strokeOpacity=".6"
        />
        <path
          d="M184 214 C150 196 120 168 118 128 C158 128 190 158 184 214Z"
          fill="url(#sp-leaf)"
          stroke="#B8F5DA"
          strokeOpacity=".7"
        />
        <path
          d="M186 262 C214 250 238 232 244 204 C214 206 192 226 186 262Z"
          fill="#1B9C73"
          stroke="#9DE8C9"
          strokeOpacity=".6"
        />

        {/* sparkles */}
        <g fill="#B8F5DA">
          <circle cx="262" cy="196" r="2.500" opacity=".7" />
          <circle cx="104" cy="228" r="1.800" opacity=".7" />
          <circle cx="300" cy="140" r="1.600" opacity=".8" />
          <circle cx="156" cy="280" r="1.600" opacity=".6" />
        </g>
        </g>
      </svg>

      <Tile icon={GraduationCap} x={268} y={48} w={W} h={H} size={60} tone="dark" rotate={6} />
      <Tile icon={BookOpen} x={296} y={182} w={W} h={H} size={56} tone="dark" rotate={-4} />
      <Tile icon={Compass} x={112} y={270} w={W} h={H} size={56} tone="dark" rotate={-5} />
      <Tile icon={BriefcaseBusiness} x={252} y={266} w={W} h={H} size={54} tone="dark" rotate={4} />
    </div>
  )
}
