import { Chess } from 'chess.js';
import type { Color, GameEnd, Move, PieceOnBoard, PieceSymbol, Square } from '../types';
import { PIECE_NAMES, PIECE_VALUES } from '../types';

let nextPieceId = 1;

/** Build a fresh piece list (new identities) from a position. */
export function piecesFromFen(fen: string): PieceOnBoard[] {
  const chess = new Chess(fen);
  const pieces: PieceOnBoard[] = [];
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell) pieces.push({ id: nextPieceId++, type: cell.type, color: cell.color, square: cell.square });
    }
  }
  return pieces;
}

/**
 * Apply a chess.js move to a piece list, preserving piece identities so the
 * board can animate. Handles captures, en passant, castling and promotion.
 */
export function applyMoveToPieces(pieces: PieceOnBoard[], move: Move): PieceOnBoard[] {
  let result = pieces;

  // Remove the captured piece. For en passant the captured pawn is not on
  // the destination square.
  if (move.flags.includes('e')) {
    const capturedSquare = (move.to[0] + move.from[1]) as Square;
    result = result.filter((p) => p.square !== capturedSquare);
  } else if (move.captured) {
    result = result.filter((p) => p.square !== move.to);
  }

  // Move the piece itself (and promote it if needed).
  result = result.map((p) =>
    p.square === move.from ? { ...p, square: move.to, type: move.promotion ?? p.type } : p,
  );

  // Castling also moves the rook.
  const rank = move.color === 'w' ? '1' : '8';
  if (move.flags.includes('k')) {
    result = result.map((p) => (p.square === (('h' + rank) as Square) ? { ...p, square: ('f' + rank) as Square } : p));
  } else if (move.flags.includes('q')) {
    result = result.map((p) => (p.square === (('a' + rank) as Square) ? { ...p, square: ('d' + rank) as Square } : p));
  }

  return result;
}

const START_COUNTS: Record<PieceSymbol, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };

export interface CapturedSummary {
  /** Pieces each color has lost, most valuable first. */
  lostBy: Record<Color, PieceSymbol[]>;
  /** Positive means White is up material. */
  advantage: number;
}

/** Derive captured pieces + material balance from the displayed position. */
export function capturedSummary(pieces: readonly PieceOnBoard[]): CapturedSummary {
  const counts: Record<Color, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };
  for (const p of pieces) counts[p.color][p.type]++;

  const lostBy: Record<Color, PieceSymbol[]> = { w: [], b: [] };
  for (const color of ['w', 'b'] as const) {
    for (const type of ['q', 'r', 'b', 'n', 'p'] as const) {
      const missing = START_COUNTS[type] - counts[color][type];
      for (let i = 0; i < missing; i++) lostBy[color].push(type);
    }
  }

  let advantage = 0;
  for (const p of pieces) advantage += (p.color === 'w' ? 1 : -1) * PIECE_VALUES[p.type];

  return { lostBy, advantage };
}

/** Determine whether the game has ended and why. */
export function detectGameEnd(chess: Chess): GameEnd | null {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    return {
      result: winner === 'White' ? '1-0' : '0-1',
      reason: 'Checkmate',
      message: `Checkmate — ${winner} wins`,
    };
  }
  if (chess.isStalemate()) {
    return { result: '1/2-1/2', reason: 'Stalemate', message: 'Stalemate — draw' };
  }
  if (chess.isThreefoldRepetition()) {
    return { result: '1/2-1/2', reason: 'Threefold repetition', message: 'Draw — threefold repetition' };
  }
  if (chess.isInsufficientMaterial()) {
    return { result: '1/2-1/2', reason: 'Insufficient material', message: 'Draw — insufficient material' };
  }
  if (chess.isDraw()) {
    return { result: '1/2-1/2', reason: 'Fifty-move rule', message: 'Draw — fifty-move rule' };
  }
  return null;
}

/** Spoken/announced description of a move for the aria-live region. */
export function describeMove(move: Move, inCheck: boolean, gameEnd: GameEnd | null): string {
  const mover = move.color === 'w' ? 'White' : 'Black';
  let text = `${mover} plays ${move.san}: ${PIECE_NAMES[move.piece]} from ${move.from} to ${move.to}`;
  if (move.flags.includes('k')) text = `${mover} castles kingside`;
  if (move.flags.includes('q')) text = `${mover} castles queenside`;
  if (move.captured) text += `, capturing ${PIECE_NAMES[move.captured]}`;
  if (move.promotion) text += `, promoting to ${PIECE_NAMES[move.promotion]}`;
  if (gameEnd) text += `. ${gameEnd.message}`;
  else if (inCheck) text += '. Check!';
  return text;
}
