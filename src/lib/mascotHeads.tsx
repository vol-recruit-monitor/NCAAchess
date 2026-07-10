/**
 * Stylized mascot heads for the Football piece set's queens, drawn in the
 * piece's side colors (white/black) on the 45x45 viewBox. Heads are centered
 * near (22.5, 12) and span roughly y 2–21; the queen body renders below.
 *
 * Each Power Four program maps to an archetype (tiger, bulldog, elephant,
 * gator, …). Programs whose identity isn't a creature (e.g. Illinois'
 * Block I) fall back to a logo medallion.
 */

export interface MascotPalette {
  fill: string;
  stroke: string;
  detail: string;
  logo?: string;
  initial?: string;
}

type P = { p: MascotPalette };

const stroked = (p: MascotPalette, w = 1.2) =>
  ({ stroke: p.stroke, strokeWidth: w, strokeLinejoin: 'round', strokeLinecap: 'round' }) as const;

function Eyes({ p, dx = 3, y = 10.8, r = 1 }: P & { dx?: number; y?: number; r?: number }) {
  return (
    <>
      <circle cx={22.5 - dx} cy={y} r={r} fill={p.detail} />
      <circle cx={22.5 + dx} cy={y} r={r} fill={p.detail} />
    </>
  );
}

function BigCat({ p, stripes }: P & { stripes?: boolean }) {
  return (
    <>
      <path d="M 15.6,8 L 16.6,2.6 L 20.4,6 z" fill={p.fill} {...stroked(p)} />
      <path d="M 29.4,8 L 28.4,2.6 L 24.6,6 z" fill={p.fill} {...stroked(p)} />
      <circle cx={22.5} cy={12} r={7.8} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={15.2} rx={3.4} ry={2.3} fill={p.detail} stroke="none" />
      <circle cx={22.5} cy={13.9} r={0.9} fill={p.stroke} />
      <Eyes p={p} dx={3.2} y={10.3} />
      {stripes && (
        <path d="M 20,5.6 v 2.2 M 22.5,5 v 2.5 M 25,5.6 v 2.2" fill="none" stroke={p.detail} strokeWidth={1.1} strokeLinecap="round" />
      )}
    </>
  );
}

function Dog({ p, pointed }: P & { pointed?: boolean }) {
  return (
    <>
      {pointed ? (
        <>
          <path d="M 15.8,8.5 L 16.2,2.4 L 20.6,6 z" fill={p.fill} {...stroked(p)} />
          <path d="M 29.2,8.5 L 28.8,2.4 L 24.4,6 z" fill={p.fill} {...stroked(p)} />
        </>
      ) : (
        <>
          <path d="M 16.6,6.5 C 13.6,7.5 13,13 14.5,16.5 C 16,16.8 17.6,15.6 18.2,13.5 z" fill={p.detail} {...stroked(p)} />
          <path d="M 28.4,6.5 C 31.4,7.5 32,13 30.5,16.5 C 29,16.8 27.4,15.6 26.8,13.5 z" fill={p.detail} {...stroked(p)} />
        </>
      )}
      <circle cx={22.5} cy={11.8} r={7.4} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={15.4} rx={3.6} ry={2.6} fill={p.detail} stroke="none" />
      <circle cx={22.5} cy={13.9} r={1} fill={p.stroke} />
      <Eyes p={p} dx={3} y={10} />
    </>
  );
}

function Bear({ p }: P) {
  return (
    <>
      <circle cx={16.8} cy={5.8} r={2.7} fill={p.fill} {...stroked(p)} />
      <circle cx={28.2} cy={5.8} r={2.7} fill={p.fill} {...stroked(p)} />
      <circle cx={16.8} cy={5.8} r={1.1} fill={p.detail} />
      <circle cx={28.2} cy={5.8} r={1.1} fill={p.detail} />
      <circle cx={22.5} cy={12} r={7.6} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={15} rx={3.4} ry={2.5} fill={p.detail} stroke="none" />
      <circle cx={22.5} cy={13.6} r={1} fill={p.stroke} />
      <Eyes p={p} dx={3} y={10.2} />
    </>
  );
}

