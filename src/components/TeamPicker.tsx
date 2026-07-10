import { useEffect, useMemo, useState } from 'react';
import type { Conference, Team } from '../types';
import { CONFERENCES, TEAMS, helmetFor, logoUrl } from '../lib/teams';

/**
 * "Play Now" matchup screen, styled after modern college football video
 * games: away panel on the left, home (you) on the right, "AT" in the
 * middle, and a player from each team seated at a chessboard between them.
 * Teams can be switched per side (arrows or dropdown) and filtered by
 * conference.
 */

/** One team's player, seated in profile at the chess table. */
function SeatedPlayer({ team, flip }: { team: Team; flip?: boolean }) {
  const h = helmetFor(team);
  const stroke = '#1a1a1a';
  return (
    <g transform={flip ? 'translate(360,0) scale(-1,1)' : undefined}>
      {/* bench */}
      <rect x={48} y={100} width={40} height={7} rx={2} fill="#6b4a2f" stroke={stroke} strokeWidth={1.5} />
      <rect x={52} y={107} width={5} height={12} fill="#59391f" stroke={stroke} strokeWidth={1.2} />
      <rect x={79} y={107} width={5} height={12} fill="#59391f" stroke={stroke} strokeWidth={1.2} />
      {/* leg toward the table + shin + cleat */}
      <rect x={74} y={88} width={34} height={11} rx={4} fill={team.secondary} stroke={stroke} strokeWidth={1.5} />
      <rect x={102} y={96} width={9} height={20} rx={3} fill={team.secondary} stroke={stroke} strokeWidth={1.5} />
      <rect x={98} y={114} width={17} height={6} rx={2} fill="#222222" stroke={stroke} strokeWidth={1.2} />
      {/* torso */}
      <rect x={62} y={54} width={27} height={38} rx={6} fill={team.primary} stroke={stroke} strokeWidth={1.8} />
      {/* arm reaching to the board */}
      <path d="M 86,62 L 132,76" stroke={team.primary} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d="M 86,62 L 132,76" stroke={stroke} strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.25} />
      <circle cx={136} cy={78} r={4.5} fill="#e8b88a" stroke={stroke} strokeWidth={1.2} />
      {/* helmet (profile, facing the table) */}
      <circle cx={80} cy={38} r={15.5} fill={h.shell} stroke={stroke} strokeWidth={1.8} />
      <rect x={86} y={32} width={9} height={13} rx={2} fill="#26221f" />
      <path d="M 68,30 A 15.5,15.5 0 0 1 92,30" fill="none" stroke={h.stripe} strokeWidth={4} strokeLinecap="round" />
      <path d="M 94,36 h 9 M 94,42 h 7 M 97,33 v 11" fill="none" stroke={h.mask} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={74} cy={38} r={1.6} fill={h.stripe} opacity={0.7} />
    </g>
  );
}

/** The centerpiece: two players seated over a chessboard. */
function ChessTableScene({ home, away }: { home: Team; away: Team }) {
  const stroke = '#1a1a1a';
  return (
    <svg viewBox="0 0 360 150" className="mx-auto block w-full max-w-md" aria-hidden="true">
      <ellipse cx={180} cy={132} rx={150} ry={12} fill="#000000" opacity={0.25} />
      {/* table */}
      <rect x={132} y={86} width={96} height={8} rx={2} fill="#8a6844" stroke={stroke} strokeWidth={1.8} />
      <rect x={140} y={94} width={7} height={28} fill="#6b4a2f" stroke={stroke} strokeWidth={1.4} />
      <rect x={213} y={94} width={7} height={28} fill="#6b4a2f" stroke={stroke} strokeWidth={1.4} />
      {/* chessboard */}
      <g stroke={stroke} strokeWidth={0.6}>
        {Array.from({ length: 8 }, (_, c) => (
          <g key={c}>
            <rect x={140 + c * 10} y={78} width={10} height={4} fill={c % 2 ? '#5d8f52' : '#efe9d2'} />
            <rect x={140 + c * 10} y={82} width={10} height={4} fill={c % 2 ? '#efe9d2' : '#5d8f52'} />
          </g>
        ))}
        <rect x={138} y={77} width={84} height={10} fill="none" strokeWidth={1.6} />
      </g>
      {/* a few pieces mid-game */}
      <g stroke={stroke} strokeWidth={1}>
        <circle cx={152} cy={72} r={3} fill="#f5f1e6" />
        <rect x={149} y={74} width={6} height={4} fill="#f5f1e6" />
        <circle cx={172} cy={70} r={3.6} fill="#f5f1e6" />
        <rect x={168.5} y={73} width={7} height={5} fill="#f5f1e6" />
        <circle cx={192} cy={72} r={3} fill="#3a3733" />
        <rect x={189} y={74} width={6} height={4} fill="#3a3733" />
        <circle cx={208} cy={70} r={3.6} fill="#3a3733" />
        <rect x={204.5} y={73} width={7} height={5} fill="#3a3733" />
      </g>
      <SeatedPlayer team={away} />
      <SeatedPlayer team={home} flip />
    </svg>
  );
}

