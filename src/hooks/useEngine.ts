import { useCallback, useEffect, useRef, useState } from 'react';
import type { DifficultyLevel } from '../types';

export type EngineStatus = 'loading' | 'ready' | 'error';

export interface EngineMove {
  from: string;
  to: string;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

interface PendingSearch {
  cancelled: boolean;
  resolve: (move: EngineMove | null) => void;
}

export interface Engine {
  status: EngineStatus;
  /** Engine name reported over UCI, once known. */
  name: string | null;
  /**
   * Ask Stockfish for a move. Resolves null if the search was cancelled
   * (new game, undo, side switch) — callers must ignore null results.
   */
  request: (fen: string, level: DifficultyLevel) => Promise<EngineMove | null>;
  /** Cancel all in-flight searches; their promises resolve null. */
  cancelAll: () => void;
}

function parseBestMove(line: string): EngineMove | null {
  const token = line.split(/\s+/)[1];
  if (!token || token === '(none)') return null;
  const move: EngineMove = { from: token.slice(0, 2), to: token.slice(2, 4) };
  const promo = token[4];
  if (promo === 'q' || promo === 'r' || promo === 'b' || promo === 'n') move.promotion = promo;
  return move;
}

/**
 * Runs Stockfish (single-threaded WASM build, copied into /public/stockfish
 * at install time) inside a Web Worker and exposes a promise-based UCI API.
 * The UI thread never blocks while the engine thinks.
 */
export function useEngine(): Engine {
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [name, setName] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  /** FIFO of outstanding `go` commands; UCI answers them in order. */
  const searchQueueRef = useRef<PendingSearch[]>([]);
  const readyRef = useRef<Promise<Worker> | null>(null);

  useEffect(() => {
    let disposed = false;
    let worker: Worker | null = null;

    readyRef.current = (async () => {
      // BASE_URL makes this work both at the site root and under a GitHub
      // Pages project subpath (e.g. /college-chess/).
      const base = import.meta.env.BASE_URL;
      const res = await fetch(`${base}stockfish/manifest.json`);
      if (!res.ok) throw new Error('Stockfish manifest missing — run `npm install` to copy engine files.');
      const manifest = (await res.json()) as { engine: string };
      if (disposed) throw new Error('disposed');

      worker = new Worker(`${base}stockfish/${manifest.engine}`);
      workerRef.current = worker;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Engine did not answer uci within 20s')), 20_000);
        worker!.onerror = (e) => {
          clearTimeout(timeout);
          reject(new Error(e.message || 'Engine worker failed to load'));
        };
        worker!.onmessage = (e: MessageEvent) => {
          const line = String(e.data);
          if (line.startsWith('id name')) setName(line.slice(8).trim());
          if (line === 'uciok') {
            clearTimeout(timeout);
            resolve();
          }
        };
        worker!.postMessage('uci');
      });

      // Steady-state message handling: answer searches in FIFO order.
      worker.onmessage = (e: MessageEvent) => {
        const line = String(e.data);
        if (line.startsWith('bestmove')) {
          const pending = searchQueueRef.current.shift();
          if (pending) pending.resolve(pending.cancelled ? null : parseBestMove(line));
        }
      };
      worker.onerror = () => setStatus('error');

      if (!disposed) setStatus('ready');
      return worker;
    })();

    readyRef.current.catch((err: unknown) => {
      if (!disposed) {
        console.error('[engine]', err);
        setStatus('error');
      }
    });

    return () => {
      disposed = true;
      worker?.terminate();
      workerRef.current = null;
      for (const s of searchQueueRef.current) s.resolve(null);
      searchQueueRef.current = [];
    };
  }, []);

  const cancelAll = useCallback(() => {
    for (const s of searchQueueRef.current) s.cancelled = true;
    workerRef.current?.postMessage('stop');
  }, []);

  const request = useCallback(
    async (fen: string, level: DifficultyLevel): Promise<EngineMove | null> => {
      const ready = readyRef.current;
      if (!ready) return null;
      let worker: Worker;
      try {
        worker = await ready;
      } catch {
        return null;
      }

      // Only one search should be live; cancel anything still pending.
      for (const s of searchQueueRef.current) {
        if (!s.cancelled) {
          s.cancelled = true;
          worker.postMessage('stop');
        }
      }

      return new Promise<EngineMove | null>((resolve) => {
        searchQueueRef.current.push({ cancelled: false, resolve });
        if (level.limitElo) {
          // Let Stockfish target the exact Elo; Skill Level is ignored while
          // strength-limiting is on, so raise it out of the way.
          worker.postMessage('setoption name UCI_LimitStrength value true');
          worker.postMessage(`setoption name UCI_Elo value ${level.elo}`);
          worker.postMessage('setoption name Skill Level value 20');
        } else {
          // Weak/max levels: drive strength via Skill Level + search depth.
          worker.postMessage('setoption name UCI_LimitStrength value false');
          worker.postMessage(`setoption name Skill Level value ${level.skill}`);
        }
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go depth ${level.depth} movetime ${level.movetime}`);
      });
    },
    [],
  );

  return { status, name, request, cancelAll };
}
