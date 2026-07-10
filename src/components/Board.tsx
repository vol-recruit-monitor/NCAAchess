import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Color, Move, PieceOnBoard, Square } from '../types';
import { PIECE_NAMES, coordsToSquare, squareToCoords } from '../types';
import type { DisplayedPosition } from '../hooks/useChessGame';
import { PieceGlyph } from '../lib/pieces';
import { PromotionDialog } from './PromotionDialog';

interface Arrow {
  from: Square;
  to: Square;
  color: string;
}
interface SquareMark {
  square: Square;
  color: string;
}

/** Annotation color from modifier keys, chess.com-style. */
function annotationColor(e: { shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean }): string {
  if (e.shiftKey) return '#c8433b'; // red
  if (e.altKey) return '#3b74c8'; // blue
  if (e.ctrlKey || e.metaKey) return '#4c9a3a'; // green
  return '#e8892b'; // orange (default)
}

export interface BoardProps {
  displayed: DisplayedPosition;
  orientation: Color;
  /** Which color(s) the human may move right now; null = none. */
  movableColor: Color | 'both' | null;
  frozen: boolean; // game over
  legalMoves: (square: Square) => Move[];
  isPromotion: (from: Square, to: Square) => boolean;
  onHumanMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  onIllegalDrop: () => void;
  /** Optional per-square color override (e.g. team-colored back ranks). */
  squareColorFor?: (square: Square, isDark: boolean) => string;
  /** Draw a subtle grass/turf texture over the whole board. */
  turf?: boolean;
}

interface DragInfo {
  pieceId: number;
  from: Square;
  el: HTMLDivElement;
  rect: DOMRect;
  grabDX: number;
  grabDY: number;
  moved: boolean;
  wasSelected: boolean;
  pointerId: number;
}

/** Display-grid coordinates (0,0 = top-left of the rendered board). */
function toDisplay(square: Square, orientation: Color): { col: number; row: number } {
  const { file, rank } = squareToCoords(square);
  return orientation === 'w' ? { col: file, row: 7 - rank } : { col: 7 - file, row: rank };
}

function gridTransform(square: Square, orientation: Color): string {
  const { col, row } = toDisplay(square, orientation);
  return `translate(${col * 100}%, ${row * 100}%)`;
}

