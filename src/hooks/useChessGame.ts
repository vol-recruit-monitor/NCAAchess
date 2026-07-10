import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Color, GameEnd, HistoryEntry, Move, PieceOnBoard, Square } from '../types';
import { applyMoveToPieces, detectGameEnd, piecesFromFen } from '../lib/gameUtils';

interface GameState {
  fen: string;
  pieces: PieceOnBoard[];
  history: HistoryEntry[];
  /** Number of half-moves currently displayed (history.length = live). */
  viewIndex: number;
  gameEnd: GameEnd | null;
  /** Increments whenever the game is reset/rewound (invalidates engine searches). */
  epoch: number;
}

/** What the board should render for the current view (live or review). */
export interface DisplayedPosition {
  pieces: PieceOnBoard[];
  lastMove: Move | null;
  inCheck: boolean;
  turn: Color;
  isLive: boolean;
}

export interface ChessGame {
  fen: string;
  turn: Color;
  inCheck: boolean;
  history: HistoryEntry[];
  viewIndex: number;
  gameEnd: GameEnd | null;
  epoch: number;
  displayed: DisplayedPosition;
  makeMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => Move | null;
  legalMoves: (square: Square) => Move[];
  isPromotion: (from: Square, to: Square) => boolean;
  undo: (halfMoves: number) => void;
  reset: () => void;
  resign: (color: Color) => void;
  timeout: (color: Color) => void;
  setViewIndex: (index: number) => void;
}

function freshState(epoch: number): GameState {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    pieces: piecesFromFen(chess.fen()),
    history: [],
    viewIndex: 0,
    gameEnd: null,
    epoch,
  };
}

export function useChessGame(): ChessGame {
  const chessRef = useRef<Chess | null>(null);
  if (!chessRef.current) chessRef.current = new Chess();
  const chess = chessRef.current;

  const [state, setState] = useState<GameState>(() => freshState(0));
  // Resignation ends the game without the board knowing — makeMove must not
  // mutate the Chess instance afterwards or state and instance would diverge.
  const resignedRef = useRef(false);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): Move | null => {
      if (resignedRef.current || detectGameEnd(chess)) return null;
      let move: Move;
      try {
        move = chess.move({ from, to, promotion });
      } catch {
        return null; // illegal move
      }
      setState((prev) => {
        if (prev.gameEnd) return prev; // e.g. resigned while engine was thinking
        const history = [...prev.history, { san: move.san, fen: chess.fen(), move }];
        return {
          ...prev,
          fen: chess.fen(),
          pieces: applyMoveToPieces(prev.pieces, move),
          history,
          // Follow the live game unless the user is reviewing an old position.
          viewIndex: prev.viewIndex === prev.history.length ? history.length : prev.viewIndex,
          gameEnd: detectGameEnd(chess),
        };
      });
      return move;
    },
    [chess],
  );

  const legalMoves = useCallback((square: Square) => chess.moves({ square, verbose: true }), [chess]);

  const isPromotion = useCallback(
    (from: Square, to: Square) =>
      chess.moves({ square: from, verbose: true }).some((m) => m.to === to && m.promotion !== undefined),
    [chess],
  );

  const undo = useCallback(
    (halfMoves: number) => {
      let undone = 0;
      for (let i = 0; i < halfMoves; i++) {
        if (!chess.undo()) break;
        undone++;
      }
      if (undone === 0) return;
      resignedRef.current = false;
      setState((prev) => ({
        ...prev,
        fen: chess.fen(),
        pieces: piecesFromFen(chess.fen()),
        history: prev.history.slice(0, prev.history.length - undone),
        viewIndex: prev.history.length - undone,
        gameEnd: null,
        epoch: prev.epoch + 1,
      }));
    },
    [chess],
  );

  const reset = useCallback(() => {
    chess.reset();
    resignedRef.current = false;
    setState((prev) => freshState(prev.epoch + 1));
  }, [chess]);

  const resign = useCallback((color: Color) => {
    resignedRef.current = true;
    const winner = color === 'w' ? 'Black' : 'White';
    setState((prev) => {
      if (prev.gameEnd) return prev;
      return {
        ...prev,
        gameEnd: {
          result: winner === 'White' ? '1-0' : '0-1',
          reason: 'Resignation',
          message: `${color === 'w' ? 'White' : 'Black'} resigns — ${winner} wins`,
        },
        epoch: prev.epoch + 1,
      };
    });
  }, []);

  const timeout = useCallback((color: Color) => {
    resignedRef.current = true;
    const winner = color === 'w' ? 'Black' : 'White';
    setState((prev) => {
      if (prev.gameEnd) return prev;
      return {
        ...prev,
        gameEnd: {
          result: winner === 'White' ? '1-0' : '0-1',
          reason: 'Time forfeit',
          message: `${color === 'w' ? 'White' : 'Black'} ran out of time — ${winner} wins`,
        },
        epoch: prev.epoch + 1,
      };
    });
  }, []);

  const setViewIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, viewIndex: Math.max(0, Math.min(prev.history.length, index)) }));
  }, []);

  const displayed = useMemo<DisplayedPosition>(() => {
    const isLive = state.viewIndex === state.history.length;
    if (isLive) {
      return {
        pieces: state.pieces,
        lastMove: state.history[state.history.length - 1]?.move ?? null,
        inCheck: chess.inCheck(),
        turn: chess.turn(),
        isLive: true,
      };
    }
    const entry = state.viewIndex > 0 ? state.history[state.viewIndex - 1] : null;
    const fen = entry ? entry.fen : new Chess().fen();
    const position = new Chess(fen);
    return {
      pieces: piecesFromFen(fen),
      lastMove: entry?.move ?? null,
      inCheck: position.inCheck(),
      turn: position.turn(),
      isLive: false,
    };
  }, [state, chess]);

  return {
    fen: state.fen,
    turn: displayed.isLive ? displayed.turn : chess.turn(),
    inCheck: chess.inCheck(),
    history: state.history,
    viewIndex: state.viewIndex,
    gameEnd: state.gameEnd,
    epoch: state.epoch,
    displayed,
    makeMove,
    legalMoves,
    isPromotion,
    undo,
    reset,
    resign,
    timeout,
    setViewIndex,
  };
}
