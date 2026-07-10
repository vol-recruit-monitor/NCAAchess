import { useEffect, useRef } from 'react';
import type { Color, Square } from '../types';
import { PIECE_NAMES, squareToCoords } from '../types';
import { PieceGlyph } from '../lib/pieces';

const CHOICES = ['q', 'r', 'b', 'n'] as const;

export function PromotionDialog({
  color,
  to,
  orientation,
  onPick,
  onCancel,
}: {
  color: Color;
  to: Square;
  orientation: Color;
  onPick: (piece: (typeof CHOICES)[number]) => void;
  onCancel: () => void;
}) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const { file, rank } = squareToCoords(to);
  const col = orientation === 'w' ? file : 7 - file;
  const row = orientation === 'w' ? 7 - rank : rank;
  // The picker extends from the promotion square toward the board center.
  const fromTop = row <= 3;

  return (
    <>
      {/* Backdrop: click anywhere else to cancel */}
      <div className="absolute inset-0 z-40 bg-black/35" onPointerDown={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Choose promotion piece"
        className="promo-in absolute z-50 flex w-[12.5%] flex-col overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-black/20 dark:bg-zinc-800"
        style={{
          left: `${col * 12.5}%`,
          top: fromTop ? `${row * 12.5}%` : undefined,
          bottom: fromTop ? undefined : `${(7 - row) * 12.5}%`,
          flexDirection: fromTop ? 'column' : 'column-reverse',
        }}
      >
        {CHOICES.map((piece, i) => (
          <button
            key={piece}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            aria-label={`Promote to ${PIECE_NAMES[piece]}`}
            onClick={() => onPick(piece)}
            className={`aspect-square w-full p-0.5 transition-colors hover:bg-amber-200 focus:outline-none focus-visible:bg-amber-200 dark:hover:bg-amber-500/40 dark:focus-visible:bg-amber-500/40 ${
              i === 0 ? 'bg-amber-100 dark:bg-amber-500/25' : ''
            }`}
          >
            <PieceGlyph type={piece} color={color} className="h-full w-full" />
          </button>
        ))}
      </div>
    </>
  );
}