function Bird({ p, crest, longBeak }: P & { crest?: boolean; longBeak?: boolean }) {
  return (
    <>
      {crest && <path d="M 17,6.5 L 17.5,1.8 L 20.3,5 L 22,1.2 L 23.5,4.8 z" fill={p.detail} {...stroked(p, 1)} />}
      <circle cx={21.5} cy={11.5} r={7.2} fill={p.fill} {...stroked(p)} />
      {longBeak ? (
        <path d="M 27.5,10 C 33,10 36.5,12.5 37,15.5 C 34,14.5 30,14.5 27.5,14 z" fill={p.detail} {...stroked(p)} />
      ) : (
        <path d="M 28,9.5 L 35.5,12 L 28,14.5 z" fill={p.detail} {...stroked(p)} />
      )}
      <circle cx={24} cy={9.5} r={1.3} fill={p.detail} />
    </>
  );
}

function Duck({ p }: P) {
  return (
    <>
      <circle cx={21} cy={11.5} r={7.2} fill={p.fill} {...stroked(p)} />
      <rect x={26.5} y={10.2} width={9.5} height={4.6} rx={2.3} fill={p.detail} {...stroked(p)} />
      <circle cx={23.5} cy={9} r={1.3} fill={p.detail} />
    </>
  );
}

function Rooster({ p }: P) {
  return (
    <>
      <path d="M 17.5,7 Q 17.5,2.8 20,4.6 Q 20.8,1.4 23,3.8 Q 25.4,1.6 25.6,5 L 26.5,7.5 z" fill={p.detail} {...stroked(p, 1)} />
      <circle cx={21.5} cy={12} r={7} fill={p.fill} {...stroked(p)} />
      <path d="M 27.7,10.5 L 33.5,12.2 L 27.7,13.9 z" fill={p.detail} {...stroked(p)} />
      <path d="M 26,14 C 27.5,15 27.5,17.5 26,18.5 C 25,17.5 24.8,15.5 26,14 z" fill={p.detail} {...stroked(p, 1)} />
      <circle cx={23.7} cy={9.8} r={1.2} fill={p.detail} />
    </>
  );
}

function Turkey({ p }: P) {
  return (
    <>
      {[-56, -28, 0, 28, 56].map((deg) => (
        <ellipse
          key={deg}
          cx={22.5}
          cy={5.4}
          rx={2}
          ry={5}
          transform={`rotate(${deg} 22.5 10.5)`}
          fill={p.detail}
          {...stroked(p, 0.9)}
        />
      ))}
      <circle cx={22.5} cy={13} r={6.6} fill={p.fill} {...stroked(p)} />
      <path d="M 27.8,12 L 32.5,13.4 L 27.8,14.8 z" fill={p.detail} {...stroked(p)} />
      <path d="M 27.5,13.6 C 28.5,15.2 28,17 27,18 C 26.2,16.8 26.3,14.8 27.5,13.6 z" fill={p.detail} stroke={p.stroke} strokeWidth={0.9} />
      <circle cx={24.5} cy={11} r={1.2} fill={p.detail} />
    </>
  );
}

function Elephant({ p }: P) {
  return (
    <>
      <ellipse cx={18.5} cy={12} rx={6} ry={7.2} fill={p.detail} {...stroked(p)} />
      <circle cx={25} cy={11.5} r={7} fill={p.fill} {...stroked(p)} />
      <path d="M 28.5,15.5 C 30.5,17.5 30.8,19.5 29.5,21.3 C 28,20.8 27,19 27,16.5 z" fill={p.fill} {...stroked(p)} />
      <path d="M 24.5,16.8 L 26.3,18.6" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <circle cx={26} cy={9.8} r={1.1} fill={p.detail} />
    </>
  );
}

function Gator({ p }: P) {
  return (
    <>
      <rect x={12.5} y={10} width={20.5} height={7.5} rx={3.6} fill={p.fill} {...stroked(p)} />
      <circle cx={16.5} cy={9} r={2.3} fill={p.fill} {...stroked(p)} />
      <circle cx={16.5} cy={8.8} r={0.9} fill={p.detail} />
      <circle cx={30.5} cy={9.8} r={1.4} fill={p.fill} {...stroked(p)} />
      <path d="M 15,17.4 l 1.6,-1.8 l 1.6,1.8 l 1.6,-1.8 l 1.6,1.8 l 1.6,-1.8 l 1.6,1.8 l 1.6,-1.8 l 1.6,1.8" fill="none" stroke={p.detail} strokeWidth={1} strokeLinejoin="round" />
    </>
  );
}

