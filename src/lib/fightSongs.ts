import type { ChipSong, Note } from './chiptune';

/**
 * Fight songs. Public-domain-era tunes are hand-transcribed by ear (titles
 * cross-checked against the EA Sports "College Football: Fight Songs" album
 * track list); every program without a transcription gets a deterministic,
 * marching-band-style chiptune generated from its team id, labeled with its
 * real fight song title.
 */

const MARCH_BASS = [48, 43, 48, 43, 53, 48, 43, 48];

/**
 * Tennessee's actual fight song ("Rocky Top", 1967) is still under copyright,
 * so instead of reproducing it we give the Vols an ORIGINAL bluegrass-flavored
 * hoedown in the same up-tempo, banjo-picking spirit — G major, driving 1-4-5.
 */
const TENNESSEE_HOEDOWN: ChipSong = {
  tempo: 172,
  bassPattern: [43, 43, 48, 48, 50, 50, 43, 43], // G G C C D D G G
  melody: [
    [67, 1], [71, 1], [74, 1], [71, 1], [67, 2], [71, 1], [74, 1], [79, 2], [76, 2],
    [72, 1], [76, 1], [79, 1], [76, 1], [72, 2], [74, 2], [71, 4],
    [67, 1], [71, 1], [74, 1], [71, 1], [67, 2], [71, 1], [74, 1], [79, 2], [76, 2],
    [74, 1], [72, 1], [71, 1], [69, 1], [67, 4], [0, 2],
  ],
};

/** Victory March — Notre Dame (1908). */
const VICTORY_MARCH: ChipSong = {
  tempo: 152,
  bassPattern: MARCH_BASS,
  melody: [
    [72, 2], [69, 1], [67, 1], [64, 2], [67, 1], [69, 1], [67, 4],
    [69, 1], [72, 1], [74, 1], [76, 2], [74, 1], [72, 1], [69, 1], [72, 4],
    [72, 1], [72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 4],
    [76, 1], [74, 1], [72, 1], [69, 2], [67, 1], [64, 1], [67, 4], [0, 2],
  ],
};

/** The Victors — Michigan (1898). */
const THE_VICTORS: ChipSong = {
  tempo: 160,
  bassPattern: MARCH_BASS,
  melody: [
    [67, 2], [64, 1], [65, 1], [67, 1], [69, 1], [65, 2],
    [69, 2], [65, 1], [67, 1], [69, 1], [71, 1], [67, 2],
    [71, 2], [71, 1], [72, 2], [69, 1], [65, 1], [67, 4], [0, 2],
  ],
};

/** Boomer Sooner — Oklahoma (tune of "Yale Boola", 1905). */
const BOOMER_SOONER: ChipSong = {
  tempo: 168,
  bassPattern: [48, 43, 48, 43],
  melody: [
    [67, 1], [64, 1], [60, 1], [64, 1], [67, 1], [64, 1], [60, 1], [64, 1],
    [67, 1], [64, 1], [60, 1], [64, 1], [62, 1], [62, 1], [67, 4],
    [0, 2],
  ],
};

/** On, Wisconsin! (1909). */
const ON_WISCONSIN: ChipSong = {
  tempo: 152,
  bassPattern: [53, 48, 53, 48, 55, 48, 53, 48],
  melody: [
    [72, 1], [77, 2], [77, 1], [77, 2], [72, 1], [79, 2], [79, 1], [79, 2],
    [77, 1], [79, 1], [81, 2], [77, 1], [74, 2], [72, 4], [0, 2],
  ],
};

/** Battle Hymn of the Republic (1862) — Georgia's Glory Glory and Colorado's Glory, Glory Colorado. */
const GLORY_GLORY: ChipSong = {
  tempo: 144,
  bassPattern: [48, 43, 48, 43, 53, 48, 55, 48],
  melody: [
    [76, 2], [74, 1], [72, 3], [69, 2], [72, 2], [74, 1], [76, 3], [0, 1],
    [76, 2], [74, 1], [72, 3], [72, 2], [71, 2], [71, 1], [72, 3], [0, 1],
    [72, 2], [74, 1], [76, 3], [77, 2], [79, 2], [77, 1], [76, 3], [0, 1],
    [76, 2], [74, 2], [72, 2], [74, 2], [72, 4], [0, 2],
  ],
};

