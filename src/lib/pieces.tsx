import { createContext, useContext } from 'react';
import type { Color, PieceSymbol, PieceSetId, Team } from '../types';
import { helmetFor, logoUrl, teamById } from './teams';
import type { HelmetSpec } from './teams';
import { MascotHead } from './mascotHeads';

/**
 * SVG chess piece sets, all drawn on a 45x45 viewBox.
 *
 * To add or swap art: implement the six glyphs for a set below and register
 * it in PIECE_SETS — every piece just needs to render inside a 45x45 viewBox
 * and respect the palette/color it is given. Nothing else in the app
 * references artwork.
 */

interface Palette {
  fill: string;
  stroke: string;
  detail: string;
  /** Football set only: team identity (helmet for pawns, logo for kings,
      mascot head for queens). */
  helmet?: HelmetSpec;
  logo?: string;
  initial?: string;
  teamId?: string;
}

const WHITE: Palette = { fill: '#f7f4ea', stroke: '#3f3b35', detail: '#3f3b35' };
const BLACK: Palette = { fill: '#43403b', stroke: '#221f1c', detail: '#e9e5da' };

const WOOD_WHITE: Palette = { fill: '#e8c99b', stroke: '#8a5a2b', detail: '#8a5a2b' };
const WOOD_BLACK: Palette = { fill: '#7c4a1e', stroke: '#3e2410', detail: '#f0ddc0' };

const common = {
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

type GlyphComponent = (props: { p: Palette }) => React.ReactElement;
type GlyphMap = Record<PieceSymbol, GlyphComponent>;

function Base({ x, width, p }: { x: number; width: number; p: Palette }) {
  return <rect x={x} y={35.2} width={width} height={3.6} rx={1.4} fill={p.fill} stroke={p.stroke} {...common} />;
}

/* ------------------------------------------------------------------ */
/* Classic (also reused by Wood and partially by Tennessee)            */
/* ------------------------------------------------------------------ */

function ClassicPawn({ p }: { p: Palette }) {
  return (
    <>
      <path
        d="M 22.5,8 C 20,8 18,10 18,12.5 C 18,13.9 18.6,15.1 19.6,15.95 C 17.2,17.3 15.5,19.9 15.5,22.8 C 15.5,25.4 16.7,27.7 18.6,29.2 L 16.2,29.2 L 14.9,34.4 L 30.1,34.4 L 28.8,29.2 L 26.4,29.2 C 28.3,27.7 29.5,25.4 29.5,22.8 C 29.5,19.9 27.8,17.3 25.4,15.95 C 26.4,15.1 27,13.9 27,12.5 C 27,10 25,8 22.5,8 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <Base x={12.5} width={20} p={p} />
    </>
  );
}

function ClassicRook({ p }: { p: Palette }) {
  return (
    <>
      <path
        d="M 12,9 L 16.5,9 L 16.5,12 L 20,12 L 20,9 L 25,9 L 25,12 L 28.5,12 L 28.5,9 L 33,9 L 33,16 L 30,19 L 30,31 L 33,34.4 L 12,34.4 L 15,31 L 15,19 L 12,16 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <path d="M 15,19 L 30,19 M 15,31 L 30,31" fill="none" stroke={p.stroke} {...common} strokeWidth={1.2} />
      <Base x={10.5} width={24} p={p} />
    </>
  );
}

function ClassicKnight({ p }: { p: Palette }) {
  return (
    <>
      <path
        d="M 31.5,34.4 C 32,27.5 31.5,24 28.7,20.6 C 29.6,17.6 29.2,13.8 27.2,11.4 L 26.1,8.2 L 23.6,11.9 C 22.6,11.7 21.5,11.9 20.5,12.5 C 16.6,14.9 13.4,19.6 12.4,23.1 C 12,24.7 12.6,25.6 13.9,25.4 C 15.6,25.1 16.9,24.1 18.1,23.3 C 18.7,22.9 19.4,23.1 19.6,23.7 C 19.9,24.6 19,25.6 17.8,27 C 15.9,29.2 14.6,31 14.4,34.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <circle cx={22.3} cy={16.6} r={1.15} fill={p.detail} stroke="none" />
      <path d="M 14.9,23.2 L 15.8,22" fill="none" stroke={p.detail} strokeWidth={1.1} strokeLinecap="round" />
      <Base x={11.5} width={22} p={p} />
    </>
  );
}

function ClassicBishop({ p }: { p: Palette }) {
  return (
    <>
      <circle cx={22.5} cy={8} r={2.1} fill={p.fill} stroke={p.stroke} {...common} />
      <path
        d="M 22.5,10.8 C 19.4,13.4 16.4,17.5 16.4,21.9 C 16.4,25.4 18.9,28.3 22.5,28.3 C 26.1,28.3 28.6,25.4 28.6,21.9 C 28.6,17.5 25.6,13.4 22.5,10.8 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <path d="M 22.5,15.2 L 22.5,21.4 M 19.8,18.3 L 25.2,18.3" fill="none" stroke={p.detail} strokeWidth={1.4} strokeLinecap="round" />
      <path
        d="M 18.3,31.6 C 18.3,29.9 20,28.9 22.5,28.9 C 25,28.9 26.7,29.9 26.7,31.6 L 27.6,34.4 L 17.4,34.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <Base x={13} width={19} p={p} />
    </>
  );
}

function ClassicQueen({ p }: { p: Palette }) {
  return (
    <>
      {[
        [9.2, 12],
        [15.4, 8.6],
        [22.5, 7.4],
        [29.6, 8.6],
        [35.8, 12],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={1.7} fill={p.fill} stroke={p.stroke} {...common} strokeWidth={1.3} />
      ))}
      <path
        d="M 11.6,26.2 L 9.6,14.8 L 15.7,21.6 L 15.5,11.5 L 20.2,20.4 L 22.5,10.2 L 24.8,20.4 L 29.5,11.5 L 29.3,21.6 L 35.4,14.8 L 33.4,26.2 C 30,27.8 15,27.8 11.6,26.2 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <path d="M 12.4,28.6 C 17,30 28,30 32.6,28.6" fill="none" stroke={p.stroke} {...common} strokeWidth={1.4} />
      <path
        d="M 13.9,30.8 L 12.6,34.4 L 32.4,34.4 L 31.1,30.8 C 26,32.2 19,32.2 13.9,30.8 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <Base x={10.5} width={24} p={p} />
    </>
  );
}