/** One side's big team panel with switch controls. */
function TeamPanel({
  label,
  team,
  teams,
  onChange,
}: {
  label: string;
  team: Team;
  teams: Team[];
  onChange: (team: Team) => void;
}) {
  const idx = teams.findIndex((t) => t.id === team.id);
  const cycle = (dir: 1 | -1) => {
    const next = teams[(Math.max(idx, 0) + dir + teams.length) % teams.length];
    onChange(next);
  };
  return (
    <div
      className="relative flex min-h-64 flex-1 flex-col items-center justify-start gap-2 overflow-hidden rounded-xl p-4 pt-6 ring-1 ring-black/40"
      style={{ background: `linear-gradient(160deg, ${team.primary} 0%, ${team.primary}cc 55%, #000000dd 130%)` }}
    >
      {/* watermark logo */}
      <img src={logoUrl(team)} alt="" className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 object-contain opacity-15" />
      <span className="rounded-full bg-black/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/90">
        {label} · {team.conference}
      </span>
      <img src={logoUrl(team)} alt="" className="h-24 w-24 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]" />
      <div className="text-center">
        <p className="text-xl font-black uppercase leading-tight tracking-wide text-white drop-shadow">{team.school}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-white/75">{team.mascot}</p>
      </div>
      <div className="mt-auto flex w-full items-center gap-1.5">
        <button
          type="button"
          onClick={() => cycle(-1)}
          aria-label={`Previous team for ${label}`}
          className="rounded-md bg-black/45 px-2.5 py-1.5 text-sm font-black text-white hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ‹
        </button>
        <select
          value={team.id}
          onChange={(e) => {
            const next = TEAMS.find((t) => t.id === e.target.value);
            if (next) onChange(next);
          }}
          aria-label={`${label} team`}
          className="min-w-0 flex-1 rounded-md border border-white/25 bg-black/45 px-2 py-1.5 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id} className="text-black">
              {t.school}
            </option>
          ))}
          {/* keep current selection listed even when filtered out */}
          {!teams.some((t) => t.id === team.id) && (
            <option value={team.id} className="text-black">
              {team.school}
            </option>
          )}
        </select>
        <button
          type="button"
          onClick={() => cycle(1)}
          aria-label={`Next team for ${label}`}
          className="rounded-md bg-black/45 px-2.5 py-1.5 text-sm font-black text-white hover:bg-black/65 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function TeamPicker({
  initialMine,
  initialOpp,
  onConfirm,
  onCancel,
}: {
  initialMine: Team;
  initialOpp: Team;
  onConfirm: (mine: Team, opp: Team) => void;
  onCancel: (() => void) | null;
}) {
  const [conference, setConference] = useState<Conference | 'All'>('All');
  const [home, setHome] = useState<Team>(initialMine); // you
  const [away, setAway] = useState<Team>(initialOpp); // opponent

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const filtered = useMemo(() => {
    const list = conference === 'All' ? [...TEAMS] : TEAMS.filter((t) => t.conference === conference);
    return list.sort((a, b) => a.school.localeCompare(b.school));
  }, [conference]);

  const randomAway = () => {
    const pool = filtered.filter((t) => t.id !== home.id);
    const list = pool.length ? pool : TEAMS.filter((t) => t.id !== home.id);
    setAway(list[Math.floor(Math.random() * list.length)]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Play Now — set up the matchup"
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-3 sm:p-5"
    >
      {/* Header */}
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-2">
        <h2 className="text-xl font-black italic tracking-tight text-white sm:text-2xl">
          🏈 PLAY NOW
        </h2>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by conference">
          {(['All', ...CONFERENCES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConference(c)}
              aria-pressed={conference === c}
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                conference === c ? 'bg-white text-zinc-900' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-xl leading-none text-zinc-300 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Matchup panels */}
      <div className="mx-auto mt-3 flex w-full max-w-4xl flex-1 flex-col overflow-y-auto">
        <div className="my-auto flex w-full flex-col gap-3">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row">
            <TeamPanel label="Away" team={away} teams={filtered} onChange={setAway} />
            <div className="flex items-center justify-center">
              <span className="text-2xl font-black italic text-zinc-400 sm:text-3xl">AT</span>
            </div>
            <TeamPanel label="Home · You" team={home} teams={filtered} onChange={setHome} />
          </div>

          {/* The table */}
          <ChessTableScene home={home} away={away} />
        </div>
      </div>

      {/* Action bar */}
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 border-t border-zinc-700 pt-3 sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ✕ Back
          </button>
        )}
        <button
          type="button"
          onClick={randomAway}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          🎲 Random Team
        </button>
        <button
          type="button"
          disabled={home.id === away.id}
          onClick={() => onConfirm(home, away)}
          className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-black uppercase tracking-wide text-white shadow-lg hover:bg-emerald-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          ✓ Kickoff — {away.abbrev} at {home.abbrev}
        </button>
      </div>
    </div>
  );
}