/** Texas Fight — Texas (built on a double-time "Taps"). */
const TEXAS_FIGHT: ChipSong = {
  tempo: 176,
  bassPattern: MARCH_BASS,
  melody: [
    [67, 1], [67, 1], [72, 2], [67, 1], [72, 1], [76, 2],
    [67, 1], [72, 1], [76, 1], [72, 1], [67, 1], [72, 1], [76, 2],
    [76, 1], [76, 1], [76, 1], [79, 2], [76, 1], [72, 1], [76, 4],
    [76, 1], [72, 1], [67, 1], [72, 1], [64, 1], [67, 1], [60, 4], [0, 2],
  ],
};

/** Tiger Rag (1917) — LSU and Clemson. */
const TIGER_RAG: ChipSong = {
  tempo: 176,
  bassPattern: [48, 43, 48, 43],
  melody: [
    [72, 1], [0, 1], [72, 1], [0, 1], [72, 1], [69, 3],
    [72, 1], [0, 1], [72, 1], [0, 1], [72, 1], [69, 3],
    [72, 1], [0, 1], [72, 1], [0, 1], [72, 1], [69, 2], [67, 1], [69, 1], [72, 4], [0, 2],
  ],
};

/** The Good Old Song — Virginia (tune of "Auld Lang Syne"). */
const GOOD_OLD_SONG: ChipSong = {
  tempo: 116,
  bassPattern: [53, 48, 53, 48, 55, 48, 53, 48],
  melody: [
    [60, 1], [65, 2], [65, 1], [65, 1], [69, 1], [67, 2], [65, 1], [67, 1], [69, 1],
    [65, 2], [65, 1], [69, 1], [72, 1], [74, 4],
    [74, 1], [72, 2], [69, 1], [69, 1], [65, 1], [67, 2], [65, 1], [67, 1], [69, 1],
    [65, 2], [62, 1], [62, 1], [60, 1], [65, 4], [0, 2],
  ],
};

/** Ramblin' Wreck — Georgia Tech (tune of "Son of a Gambolier"). */
const RAMBLIN_WRECK: ChipSong = {
  tempo: 160,
  bassPattern: MARCH_BASS,
  melody: [
    [67, 1], [67, 1], [67, 1], [64, 1], [67, 1], [69, 1], [67, 1], [64, 1],
    [62, 1], [62, 1], [62, 1], [59, 1], [62, 1], [64, 1], [62, 1], [59, 1],
    [60, 1], [60, 1], [60, 1], [64, 1], [67, 1], [72, 2], [69, 1], [67, 1], [64, 1], [62, 1], [60, 4],
    [0, 2],
  ],
};

/** Buckeye Battle Cry — Ohio State (1919, approximation). */
const BUCKEYE_BATTLE_CRY: ChipSong = {
  tempo: 152,
  bassPattern: MARCH_BASS,
  melody: [
    [72, 1], [72, 1], [74, 1], [76, 2], [74, 1], [72, 2], [69, 1], [67, 1], [69, 1], [72, 2], [67, 4],
    [69, 1], [69, 1], [71, 1], [72, 2], [74, 1], [76, 1], [74, 1], [72, 1], [74, 4], [0, 2],
  ],
};

/** Fight On — USC (1922, approximation). */
const FIGHT_ON: ChipSong = {
  tempo: 152,
  bassPattern: MARCH_BASS,
  melody: [
    [67, 1], [72, 1], [76, 2], [79, 2], [0, 1],
    [76, 1], [74, 1], [72, 1], [74, 2], [76, 1], [72, 4],
    [69, 1], [71, 1], [72, 1], [74, 2], [76, 1], [79, 4], [0, 2],
  ],
};