function Frog({ p }: P) {
  return (
    <>
      <circle cx={17} cy={6.8} r={2.8} fill={p.fill} {...stroked(p)} />
      <circle cx={28} cy={6.8} r={2.8} fill={p.fill} {...stroked(p)} />
      <circle cx={17} cy={6.8} r={1.1} fill={p.detail} />
      <circle cx={28} cy={6.8} r={1.1} fill={p.detail} />
      <ellipse cx={22.5} cy={13} rx={8.6} ry={6} fill={p.fill} {...stroked(p)} />
      <path d="M 13.8,10.5 L 11.5,9 M 31.2,10.5 L 33.5,9" stroke={p.detail} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <path d="M 18.5,15.5 Q 22.5,17.8 26.5,15.5" fill="none" stroke={p.detail} strokeWidth={1.1} strokeLinecap="round" />
    </>
  );
}

function Turtle({ p }: P) {
  return (
    <>
      <circle cx={22.5} cy={11.8} r={6.8} fill={p.fill} {...stroked(p)} />
      <path d="M 17.5,7.6 L 20.5,9.5 M 27.5,7.6 L 24.5,9.5" stroke={p.detail} strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <path d="M 18.8,14.5 Q 22.5,16.8 26.2,14.5" fill="none" stroke={p.detail} strokeWidth={1.2} strokeLinecap="round" />
      <Eyes p={p} dx={3} y={10.2} r={1.1} />
    </>
  );
}

function Hog({ p }: P) {
  return (
    <>
      <path d="M 16,4.5 L 18,2.6 L 20,4.6 L 22.5,2.4 L 25,4.6 L 27,2.6 L 29,4.5" fill="none" stroke={p.detail} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 15.8,9 L 15,4.6 L 19.4,6.4 z" fill={p.fill} {...stroked(p)} />
      <path d="M 29.2,9 L 30,4.6 L 25.6,6.4 z" fill={p.fill} {...stroked(p)} />
      <circle cx={22.5} cy={12} r={7.4} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={14.6} rx={3.8} ry={2.8} fill={p.detail} {...stroked(p, 0.9)} />
      <circle cx={21.2} cy={14.6} r={0.7} fill={p.stroke} />
      <circle cx={23.8} cy={14.6} r={0.7} fill={p.stroke} />
      <Eyes p={p} dx={3.2} y={9.8} />
    </>
  );
}

function Longhorn({ p }: P) {
  return (
    <>
      <path d="M 18,10 C 13,9.5 9.5,7.5 7.5,4.8 C 11.5,4.4 15.5,5.8 18.8,7.6 z" fill={p.detail} {...stroked(p)} />
      <path d="M 27,10 C 32,9.5 35.5,7.5 37.5,4.8 C 33.5,4.4 29.5,5.8 26.2,7.6 z" fill={p.detail} {...stroked(p)} />
      <circle cx={22.5} cy={12.2} r={6.4} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={15} rx={3.2} ry={2.4} fill={p.detail} stroke="none" />
      <circle cx={21.3} cy={15} r={0.7} fill={p.stroke} />
      <circle cx={23.7} cy={15} r={0.7} fill={p.stroke} />
      <Eyes p={p} dx={2.8} y={10.4} />
    </>
  );
}

function Buffalo({ p }: P) {
  return (
    <>
      <path d="M 16.5,10 C 13.5,9 12.5,6.5 13,4.5 C 15.5,5 17.5,6.8 18.3,9 z" fill={p.detail} {...stroked(p)} />
      <path d="M 28.5,10 C 31.5,9 32.5,6.5 32,4.5 C 29.5,5 27.5,6.8 26.7,9 z" fill={p.detail} {...stroked(p)} />
      <circle cx={22.5} cy={12} r={7.2} fill={p.fill} {...stroked(p)} />
      <path d="M 17,16.8 l 1.7,1.6 l 1.8,-1.6 l 1.9,1.7 l 1.9,-1.7 l 1.8,1.6 l 1.7,-1.6" fill="none" stroke={p.detail} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={20.8} cy={14.8} r={0.7} fill={p.detail} />
      <circle cx={24.2} cy={14.8} r={0.7} fill={p.detail} />
      <Eyes p={p} dx={3.2} y={10} />
    </>
  );
}

