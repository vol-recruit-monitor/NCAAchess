import type { AppTheme, PieceSetId, SideMode } from '../types';
import { DIFFICULTY_LEVELS, TIME_CONTROLS } from '../types';
import { PIECE_SETS } from '../lib/pieces';

export interface BoardTheme {
  name: string;
  light: string;
  dark: string;
}

export const BOARD_THEMES: readonly BoardTheme[] = [
  { name: 'Green', light: '#eef0d5', dark: '#739552' },
  { name: 'Walnut', light: '#f0d9b5', dark: '#b58863' },
  { name: 'Ocean', light: '#dbe4ef', dark: '#6f8ab0' },
  { name: 'Slate', light: '#dfdfdf', dark: '#8a8a8a' },
] as const;

const btn =
  'rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-white dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:disabled:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const selectCls =
  'rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export function Controls({
  sideMode,
  onSideModeChange,
  levelIndex,
  onLevelChange,
  onNewGame,
  onUndo,
  canUndo,
  onFlip,
  onResign,
  canResign,
  soundOn,
  onToggleSound,
  boardThemeIndex,
  onBoardThemeChange,
  appTheme,
  onOpenTeamPicker,
  onExitCollege,
  pieceSet,
  onPieceSetChange,
  timeControlId,
  onTimeControlChange,
  evalOn,
  onToggleEval,
  songPlaying,
  songName,
  onToggleSong,
}: {
  sideMode: SideMode;
  onSideModeChange: (mode: SideMode) => void;
  levelIndex: number;
  onLevelChange: (index: number) => void;
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onFlip: () => void;
  onResign: () => void;
  canResign: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  boardThemeIndex: number;
  onBoardThemeChange: (index: number) => void;
  appTheme: AppTheme;
  onOpenTeamPicker: () => void;
  onExitCollege: () => void;
  pieceSet: PieceSetId;
  onPieceSetChange: (set: PieceSetId) => void;
  timeControlId: string;
  onTimeControlChange: (id: string) => void;
  evalOn: boolean;
  onToggleEval: () => void;
  songPlaying: boolean;
  songName: string;
  onToggleSong: () => void;
}) {
  const level = DIFFICULTY_LEVELS[levelIndex];
  const tn = appTheme === 'college';
  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-white/60 p-3 dark:border-zinc-700 dark:bg-zinc-800/60">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={onNewGame}>
          New Game
        </button>
        <button type="button" className={btn} onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className={btn} onClick={onFlip}>
          Flip Board
        </button>
        <button type="button" className={btn} onClick={onResign} disabled={!canResign}>
          Resign
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenTeamPicker}
          className={`rounded-md px-3 py-1.5 text-sm font-bold shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            tn
              ? 'bg-emerald-700 text-white hover:bg-emerald-600'
              : 'border border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50 dark:bg-zinc-700 dark:text-emerald-300 dark:hover:bg-zinc-600'
          }`}
        >
          🏈 {tn ? 'Change Teams' : 'College Football Mode'}
        </button>
        {tn && (
          <button type="button" className={btn} onClick={onExitCollege}>
            Exit College Mode
          </button>
        )}
        {/* Fight-song button hidden for now (kept in code for later). */}
        {false && (
          <button type="button" onClick={onToggleSong} aria-pressed={songPlaying}>
            {songName}
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="flex justify-between font-medium">
          <span>
            Difficulty: <strong>{level.label}</strong>
          </span>
          <span className="tabular-nums text-zinc-400">~{level.elo} Elo</span>
        </span>
        <input
          type="range"
          min={0}
          max={DIFFICULTY_LEVELS.length - 1}
          step={1}
          value={levelIndex}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          aria-label={`Difficulty: ${level.label}, about ${level.elo} Elo`}
          aria-valuetext={`${level.label}, ${level.elo} Elo`}
          className="accent-emerald-600"
        />
        <span className="flex justify-between text-xs text-zinc-400">
          <span>~300</span>
          <span>Level {levelIndex + 1}/{DIFFICULTY_LEVELS.length}</span>
          <span>3000+</span>
        </span>
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        You play
        <select value={sideMode} onChange={(e) => onSideModeChange(e.target.value as SideMode)} className={selectCls}>
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="both">Both sides</option>
          <option value="watch">Watch (engine vs engine)</option>
        </select>
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        Time control
        <select value={timeControlId} onChange={(e) => onTimeControlChange(e.target.value)} className={selectCls}>
          {TIME_CONTROLS.map((tc) => (
            <option key={tc.id} value={tc.id}>
              {tc.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        Piece design
        <select value={pieceSet} onChange={(e) => onPieceSetChange(e.target.value as PieceSetId)} className={selectCls}>
          {PIECE_SETS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        Board colors
        <select
          value={boardThemeIndex}
          onChange={(e) => onBoardThemeChange(Number(e.target.value))}
          className={selectCls}
          disabled={tn}
          title={tn ? 'College mode paints the board in field green and team colors' : undefined}
        >
          {BOARD_THEMES.map((t, i) => (
            <option key={t.name} value={i}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        Evaluation bar
        <input type="checkbox" checked={evalOn} onChange={onToggleEval} className="h-4 w-4 accent-emerald-600" />
      </label>

      <label className="flex items-center justify-between gap-2 text-sm font-medium">
        Sound effects
        <input type="checkbox" checked={soundOn} onChange={onToggleSound} className="h-4 w-4 accent-emerald-600" />
      </label>
    </div>
  );
}