function ClassicKing({ p }: { p: Palette }) {
  return (
    <>
      <path
        d="M 21,5 L 24,5 L 24,8.2 L 27.2,8.2 L 27.2,11.2 L 24,11.2 L 24,13.6 L 21,13.6 L 21,11.2 L 17.8,11.2 L 17.8,8.2 L 21,8.2 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
        strokeWidth={1.3}
      />
      <path
        d="M 22.5,14.4 C 19.6,14.4 17.9,16.4 17.9,18.9 C 17.9,20.3 18.5,21.5 19.4,22.4 C 15.9,21 11.4,22.4 11.4,26.6 C 11.4,29.8 14.3,31.4 17.2,30.6 L 16.6,34.4 L 28.4,34.4 L 27.8,30.6 C 30.7,31.4 33.6,29.8 33.6,26.6 C 33.6,22.4 29.1,21 25.6,22.4 C 26.5,21.5 27.1,20.3 27.1,18.9 C 27.1,16.4 25.4,14.4 22.5,14.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <path d="M 17.2,27.1 C 20.5,25.6 24.5,25.6 27.8,27.1" fill="none" stroke={p.detail} strokeWidth={1.3} strokeLinecap="round" />
      <Base x={12} width={21} p={p} />
    </>
  );
}

const CLASSIC: GlyphMap = {
  p: ClassicPawn,
  r: ClassicRook,
  n: ClassicKnight,
  b: ClassicBishop,
  q: ClassicQueen,
  k: ClassicKing,
};

/* ------------------------------------------------------------------ */
/* Glyph — crisp Unicode chess characters                              */
/* ------------------------------------------------------------------ */

const GLYPH_CHARS: Record<PieceSymbol, string> = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' };

function glyphFor(type: PieceSymbol): GlyphComponent {
  return function Glyph({ p }: { p: Palette }) {
    return (
      <text
        x={22.5}
        y={24}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={40}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={1.1}
        paintOrder="stroke"
        style={{ fontFamily: '"Segoe UI Symbol", "Noto Sans Symbols 2", serif' }}
      >
        {GLYPH_CHARS[type]}
      </text>
    );
  };
}

const GLYPH: GlyphMap = {
  p: glyphFor('p'),
  r: glyphFor('r'),
  n: glyphFor('n'),
  b: glyphFor('b'),
  q: glyphFor('q'),
  k: glyphFor('k'),
};

