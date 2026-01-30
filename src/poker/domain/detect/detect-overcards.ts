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

export function detectOvercards(hole: Card[], board: Board): number {
  if (hole.length !== 2 || board.length < 3) return 0;

  const boardMax = Math.max(...board.map((c) => RANK_VALUES[c.rank]));
  const holeValues = hole.map((c) => RANK_VALUES[c.rank]);

  return holeValues.filter((v) => v > boardMax).length; // 0..2
}
