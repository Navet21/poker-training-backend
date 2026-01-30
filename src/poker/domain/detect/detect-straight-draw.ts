import type { Board, Rank } from '../../types';
import type { Card } from '../../interfaces';

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

export type StraightDrawKind = 'NONE' | 'OESD_2x2' | 'GUTSHOT_2x2';

export interface StraightDrawInfo {
  kind: StraightDrawKind;
}

/**
 * Heurística v1:
 * - Consideramos los ranks únicos de hole+board (ace-high y ace-low)
 * - Buscamos si hay 4 ranks que encajan en una ventana de 5 (span<=4):
 *    - si span==3 -> es OESD “cerrada” (realmente es 4 consecutivas)
 *    - si span==4 -> puede ser OESD o Gutshot:
 *        - si faltan ranks en medio (hay hueco) => gutshot
 *        - si no hay hueco (4 consecutivas) => OESD
 * Esto no cubre todos los casos perfectos, pero para trainer v1 es usable.
 */
export function detectStraightDraw2x2(
  hole: Card[],
  board: Board,
): StraightDrawInfo {
  if (hole.length !== 2 || board.length < 3) return { kind: 'NONE' };

  const ranks = Array.from(
    new Set([...hole, ...board].map((c) => RANK_VALUES[c.rank])),
  ).sort((a, b) => a - b);

  const ranksAceLow = Array.from(
    new Set(
      [...hole, ...board].map((c) =>
        RANK_VALUES[c.rank] === 14 ? 1 : RANK_VALUES[c.rank],
      ),
    ),
  ).sort((a, b) => a - b);

  const best = classifyStraightWindow(ranks);
  const bestLow = classifyStraightWindow(ranksAceLow);

  // prioriza el mejor
  return best !== 'NONE' ? { kind: best } : { kind: bestLow };
}

function classifyStraightWindow(uniqRanks: number[]): StraightDrawKind {
  if (uniqRanks.length < 4) return 'NONE';

  // revisa ventanas de 4 ranks
  for (let i = 0; i <= uniqRanks.length - 4; i++) {
    const slice = uniqRanks.slice(i, i + 4);
    const span = slice[3] - slice[0];
    if (span > 4) continue;

    // construye set esperado entre min..max
    const expected: number[] = [];
    for (let v = slice[0]; v <= slice[3]; v++) expected.push(v);

    const missing = expected.filter((v) => !slice.includes(v)).length;

    if (span === 3 && missing === 0) return 'OESD_2x2'; // 4 consecutivas
    if (span === 4) {
      // si falta 1 rank dentro -> gutshot; si no falta -> también OESD (caso raro por duplicados)
      if (missing === 1) return 'GUTSHOT_2x2';
      if (missing === 0) return 'OESD_2x2';
    }
  }

  return 'NONE';
}
