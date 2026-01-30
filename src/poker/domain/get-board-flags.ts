import type { Board } from '../types';
import type { Rank } from '../types';
import type {
  BoardFlags,
  FlushState,
  PairedType,
  StraightPressure,
} from './board-flags.type';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function getPairedTypeAnd88Plus(board: Board): {
  pairedType: PairedType;
  isPaired88Plus: boolean;
} {
  const counts = new Map<number, number>();
  for (const c of board) {
    const v = RANK_VALUES[c.rank];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  const groups = Array.from(counts.entries()) // [rankValue, count]
    .sort((a, b) => b[1] - a[1]); // por count desc

  const maxCount = groups[0]?.[1] ?? 1;

  if (maxCount >= 3) return { pairedType: 'trips', isPaired88Plus: true }; // si hay trips da igual el 88+, lo marcamos true por “paired fuerte”
  const pairs = groups.filter(([, count]) => count === 2);

  if (pairs.length >= 2) {
    const highestPairRank = Math.max(...pairs.map(([rankValue]) => rankValue));
    return {
      pairedType: 'double_paired',
      isPaired88Plus: highestPairRank >= 8,
    };
  }

  if (pairs.length === 1) {
    const pairRank = pairs[0][0];
    return { pairedType: 'paired', isPaired88Plus: pairRank >= 8 };
  }

  return { pairedType: 'none', isPaired88Plus: false };
}

function getFlushState(board: Board): FlushState {
  const suitCounts: Record<string, number> = {};
  for (const c of board) suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1;
  const maxSuitCount = Math.max(...Object.values(suitCounts), 0);

  if (maxSuitCount >= 3) return 'three_tone';
  if (maxSuitCount === 2) return 'two_tone';
  return 'rainbow';
}

// v1 (flop-friendly):
// - two_card_straight_possible: 3 ranks que caben en ventana de 5 (max-min <= 4)
// - one_card_straight_possible: 3 ranks que caben en ventana de 4 (max-min <= 3) -> más “tenso”
// Nota: en turn/river lo refinamos, pero para flop vale.
function getStraightPressure(board: Board): StraightPressure {
  const ranks = Array.from(new Set(board.map((c) => RANK_VALUES[c.rank]))).sort(
    (a, b) => a - b,
  );

  if (ranks.length < 3) return 'none';

  const span = ranks[ranks.length - 1] - ranks[0];

  // Ajuste Ace-low: A puede ser 1 en proyectos bajos
  const ranksAceLow = Array.from(
    new Set(
      board.map((c) => (RANK_VALUES[c.rank] === 14 ? 1 : RANK_VALUES[c.rank])),
    ),
  ).sort((a, b) => a - b);

  const spanAceLow = ranksAceLow[ranksAceLow.length - 1] - ranksAceLow[0];

  const minSpan = Math.min(span, spanAceLow);

  if (minSpan <= 3) return 'one_card_straight_possible';
  if (minSpan <= 4) return 'two_card_straight_possible';
  return 'none';
}

/**
 * OJO: aquí NO calculamos texture aún. Solo flags objetivos.
 * texture la calculará TextureService para no romper tu API.
 */
export function getBoardBaseFlags(board: Board): Omit<BoardFlags, 'texture'> {
  const { pairedType, isPaired88Plus } = getPairedTypeAnd88Plus(board);
  const flushState = getFlushState(board);
  const straightPressure = getStraightPressure(board);

  return { pairedType, isPaired88Plus, flushState, straightPressure };
}
