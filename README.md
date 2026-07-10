# Chess vs Stockfish

A polished, single-page chess app: play against Stockfish (WASM, running in a
Web Worker) with tactile drag-and-drop, full rules enforcement via chess.js,
move review, sounds, and light/dark themes. Everything runs client-side — no
backend.

Extras: a 🏈 **College Football mode** — all 68 Power Four programs (plus
Notre Dame) with real names, brand colors, and official logos; a **Play Now**
screen with conference filtering; a green-field board whose back ranks wear
each team's primary/secondary colors; a cartoon stadium (correct venue names,
e.g. Neyland Stadium) with a live jumbotron; classic white/black pieces
where the **pawns suit up in their team's real primary helmet** (68 helmet
specs in `src/lib/teams.ts`, including Michigan's winged helmet) over plain
"00" jerseys; a subtle **turf texture** over the board; **fireworks and a
field-rush** when either side delivers checkmate; a live **Pat McAfee & Kirk
Herbstreit booth** (`src/lib/commentary.ts`) reacting to captures, checks,
castles, promotions, en passant, and the final whistle; and an
**8-bit fight song per team** (hand-transcribed classics — Rocky Top for Tennessee, The Victors,
Victory March, Boomer Sooner, On Wisconsin, Glory Glory, The Eyes of Texas,
Tiger Rag — with a generated marching-band chiptune for everyone else).
Plus a **welcome screen**, **15 difficulty levels** (~300 → 3000+ Elo, mapped to
Stockfish's `UCI_Elo` / Skill Level), **right-click arrows & square highlights**
on desktop (chess.com-style, with shift/alt/ctrl colors), **chess clocks** with
selectable time controls, an optional **evaluation bar** powered by a second
Stockfish worker, and **seven piece design sets**. Fully responsive for phones.

## Run it

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:5173).

> `npm install` runs a small postinstall script that copies the single-threaded
> Stockfish 17.1 WASM build from `node_modules/stockfish` into
> `public/stockfish/` (it also runs before `dev`/`build`). No other setup is
> needed.

`npm run build` produces a static production build in `dist/`.

## Host it on GitHub Pages

The app is a fully static, base-relative build, so it runs from any subpath.

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages → Build and deployment**, and set
   **Source** to **GitHub Actions**.
3. Push to `main` (or `master`). The included workflow
   ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) installs deps,
   builds, and publishes `dist/` automatically.
4. Your site goes live at `https://<user>.github.io/<repo>/` — playable on phone,
   tablet, or desktop.

No config edit is needed for the repo name: `vite.config.ts` uses `base: './'`
and every runtime asset (including the Stockfish worker) loads via
`import.meta.env.BASE_URL`, so it works at any path.

## How to play

- Drag a piece (mouse or touch) or click it, then click a highlighted target.
- Dots mark quiet moves, rings mark captures; illegal drops animate back.
- Right-click clears the selection.
- Use the side panel for New Game, Undo (takes back your move and the engine's
  reply), Flip Board, Resign, difficulty (Beginner → Master, mapped to
  Stockfish skill level + search limits), side switching (White / Black / both
  sides / engine vs engine), board colors, and sounds.
- Click any move in the move list to review that position, then "back to game"
  (or the ⏭ button) to return.

## Architecture

- `src/hooks/useChessGame.ts` — single source of truth for game state. Wraps a
  `chess.js` instance; exposes the piece list (with stable ids so pieces can
  animate), SAN history, review view-index, and game-end detection.
- `src/hooks/useEngine.ts` — loads Stockfish in a Web Worker and speaks UCI
  (`uci`/`isready`/`position fen`/`go depth N movetime M`). Searches resolve as
  promises; stale searches (new game, undo, side switch) are cancelled and
  resolve `null`, which callers ignore — the UI thread never blocks.
- `src/components/Board.tsx` — custom board: pointer-event drag & drop,
  click-to-move, legal-move hints, last-move/check/selection highlights,
  coordinates, keyboard (arrow keys + Enter) support.
- `src/components/PromotionDialog.tsx`, `MoveList.tsx`, `CapturedTray.tsx`,
  `Controls.tsx`, `StatusBar.tsx` — presentational components.
- `src/hooks/useClock.ts` — chess clock (per-side countdown, increments,
  flag-on-zero). `src/hooks/useEvaluator.ts` — second Stockfish worker that
  streams `info score` lines for the eval bar.
- `src/lib/teams.ts` — the 68 Power Four programs (ids, names, abbreviations,
  brand colors, venues), generated from ESPN's public team API. Logos are
  loaded from ESPN's CDN at runtime with a monogram fallback when offline.
- `src/components/TeamPicker.tsx` — the Play Now screen (conference tabs,
  you/opponent slots, random opponent).
- `src/lib/chiptune.ts` + `src/lib/fightSongs.ts` — the 8-bit sequencer and
  per-team fight songs (transcribed classics + seeded generated marches).
- `src/components/EvalBar.tsx`, `ClockDisplay.tsx`, `Stadium.tsx` — evaluation
  bar, clock chips, and the cartoon stadium backdrop with its live
  jumbotron (play-by-play, clock, material score, matchup logos).
- `src/lib/gameUtils.ts` — piece-list move application (castling, en passant,
  promotion), captured-material summary, game-end reasons, move descriptions
  for the aria-live announcer.
- `src/lib/sounds.ts` — tiny WebAudio synthesizer (no audio files).
- `src/lib/pieces.tsx` — all SVG piece sets, including the team-parameterized
  Football set.

## Swapping or adding piece art

All piece graphics live in [`src/lib/pieces.tsx`](src/lib/pieces.tsx),
organized as named sets (Classic, Wood, Glyph, 8-Bit, Flat, Bubble,
Tennessee). Each piece is a small React component rendering into a 45×45
viewBox. To add a set, implement the six glyphs and register the set in
`PIECE_SETS` — nothing else references the artwork, and it appears in the
"Piece design" dropdown automatically.
