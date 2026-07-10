import type { Color } from '../types';
import type { Evaluation } from '../hooks/useEvaluator';

/** chess.com-style vertical evaluation bar. */
export function EvalBar({ evaluation, orientation }: { evaluation: Evaluation | null; orientation: Color }) {
  let whiteShare = 0.5;
  let label = '0.0';
  if (evaluation) {
    if (evaluation.mate !== null) {
      whiteShare = evaluation.mate > 0 ? 1 : 0;
      label = `M${Math.abs(evaluation.mate)}`;
    } else if (evaluation.cp !== null) {
      // Logistic squash: ±400cp ≈ 80/20 split.
      whiteShare = 1 / (1 + Math.exp(-0.0035 * evaluation.cp));
      label = (Math.abs(evaluation.cp) / 100).toFixed(1);
    }
  }
  const whiteOnBottom = orientation === 'w';
  const whitePct = Math.round(whiteShare * 1000) / 10;
  const whiteWinning = whiteShare >= 0.5;

  return (
    <div
      className="relative h-full w-4 shrink-0 overflow-hidden rounded-sm bg-zinc-800 shadow-inner ring-1 ring-black/30 sm:w-5"
      role="meter"
      aria-label="Engine evaluation"
      aria-valuenow={evaluation?.cp ?? 0}
      aria-valuetext={`${whiteWinning ? 'White' : 'Black'} ${label}`}
    >
      <div
        className="absolute inset-x-0 bg-zinc-100 transition-[height] duration-500 ease-out"
        style={{ height: `${whitePct}%`, [whiteOnBottom ? 'bottom' : 'top']: 0 } as React.CSSProperties}
      />
      <span
        className={`absolute inset-x-0 text-center text-[8px] font-bold leading-4 ${
          whiteWinning ? 'text-zinc-700' : 'text-zinc-200'
        }`}
        style={{ [whiteWinning === whiteOnBottom ? 'bottom' : 'top']: 0 } as React.CSSProperties}
      >
        {label}
      </span>
    </div>
  );
}
