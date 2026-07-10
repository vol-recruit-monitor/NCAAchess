// Dev launcher used by .claude/launch.json: runs the engine-copy step and
// then starts the Vite dev server in-process. Exists so the preview harness
// can start the app with a single absolute `node` invocation, without
// depending on `node` being on PATH (plain `npm run dev` works too).
import './copy-stockfish.mjs';

const { createServer } = await import('vite');
const server = await createServer();
await server.listen();
server.printUrls();
