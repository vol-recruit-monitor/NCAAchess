import type { Color, PieceSymbol } from '../types';
import { PIECE_NAMES } from '../types';
import { PieceGlyph } from '../lib/pieces';

/**
 * Shows the pieces a player has captured (i.e. the opponent's lost pieces)
 * plus their material advantage when positive.
 */
export function CapturedTray({
  capturer,
  captured,
  advantage,
  label,
}: {
  capturer: Color;
  captured: PieceSymbol[];
  advantage: number;
  label: string;
}) {
  const victim: Color = capturer === 'w' ? 'b' : 'w';
  return (
    <div className="flex h-8 items-center gap-2 px-1" aria-label={`${label} captured pieces`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="flex items-center">
        {captured.map((type, i) => (
          <span key={i} className="-ml-2 h-7 w-7 first:ml-0" title={PIECE_NAMES[type]}>
            <PieceGlyph type={type} color={victim} className="h-full w-full" />
          </span>
        ))}
      </div>
      {advantage > 0 && (
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400" aria-label={`ahead by ${advantage} points`}>
          +{advantage}
        </span>
      )}
    </div>
  );
}
