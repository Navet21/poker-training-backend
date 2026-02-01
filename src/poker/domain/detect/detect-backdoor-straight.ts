import type { Card } from 'src/poker/interfaces';
import type { Rank } from 'src/poker/types';

const RANK_TO_VALUE: Record<Rank, number> = {
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

const STRAIGHT_WINDOWS: number[][] = [
  [14, 2, 3, 4, 5], // wheel
  [2, 3, 4, 5, 6],
  [3, 4, 5, 6, 7],
  [4, 5, 6, 7, 8],
  [5, 6, 7, 8, 9],
  [6, 7, 8, 9, 10],
  [7, 8, 9, 10, 11],
  [8, 9, 10, 11, 12],
  [9, 10, 11, 12, 13],
  [10, 11, 12, 13, 14], // broadway
];

export function detectBackdoorStraightPotential(
  hole: Card[],
  flop: Card[],
): boolean {
  if (hole.length !== 2 || flop.length !== 3) return false;

  const present = new Set<number>();
  for (const c of [...hole, ...flop]) {
    present.add(RANK_TO_VALUE[c.rank]);
  }

  for (const window of STRAIGHT_WINDOWS) {
    let hits = 0;
    for (const v of window) {
      if (present.has(v)) hits++;
    }
    if (hits >= 3) return true;
  }

  return false;
}
