import type { Color, Move, PieceSymbol, Square } from 'chess.js';

export type { Color, Move, PieceSymbol, Square };

/** A piece with a stable identity so it can animate between squares. */
export interface PieceOnBoard {
  id: number;
  type: PieceSymbol;
  color: Color;
  square: Square;
}

/** One half-move in the game record. */
export interface HistoryEntry {
  san: string;
  /** FEN after the move was played. */
  fen: string;
  move: Move;
}

export type GameResult = '1-0' | '0-1' | '1/2-1/2';

export interface GameEnd {
  result: GameResult;
  /** Human-readable reason, e.g. "Checkmate", "Stalemate". */
  reason: string;
  /** Full status line, e.g. "Checkmate — White wins". */
  message: string;
}

/** Who controls each color. */
export type SideMode = 'white' | 'black' | 'both' | 'watch';

export interface DifficultyLevel {
  /** Approximate playing strength in Elo. */
  elo: number;
  /** College-themed tier name. */
  label: string;
  /** Stockfish Skill Level 0-20 (drives weak levels + is a safe fallback). */
  skill: number;
  depth: number;
  movetime: number;
  /**
   * When true, use Stockfish's UCI_LimitStrength + UCI_Elo to hit the target
   * Elo. Stockfish's Elo limiter bottoms out around 1320, so weaker levels
   * rely on Skill Level + shallow search instead.
   */
  limitElo: boolean;
}

/** 15 strength levels spanning ~300 to full-strength (~3000+) Elo. */
export const DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [
  { elo: 300, label: 'Pop Warner', skill: 0, depth: 1, movetime: 100, limitElo: false },
  { elo: 500, label: 'Middle School', skill: 1, depth: 1, movetime: 120, limitElo: false },
  { elo: 700, label: 'JV', skill: 2, depth: 2, movetime: 140, limitElo: false },
  { elo: 900, label: 'Varsity', skill: 4, depth: 2, movetime: 160, limitElo: false },
  { elo: 1100, label: 'All-District', skill: 6, depth: 3, movetime: 200, limitElo: false },
  { elo: 1300, label: 'All-State', skill: 8, depth: 4, movetime: 250, limitElo: false },
  { elo: 1500, label: 'Recruit', skill: 10, depth: 6, movetime: 300, limitElo: true },
  { elo: 1700, label: 'Walk-On', skill: 12, depth: 7, movetime: 350, limitElo: true },
  { elo: 1900, label: 'Scholarship', skill: 14, depth: 8, movetime: 450, limitElo: true },
  { elo: 2100, label: 'Starter', skill: 16, depth: 9, movetime: 550, limitElo: true },
  { elo: 2300, label: 'All-Conference', skill: 17, depth: 11, movetime: 650, limitElo: true },
  { elo: 2500, label: 'All-American', skill: 18, depth: 13, movetime: 800, limitElo: true },
  { elo: 2700, label: 'Heisman', skill: 19, depth: 15, movetime: 1000, limitElo: true },
  { elo: 2850, label: 'Draft Pick', skill: 20, depth: 18, movetime: 1200, limitElo: true },
  { elo: 3000, label: 'Hall of Fame', skill: 20, depth: 24, movetime: 1600, limitElo: false },
] as const;

/** Overall app skin. */
export type AppTheme = 'classic' | 'college';

/** Available piece design sets. */
export type PieceSetId = 'classic' | 'wood' | 'glyph' | 'pixel' | 'flat' | 'bubble' | 'football';

export type Conference = 'SEC' | 'Big Ten' | 'Big 12' | 'ACC';

/** A college football program. */
export interface Team {
  id: string;
  /** ESPN team id — used for the official logo image URL. */
  espnId: string;
  school: string;
  mascot: string;
  abbrev: string;
  conference: Conference;
  primary: string;
  secondary: string;
}

export interface TimeControl {
  id: string;
  label: string;
  /** Starting time per side in ms; 0 = no clock. */
  baseMs: number;
  /** Increment per move in ms. */
  incMs: number;
}

export const TIME_CONTROLS: readonly TimeControl[] = [
  { id: 'off', label: 'No clock', baseMs: 0, incMs: 0 },
  { id: 'bullet1', label: 'Bullet 1+0', baseMs: 60_000, incMs: 0 },
  { id: 'bullet2', label: 'Bullet 2+1', baseMs: 120_000, incMs: 1_000 },
  { id: 'blitz3', label: 'Blitz 3+2', baseMs: 180_000, incMs: 2_000 },
  { id: 'blitz5', label: 'Blitz 5+0', baseMs: 300_000, incMs: 0 },
  { id: 'rapid10', label: 'Rapid 10+0', baseMs: 600_000, incMs: 0 },
  { id: 'rapid15', label: 'Rapid 15+10', baseMs: 900_000, incMs: 10_000 },
  { id: 'classical30', label: 'Classical 30+0', baseMs: 1_800_000, incMs: 0 },
] as const;

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const PIECE_NAMES: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function squareToCoords(square: Square): { file: number; rank: number } {
  return {
    file: square.charCodeAt(0) - 97, // 'a' -> 0
    rank: square.charCodeAt(1) - 49, // '1' -> 0
  };
}

export function coordsToSquare(file: number, rank: number): Square | null {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return (FILES[file] + RANKS[rank]) as Square;
}
