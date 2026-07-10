import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../types';

export function MoveList({
  history,
  viewIndex,
  onSelect,
}: {
  history: HistoryEntry[];
  viewIndex: number;
  onSelect: (index: number) => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [viewIndex, history.length]);

  const rows: { no: number; white?: { san: string; index: number }; black?: { san: string; index: number } }[] = [];
  history.forEach((entry, i) => {
    if (i % 2 === 0) rows.push({ no: i / 2 + 1, white: { san: entry.san, index: i + 1 } });
    else rows[rows.length - 1].black = { san: entry.san, index: i + 1 };
  });

  const cell = (move: { san: string; index: number } | undefined) => {
    if (!move) return <span className="px-2 py-1" />;
    const active = viewIndex === move.index;
    return (
      <button
        ref={active ? activeRef : undefined}
        type="button"
        onClick={() => onSelect(move.index)}
        aria-current={active ? 'true' : undefined}
        className={`rounded px-2 py-1 text-left font-medium tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          active
            ? 'bg-amber-300/80 text-zinc-900 dark:bg-amber-400/90'
            : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        {move.san}
      </button>
    );
  };

  const atStart = viewIndex === 0;
  const atEnd = viewIndex === history.length;

  const navBtn = 'rounded px-2 py-0.5 text-sm font-bold hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Moves</h2>
        <div className="flex gap-1" role="group" aria-label="Move navigation">
          <button type="button" className={navBtn} disabled={atStart} onClick={() => onSelect(0)} aria-label="Go to start">
            ⏮
          </button>
          <button type="button" className={navBtn} disabled={atStart} onClick={() => onSelect(viewIndex - 1)} aria-label="Previous move">
            ◀
          </button>
          <button type="button" className={navBtn} disabled={atEnd} onClick={() => onSelect(viewIndex + 1)} aria-label="Next move">
            ▶
          </button>
          <button type="button" className={navBtn} disabled={atEnd} onClick={() => onSelect(history.length)} aria-label="Go to latest move">
            ⏭
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-zinc-200 bg-white/60 p-1 dark:border-zinc-700 dark:bg-zinc-800/60">
        {rows.length === 0 ? (
          <p className="p-2 text-sm text-zinc-500 dark:text-zinc-400">No moves yet — you're up!</p>
        ) : (
          <div className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-x-1 text-sm">
            {rows.map((row) => (
              <div key={row.no} className="contents">
                <span className="px-1 py-1 text-right text-zinc-400 tabular-nums">{row.no}.</span>
                {cell(row.white)}
                {cell(row.black)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
