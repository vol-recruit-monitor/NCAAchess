import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { AppTheme, Color, Move, PieceSetId, SideMode, Square, Team } from './types';
import { DIFFICULTY_LEVELS, PIECE_VALUES, TIME_CONTROLS } from './types';
import { useChessGame } from './hooks/useChessGame';
import { useEngine } from './hooks/useEngine';
import type { EngineMove } from './hooks/useEngine';
import { useClock } from './hooks/useClock';
import { formatClock } from './hooks/useClock';
import { useEvaluator } from './hooks/useEvaluator';
import { Board } from './components/Board';
import { MoveList } from './components/MoveList';
import { CapturedTray } from './components/CapturedTray';
import { Controls, BOARD_THEMES } from './components/Controls';
import { StatusBar } from './components/StatusBar';
import { EvalBar } from './components/EvalBar';
import { ClockDisplay } from './components/ClockDisplay';
import { Stadium } from './components/Stadium';
import { TeamPicker } from './components/TeamPicker';
import { Celebration } from './components/Celebration';
import { BoothPanel } from './components/BoothPanel';
import { WelcomeScreen } from './components/WelcomeScreen';
import { capturedSummary, describeMove } from './lib/gameUtils';
import { playSound } from './lib/sounds';
import type { SoundKind } from './lib/sounds';
import { PieceSetContext, PIECE_SETS } from './lib/pieces';
import type { PieceSetConfig } from './lib/pieces';
import { TEAMS, logoUrl, teamById, venueFor } from './lib/teams';
import { kickoffLines, moveLines, endgameLines } from './lib/commentary';
import type { BoothLine } from './lib/commentary';
import { isSongPlaying, startSong, stopSong } from './lib/chiptune';
import { fightSongFor, songLabel } from './lib/fightSongs';

/** useState persisted to localStorage (bad/missing stored values fall back). */
function usePersisted<T>(key: string, initial: T, validate: (v: T) => boolean): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        const parsed = JSON.parse(stored) as T;
        if (validate(parsed)) return parsed;
      }
    } catch {
      // fall through to the default
    }
    return initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage may be unavailable (private mode); preferences just won't stick
    }
  }, [key, value]);
  return [value, setValue];
}

function randomMove(fen: string): EngineMove | null {
  const moves = new Chess(fen).moves({ verbose: true });
  if (moves.length === 0) return null;
  const m = moves[Math.floor(Math.random() * moves.length)];
  return { from: m.from, to: m.to, promotion: m.promotion as EngineMove['promotion'] };
}

const PIECE_SET_IDS = PIECE_SETS.map((s) => s.id);
const FIELD_DARK = '#3d7136';
const FIELD_MEDIUM = '#589a4d';

interface TeamSelection {
  mine: string;
  opp: string;
}