/** Aggie War Hymn — Texas A&M (1918, approximation). */
const AGGIE_WAR_HYMN: ChipSong = {
  tempo: 152,
  bassPattern: [48, 48, 43, 43],
  melody: [
    [67, 1], [67, 1], [0, 1], [67, 1], [67, 1], [0, 1], // Hullabaloo, caneck! caneck!
    [76, 1], [76, 1], [74, 1], [72, 1], [71, 1], [72, 1], [74, 2],
    [72, 1], [72, 1], [71, 1], [69, 1], [67, 1], [69, 1], [71, 2],
    [72, 1], [74, 1], [76, 2], [74, 1], [72, 1], [71, 1], [72, 4], [0, 2],
  ],
};

/** Minnesota Rouser (1909, approximation). */
const MINNESOTA_ROUSER: ChipSong = {
  tempo: 152,
  bassPattern: MARCH_BASS,
  melody: [
    [72, 2], [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [72, 2], [69, 1], [72, 4],
    [72, 1], [74, 1], [76, 1], [77, 1], [79, 2], [77, 1], [76, 1], [74, 4], [0, 2],
  ],
};

/** Down the Field — Syracuse (1905, approximation). */
const DOWN_THE_FIELD: ChipSong = {
  tempo: 144,
  bassPattern: MARCH_BASS,
  melody: [
    [76, 2], [74, 2], [72, 2], [71, 2], [69, 2], [72, 2], [67, 4],
    [67, 1], [69, 1], [71, 1], [72, 1], [74, 2], [76, 2], [74, 4], [0, 2],
  ],
};

/** For Boston — Boston College (1885, approximation). */
const FOR_BOSTON: ChipSong = {
  tempo: 126,
  bassPattern: [48, 43, 53, 43],
  melody: [
    [60, 2], [64, 2], [67, 2], [72, 3], [71, 1], [69, 2], [67, 2], [65, 2], [64, 4],
    [64, 2], [65, 2], [67, 2], [69, 3], [67, 1], [65, 2], [64, 2], [62, 2], [60, 4], [0, 2],
  ],
};

/** Yea Alabama (1926, approximation). */
const YEA_ALABAMA: ChipSong = {
  tempo: 160,
  bassPattern: MARCH_BASS,
  melody: [
    [72, 2], [76, 1], [74, 1], [72, 1], [69, 2], [67, 1], [69, 1], [72, 2], [0, 1],
    [72, 1], [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [76, 4], [0, 2],
  ],
};

const TRANSCRIBED: Record<string, ChipSong> = {
  tennessee: TENNESSEE_HOEDOWN,
  'notre-dame': VICTORY_MARCH,
  michigan: THE_VICTORS,
  oklahoma: BOOMER_SOONER,
  wisconsin: ON_WISCONSIN,
  georgia: GLORY_GLORY,
  colorado: GLORY_GLORY,
  texas: TEXAS_FIGHT,
  lsu: TIGER_RAG,
  clemson: TIGER_RAG,
  virginia: GOOD_OLD_SONG,
  'georgia-tech': RAMBLIN_WRECK,
  'ohio-state': BUCKEYE_BATTLE_CRY,
  usc: FIGHT_ON,
  'texas-a-m': AGGIE_WAR_HYMN,
  minnesota: MINNESOTA_ROUSER,
  syracuse: DOWN_THE_FIELD,
  'boston-college': FOR_BOSTON,
  alabama: YEA_ALABAMA,
};

/** Canonical fight song titles (album-informed where available). */
const SONG_TITLES: Record<string, string> = {
  alabama: 'Yea Alabama', arkansas: 'Arkansas Fight', auburn: 'War Eagle',
  florida: 'The Orange and Blue', georgia: 'Glory Glory', kentucky: 'On, On, U of K',
  lsu: 'Tiger Rag', 'mississippi-state': 'Hail State', missouri: 'Every True Son',
  oklahoma: 'Boomer Sooner', 'ole-miss': 'Forward Rebels', 'south-carolina': 'Step to the Rear',
  tennessee: 'Vols Hoedown', texas: 'Texas Fight', 'texas-a-m': 'Aggie War Hymn', vanderbilt: 'Dynamite',
  illinois: 'Oskee Wow-Wow', indiana: 'Indiana, Our Indiana', iowa: 'Iowa Fight Song',
  maryland: 'Maryland Fight Song', michigan: 'The Victors', 'michigan-state': 'Victory for MSU',
  minnesota: 'Minnesota Rouser', nebraska: 'Dear Old Nebraska U', northwestern: 'Go U Northwestern',
  'ohio-state': 'Buckeye Battle Cry', oregon: 'Mighty Oregon', 'penn-state': 'Fight On, State',
  purdue: 'Hail Purdue', rutgers: 'The Bells Must Ring', ucla: 'Mighty Bruins', usc: 'Fight On',
  washington: 'Bow Down to Washington', wisconsin: 'On, Wisconsin',
  arizona: 'Bear Down, Arizona', 'arizona-state': 'Maroon and Gold', baylor: 'Old Fight',
  byu: 'Rise and Shout', ucf: 'Charge On', cincinnati: 'Cheer Cincinnati',
  colorado: 'Glory, Glory Colorado', houston: 'Cougar Fight Song', 'iowa-state': 'ISU Fights',
  kansas: "I'm a Jayhawk", 'kansas-state': 'Wildcat Victory', 'oklahoma-state': "Ride 'Em Cowboys",
  tcu: 'TCU Fight Song', 'texas-tech': 'Fight, Raiders, Fight', utah: 'Utah Man',
  'west-virginia': 'Hail West Virginia',
  'boston-college': 'For Boston', california: 'Fight for California', clemson: 'Tiger Rag',
  duke: 'Fight! Blue Devils', 'florida-state': 'FSU Fight Song', 'georgia-tech': "Ramblin' Wreck",
  louisville: 'Fight! U of L', miami: 'Miami U Fight Song', 'north-carolina': "I'm a Tar Heel Born",
  'nc-state': 'NC State Fight Song', pittsburgh: 'Hail to Pitt', smu: 'Peruna',
  stanford: 'Come Join the Band', syracuse: 'Down the Field', virginia: 'The Good Old Song',
  'virginia-tech': 'Tech Triumph', 'wake-forest': "O Here's to Wake Forest", 'notre-dame': 'Victory March',
};

// --- Generated marches for teams without a transcription ---------------------

/** Deterministic PRNG seeded from a string, so each team's march is stable. */
function seeded(id: string): () => number {
  let h = 2166136261;
  for (const ch of id) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76]; // C major, C4..E5

/** A four-phrase, marching-band-flavored chiptune unique to the team. */
function generatedMarch(id: string): ChipSong {
  const rand = seeded(id);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const melody: Note[] = [];
  for (let phrase = 0; phrase < 4; phrase++) {
    let idx = phrase === 0 ? 4 : Math.floor(rand() * SCALE.length);
    let eighths = 0;
    while (eighths < 14) {
      const len = pick([1, 1, 1, 2, 2] as const);
      melody.push([SCALE[idx], len]);
      eighths += len;
      const step = pick([-2, -1, -1, 1, 1, 2, 3] as const);
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + step));
    }
    melody.push(phrase === 3 ? [72, 4] : [pick([64, 67, 72] as const), 4]);
    if (phrase === 3) melody.push([0, 2]);
  }
  return {
    tempo: 148 + Math.floor(rand() * 24),
    bassPattern: pick([
      MARCH_BASS,
      [48, 43, 53, 43, 48, 43, 55, 43],
      [48, 48, 43, 43, 53, 53, 43, 43],
    ] as const) as number[],
    melody,
  };
}

const generatedCache = new Map<string, ChipSong>();

export function fightSongFor(teamId: string): ChipSong {
  const real = TRANSCRIBED[teamId];
  if (real) return real;
  let song = generatedCache.get(teamId);
  if (!song) {
    song = generatedMarch(teamId);
    generatedCache.set(teamId, song);
  }
  return song;
}

/** Whether the team's song is a real transcription (vs a generated march). */
export function hasTranscribedSong(teamId: string): boolean {
  return teamId in TRANSCRIBED;
}

/** The team's actual fight song title (used for the play button). */
export function songLabel(teamId: string): string {
  return SONG_TITLES[teamId] ?? 'Fight Song';
}
