import { formatClock } from '../hooks/useClock';

/** One side's clock chip, shown next to the captured-pieces tray. */
export function ClockDisplay({ ms, active, tn }: { ms: number; active: boolean; tn: boolean }) {
  const low = ms < 30_000;
  return (
    <span
      className={`ml-auto rounded-md px-2.5 py-1 font-mono text-base font-bold tabular-nums transition-colors ${
        active
          ? tn
            ? 'bg-[#ff8200] text-white shadow ring-2 ring-[#ff8200]/40'
            : 'bg-emerald-600 text-white shadow ring-2 ring-emerald-500/40'
          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
      } ${low && active ? '!bg-red-600 !ring-red-500/50' : ''}`}
      aria-label={`clock: ${formatClock(ms)}${active ? ', running' : ''}`}
    >
      {formatClock(ms)}
    </span>
  );
}
