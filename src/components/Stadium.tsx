import type { Team } from '../types';
import { logoUrl, venueFor } from '../lib/teams';

/**
 * Cartoon college stadium backdrop, painted in the home team's colors:
 * crowd bowl, light towers, and a live jumbotron showing the play-by-play,
 * a game clock, and the material "score". Sits directly above the board so
 * the board reads as the field. The far end zone (bottom strip of this SVG)
 * belongs to the visiting team.
 */

const SMOKE = '#58595b';

function CrowdRows({ x, y, width, rows, a, b }: { x: number; y: number; width: number; rows: number; a: string; b: string }) {
  const dots: React.ReactElement[] = [];
  const step = 11;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < Math.floor(width / step); c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={x + c * step + (r % 2 ? step / 2 : 0) + 4}
          cy={y + r * 8}
          r={2.6}
          fill={(r + c) % 2 ? a : b}
          opacity={0.9}
        />,
      );
    }
  }
  return <g>{dots}</g>;
}

function LightTower({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 1.5} y={26} width={3} height={52} fill={SMOKE} />
      <rect x={x - 13} y={14} width={26} height={14} rx={2} fill={SMOKE} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <circle key={`${r}${c}`} cx={x - 9 + c * 6} cy={18 + r * 4.5} r={1.7} fill="#fff6c9" />
        )),
      )}
    </g>
  );
}

export interface StadiumProps {
  home: Team;
  away: Team;
  play: string;
  clock: string;
  scoreHome: number;
  scoreAway: number;
  thinking: boolean;
}

export function Stadium({ home, away, play, clock, scoreHome, scoreAway, thinking }: StadiumProps) {
  const venue = venueFor(home).toUpperCase();
  return (
    <svg
      viewBox="0 0 700 196"
      className="block w-full"
      role="img"
      aria-label={`${venue} scoreboard. ${play}. Clock ${clock}.`}
    >
      <defs>
        <linearGradient id="cfbsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ecdf2" />
          <stop offset="1" stopColor="#d7ecfa" />
        </linearGradient>
        <linearGradient id="cfbscreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101418" />
          <stop offset="1" stopColor="#1d2733" />
        </linearGradient>
      </defs>
      <rect width="700" height="196" fill="url(#cfbsky)" />

      <LightTower x={36} />
      <LightTower x={664} />

      {/* Upper bowl with home-colored crowd */}
      <path d="M 60,78 Q 350,40 640,78 L 640,140 L 60,140 Z" fill="#e4e1db" stroke={SMOKE} strokeWidth="2.5" />
      <path d="M 60,78 Q 350,40 640,78 L 640,86 Q 350,49 60,86 Z" fill={home.primary} />
      <CrowdRows x={66} y={94} width={188} rows={5} a={home.primary} b={home.secondary} />
      <CrowdRows x={446} y={94} width={188} rows={5} a={home.primary} b={home.secondary} />

      {/* Facade band with the venue name */}
      <rect x="60" y="140" width="580" height="18" fill={SMOKE} />
      <text x="350" y="153" textAnchor="middle" fontSize="12.5" fontWeight="800" letterSpacing="5" fill="#ffffff" fontFamily="Verdana, sans-serif">
        {venue}
      </text>

      {/* Jumbotron */}
      <rect x="256" y="52" width="188" height="86" rx="6" fill={SMOKE} stroke="#3c3d3f" strokeWidth="2" />
      <rect x="263" y="59" width="174" height="64" rx="3" fill="url(#cfbscreen)" stroke={home.primary} strokeWidth="2.5" />
      <rect x="308" y="42" width="84" height="12" rx="2" fill={home.primary} />
      <text x="350" y="51" textAnchor="middle" fontSize="8" fontWeight="800" fill={home.secondary} fontFamily="Verdana, sans-serif">
        GO {home.mascot.toUpperCase().slice(0, 14)}
      </text>
      {/* Matchup logos on screen corners */}
      <image href={logoUrl(home)} x="270" y="99" width="18" height="18" />
      <image href={logoUrl(away)} x="412" y="99" width="18" height="18" />
      {/* Replay badge */}
      <circle cx="276" cy="70" r="3.4" fill="#ff3b30" className={thinking ? 'animate-pulse' : ''} />
      <text x="284" y="73.5" fontSize="8.5" fontWeight="700" fill="#ffb997" fontFamily="Verdana, sans-serif">
        {thinking ? 'LIVE — IN THE BOOTH…' : 'PLAY REVIEW'}
      </text>
      {/* Play-by-play line */}
      <text
        x="350"
        y="92"
        textAnchor="middle"
        fontSize={play.length > 15 ? 10.5 : 15}
        fontWeight="800"
        fill="#ffffff"
        fontFamily="Consolas, monospace"
      >
        {play}
      </text>
      {/* Clock + score row */}
      <text x="350" y="114" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#ffd08a" fontFamily="Consolas, monospace">
        ⏱ {clock}  ·  {home.abbrev} {scoreHome} — {scoreAway} {away.abbrev}
      </text>

      {/* Field-level strip: grass + yard lines + the visitors' end zone */}
      <rect x="0" y="158" width="700" height="38" fill="#3f9142" />
      {[100, 200, 300, 400, 500, 600].map((x) => (
        <rect key={x} x={x} y={162} width={3.5} height={30} fill="#ffffff" opacity={0.75} />
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <rect key={i} x={i * 39} y={178} width={39} height={18} fill={i % 2 ? away.primary : away.secondary} />
      ))}
    </svg>
  );
}
