import { useEffect, useRef, useState } from 'react';
import type { BoothLine } from '../lib/commentary';
import { SPEAKERS } from '../lib/commentary';

/**
 * 8-bit Pat & Kirk at the College GameDay desk. Whoever delivered the most
 * recent line "talks" for a few seconds: mouth flaps, head bobs, and Pat
 * gestures with his arm. Everyone blinks on idle.
 */
function BoothScene({ speaking }: { speaking: 'pat' | 'kirk' | null }) {
  const cls = speaking === 'pat' ? 'speaking-pat' : speaking === 'kirk' ? 'speaking-kirk' : '';
  return (
    <svg viewBox="0 0 240 84" className={`block w-full ${cls}`} aria-hidden="true" shapeRendering="crispEdges">
      {/* GameDay set backdrop */}
      <rect width="240" height="56" fill="#152238" />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 20 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={4 + c * 12 + (r % 2) * 6}
            y={6 + r * 11}
            width="3"
            height="3"
            fill={(r + c) % 3 === 0 ? '#e8443a' : (r + c) % 3 === 1 ? '#3a5f9e' : '#d9d9d9'}
            opacity="0.55"
          />
        )),
      )}
      <rect x="88" y="2" width="64" height="12" fill="#cc0000" />
      <text x="120" y="11" textAnchor="middle" fontSize="7" fontWeight="900" fill="#ffffff" fontFamily="Verdana, sans-serif">
        GAMEDAY
      </text>

      {/* ---- Pat (left): blond, sleeveless black ---- */}
      <g className="pat">
        {/* torso */}
        <rect x="58" y="42" width="30" height="14" fill="#17171a" />
        <rect x="56" y="42" width="5" height="12" fill="#e8b88a" />
        {/* gesturing arm */}
        <g className="booth-arm">
          <rect x="87" y="42" width="5" height="8" fill="#e8b88a" />
          <rect x="87" y="48" width="8" height="4" fill="#e8b88a" />
        </g>
        {/* head */}
        <g className="booth-head">
          <rect x="64" y="20" width="18" height="17" fill="#e8b88a" />
          <rect x="63" y="15" width="20" height="6" fill="#d9a441" />
          <rect x="62" y="19" width="3" height="9" fill="#d9a441" />
          {/* beard */}
          <rect x="64" y="32" width="18" height="5" fill="#c99b62" />
          <rect x="70" y="33" width="6" height="2" fill="#5a2d20" className="booth-mouth" />
          {/* eyes */}
          <rect x="68" y="25" width="2" height="2" fill="#241a12" className="booth-eye" />
          <rect x="76" y="25" width="2" height="2" fill="#241a12" className="booth-eye" />
        </g>
      </g>

      {/* ---- Kirk (right): gray suit, purple tie ---- */}
      <g className="kirk">
        <rect x="152" y="42" width="30" height="14" fill="#8b8f96" />
        <rect x="163" y="42" width="8" height="11" fill="#ffffff" />
        <rect x="165" y="42" width="4" height="13" fill="#7a3fa8" />
        <g className="booth-head">
          <rect x="158" y="20" width="18" height="17" fill="#e6b48c" />
          <rect x="157" y="15" width="20" height="6" fill="#6e5b4a" />
          <rect x="175" y="19" width="3" height="7" fill="#6e5b4a" />
          <rect x="164" y="32" width="6" height="2" fill="#5a2d20" className="booth-mouth" />
          <rect x="162" y="25" width="2" height="2" fill="#241a12" className="booth-eye" />
          <rect x="170" y="25" width="2" height="2" fill="#241a12" className="booth-eye" />
        </g>
      </g>

      {/* Desk */}
      <rect x="0" y="56" width="240" height="28" fill="#cc0000" />
      <rect x="0" y="56" width="240" height="3" fill="#ffffff" />
      <text x="120" y="74" textAnchor="middle" fontSize="9" fontWeight="900" letterSpacing="2" fill="#ffffff" fontFamily="Verdana, sans-serif">
        COLLEGE CHESSDAY
      </text>
      {/* desk mics */}
      <rect x="70" y="52" width="3" height="6" fill="#111111" />
      <rect x="68" y="50" width="7" height="4" fill="#333333" />
      <rect x="167" y="52" width="3" height="6" fill="#111111" />
      <rect x="165" y="50" width="7" height="4" fill="#333333" />
    </svg>
  );
}

/** The ESPN booth: live Pat & Kirk reactions, newest at the bottom. */
export function BoothPanel({ lines }: { lines: BoothLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [speaking, setSpeaking] = useState<'pat' | 'kirk' | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    const last = lines[lines.length - 1];
    if (!last) return;
    setSpeaking(last.speaker);
    const timer = setTimeout(() => setSpeaking(null), 3200);
    return () => clearTimeout(timer);
  }, [lines]);

  return (
    <div className="overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-lg">
      <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-3 py-1.5">
        <span aria-hidden className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-200">
          The Booth · College ChessDay
        </span>
      </div>
      <BoothScene speaking={speaking} />
      <div ref={scrollRef} className="flex max-h-28 flex-col gap-1.5 overflow-y-auto px-3 py-2" aria-live="off">
        {lines.length === 0 && <p className="text-xs italic text-zinc-400">The booth is standing by…</p>}
        {lines.map((l) => (
          <p key={l.id} className="promo-in text-xs leading-snug">
            <span
              className={`mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full align-middle text-[8px] font-black ${
                l.speaker === 'pat' ? 'bg-amber-400 text-zinc-900' : 'bg-sky-400 text-zinc-900'
              }`}
              aria-hidden
            >
              {SPEAKERS[l.speaker].short}
            </span>
            <span className={`font-bold ${l.speaker === 'pat' ? 'text-amber-300' : 'text-sky-300'}`}>
              {SPEAKERS[l.speaker].name}:
            </span>{' '}
            <span className="text-zinc-200">{l.text}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
