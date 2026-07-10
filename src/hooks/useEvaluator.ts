import { useEffect, useRef, useState } from 'react';

/** Engine evaluation of a position, always from White's perspective. */
export interface Evaluation {
  /** Centipawns (null when a forced mate was found instead). */
  cp: number | null;
  /** Moves until mate; positive = White mates. */
  mate: number | null;
  depth: number;
}

/**
 * Live position evaluation for the eval bar. Runs a *second* Stockfish
 * worker so analysis never competes with the opponent engine's move search.
 * The worker is only created once enabled, and torn down when disabled.
 */
export function useEvaluator(fen: string, enabled: boolean): Evaluation | null {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef<Promise<Worker> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;

    readyRef.current = (async () => {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(`${base}stockfish/manifest.json`);
      const manifest = (await res.json()) as { engine: string };
      if (disposed) throw new Error('disposed');
      const worker = new Worker(`${base}stockfish/${manifest.engine}`);
      workerRef.current = worker;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('evaluator: no uciok')), 20_000);
        worker.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('evaluator worker failed'));
        };
        worker.onmessage = (e: MessageEvent) => {
          if (String(e.data) === 'uciok') {
            clearTimeout(timeout);
            resolve();
          }
        };
        worker.postMessage('uci');
      });
      return worker;
    })();
    readyRef.current.catch(() => undefined);

    return () => {
      disposed = true;
      workerRef.current?.terminate();
      workerRef.current = null;
      readyRef.current = null;
      setEvaluation(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !readyRef.current) return;
    let stale = false;
    const whiteToMove = fen.split(' ')[1] === 'w';

    void readyRef.current
      .then((worker) => {
        if (stale) return;
        worker.onmessage = (e: MessageEvent) => {
          if (stale) return;
          const line = String(e.data);
          if (!line.startsWith('info ') || !line.includes(' score ')) return;
          const depth = Number(/\bdepth (\d+)/.exec(line)?.[1] ?? 0);
          const cpMatch = /\bscore cp (-?\d+)/.exec(line);
          const mateMatch = /\bscore mate (-?\d+)/.exec(line);
          const sign = whiteToMove ? 1 : -1;
          if (mateMatch) {
            setEvaluation({ cp: null, mate: sign * Number(mateMatch[1]), depth });
          } else if (cpMatch) {
            setEvaluation({ cp: sign * Number(cpMatch[1]), mate: null, depth });
          }
        };
        worker.postMessage('stop');
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage('go depth 16 movetime 1200');
      })
      .catch(() => undefined);

    return () => {
      stale = true;
      workerRef.current?.postMessage('stop');
    };
  }, [fen, enabled]);

  return enabled ? evaluation : null;
}