function Ram({ p }: P) {
  return (
    <>
      <circle cx={15.4} cy={10.5} r={3.4} fill={p.detail} {...stroked(p)} />
      <circle cx={15.4} cy={10.5} r={1.3} fill={p.fill} stroke={p.stroke} strokeWidth={0.8} />
      <circle cx={29.6} cy={10.5} r={3.4} fill={p.detail} {...stroked(p)} />
      <circle cx={29.6} cy={10.5} r={1.3} fill={p.fill} stroke={p.stroke} strokeWidth={0.8} />
      <circle cx={22.5} cy={12} r={6.6} fill={p.fill} {...stroked(p)} />
      <ellipse cx={22.5} cy={15.2} rx={3} ry={2.2} fill={p.detail} stroke="none" />
      <Eyes p={p} dx={2.8} y={10.2} />
    </>
  );
}

function Horse({ p }: P) {
  return (
    <>
      <path
        d="M 27.5,20.5 C 28,16.5 27.6,14.5 26,12.5 C 26.5,10.8 26.3,8.6 25.1,7.2 L 24.5,3.6 L 22.6,6.4 C 21.9,6.3 21.2,6.4 20.5,6.8 C 17.7,8.5 15.4,11.9 14.7,14.4 C 14.4,15.6 14.9,16.2 15.8,16 C 17,15.8 17.9,15.1 18.8,14.5 C 19.2,14.2 19.7,14.4 19.8,14.8 C 20,15.4 19.4,16.2 18.5,17.2 C 17.5,18.4 16.8,19.3 16.7,20.5 z"
        fill={p.fill}
        {...stroked(p)}
      />
      <circle cx={22} cy={10.5} r={0.9} fill={p.detail} />
    </>
  );
}

function Person({ p, hat }: P & { hat: 'cap' | 'cowboy' | 'tophat' | 'feather' | 'leprechaun' }) {
  return (
    <>
      <circle cx={22.5} cy={12.5} r={6.2} fill={p.fill} {...stroked(p)} />
      {hat === 'cap' && (
        <>
          <path d="M 16.4,10.5 a 6.1,6 0 0 1 12.2,0 z" fill={p.detail} {...stroked(p)} />
          <path d="M 22.5,10.4 h 8.5 a 1.2,1.2 0 0 1 0,2 l -8.5,-0.4 z" fill={p.detail} {...stroked(p, 0.9)} />
        </>
      )}
      {hat === 'cowboy' && (
        <>
          <ellipse cx={22.5} cy={9.2} rx={9.5} ry={2.3} fill={p.detail} {...stroked(p)} />
          <path d="M 18,9 a 4.6,5.4 0 0 1 9,0 z" fill={p.detail} {...stroked(p)} />
        </>
      )}
      {(hat === 'tophat' || hat === 'leprechaun') && (
        <>
          <rect x={18.3} y={1.6} width={8.4} height={7} fill={p.detail} {...stroked(p)} />
          <rect x={15.8} y={7.6} width={13.4} height={2} rx={1} fill={p.detail} {...stroked(p, 0.9)} />
        </>
      )}
      {hat === 'leprechaun' && (
        <path d="M 16.6,13.5 C 17,17.5 19.5,19.5 22.5,19.5 C 25.5,19.5 28,17.5 28.4,13.5 C 26.5,16 25,16.6 22.5,16.6 C 20,16.6 18.5,16 16.6,13.5 z" fill={p.detail} {...stroked(p, 0.9)} />
      )}
      {hat === 'feather' && (
        <>
          <rect x={16.4} y={8.4} width={12.2} height={2.2} rx={1.1} fill={p.detail} {...stroked(p, 0.9)} />
          <ellipse cx={28.6} cy={5} rx={1.4} ry={4} transform="rotate(18 28.6 5)" fill={p.detail} {...stroked(p, 0.8)} />
        </>
      )}
      <Eyes p={p} dx={2.4} y={12} r={0.9} />
    </>
  );
}