/* ------------------------------------------------------------------ */
/* 8-Bit — pixel-art pieces                                            */
/* ------------------------------------------------------------------ */

const PIXEL_MAPS: Record<PieceSymbol, string[]> = {
  p: [
    '....####....',
    '...######...',
    '...######...',
    '....####....',
    '.....##.....',
    '....####....',
    '....####....',
    '....####....',
    '...######...',
    '...######...',
    '..########..',
    '.##########.',
    '.##########.',
  ],
  r: [
    '.##..##..##.',
    '.##..##..##.',
    '.##########.',
    '..########..',
    '...######...',
    '...######...',
    '...######...',
    '...######...',
    '...######...',
    '..########..',
    '..########..',
    '.##########.',
    '.##########.',
  ],
  n: [
    '.....###....',
    '....#####...',
    '...#######..',
    '..#########.',
    '.#####..###.',
    '.###....###.',
    '.#.....####.',
    '......#####.',
    '.....######.',
    '....#######.',
    '...########.',
    '..#########.',
    '..#########.',
  ],
  b: [
    '.....##.....',
    '....####....',
    '...######...',
    '...##..##...',
    '...##..##...',
    '...######...',
    '....####....',
    '....####....',
    '.....##.....',
    '....####....',
    '...######...',
    '..########..',
    '.##########.',
  ],
  q: [
    '.#...##...#.',
    '.#...##...#.',
    '.##..##..##.',
    '.##..##..##.',
    '..########..',
    '..########..',
    '...######...',
    '...######...',
    '...######...',
    '..########..',
    '..########..',
    '.##########.',
    '.##########.',
  ],
  k: [
    '.....##.....',
    '...######...',
    '.....##.....',
    '....####....',
    '...######...',
    '..########..',
    '..########..',
    '...######...',
    '...######...',
    '...######...',
    '..########..',
    '.##########.',
    '.##########.',
  ],
};

function pixelFor(type: PieceSymbol): GlyphComponent {
  const rows = PIXEL_MAPS[type];
  return function Pixel({ p }: { p: Palette }) {
    const w = rows[0].length;
    const h = rows.length;
    const cell = 34 / Math.max(w, h);
    const ox = (45 - w * cell) / 2;
    const oy = 45 - 5 - h * cell;
    const cells: { x: number; y: number }[] = [];
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '#') cells.push({ x, y });
      });
    });
    return (
      <g shapeRendering="crispEdges">
        {/* outline pass: slightly enlarged squares behind the body */}
        {cells.map(({ x, y }) => (
          <rect
            key={`o${x}-${y}`}
            x={ox + x * cell - 0.9}
            y={oy + y * cell - 0.9}
            width={cell + 1.8}
            height={cell + 1.8}
            fill={p.stroke}
          />
        ))}
        {cells.map(({ x, y }) => (
          <rect key={`f${x}-${y}`} x={ox + x * cell} y={oy + y * cell} width={cell + 0.05} height={cell + 0.05} fill={p.fill} />
        ))}
      </g>
    );
  };
}

const PIXEL: GlyphMap = {
  p: pixelFor('p'),
  r: pixelFor('r'),
  n: pixelFor('n'),
  b: pixelFor('b'),
  q: pixelFor('q'),
  k: pixelFor('k'),
};

/* ------------------------------------------------------------------ */
/* Flat — minimal geometric silhouettes                                */
/* ------------------------------------------------------------------ */

