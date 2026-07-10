/**
 * Tiny WebAudio synthesizer for UI sounds — no audio files needed.
 * All sounds are short, quiet, and slightly softened with a lowpass filter.
 */

export type SoundKind = 'move' | 'capture' | 'castle' | 'check' | 'promote' | 'gameEnd' | 'illegal';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Shared AudioContext for other audio features (e.g. the Rocky Top player). */
export function getAudioContext(): AudioContext | null {
  return audio();
}

interface Tone {
  freq: number;
  /** seconds after call */
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  /** frequency glide target */
  glide?: number;
}

function play(tones: Tone[]) {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const t of tones) {
    const start = now + (t.at ?? 0);
    const dur = t.dur ?? 0.08;
    const peak = t.gain ?? 0.12;

    const osc = ac.createOscillator();
    osc.type = t.type ?? 'sine';
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.glide) osc.frequency.exponentialRampToValueAtTime(t.glide, start + dur);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2400;

    osc.connect(gain).connect(filter).connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

const SOUNDS: Record<SoundKind, () => void> = {
  move: () => play([{ freq: 260, glide: 180, dur: 0.07, gain: 0.14, type: 'triangle' }]),
  capture: () =>
    play([
      { freq: 200, glide: 120, dur: 0.09, gain: 0.16, type: 'triangle' },
      { freq: 520, dur: 0.03, gain: 0.06, type: 'square' },
    ]),
  castle: () =>
    play([
      { freq: 250, glide: 180, dur: 0.06, gain: 0.12, type: 'triangle' },
      { freq: 250, glide: 170, dur: 0.07, gain: 0.13, type: 'triangle', at: 0.09 },
    ]),
  check: () =>
    play([
      { freq: 660, dur: 0.09, gain: 0.07 },
      { freq: 880, dur: 0.12, gain: 0.05, at: 0.07 },
    ]),
  promote: () =>
    play([
      { freq: 440, dur: 0.08, gain: 0.08 },
      { freq: 660, dur: 0.1, gain: 0.08, at: 0.07 },
    ]),
  gameEnd: () =>
    play([
      { freq: 392, dur: 0.14, gain: 0.09 },
      { freq: 494, dur: 0.14, gain: 0.09, at: 0.12 },
      { freq: 587, dur: 0.22, gain: 0.09, at: 0.24 },
    ]),
  illegal: () => play([{ freq: 130, glide: 90, dur: 0.1, gain: 0.1, type: 'sawtooth' }]),
};

export function playSound(kind: SoundKind, enabled: boolean) {
  if (!enabled) return;
  try {
    SOUNDS[kind]();
  } catch {
    // Audio is best-effort; never break gameplay over it.
  }
}
