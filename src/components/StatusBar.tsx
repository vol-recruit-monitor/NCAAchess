import type { Color, GameEnd } from '../types';
import type { EngineStatus } from '../hooks/useEngine';

export function StatusBar({
  turn,
  inCheck,
  gameEnd,
  thinking,
  engineStatus,
  reviewing,
  onGoLive,
}: {
  turn: Color;
  inCheck: boolean;
  gameEnd: GameEnd | null;
  thinking: boolean;
  engineStatus: EngineStatus;
  reviewing: boolean;
  onGoLive: () => void;
}) {
  let content: React.ReactNode;
  if (gameEnd) {
    content = <span className="font-bold text-amber-600 dark:text-amber-400">{gameEnd.message}</span>;
  } else {
    content = (
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={`inline-block h-3 w-3 rounded-full border ${
            turn === 'w' ? 'border-zinc-400 bg-white' : 'border-zinc-500 bg-zinc-900'
          }`}
        />
        <span className="font-semibold">{turn === 'w' ? 'White' : 'Black'} to move</span>
        {inCheck && <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">CHECK!</span>}
        {thinking && (
          <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <span aria-hidden className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            thinking…
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white/60 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="text-sm">{content}</div>
      <div className="flex items-center gap-2">
        {reviewing && (
          <button
            type="button"
            onClick={onGoLive}
            className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Reviewing — back to game
          </button>
        )}
        {engineStatus === 'loading' && <span className="text-xs text-zinc-400">engine loading…</span>}
        {engineStatus === 'error' && (
          <span className="text-xs font-semibold text-red-500" role="alert">
            engine unavailable — playing random moves
          </span>
        )}
      </div>
    </div>
  );
}