export default function App() {
  const game = useChessGame();
  const engine = useEngine();

  const [sideMode, setSideMode] = useState<SideMode>('white');
  const [orientation, setOrientation] = useState<Color>('w');
  const [levelIndex, setLevelIndex] = usePersisted(
    'chess-level',
    3,
    (v) => Number.isInteger(v) && v >= 0 && v < DIFFICULTY_LEVELS.length,
  );
  const [soundOn, setSoundOn] = usePersisted('chess-sound', true, (v) => typeof v === 'boolean');
  const [boardThemeIndex, setBoardThemeIndex] = usePersisted(
    'chess-board-theme',
    0,
    (v) => Number.isInteger(v) && v >= 0 && v < BOARD_THEMES.length,
  );
  const [appTheme, setAppTheme] = usePersisted<AppTheme>(
    'chess-app-theme-v2',
    'classic',
    (v) => v === 'classic' || v === 'college',
  );
  const [pieceSet, setPieceSet] = usePersisted<PieceSetId>(
    'chess-piece-set',
    'classic',
    (v) => PIECE_SET_IDS.includes(v),
  );
  const [teamSel, setTeamSel] = usePersisted<TeamSelection>(
    'chess-college-teams',
    { mine: 'tennessee', opp: 'alabama' },
    (v) =>
      typeof v === 'object' &&
      v !== null &&
      TEAMS.some((t) => t.id === v.mine) &&
      TEAMS.some((t) => t.id === v.opp),
  );
  const [timeControlId, setTimeControlId] = usePersisted(
    'chess-time-control',
    'off',
    (v) => TIME_CONTROLS.some((tc) => tc.id === v),
  );
  const [evalOn, setEvalOn] = usePersisted('chess-eval-bar', false, (v) => typeof v === 'boolean');
  const [thinking, setThinking] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [songPlaying, setSongPlaying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [boothLines, setBoothLines] = useState<BoothLine[]>([]);
  const [celebration, setCelebration] = useState<string[] | null>(null);
  // Landing screen shows first; Play buttons enter the game.
  const [started, setStarted] = useState(false);

  const college = appTheme === 'college';
  const timeControl = TIME_CONTROLS.find((tc) => tc.id === timeControlId) ?? TIME_CONTROLS[0];
  const clockOn = timeControl.baseMs > 0;

  // Which chess color the user's program plays.
  const mineSide: Color = sideMode === 'black' ? 'b' : 'w';
  const mineTeam = teamById(teamSel.mine);
  const oppTeam = teamById(teamSel.opp);
  const teamFor = useCallback(
    (color: Color): Team => (color === mineSide ? mineTeam : oppTeam),
    [mineSide, mineTeam, oppTeam],
  );

  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  // ------- Clock -------
  const handleFlag = useCallback(
    (color: Color) => {
      engine.cancelAll();
      game.timeout(color);
    },
    [engine, game],
  );
  const clockActive = clockOn && !game.gameEnd && game.history.length > 0 ? game.turn : null;
  const clock = useClock(timeControl, clockActive, handleFlag);
  const clockRef = useRef(clock);
  clockRef.current = clock;

  const afterMove = useCallback((move: Move) => {
    let kind: SoundKind = 'move';
    if (move.flags.includes('k') || move.flags.includes('q')) kind = 'castle';
    else if (move.captured) kind = 'capture';
    else if (move.promotion) kind = 'promote';
    playSound(kind, soundOnRef.current);
    const inCheck = move.san.includes('+') || move.san.includes('#');
    if (inCheck && !move.san.includes('#')) {
      setTimeout(() => playSound('check', soundOnRef.current), 120);
    }
    setAnnouncement(describeMove(move, inCheck, null));
    clockRef.current.applyIncrement(move.color);
  }, []);

  const handleHumanMove = useCallback(
    (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): boolean => {
      const move = game.makeMove(from, to, promotion);
      if (!move) return false;
      afterMove(move);
      return true;
    },
    [game, afterMove],
  );

  const handleIllegalDrop = useCallback(() => playSound('illegal', soundOnRef.current), []);

  // Announce + chime when the game ends; in college mode, checkmate also
  // sets off fireworks + the field rush in the winner's colors.
  const prevEndRef = useRef(game.gameEnd);
  useEffect(() => {
    if (game.gameEnd && game.gameEnd !== prevEndRef.current) {
      playSound('gameEnd', soundOnRef.current);
      setAnnouncement(game.gameEnd.message);
      if (college) {
        const winner =
          game.gameEnd.result === '1-0' ? teamFor('w') : game.gameEnd.result === '0-1' ? teamFor('b') : null;
        const loser =
          game.gameEnd.result === '1-0' ? teamFor('b') : game.gameEnd.result === '0-1' ? teamFor('w') : null;
        if (game.gameEnd.reason === 'Checkmate' && winner) {
          setCelebration([winner.primary, winner.secondary]);
        }
        const lines = endgameLines(game.gameEnd.reason, winner, loser);
        if (lines.length) setBoothLines((prev) => [...prev.slice(-10), ...lines]);
      }
    }
    prevEndRef.current = game.gameEnd;
  }, [game.gameEnd, college, teamFor]);

  // Booth commentary reacts to each new move.
  const prevHistLenRef = useRef(0);
  useEffect(() => {
    const len = game.history.length;
    if (college && len > prevHistLenRef.current) {
      const entry = game.history[len - 1];
      const mover = teamFor(entry.move.color);
      const defender = teamFor(entry.move.color === 'w' ? 'b' : 'w');
      const lines = moveLines(entry.move, mover, defender);
      if (lines.length) setBoothLines((prev) => [...prev.slice(-10), ...lines]);
    }
    prevHistLenRef.current = len;
  }, [game.history, college, teamFor]);

  // ------- Engine orchestration -------
  const engineControls: Color | null = useMemo(() => {
    if (game.gameEnd) return null;
    if (sideMode === 'watch') return game.turn;
    if (sideMode === 'white' && game.turn === 'b') return 'b';
    if (sideMode === 'black' && game.turn === 'w') return 'w';
    return null;
  }, [sideMode, game.turn, game.gameEnd]);

  useEffect(() => {
    if (!engineControls) return;
    let stale = false;
    const fen = game.fen;
    const level = DIFFICULTY_LEVELS[levelIndex];
    // A short, natural-feeling pause before the engine starts thinking.
    const delay = 250 + Math.random() * 350;
    setThinking(true);

    const timer = setTimeout(async () => {
      let move = await engine.request(fen, level);
      if (stale) return;
      // If the engine is unavailable (failed to load), keep the game playable
      // with random legal moves rather than hanging.
      if (!move) {
        if (engine.status !== 'error') return; // search was cancelled
        move = randomMove(fen);
        if (!move) return;
      }
      const applied = game.makeMove(move.from as Square, move.to as Square, move.promotion);
      if (applied) afterMove(applied);
      setThinking(false);
    }, delay);

    return () => {
      stale = true;
      clearTimeout(timer);
      engine.cancelAll();
      setThinking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineControls, game.fen, game.epoch, levelIndex, engine.status]);

  // ------- Evaluation bar -------
  const evaluation = useEvaluator(game.fen, evalOn);

  // ------- Controls -------
  const handleNewGame = useCallback(() => {
    engine.cancelAll();
    game.reset();
    clockRef.current.reset();
    setCelebration(null);
    if (appTheme === 'college') setBoothLines(kickoffLines(mineTeam, oppTeam, venueFor(mineTeam)));
    setAnnouncement('New game started.');
  }, [engine, game, appTheme, mineTeam, oppTeam]);

  const handleUndo = useCallback(() => {
    engine.cancelAll();
    let count = 1;
    if (sideMode === 'white' || sideMode === 'black') {
      const human = sideMode === 'white' ? 'w' : 'b';
      // Take back my move and the engine's reply (or just my move if the
      // engine is still thinking).
      count = game.turn === human ? 2 : 1;
    }
    game.undo(Math.min(count, game.history.length));
    setCelebration(null);
    setAnnouncement('Move taken back.');
  }, [engine, game, sideMode]);

  const handleFlip = useCallback(() => setOrientation((o) => (o === 'w' ? 'b' : 'w')), []);

  const handleResign = useCallback(() => {
    if (sideMode !== 'white' && sideMode !== 'black') return;
    engine.cancelAll();
    game.resign(sideMode === 'white' ? 'w' : 'b');
  }, [sideMode, engine, game]);

  const handleSideMode = useCallback(
    (mode: SideMode) => {
      engine.cancelAll();
      setSideMode(mode);
      if (mode === 'white' || mode === 'watch') setOrientation('w');
      else if (mode === 'black') setOrientation('b');
    },
    [engine],
  );

  const stopSongIfPlaying = useCallback(() => {
    if (isSongPlaying()) {
      stopSong();
      setSongPlaying(false);
    }
  }, []);

  const handleKickoff = useCallback(
    (mine: Team, opp: Team) => {
      stopSongIfPlaying();
      setTeamSel({ mine: mine.id, opp: opp.id });
      setAppTheme('college');
      setPieceSet('football');
      setPickerOpen(false);
      // A new matchup is a new game.
      engine.cancelAll();
      game.reset();
      clockRef.current.reset();
      setCelebration(null);
      setBoothLines(kickoffLines(mine, opp, venueFor(mine)));
      setAnnouncement(`Kickoff: ${mine.school} versus ${opp.school}. New game started.`);
    },
    [setTeamSel, setAppTheme, setPieceSet, stopSongIfPlaying, engine, game],
  );

  const handleExitCollege = useCallback(() => {
    stopSongIfPlaying();
    setAppTheme('classic');
    setPieceSet((prev) => (prev === 'football' ? 'classic' : prev));
  }, [setAppTheme, setPieceSet, stopSongIfPlaying]);

  const handleToggleSong = useCallback(() => {
    if (isSongPlaying()) {
      stopSong();
      setSongPlaying(false);
    } else if (startSong(fightSongFor(mineTeam.id))) {
      setSongPlaying(true);
    }
  }, [mineTeam.id]);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('chess-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // ------- Welcome screen entry -------
  const handlePlayClassic = useCallback(() => {
    setAppTheme('classic');
    setPieceSet((prev) => (prev === 'football' ? 'classic' : prev));
    setStarted(true);
  }, [setAppTheme, setPieceSet]);

  const handlePlayCollege = useCallback(() => {
    setStarted(true);
    setPickerOpen(true);
  }, []);

  // ------- Derived view state -------
  const movableColor: Color | 'both' | null =
    sideMode === 'both' ? 'both' : sideMode === 'white' ? 'w' : sideMode === 'black' ? 'b' : null;

  const summary = useMemo(() => capturedSummary(game.displayed.pieces), [game.displayed.pieces]);
  const topColor: Color = orientation === 'w' ? 'b' : 'w';
  const bottomColor: Color = orientation;
  const trayFor = (color: Color) => ({
    captured: summary.lostBy[color === 'w' ? 'b' : 'w'],
    advantage: color === 'w' ? summary.advantage : -summary.advantage,
  });

  const boardTheme = BOARD_THEMES[boardThemeIndex];
  const squareVars = {
    '--sq-light': boardTheme.light,
    '--sq-dark': boardTheme.dark,
    ...(college
      ? {
          '--sq-last-move': 'rgba(30, 90, 200, 0.4)',
          '--sq-selected': 'rgba(30, 90, 200, 0.5)',
          '--sq-hover-ring': 'rgba(255, 255, 255, 0.85)',
        }
      : {}),
  } as React.CSSProperties;

  /** Field green with team-colored back ranks (the "end zones"). */
  const collegeSquareColor = useCallback(
    (square: Square, isDark: boolean): string => {
      const rank = square[1];
      if (rank === '1' || rank === '2') {
        const t = teamFor('w');
        return isDark ? t.primary : t.secondary;
      }
      if (rank === '7' || rank === '8') {
        const t = teamFor('b');
        return isDark ? t.primary : t.secondary;
      }
      return isDark ? FIELD_DARK : FIELD_MEDIUM;
    },
    [teamFor],
  );

  const pieceConfig = useMemo<PieceSetConfig>(
    () => ({ set: pieceSet, teams: { w: teamFor('w'), b: teamFor('b') } }),
    [pieceSet, teamFor],
  );

  // Jumbotron content
  const lastEntry = game.history[game.history.length - 1];
  const playText = lastEntry
    ? `${Math.floor((game.history.length - 1) / 2) + 1}${lastEntry.move.color === 'w' ? '.' : '…'} ${lastEntry.san}`
    : 'KICKOFF — WHITE TO MOVE';
  const jumboClock = clockOn
    ? formatClock(clock.times[game.turn])
    : `MOVE ${Math.floor(game.history.length / 2) + 1}`;
  const scoreFor = (color: Color) =>
    summary.lostBy[color === 'w' ? 'b' : 'w'].reduce((sum, t) => sum + PIECE_VALUES[t], 0);

  if (!started) {
    return <WelcomeScreen college={college} onPlay={handlePlayClassic} onPlayCollege={handlePlayCollege} />;
  }

  return (
    <PieceSetContext.Provider value={pieceConfig}>
      <div
        className={`min-h-full text-zinc-900 dark:text-zinc-100 ${
          college
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-200 dark:from-[#0c1c0e] dark:to-[#07130a]'
            : 'bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950'
        }`}
        style={squareVars}
      >
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-3 py-4 sm:px-6">
          <header className="mb-4 flex items-center justify-between gap-2">
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              {college ? (
                <>
                  <img src={logoUrl(mineTeam)} alt="" className="h-8 w-8 shrink-0 object-contain" />
                  <span className="truncate">
                    {mineTeam.school}{' '}
                    <span className="font-normal text-zinc-500 dark:text-zinc-400">vs {oppTeam.school}</span>
                  </span>
                  <img src={logoUrl(oppTeam)} alt="" className="h-8 w-8 shrink-0 object-contain" />
                </>
              ) : (
                <>
                  ♟ Chess{' '}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">vs {engine.name ?? 'Stockfish'}</span>
                </>
              )}
            </h1>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </header>

          <main className="flex flex-1 flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
            {/* Board column */}
            <div className="relative flex w-full max-w-[min(92vw,calc(100vh-16rem),40rem)] flex-col">
              {celebration && <Celebration colors={celebration} onDone={() => setCelebration(null)} />}
              {college && (
                <div className="overflow-hidden rounded-t-md shadow-lg ring-1 ring-black/20">
                  <Stadium
                    home={mineTeam}
                    away={oppTeam}
                    play={playText}
                    clock={jumboClock}
                    scoreHome={scoreFor(mineSide)}
                    scoreAway={scoreFor(mineSide === 'w' ? 'b' : 'w')}
                    thinking={thinking}
                  />
                </div>
              )}
              <div className="flex items-center">
                <CapturedTray
                  capturer={topColor}
                  label={college ? teamFor(topColor).abbrev : topColor === 'w' ? 'White' : 'Black'}
                  {...trayFor(topColor)}
                />
                {clockOn && <ClockDisplay ms={clock.times[topColor]} active={clockActive === topColor} tn={college} />}
              </div>
              <div className="flex items-stretch gap-1.5">
                {evalOn && <EvalBar evaluation={evaluation} orientation={orientation} />}
                <div className="min-w-0 flex-1">
                  <Board
                    displayed={game.displayed}
                    orientation={orientation}
                    movableColor={movableColor}
                    frozen={game.gameEnd !== null}
                    legalMoves={game.legalMoves}
                    isPromotion={game.isPromotion}
                    onHumanMove={handleHumanMove}
                    onIllegalDrop={handleIllegalDrop}
                    squareColorFor={college ? collegeSquareColor : undefined}
                    turf={college}
                  />
                </div>
              </div>
              {college && (
                <div aria-hidden className="flex h-3.5 overflow-hidden rounded-b-md shadow-lg ring-1 ring-black/20">
                  {Array.from({ length: 16 }, (_, i) => (
                    <span
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: i % 2 ? mineTeam.primary : mineTeam.secondary }}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-center">
                <CapturedTray
                  capturer={bottomColor}
                  label={college ? teamFor(bottomColor).abbrev : bottomColor === 'w' ? 'White' : 'Black'}
                  {...trayFor(bottomColor)}
                />
                {clockOn && (
                  <ClockDisplay ms={clock.times[bottomColor]} active={clockActive === bottomColor} tn={college} />
                )}
              </div>
            </div>

            {/* Side panel */}
            <aside className="flex w-full max-w-[40rem] flex-col gap-3 lg:w-80">
              <StatusBar
                turn={game.turn}
                inCheck={game.inCheck}
                gameEnd={game.gameEnd}
                thinking={thinking}
                engineStatus={engine.status}
                reviewing={!game.displayed.isLive}
                onGoLive={() => game.setViewIndex(game.history.length)}
              />
              {college && <BoothPanel lines={boothLines} />}
              <div className="min-h-40 flex-1 overflow-hidden lg:max-h-72 lg:min-h-0">
                <MoveList history={game.history} viewIndex={game.viewIndex} onSelect={game.setViewIndex} />
              </div>
              <Controls
                sideMode={sideMode}
                onSideModeChange={handleSideMode}
                levelIndex={levelIndex}
                onLevelChange={setLevelIndex}
                onNewGame={handleNewGame}
                onUndo={handleUndo}
                canUndo={game.history.length > 0 && sideMode !== 'watch'}
                onFlip={handleFlip}
                onResign={handleResign}
                canResign={game.gameEnd === null && (sideMode === 'white' || sideMode === 'black')}
                soundOn={soundOn}
                onToggleSound={() => setSoundOn((s) => !s)}
                boardThemeIndex={boardThemeIndex}
                onBoardThemeChange={setBoardThemeIndex}
                appTheme={appTheme}
                onOpenTeamPicker={() => setPickerOpen(true)}
                onExitCollege={handleExitCollege}
                pieceSet={pieceSet}
                onPieceSetChange={setPieceSet}
                timeControlId={timeControlId}
                onTimeControlChange={setTimeControlId}
                evalOn={evalOn}
                onToggleEval={() => setEvalOn((v) => !v)}
                songPlaying={songPlaying}
                songName={songLabel(mineTeam.id)}
                onToggleSong={handleToggleSong}
              />
            </aside>
          </main>

          {pickerOpen && (
            <TeamPicker
              initialMine={mineTeam}
              initialOpp={oppTeam}
              onConfirm={handleKickoff}
              onCancel={() => setPickerOpen(false)}
            />
          )}

          {/* Screen-reader announcements */}
          <div aria-live="polite" role="status" className="sr-only">
            {announcement}
          </div>
        </div>
      </div>
    </PieceSetContext.Provider>
  );
}
