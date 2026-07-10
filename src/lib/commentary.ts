import type { Move, Team } from '../types';
import { PIECE_NAMES } from '../types';

/**
 * The ESPN booth: Pat McAfee and Kirk Herbstreit react to the action.
 * Lines are picked from event-specific banks and lightly templated with
 * team/mascot/piece names.
 */

export interface BoothLine {
  id: number;
  speaker: 'pat' | 'kirk';
  text: string;
}

export const SPEAKERS = {
  pat: { name: 'Pat McAfee', short: 'PM' },
  kirk: { name: 'Kirk Herbstreit', short: 'KH' },
} as const;

let nextId = 1;
const line = (speaker: 'pat' | 'kirk', text: string): BoothLine => ({ id: nextId++, speaker, text });
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function kickoffLines(home: Team, away: Team, venue: string): BoothLine[] {
  return [
    line(
      'pat',
      pick([
        `WELCOME TO ${venue.toUpperCase()}, BEAUTIFUL PEOPLE! ${home.school}. ${away.school}. Sixty-four squares of PURE VIOLENCE… tastefully, of course.`,
        `IT'S SATURDAY SOMEWHERE, BABY! Live from ${venue} — the ${home.mascot} host the ${away.mascot} and I am JACKED.`,
        `FOR THE BRAND! ${home.school} versus ${away.school} from ${venue}. Somebody hide the queens, this one's gonna get physical.`,
      ]),
    ),
    line(
      'kirk',
      pick([
        `Pat, I watched the film all week — whoever wins the battle for those middle four squares wins this football game. It's that simple.`,
        `Keys to the game: protect your king like it's third-and-long, establish the pawns early, and don't get cute on the road.`,
        `You look at this ${away.mascot} roster on paper, Pat — but chess isn't played on paper. It's played on 64 squares of hostile territory.`,
      ]),
    ),
  ];
}

export function moveLines(move: Move, mover: Team, defender: Team): BoothLine[] {
  const isMate = move.san.includes('#');
  const isCheck = move.san.includes('+');
  const captured = move.captured ? PIECE_NAMES[move.captured] : null;

  if (isMate) {
    return [
      line(
        'pat',
        pick([
          `IT'S OVERRRR! ${mover.school.toUpperCase()} WINS IT ALL! THE ${mover.mascot.toUpperCase()} ARE STORMING THE FIELD! SOMEBODY GUARD THE GOALPOSTS!`,
          `CHECKMATE, BABY! ${mover.school} WALKS IT OFF! I have CHILLS. CHILLS!`,
          `BALLGAME! ${mover.school} slams the door! Tell the equipment truck to start the bus!`,
        ]),
      ),
      line(
        'kirk',
        pick([
          `What a finish. ${defender.school} is going to be sick watching this film — you simply cannot leave your king in traffic like that in crunch time.`,
          `You've got to hand it to the ${mover.mascot}, Pat. They imposed their will square by square. That's championship DNA.`,
          `Devastating for ${defender.school}. Great teams finish drives, and that's exactly what ${mover.school} just did.`,
        ]),
      ),
    ];
  }

  if (move.promotion) {
    return [
      line(
        'pat',
        pick([
          `HE'S GONE THE DISTANCE! That little pawn took it EIGHTY YARDS TO THE HOUSE and now he's a ${PIECE_NAMES[move.promotion]}! TOUCHDOWN ${mover.school.toUpperCase()}!`,
          `PROMOTION! From walk-on to ALL-AMERICAN in one play! I LOVE this sport!`,
        ]),
      ),
      line('kirk', `That's what player development looks like, Pat. You recruit a pawn, you coach him up, and on Saturday he becomes a ${PIECE_NAMES[move.promotion]}.`),
    ];
  }

  if (move.flags.includes('e')) {
    return [
      line('pat', `EN PASSANT?! EN PASSANT! You do NOT see that every Saturday, folks! That's a trick play from a French playbook!`),
      line('kirk', `Textbook situational awareness. Most pawns don't even know that rule exists — that's film study right there.`),
    ];
  }

  if (move.flags.includes('k') || move.flags.includes('q')) {
    return [
      line(
        pick(['pat', 'kirk'] as const),
        pick([
          `Max protect! The offensive line slides ${move.flags.includes('k') ? 'right' : 'left'} and the king is safe in the pocket.`,
          `Smart situational football — ${mover.school} castles and the king lives to see another drive.`,
          `THE KING IS IN WITNESS PROTECTION, FOLKS! Castled up, rook on guard duty.`,
        ]),
      ),
    ];
  }

  if (isCheck) {
    return [
      line(
        pick(['pat', 'kirk'] as const),
        pick([
          `THE ${defender.mascot.toUpperCase()} KING IS UNDER PRESSURE! Blitz coming off the edge!`,
          `Check! ${defender.school}'s king is scrambling out of the pocket, Pat — somebody pick up the free rusher.`,
          `That's a free hit on the quarterback! ${defender.school} has GOT to answer here.`,
        ]),
      ),
    ];
  }

  if (captured) {
    const big = move.captured === 'q' || move.captured === 'r';
    if (big) {
      return [
        line('pat', pick([
          `TURNOVER! THE ${captured.toUpperCase()} IS GONE! ${mover.school.toUpperCase()} TAKES IT THE OTHER WAY!`,
          `HE FUMBLED THE ${captured.toUpperCase()}! Scoop and score, baby! That's a MOMENTUM SWING!`,
        ])),
        line('kirk', pick([
          `You just can't put the ${captured} on the ground in that spot. ${defender.school} was driving, and now look at this.`,
          `That's a back-breaker, Pat. Losing a ${captured} on the road? The sideline body language says it all.`,
        ])),
      ];
    }
    return [
      line(
        pick(['pat', 'kirk'] as const),
        pick([
          `Big hit at ${move.to}! The ${captured} never saw it coming.`,
          `${mover.school} wins the trade at ${move.to} — that's winning the line of scrimmage.`,
          `And the ${captured} gets ESCORTED to the sideline. Physical brand of chess right there.`,
          `That ${captured} just got put on a POSTER at ${move.to}!`,
        ]),
      ),
    ];
  }

  // Occasional color commentary on quiet moves so the booth stays alive
  // without spamming every play.
  if (Math.random() < 0.18) {
    return [
      line(
        pick(['pat', 'kirk'] as const),
        pick([
          `${mover.school} just methodically moving the chains with ${move.san}.`,
          `Quiet development from the ${mover.mascot}. This is a heavyweight fight, folks.`,
          `I like what ${mover.school} is scheming up on that side of the board.`,
          `${move.san}. Doesn't make the highlight reel, but that's winning football.`,
          `The ${mover.mascot} are playing complementary chess right now — all eleven… er, sixteen pieces on a string.`,
        ]),
      ),
    ];
  }
  return [];
}

export function endgameLines(reason: string, winner: Team | null, loser: Team | null): BoothLine[] {
  if (reason === 'Checkmate') return []; // handled with the move itself
  if (winner && loser) {
    return [
      line('pat', `AND THAT'S THE BALLGAME — ${winner.school.toUpperCase()} TAKES IT! ${reason}!`),
      line('kirk', `Tough way to lose one for ${loser.school}, but you make your own luck in this sport.`),
    ];
  }
  return [
    line('pat', `A DRAW?! ${reason}! Nobody storms the field for a tie, folks, but that was a HECK of a football game.`),
    line('kirk', `Both staffs will take it, Pat. Live to fight another Saturday.`),
  ];
}
