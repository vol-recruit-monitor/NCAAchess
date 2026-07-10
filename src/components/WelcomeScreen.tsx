import type { AppTheme } from '../types';

/**
 * Landing screen shown before play. Big Play button plus a quick choice of
 * classic chess or College Football mode. Fully responsive for phones.
 */
export function WelcomeScreen({
  college,
  onPlay,
  onPlayCollege,
}: {
  college: boolean;
  onPlay: () => void;
  onPlayCollege: () => void;
}) {
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center ${
        college
          ? 'bg-gradient-to-b from-emerald-800 via-emerald-950 to-zinc-950'
          : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950'
      } text-white`}
    >
      <div className="flex max-w-md flex-col items-center gap-6">
        <div className="text-7xl drop-shadow-lg sm:text-8xl">{college ? '🏈' : '♟'}</div>
        <div>
          <h1 className="text-4xl font-black italic tracking-tight sm:text-5xl">
            {college ? 'College Football Chess' : 'Chess'}
          </h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Play Stockfish across 15 skill levels — on any device. Drag or tap to move; right-click to
            draw arrows on desktop.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayCollege}
            className="w-full rounded-xl bg-emerald-500 px-8 py-4 text-lg font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-emerald-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
          >
            🏈 Play College Football
          </button>
          <button
            type="button"
            onClick={onPlay}
            className="w-full rounded-xl border border-white/25 bg-white/10 px-8 py-3 text-base font-bold text-white shadow transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            ♟ Play Classic Chess
          </button>
        </div>

        <p className="pt-2 text-xs text-white/40">Everything runs in your browser. No sign-in, no backend.</p>
      </div>
    </div>
  );
}

export type { AppTheme };