function Helm({ p }: P) {
  return (
    <>
      <path d="M 22.5,1.6 C 26.5,2.6 28.3,5.6 28,9.4 L 17,9.4 C 16.7,5.6 18.5,2.6 22.5,1.6 z" fill={p.detail} {...stroked(p)} />
      <path d="M 15.8,15 a 6.7,7 0 0 1 13.4,0 v 4.4 h -13.4 z" fill={p.fill} {...stroked(p)} />
      <rect x={19.3} y={12} width={6.4} height={2.4} rx={1.2} fill={p.stroke} />
    </>
  );
}

function Devil({ p }: P) {
  return (
    <>
      <path d="M 16.6,8 C 15,5.5 15,3 16,1.8 C 17.8,2.8 18.8,5 18.9,7.2 z" fill={p.detail} {...stroked(p)} />
      <path d="M 28.4,8 C 30,5.5 30,3 29,1.8 C 27.2,2.8 26.2,5 26.1,7.2 z" fill={p.detail} {...stroked(p)} />
      <circle cx={22.5} cy={12} r={6.8} fill={p.fill} {...stroked(p)} />
      <path d="M 21,19.5 L 22.5,22 L 24,19.5" fill={p.detail} stroke={p.stroke} strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M 18.2,9 L 21,10.2 M 26.8,9 L 24,10.2" stroke={p.detail} strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Eyes p={p} dx={2.6} y={11.4} r={0.9} />
    </>
  );
}

function Bee({ p }: P) {
  return (
    <>
      <path d="M 19.5,6.5 C 18,4.5 17.6,3 18,1.8 M 25.5,6.5 C 27,4.5 27.4,3 27,1.8" fill="none" stroke={p.stroke} strokeWidth={1.1} strokeLinecap="round" />
      <circle cx={18} cy={2} r={1.2} fill={p.detail} />
      <circle cx={27} cy={2} r={1.2} fill={p.detail} />
      <circle cx={22.5} cy={12.5} r={7} fill={p.fill} {...stroked(p)} />
      <ellipse cx={18.6} cy={11.5} rx={2.2} ry={3.2} fill={p.detail} {...stroked(p, 0.8)} />
      <ellipse cx={26.4} cy={11.5} rx={2.2} ry={3.2} fill={p.detail} {...stroked(p, 0.8)} />
      <path d="M 20,16.6 Q 22.5,18.2 25,16.6" fill="none" stroke={p.detail} strokeWidth={1} strokeLinecap="round" />
    </>
  );
}

function Tree({ p }: P) {
  return (
    <>
      <path d="M 22.5,1.6 L 28.5,9 L 25.8,9 L 31,16.4 L 14,16.4 L 19.2,9 L 16.5,9 z" fill={p.fill} {...stroked(p)} />
      <rect x={20.9} y={16.4} width={3.2} height={4.6} fill={p.detail} {...stroked(p, 0.9)} />
      <Eyes p={p} dx={2.6} y={11} r={0.9} />
    </>
  );
}

function OrangeFruit({ p }: P) {
  return (
    <>
      <circle cx={22.5} cy={12.5} r={7.4} fill={p.fill} {...stroked(p)} />
      <ellipse cx={26.5} cy={4.4} rx={3} ry={1.5} transform="rotate(-24 26.5 4.4)" fill={p.detail} {...stroked(p, 0.9)} />
      <path d="M 24,6.5 C 24,5.5 24.5,4.6 25.4,4" fill="none" stroke={p.stroke} strokeWidth={1} strokeLinecap="round" />
      <Eyes p={p} dx={2.8} y={11.5} r={0.9} />
      <path d="M 20,15.4 Q 22.5,17 25,15.4" fill="none" stroke={p.detail} strokeWidth={1.1} strokeLinecap="round" />
    </>
  );
}

function Buckeye({ p }: P) {
  return (
    <>
      <circle cx={22.5} cy={12.5} r={7.4} fill={p.fill} {...stroked(p)} />
      <path d="M 16,10 a 7,7 0 0 1 13,0 a 12,7.5 0 0 1 -13,0 z" fill={p.detail} {...stroked(p, 0.9)} />
      <Eyes p={p} dx={2.8} y={14} r={0.9} />
    </>
  );
}

