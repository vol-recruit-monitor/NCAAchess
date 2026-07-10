import { useCallback, useEffect, useRef, useState } from 'react';
import type { Color, TimeControl } from '../types';

export interface ClockTimes {
  w: number;
  b: number;
}

export interface ChessClock {
  times: ClockTimes;
  /** Add the control's increment to a side (call after that side moves). */
  applyIncrement: (color: Color) => void;
  reset: () => void;
}

/**
 * Chess clock. `active` is the color whose clock should run (null = paused).
 * Fires `onFlag` exactly once when a side reaches zero.
 */
export function useClock(control: TimeControl, active: Color | null, onFlag: (color: Color) => void): ChessClock {
  const [times, setTimes] = useState<ClockTimes>({ w: control.baseMs, b: control.baseMs });
  const flaggedRef = useRef(false);
  const onFlagRef = useRef(onFlag);
  onFlagRef.current = onFlag;

  // New time control -> fresh clocks.
  useEffect(() => {
    setTimes({ w: control.baseMs, b: control.baseMs });
    flaggedRef.current = false;
  }, [control]);

  useEffect(() => {
    if (!active || control.baseMs <= 0) return;
    let last = performance.now();
    const tick = setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      setTimes((prev) => {
        const next = Math.max(0, prev[active] - elapsed);
        if (next === 0 && !flaggedRef.current) {
          flaggedRef.current = true;
          // Defer: don't update other components' state inside this updater.
          setTimeout(() => onFlagRef.current(active), 0);
        }
        return { ...prev, [active]: next };
      });
    }, 100);
    return () => clearInterval(tick);
  }, [active, control]);

  const applyIncrement = useCallback(
    (color: Color) => {
      if (control.baseMs <= 0 || control.incMs <= 0) return;
      setTimes((prev) => (prev[color] > 0 ? { ...prev, [color]: prev[color] + control.incMs } : prev));
    },
    [control],
  );

  const reset = useCallback(() => {
    setTimes({ w: control.baseMs, b: control.baseMs });
    flaggedRef.current = false;
  }, [control]);

  return { times, applyIncrement, reset };
}

/** mm:ss, with tenths under 10 seconds. */
export function formatClock(ms: number): string {
  if (ms < 10_000) return (ms / 1000).toFixed(1);
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