const flatStroke = { strokeWidth: 1.4, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

const FLAT: GlyphMap = {
  p: ({ p }) => (
    <>
      <circle cx={22.5} cy={14} r={6} fill={p.fill} stroke={p.stroke} {...flatStroke} />
      <path d="M 18.5,20 L 27,20 L 30,34.4 L 15,34.4 z" fill={p.fill} stroke={p.stroke} {...flatStroke} />
      <Base x={13} width={19} p={p} />
    </>
  ),
  r: ({ p }) => (
    <>
      <path
        d="M 13,9 h4 v4 h3.5 v-4 h4 v4 h3.5 v-4 h4 v9 h-19 z M 15,18 h15 v16.4 h-15 z"
        fill={p.fill}
        stroke={p.stroke}
        {...flatStroke}
      />
      <Base x={11.5} width={22} p={p} />
    </>
  ),
  n: ({ p }) => (
    <>
      <path
        d="M 15,34.4 L 15,24 Q 15,12 25,10 L 24.5,7 L 29,11 Q 32,13 31,17 L 26,19 Q 23,17 21.5,19.5 Q 20.5,21.5 23,23 L 30,27 L 30,34.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...flatStroke}
      />
      <Base x={12.5} width={20} p={p} />
    </>
  ),
  b: ({ p }) => (
    <>
      <path
        d="M 22.5,7.5 Q 30.5,17 30.5,25 Q 30.5,33 22.5,33 Q 14.5,33 14.5,25 Q 14.5,17 22.5,7.5 z"
        fill={p.fill}
        stroke={p.stroke}
        {...flatStroke}
      />
      <path d="M 22.5,14 L 22.5,22 M 18.7,18 L 26.3,18" fill="none" stroke={p.detail} strokeWidth={1.6} strokeLinecap="round" />
      <Base x={13} width={19} p={p} />
    </>
  ),
  q: ({ p }) => (
    <>
      <path
        d="M 10.5,30 L 13,12 L 18.2,20.5 L 22.5,9 L 26.8,20.5 L 32,12 L 34.5,30 z"
        fill={p.fill}
        stroke={p.stroke}
        {...flatStroke}
      />
      <path d="M 12,32.5 h 21" fill="none" stroke={p.stroke} strokeWidth={2.4} strokeLinecap="round" />
      <Base x={11} width={23} p={p} />
    </>
  ),
  k: ({ p }) => (
    <>
      <path d="M 20.7,5.5 h3.6 v4 h4 v3.6 h-4 v4 h-3.6 v-4 h-4 v-3.6 h4 z" fill={p.fill} stroke={p.stroke} {...flatStroke} />
      <rect x={14} y={18} width={17} height={16.4} rx={4.5} fill={p.fill} stroke={p.stroke} {...flatStroke} />
      <Base x={12} width={21} p={p} />
    </>
  ),
};

/* ------------------------------------------------------------------ */
/* Bubble — extra-round, cute                                          */
/* ------------------------------------------------------------------ */

const bub = { strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

const BUBBLE: GlyphMap = {
  p: ({ p }) => (
    <>
      <circle cx={22.5} cy={13} r={6.5} fill={p.fill} stroke={p.stroke} {...bub} />
      <circle cx={22.5} cy={25} r={8.5} fill={p.fill} stroke={p.stroke} {...bub} />
      <rect x={13} y={32} width={19} height={6} rx={3} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
  r: ({ p }) => (
    <>
      <circle cx={15} cy={11} r={2.8} fill={p.fill} stroke={p.stroke} {...bub} />
      <circle cx={22.5} cy={9.5} r={2.8} fill={p.fill} stroke={p.stroke} {...bub} />
      <circle cx={30} cy={11} r={2.8} fill={p.fill} stroke={p.stroke} {...bub} />
      <rect x={13.5} y={13} width={18} height={20} rx={6} fill={p.fill} stroke={p.stroke} {...bub} />
      <rect x={11.5} y={32} width={22} height={6} rx={3} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
  n: ({ p }) => (
    <>
      <path d="M 19,12 L 16.5,6.5 L 22,9.5 z" fill={p.fill} stroke={p.stroke} {...bub} />
      <path d="M 26,12 L 28.5,6.5 L 23,9.5 z" fill={p.fill} stroke={p.stroke} {...bub} />
      <circle cx={22.5} cy={17} r={8.5} fill={p.fill} stroke={p.stroke} {...bub} />
      <ellipse cx={17.5} cy={21} rx={5} ry={4} fill={p.fill} stroke={p.stroke} {...bub} />
      <circle cx={20} cy={15} r={1.3} fill={p.detail} stroke="none" />
      <rect x={14} y={26} width={17} height={8} rx={4} fill={p.fill} stroke={p.stroke} {...bub} />
      <rect x={12} y={32} width={21} height={6} rx={3} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
  b: ({ p }) => (
    <>
      <circle cx={22.5} cy={7.5} r={2.5} fill={p.fill} stroke={p.stroke} {...bub} />
      <path
        d="M 22.5,11 Q 30,19 30,25.5 Q 30,32 22.5,32 Q 15,32 15,25.5 Q 15,19 22.5,11 z"
        fill={p.fill}
        stroke={p.stroke}
        {...bub}
      />
      <path d="M 22.5,17 L 22.5,24 M 19.2,20.5 L 25.8,20.5" fill="none" stroke={p.detail} strokeWidth={1.8} strokeLinecap="round" />
      <rect x={12.5} y={32} width={20} height={6} rx={3} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
  q: ({ p }) => (
    <>
      {[
        [11, 10.5],
        [17, 7.5],
        [22.5, 6.5],
        [28, 7.5],
        [34, 10.5],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={2.4} fill={p.fill} stroke={p.stroke} {...bub} strokeWidth={1.6} />
      ))}
      <path d="M 13,14 Q 22.5,20 32,14 L 31,27 Q 22.5,31 14,27 z" fill={p.fill} stroke={p.stroke} {...bub} />
      <ellipse cx={22.5} cy={29.5} rx={9.5} ry={4} fill={p.fill} stroke={p.stroke} {...bub} />
      <rect x={11.5} y={32.5} width={22} height={5.8} rx={2.9} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
  k: ({ p }) => (
    <>
      <path d="M 20.8,4.5 h3.4 v3.4 h3.4 v3.4 h-3.4 v3.4 h-3.4 v-3.4 h-3.4 v-3.4 h3.4 z" fill={p.fill} stroke={p.stroke} strokeWidth={1.6} strokeLinejoin="round" />
      <circle cx={22.5} cy={24} r={10} fill={p.fill} stroke={p.stroke} {...bub} />
      <path d="M 16.5,26.5 Q 22.5,23 28.5,26.5" fill="none" stroke={p.detail} strokeWidth={1.8} strokeLinecap="round" />
      <rect x={11.5} y={32.5} width={22} height={5.8} rx={2.9} fill={p.fill} stroke={p.stroke} {...bub} />
    </>
  ),
};

/* ------------------------------------------------------------------ */
/* Football — standard white/black pieces; the pawns suit up in their  */
/* team's real helmet over a plain 00 jersey                           */
/* ------------------------------------------------------------------ */

/** Pawn: football player — team-accurate helmet, plain 00 jersey. */
function FbPawn({ p }: { p: Palette }) {
  const h = p.helmet ?? { shell: p.fill, stripe: p.detail, mask: p.detail };
  return (
    <>
      {/* Jersey */}
      <path
        d="M 11.5,34.4 L 13.5,26 Q 17,22.4 22.5,22.4 Q 28,22.4 31.5,26 L 33.5,34.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <text x={22.5} y={32.4} textAnchor="middle" fontSize={8} fontWeight={900} fill={p.detail} fontFamily="Verdana, sans-serif">
        00
      </text>
      {/* Helmet shell */}
      <path
        d="M 14,15 a 8.5,8.8 0 0 1 17,0 v 3.6 a 1.9,1.9 0 0 1 -1.9,1.9 h -13.2 a 1.9,1.9 0 0 1 -1.9,-1.9 z"
        fill={h.shell}
        stroke={p.stroke}
        {...common}
        strokeWidth={1.4}
      />
      {/* Face opening (dark, so any facemask color stays visible) */}
      <path d="M 16.9,12.8 h 11.2 v 5.4 a 1.7,1.7 0 0 1 -1.7,1.7 h -7.8 a 1.7,1.7 0 0 1 -1.7,-1.7 z" fill="#2b2b2b" />
      {/* Center stripe, or the winged design for Michigan */}
      {h.wing ? (
        <path
          d="M 14.7,13.2 a 8.2,8.5 0 0 1 15.6,0 l -2.5,-1.4 -2.6,1.8 -2.7,-2.1 -2.7,2.1 -2.6,-1.8 z"
          fill={h.stripe}
          stroke={p.stroke}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ) : (
        <path d="M 21.2,6.5 q 1.3,-0.3 2.6,0 v 5.3 h -2.6 z" fill={h.stripe} stroke="none" />
      )}
      {/* Facemask */}
      <path
        d="M 17.8,15.1 h 9.4 M 17.8,17.7 h 9.4 M 22.5,13.4 v 5.8"
        fill="none"
        stroke={h.mask}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Base x={11} width={23} p={p} />
    </>
  );
}

/** Queen: the team's mascot head wearing a tiara, atop a royal gown. */
function FbQueen({ p }: { p: Palette }) {
  return (
    <>
      {/* Gown */}
      <path d="M 16.5,24.5 L 28.5,24.5 L 32,34.4 L 13,34.4 z" fill={p.fill} stroke={p.stroke} {...common} />
      {/* Mascot head */}
      <MascotHead teamId={p.teamId} p={p} />
      {/* Tiara collar between head and gown */}
      <path
        d="M 15.6,25.6 L 16.4,20.6 L 19.6,23.2 L 22.5,19.6 L 25.4,23.2 L 28.6,20.6 L 29.4,25.6 z"
        fill={p.detail}
        stroke={p.stroke}
        {...common}
        strokeWidth={1.2}
      />
      <Base x={10.5} width={24} p={p} />
    </>
  );
}

/** King: the classic king, but the team's actual logo replaces the cross. */
function FbKing({ p }: { p: Palette }) {
  return (
    <>
      {/* Logo emblem where the cross would sit */}
      <circle cx={22.5} cy={8.2} r={5.6} fill="#ffffff" stroke={p.stroke} {...common} strokeWidth={1.3} />
      <text x={22.5} y={10.8} textAnchor="middle" fontSize={7.5} fontWeight={900} fill={p.detail} stroke={p.stroke} strokeWidth={0.4} fontFamily="Verdana, sans-serif">
        {p.initial ?? 'K'}
      </text>
      {p.logo && <image href={p.logo} x={17.9} y={3.6} width={9.2} height={9.2} />}
      {/* Classic king body */}
      <path
        d="M 22.5,14.4 C 19.6,14.4 17.9,16.4 17.9,18.9 C 17.9,20.3 18.5,21.5 19.4,22.4 C 15.9,21 11.4,22.4 11.4,26.6 C 11.4,29.8 14.3,31.4 17.2,30.6 L 16.6,34.4 L 28.4,34.4 L 27.8,30.6 C 30.7,31.4 33.6,29.8 33.6,26.6 C 33.6,22.4 29.1,21 25.6,22.4 C 26.5,21.5 27.1,20.3 27.1,18.9 C 27.1,16.4 25.4,14.4 22.5,14.4 z"
        fill={p.fill}
        stroke={p.stroke}
        {...common}
      />
      <path d="M 17.2,27.1 C 20.5,25.6 24.5,25.6 27.8,27.1" fill="none" stroke={p.detail} strokeWidth={1.3} strokeLinecap="round" />
      <Base x={12} width={21} p={p} />
    </>
  );
}

const FOOTBALL: GlyphMap = {
  p: FbPawn,
  r: ClassicRook,
  n: ClassicKnight,
  b: ClassicBishop,
  q: FbQueen,
  k: FbKing,
};

/* ------------------------------------------------------------------ */
/* Registry                                                            */
/* ------------------------------------------------------------------ */

interface PieceSet {
  id: PieceSetId;
  label: string;
  glyphs: GlyphMap;
  white: Palette;
  black: Palette;
}

export const PIECE_SETS: readonly PieceSet[] = [
  { id: 'classic', label: 'Classic', glyphs: CLASSIC, white: WHITE, black: BLACK },
  { id: 'wood', label: 'Wood', glyphs: CLASSIC, white: WOOD_WHITE, black: WOOD_BLACK },
  { id: 'glyph', label: 'Glyph', glyphs: GLYPH, white: WHITE, black: BLACK },
  { id: 'pixel', label: '8-Bit', glyphs: PIXEL, white: WHITE, black: BLACK },
  { id: 'flat', label: 'Flat', glyphs: FLAT, white: WHITE, black: BLACK },
  { id: 'bubble', label: 'Bubble', glyphs: BUBBLE, white: WHITE, black: BLACK },
  { id: 'football', label: 'Football 🏈', glyphs: FOOTBALL, white: WHITE, black: BLACK },
] as const;

export interface PieceSetConfig {
  set: PieceSetId;
  /** Which program each side represents (used by the football set). */
  teams: { w: Team; b: Team };
}

export const PieceSetContext = createContext<PieceSetConfig>({
  set: 'classic',
  teams: { w: teamById('tennessee'), b: teamById('alabama') },
});

export function PieceGlyph({ type, color, className }: { type: PieceSymbol; color: Color; className?: string }) {
  const config = useContext(PieceSetContext);
  const set = PIECE_SETS.find((s) => s.id === config.set) ?? PIECE_SETS[0];
  const Glyph = set.glyphs[type];
  const base = color === 'w' ? set.white : set.black;
  const team = config.teams[color];
  const palette: Palette =
    config.set === 'football'
      ? { ...base, helmet: helmetFor(team), logo: logoUrl(team), initial: team.school[0], teamId: team.id }
      : base;
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden="true" focusable="false">
      <Glyph p={palette} />
    </svg>
  );
}