function Rodent({ p }: P) {
  return (
    <>
      <circle cx={17.4} cy={5.6} r={2.6} fill={p.fill} {...stroked(p)} />
      <circle cx={27.6} cy={5.6} r={2.6} fill={p.fill} {...stroked(p)} />
      <circle cx={17.4} cy={5.6} r={1.1} fill={p.detail} />
      <circle cx={27.6} cy={5.6} r={1.1} fill={p.detail} />
      <circle cx={22.5} cy={12.2} r={7.2} fill={p.fill} {...stroked(p)} />
      <circle cx={22.5} cy={13.4} r={1} fill={p.stroke} />
      <rect x={20.6} y={15} width={1.8} height={3} rx={0.5} fill="#ffffff" stroke={p.stroke} strokeWidth={0.8} />
      <rect x={22.6} y={15} width={1.8} height={3} rx={0.5} fill="#ffffff" stroke={p.stroke} strokeWidth={0.8} />
      <Eyes p={p} dx={3} y={10.2} />
    </>
  );
}

function Badger({ p }: P) {
  return (
    <>
      <path d="M 16.4,7.8 L 17.2,3.6 L 20.6,6.2 z" fill={p.fill} {...stroked(p)} />
      <path d="M 28.6,7.8 L 27.8,3.6 L 24.4,6.2 z" fill={p.fill} {...stroked(p)} />
      <circle cx={22.5} cy={12} r={7.4} fill={p.fill} {...stroked(p)} />
      <path d="M 20.6,4.8 C 21.2,9 21.2,13 20.4,18.4 L 24.6,18.4 C 23.8,13 23.8,9 24.4,4.8 z" fill={p.detail} stroke="none" />
      <circle cx={22.5} cy={15.8} r={1.1} fill={p.stroke} />
      <Eyes p={p} dx={3.6} y={10.2} />
    </>
  );
}

function LogoMedallion({ p }: P) {
  return (
    <>
      <circle cx={22.5} cy={11.5} r={7.6} fill="#ffffff" {...stroked(p)} />
      <text x={22.5} y={14.6} textAnchor="middle" fontSize={9} fontWeight={900} fill={p.detail} stroke={p.stroke} strokeWidth={0.4} fontFamily="Verdana, sans-serif">
        {p.initial ?? '★'}
      </text>
      {p.logo && <image href={p.logo} x={16.3} y={5.3} width={12.4} height={12.4} />}
    </>
  );
}

type HeadKind =
  | { kind: 'bigcat'; stripes?: boolean }
  | { kind: 'dog'; pointed?: boolean }
  | { kind: 'bear' }
  | { kind: 'bird'; crest?: boolean; longBeak?: boolean }
  | { kind: 'duck' }
  | { kind: 'rooster' }
  | { kind: 'turkey' }
  | { kind: 'elephant' }
  | { kind: 'gator' }
  | { kind: 'frog' }
  | { kind: 'turtle' }
  | { kind: 'hog' }
  | { kind: 'longhorn' }
  | { kind: 'buffalo' }
  | { kind: 'ram' }
  | { kind: 'horse' }
  | { kind: 'person'; hat: 'cap' | 'cowboy' | 'tophat' | 'feather' | 'leprechaun' }
  | { kind: 'helm' }
  | { kind: 'devil' }
  | { kind: 'bee' }
  | { kind: 'tree' }
  | { kind: 'orange' }
  | { kind: 'buckeye' }
  | { kind: 'rodent' }
  | { kind: 'badger' }
  | { kind: 'logo' };