const Piece = memo(function Piece({
  piece,
  displaySquare,
  orientation,
  grabbable,
  registerRef,
}: {
  piece: PieceOnBoard;
  displaySquare: Square;
  orientation: Color;
  grabbable: boolean;
  registerRef: (id: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={(el) => registerRef(piece.id, el)}
      data-piece-square={piece.square}
      className={`absolute left-0 top-0 h-[12.5%] w-[12.5%] transition-transform duration-150 ease-out will-change-transform ${
        grabbable ? 'cursor-grab' : ''
      }`}
      style={{ transform: gridTransform(displaySquare, orientation) }}
    >
      <div className="piece-inner h-full w-full transition-[transform,filter] duration-100 ease-out">
        <PieceGlyph type={piece.type} color={piece.color} className="h-full w-full" />
      </div>
    </div>
  );
});

export function Board({
  displayed,
  orientation,
  movableColor,
  frozen,
  legalMoves,
  isPromotion,
  onHumanMove,
  onIllegalDrop,
  squareColorFor,
  turf,
}: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pieceEls = useRef(new Map<number, HTMLDivElement>());
  const dragRef = useRef<DragInfo | null>(null);

  const [selected, setSelected] = useState<Square | null>(null);
  const [hoverSquare, setHoverSquare] = useState<Square | null>(null);
  const [dragging, setDragging] = useState(false);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);

  // Right-drag annotations (desktop), chess.com-style.
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [marks, setMarks] = useState<SquareMark[]>([]);
  const [drawing, setDrawing] = useState<Arrow | null>(null);
  const annoRef = useRef<{ from: Square; pointerId: number; color: string } | null>(null);

  const clearAnnotations = useCallback(() => {
    setArrows([]);
    setMarks([]);
  }, []);

  // Wipe annotations whenever the shown position changes.
  useEffect(() => {
    setArrows([]);
    setMarks([]);
  }, [displayed.lastMove, displayed.pieces]);

  const piecesBySquare = useMemo(() => {
    const map = new Map<Square, PieceOnBoard>();
    for (const p of displayed.pieces) map.set(p.square, p);
    return map;
  }, [displayed.pieces]);

  const interactive = displayed.isLive && !frozen && movableColor !== null && !promo;

  const canGrab = useCallback(
    (piece: PieceOnBoard) =>
      interactive && piece.color === displayed.turn && (movableColor === 'both' || piece.color === movableColor),
    [interactive, displayed.turn, movableColor],
  );

  const selectedTargets = useMemo(() => {
    if (!selected || !displayed.isLive) return new Map<Square, Move>();
    const map = new Map<Square, Move>();
    for (const m of legalMoves(selected)) map.set(m.to, m);
    return map;
  }, [selected, displayed.isLive, legalMoves]);

  const checkSquare = useMemo(() => {
    if (!displayed.inCheck) return null;
    return displayed.pieces.find((p) => p.type === 'k' && p.color === displayed.turn)?.square ?? null;
  }, [displayed]);

  const registerRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) pieceEls.current.set(id, el);
    else pieceEls.current.delete(id);
  }, []);

  const squareFromPoint = useCallback(
    (clientX: number, clientY: number): Square | null => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      if (x < 0 || x >= 1 || y < 0 || y >= 1) return null;
      const col = Math.floor(x * 8);
      const row = Math.floor(y * 8);
      const file = orientation === 'w' ? col : 7 - col;
      const rank = orientation === 'w' ? 7 - row : row;
      return coordsToSquare(file, rank);
    },
    [orientation],
  );

  /** Attempt a move; opens the promotion picker when needed. */
  const attemptMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (isPromotion(from, to)) {
        setPromo({ from, to });
        return true; // visually parked on the target square until confirmed
      }
      return onHumanMove(from, to);
    },
    [isPromotion, onHumanMove],
  );

  const settlePiece = useCallback((drag: DragInfo, snapped: boolean) => {
    const el = drag.el;
    el.style.transition = '';
    el.style.zIndex = '';
    el.querySelector<HTMLElement>('.piece-inner')?.classList.remove('piece-lifted');
    // If the move failed (or was a plain click) React state didn't change, so
    // restore the grid transform ourselves — CSS transitions it back smoothly.
    if (!snapped) {
      const square = (el.dataset.pieceSquare ?? drag.from) as Square;
      el.style.transform = gridTransform(square, orientationRef.current);
    }
  }, []);

  // Keep latest orientation reachable from stable callbacks.
  const orientationRef = useRef(orientation);
  orientationRef.current = orientation;

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setHoverSquare(null);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (promo) return;
      if (e.button === 2) {
        // Right button: start drawing an arrow / square highlight.
        const square = squareFromPoint(e.clientX, e.clientY);
        if (!square) return;
        const color = annotationColor(e);
        annoRef.current = { from: square, pointerId: e.pointerId, color };
        setDrawing({ from: square, to: square, color });
        try {
          containerRef.current?.setPointerCapture(e.pointerId);
        } catch {
          // ignore uncaptured pointers
        }
        return;
      }
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      // A left/touch press clears any annotations, chess.com-style.
      clearAnnotations();
      const square = squareFromPoint(e.clientX, e.clientY);
      if (!square) return;

      // Click-to-move: if a piece is selected and this square is a target,
      // move immediately on press (feels snappy).
      if (selected && selected !== square && selectedTargets.has(square)) {
        const from = selected;
        setSelected(null);
        if (!attemptMove(from, square)) onIllegalDrop();
        return;
      }

      const piece = piecesBySquare.get(square);
      if (!piece || !canGrab(piece)) {
        setSelected(null);
        return;
      }

      // Grab the piece.
      const el = pieceEls.current.get(piece.id);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!el || !rect) return;

      const { col, row } = toDisplay(square, orientation);
      const sq = rect.width / 8;
      dragRef.current = {
        pieceId: piece.id,
        from: square,
        el,
        rect,
        grabDX: e.clientX - rect.left - col * sq,
        grabDY: e.clientY - rect.top - row * sq,
        moved: false,
        wasSelected: selected === square,
        pointerId: e.pointerId,
      };
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic or already-released pointers can't be captured — dragging
        // still works for events that bubble through the board.
      }

      el.style.zIndex = '30';
      el.querySelector<HTMLElement>('.piece-inner')?.classList.add('piece-lifted');
      setSelected(square);
      setDragging(true);
    },
    [promo, selected, selectedTargets, piecesBySquare, canGrab, squareFromPoint, attemptMove, onIllegalDrop, orientation, clearAnnotations],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const anno = annoRef.current;
      if (anno && e.pointerId === anno.pointerId) {
        const over = squareFromPoint(e.clientX, e.clientY);
        setDrawing((prev) => (prev && over && prev.to !== over ? { ...prev, to: over } : prev));
        return;
      }
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const x = e.clientX - drag.rect.left - drag.grabDX;
      const y = e.clientY - drag.rect.top - drag.grabDY;
      if (!drag.moved) {
        const sq = drag.rect.width / 8;
        const { col, row } = toDisplay(drag.from, orientation);
        if (Math.hypot(x - col * sq, y - row * sq) < 4) return; // still a click
        drag.moved = true;
        drag.el.style.transition = 'none';
      }
      drag.el.style.transform = `translate(${x}px, ${y}px)`;
      const over = squareFromPoint(e.clientX, e.clientY);
      setHoverSquare((prev) => (prev === over ? prev : over));
    },
    [orientation, squareFromPoint],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const anno = annoRef.current;
      if (anno && e.pointerId === anno.pointerId) {
        const to = squareFromPoint(e.clientX, e.clientY) ?? anno.from;
        const { from, color } = anno;
        if (to === from) {
          // Toggle a square highlight.
          setMarks((prev) => {
            const existing = prev.find((m) => m.square === from);
            const rest = prev.filter((m) => m.square !== from);
            return existing && existing.color === color ? rest : [...rest, { square: from, color }];
          });
        } else {
          // Toggle an arrow.
          setArrows((prev) => {
            const existing = prev.find((a) => a.from === from && a.to === to);
            const rest = prev.filter((a) => !(a.from === from && a.to === to));
            return existing && existing.color === color ? rest : [...rest, { from, to, color }];
          });
        }
        annoRef.current = null;
        setDrawing(null);
        return;
      }
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      if (!drag.moved) {
        // A plain click: toggle selection.
        settlePiece(drag, false);
        if (drag.wasSelected) setSelected(null);
        endDrag();
        return;
      }

      const target = squareFromPoint(e.clientX, e.clientY);
      let snapped = false;
      if (target && target !== drag.from && selectedTargets.has(target)) {
        if (isPromotion(drag.from, target)) {
          // Park the pawn on the promotion square while the picker is open.
          drag.el.style.transition = '';
          drag.el.style.transform = gridTransform(target, orientation);
          drag.el.style.zIndex = '';
          drag.el.querySelector<HTMLElement>('.piece-inner')?.classList.remove('piece-lifted');
          setPromo({ from: drag.from, to: target });
          setSelected(null);
          endDrag();
          return;
        }
        snapped = onHumanMove(drag.from, target);
        if (snapped) setSelected(null);
      }
      if (!snapped && target && target !== drag.from) onIllegalDrop();
      settlePiece(drag, snapped);
      endDrag();
    },
    [selectedTargets, isPromotion, onHumanMove, onIllegalDrop, squareFromPoint, settlePiece, endDrag, orientation],
  );

  const handlePointerCancel = useCallback(() => {
    if (annoRef.current) {
      annoRef.current = null;
      setDrawing(null);
    }
    const drag = dragRef.current;
    if (drag) settlePiece(drag, false);
    endDrag();
  }, [settlePiece, endDrag]);

  /** Keyboard activation of a square (Enter/Space on the focusable grid). */
  const handleSquareActivate = useCallback(
    (square: Square) => {
      if (promo || !interactive) return;
      if (selected && selectedTargets.has(square)) {
        const from = selected;
        setSelected(null);
        if (!attemptMove(from, square)) onIllegalDrop();
        return;
      }
      const piece = piecesBySquare.get(square);
      if (piece && canGrab(piece)) setSelected(selected === square ? null : square);
      else setSelected(null);
    },
    [promo, interactive, selected, selectedTargets, piecesBySquare, canGrab, attemptMove, onIllegalDrop],
  );

  const handlePromoPick = useCallback(
    (piece: 'q' | 'r' | 'b' | 'n') => {
      if (!promo) return;
      onHumanMove(promo.from, promo.to, piece);
      setPromo(null);
    },
    [promo, onHumanMove],
  );

  const handlePromoCancel = useCallback(() => setPromo(null), []);

  /** Roving arrow-key navigation across the square grid. */
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const active = document.activeElement as HTMLElement | null;
      const current = active?.dataset.square as Square | undefined;
      if (!current) return;
      const deltas: Record<string, [number, number]> = {
        ArrowUp: [0, 1],
        ArrowDown: [0, -1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const delta = deltas[e.key];
      if (!delta) return;
      e.preventDefault();
      const { file, rank } = squareToCoords(current);
      const flip = orientation === 'b' ? -1 : 1;
      const next = coordsToSquare(file + delta[0] * flip, rank + delta[1] * flip);
      if (next) containerRef.current?.querySelector<HTMLElement>(`[data-square="${next}"]`)?.focus();
    },
    [orientation],
  );

  // While the promotion picker is open, render the pawn on the target square.
  const promoPieceId = promo ? piecesBySquare.get(promo.from)?.id : undefined;

  const squares = useMemo(() => {
    const out: { square: Square; col: number; row: number; isDark: boolean }[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const file = orientation === 'w' ? col : 7 - col;
        const rank = orientation === 'w' ? 7 - row : row;
        const square = coordsToSquare(file, rank)!;
        out.push({ square, col, row, isDark: (file + rank) % 2 === 0 });
      }
    }
    return out;
  }, [orientation]);

  return (
    <div
      ref={containerRef}
      className={`board-surface relative aspect-square w-full overflow-hidden rounded-md shadow-lg ${
        dragging ? 'cursor-grabbing' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => {
        // Suppress the browser menu so right-drag can draw arrows.
        e.preventDefault();
      }}
    >
      {/* Squares + highlights (also the accessible interface) */}
      <div
        className="absolute inset-0 grid grid-cols-8 grid-rows-8"
        role="grid"
        aria-label="Chess board"
        onKeyDown={handleGridKeyDown}
      >
        {squares.map(({ square, col, row, isDark }) => {
          const piece = piecesBySquare.get(square);
          const isLast = displayed.lastMove !== null && (displayed.lastMove.from === square || displayed.lastMove.to === square);
          const target = selectedTargets.get(square);
          const label = piece
            ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${PIECE_NAMES[piece.type]}`
            : `${square}, empty`;
          return (
            <button
              key={square}
              type="button"
              role="gridcell"
              data-square={square}
              tabIndex={row === 7 && col === 0 ? 0 : -1}
              aria-label={label}
              aria-pressed={selected === square}
              onClick={(e) => {
                // Pointer handlers already covered mouse/touch; only keyboard
                // "clicks" (detail === 0) get handled here.
                if (e.detail === 0) handleSquareActivate(square);
              }}
              className="relative focus:outline-none focus-visible:z-20 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-inset"
              style={{
                backgroundColor: squareColorFor
                  ? squareColorFor(square, isDark)
                  : isDark
                    ? 'var(--sq-dark)'
                    : 'var(--sq-light)',
              }}
            >
              {isLast && <span aria-hidden className="absolute inset-0" style={{ backgroundColor: 'var(--sq-last-move)' }} />}
              {selected === square && (
                <span aria-hidden className="absolute inset-0" style={{ backgroundColor: 'var(--sq-selected)' }} />
              )}
              {checkSquare === square && <span aria-hidden className="check-flash absolute inset-0" />}
              {hoverSquare === square && dragging && (
                <span aria-hidden className="absolute inset-0" style={{ boxShadow: 'inset 0 0 0 4px var(--sq-hover-ring)' }} />
              )}
              {target && !piece && (
                <span aria-hidden className="absolute inset-0 flex items-center justify-center">
                  <span className="h-[30%] w-[30%] rounded-full bg-black/25 dark:bg-black/35" />
                </span>
              )}
              {target && piece && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.3)' }}
                />
              )}
              {/* Coordinates on the board edge */}
              {col === 0 && (
                <span
                  aria-hidden
                  className={`absolute left-0.5 top-0.5 text-[min(1.9vw,11px)] font-semibold leading-none ${
                    isDark ? 'text-[var(--sq-light)]' : 'text-[var(--sq-dark)]'
                  }`}
                >
                  {square[1]}
                </span>
              )}
              {row === 7 && (
                <span
                  aria-hidden
                  className={`absolute bottom-0.5 right-0.5 text-[min(1.9vw,11px)] font-semibold leading-none ${
                    isDark ? 'text-[var(--sq-light)]' : 'text-[var(--sq-dark)]'
                  }`}
                >
                  {square[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Turf texture (below pieces, above squares/highlights) */}
      {turf && <div aria-hidden className="turf-overlay pointer-events-none absolute inset-0" />}

      {/* Pieces */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {displayed.pieces.map((p) => (
          <Piece
            key={p.id}
            piece={p}
            displaySquare={p.id === promoPieceId && promo ? promo.to : p.square}
            orientation={orientation}
            grabbable={canGrab(p)}
            registerRef={registerRef}
          />
        ))}
      </div>

      {/* Annotation overlay: square highlights + arrows (above pieces) */}
      {(marks.length > 0 || arrows.length > 0 || drawing) && (
        <svg
          aria-hidden
          viewBox="0 0 8 8"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full"
        >
          {marks.map((m) => {
            const { col, row } = toDisplay(m.square, orientation);
            return (
              <rect
                key={`${m.square}-${m.color}`}
                x={col + 0.05}
                y={row + 0.05}
                width={0.9}
                height={0.9}
                rx={0.06}
                fill="none"
                stroke={m.color}
                strokeWidth={0.09}
                opacity={0.9}
              />
            );
          })}
          {[...arrows, ...(drawing && drawing.from !== drawing.to ? [drawing] : [])].map((a, i) => {
            const from = toDisplay(a.from, orientation);
            const to = toDisplay(a.to, orientation);
            const ax = from.col + 0.5;
            const ay = from.row + 0.5;
            const bx = to.col + 0.5;
            const by = to.row + 0.5;
            const dx = bx - ax;
            const dy = by - ay;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const head = 0.34;
            const sx = ax + ux * 0.28; // start just outside the origin square center
            const sy = ay + uy * 0.28;
            const ex = bx - ux * head; // shaft ends where the head begins
            const ey = by - uy * head;
            const px = -uy;
            const py = ux;
            const hw = 0.22;
            return (
              <g key={`${a.from}-${a.to}-${a.color}-${i}`} opacity={0.85}>
                <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={a.color} strokeWidth={0.15} strokeLinecap="round" />
                <polygon
                  points={`${bx},${by} ${ex + px * hw},${ey + py * hw} ${ex - px * hw},${ey - py * hw}`}
                  fill={a.color}
                />
              </g>
            );
          })}
        </svg>
      )}

      {promo && (
        <PromotionDialog
          color={displayed.turn}
          to={promo.to}
          orientation={orientation}
          onPick={handlePromoPick}
          onCancel={handlePromoCancel}
        />
      )}
    </div>
  );
}
