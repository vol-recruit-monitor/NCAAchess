import { getAudioContext } from './sounds';

/**
 * 8-bit chiptune sequencer with four voices, scheduled against the WebAudio
 * clock and looped until stopped:
 *   - lead:    square-wave melody
 *   - harmony: quiet pulse arpeggio (root-fifth-octave of the current chord),
 *              the classic NES trick for implying full chords on one channel
 *   - bass:    triangle root notes
 *   - drums:   noise hi-hats + a short kick on the downbeats
 * Power-chord (root+fifth) arpeggios are harmonically neutral, so they thicken
 * any melody without clashing on major vs. minor thirds.
 */

/** [midiNote, lengthInEighths] — midi 0 = rest. */
export type Note = [number, number];

export interface ChipSong {
  /** beats per minute */
  tempo: number;
  melody: Note[];
  /** One bass/chord root per beat, cycled under the melody. */
  bassPattern: number[];
}

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

let playing = false;
let stopFns: (() => void)[] = [];

export function isSongPlaying(): boolean {
  return playing;
}

export function stopSong(): void {
  playing = false;
  for (const fn of stopFns) fn();
  stopFns = [];
}

export function startSong(song: ChipSong): boolean {
  const ctx = getAudioContext();
  if (!ctx || playing) return false;
  playing = true;

  const eighth = 60 / song.tempo / 2;
  const sixteenth = eighth / 2;

  const master = ctx.createGain();
  master.gain.value = 0.42;
  master.connect(ctx.destination);
  // A gentle lowpass keeps the square waves from getting harsh.
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3400;
  tone.connect(master);

  const nodes: AudioScheduledSourceNode[] = [];

  const totalEighths = song.melody.reduce((sum, [, len]) => sum + len, 0);
  const loopDur = totalEighths * eighth;

  const blip = (
    midi: number,
    start: number,
    dur: number,
    peak: number,
    type: OscillatorType,
    dest: AudioNode,
    sustain = 0.72,
  ) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = midiToFreq(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(peak, start + 0.008);
    g.gain.setValueAtTime(peak, start + dur * sustain);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.98);
    osc.connect(g).connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    nodes.push(osc);
  };

  const scheduleLoop = (loopStart: number) => {
    // Lead melody
    let t = loopStart;
    for (const [midi, len] of song.melody) {
      const dur = len * eighth;
      if (midi > 0) blip(midi, t, dur, 0.09, 'square', tone, 0.7);
      t += dur;
    }

    const beats = Math.floor(totalEighths / 2);
    for (let i = 0; i < beats; i++) {
      const bt = loopStart + i * eighth * 2;
      const root = song.bassPattern[i % song.bassPattern.length];

      // Bass (triangle) on the beat
      blip(root, bt, eighth * 1.8, 0.12, 'triangle', master, 0.55);

      // Harmony: quiet root-fifth-octave arpeggio across the beat (4 x 16th)
      const arp = [root + 12, root + 19, root + 24, root + 19];
      for (let a = 0; a < 4; a++) {
        blip(arp[a], bt + a * sixteenth, sixteenth, 0.028, 'square', tone, 0.5);
      }

      // Kick on the downbeat of each beat
      const kick = ctx.createOscillator();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, bt);
      kick.frequency.exponentialRampToValueAtTime(52, bt + 0.09);
      const kg = ctx.createGain();
      kg.gain.setValueAtTime(0.16, bt);
      kg.gain.exponentialRampToValueAtTime(0.001, bt + 0.12);
      kick.connect(kg).connect(master);
      kick.start(bt);
      kick.stop(bt + 0.14);
      nodes.push(kick);

      // Hi-hat noise on the off-beat
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, 1100, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let s = 0; s < data.length; s++) data[s] = (((s * 1103515245 + 12345) % 65536) / 32768 - 1) * 0.6;
      noise.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.028, bt + eighth);
      ng.gain.exponentialRampToValueAtTime(0.001, bt + eighth + 0.05);
      noise.connect(ng).connect(master);
      noise.start(bt + eighth);
      nodes.push(noise);
    }
  };

  let nextLoopStart = ctx.currentTime + 0.08;
  const pump = () => {
    if (!playing) return;
    scheduleLoop(nextLoopStart);
    nextLoopStart += loopDur;
    timer = setTimeout(pump, (nextLoopStart - ctx.currentTime - 1.5) * 1000);
  };
  let timer: ReturnType<typeof setTimeout> | null = null;
  pump();

  stopFns.push(() => {
    if (timer) clearTimeout(timer);
    for (const n of nodes) {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    }
    master.disconnect();
  });
  return true;
}