/** Which head each program's queen wears. */
const HEADS: Record<string, HeadKind> = {
  alabama: { kind: 'elephant' },
  arkansas: { kind: 'hog' },
  auburn: { kind: 'bigcat', stripes: true },
  florida: { kind: 'gator' },
  georgia: { kind: 'dog' },
  kentucky: { kind: 'bigcat' },
  lsu: { kind: 'bigcat', stripes: true },
  'mississippi-state': { kind: 'dog' },
  missouri: { kind: 'bigcat', stripes: true },
  oklahoma: { kind: 'person', hat: 'cowboy' },
  'ole-miss': { kind: 'person', hat: 'cap' },
  'south-carolina': { kind: 'rooster' },
  tennessee: { kind: 'dog' },
  texas: { kind: 'longhorn' },
  'texas-a-m': { kind: 'dog' },
  vanderbilt: { kind: 'person', hat: 'cap' },
  illinois: { kind: 'logo' },
  indiana: { kind: 'logo' },
  iowa: { kind: 'bird' },
  maryland: { kind: 'turtle' },
  michigan: { kind: 'badger' },
  'michigan-state': { kind: 'helm' },
  minnesota: { kind: 'rodent' },
  nebraska: { kind: 'person', hat: 'cap' },
  northwestern: { kind: 'bigcat' },
  'ohio-state': { kind: 'buckeye' },
  oregon: { kind: 'duck' },
  'penn-state': { kind: 'bigcat' },
  purdue: { kind: 'person', hat: 'cap' },
  rutgers: { kind: 'helm' },
  ucla: { kind: 'bear' },
  usc: { kind: 'helm' },
  washington: { kind: 'dog', pointed: true },
  wisconsin: { kind: 'badger' },
  arizona: { kind: 'bigcat' },
  'arizona-state': { kind: 'devil' },
  baylor: { kind: 'bear' },
  byu: { kind: 'bigcat' },
  ucf: { kind: 'helm' },
  cincinnati: { kind: 'bigcat' },
  colorado: { kind: 'buffalo' },
  houston: { kind: 'bigcat' },
  'iowa-state': { kind: 'bird', crest: true },
  kansas: { kind: 'bird' },
  'kansas-state': { kind: 'bigcat' },
  'oklahoma-state': { kind: 'person', hat: 'cowboy' },
  tcu: { kind: 'frog' },
  'texas-tech': { kind: 'person', hat: 'cowboy' },
  utah: { kind: 'bird' },
  'west-virginia': { kind: 'person', hat: 'cap' },
  'boston-college': { kind: 'bird' },
  california: { kind: 'bear' },
  clemson: { kind: 'bigcat', stripes: true },
  duke: { kind: 'devil' },
  'florida-state': { kind: 'person', hat: 'feather' },
  'georgia-tech': { kind: 'bee' },
  louisville: { kind: 'bird', crest: true },
  miami: { kind: 'bird', longBeak: true },
  'north-carolina': { kind: 'ram' },
  'nc-state': { kind: 'dog', pointed: true },
  pittsburgh: { kind: 'bigcat' },
  smu: { kind: 'horse' },
  stanford: { kind: 'tree' },
  syracuse: { kind: 'orange' },
  virginia: { kind: 'helm' },
  'virginia-tech': { kind: 'turkey' },
  'wake-forest': { kind: 'person', hat: 'tophat' },
  'notre-dame': { kind: 'person', hat: 'leprechaun' },
};

export function MascotHead({ teamId, p }: { teamId?: string; p: MascotPalette }) {
  const spec: HeadKind = (teamId && HEADS[teamId]) || { kind: 'logo' };
  switch (spec.kind) {
    case 'bigcat':
      return <BigCat p={p} stripes={spec.stripes} />;
    case 'dog':
      return <Dog p={p} pointed={spec.pointed} />;
    case 'bear':
      return <Bear p={p} />;
    case 'bird':
      return <Bird p={p} crest={spec.crest} longBeak={spec.longBeak} />;
    case 'duck':
      return <Duck p={p} />;
    case 'rooster':
      return <Rooster p={p} />;
    case 'turkey':
      return <Turkey p={p} />;
    case 'elephant':
      return <Elephant p={p} />;
    case 'gator':
      return <Gator p={p} />;
    case 'frog':
      return <Frog p={p} />;
    case 'turtle':
      return <Turtle p={p} />;
    case 'hog':
      return <Hog p={p} />;
    case 'longhorn':
      return <Longhorn p={p} />;
    case 'buffalo':
      return <Buffalo p={p} />;
    case 'ram':
      return <Ram p={p} />;
    case 'horse':
      return <Horse p={p} />;
    case 'person':
      return <Person p={p} hat={spec.hat} />;
    case 'helm':
      return <Helm p={p} />;
    case 'devil':
      return <Devil p={p} />;
    case 'bee':
      return <Bee p={p} />;
    case 'tree':
      return <Tree p={p} />;
    case 'orange':
      return <OrangeFruit p={p} />;
    case 'buckeye':
      return <Buckeye p={p} />;
    case 'rodent':
      return <Rodent p={p} />;
    case 'badger':
      return <Badger p={p} />;
    case 'logo':
      return <LogoMedallion p={p} />;
  }
}
