import { Injectable } from '@nestjs/common';
import type { Board, BoardTexture, Rank } from '../types';
import { getBoardBaseFlags } from '../domain/get-board-flags';

@Injectable()
export class TextureService {
  private readonly RANK_VALUES: Record<Rank, number> = {
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

  evaluate(board: Board): BoardTexture {
    if (board.length < 3) return 'dry';

    // ✅ flags base disponibles (los usarás en outs)
    const baseFlags = getBoardBaseFlags(board);
    // Si quieres, podrías empezar a usar baseFlags.flushState / straightPressure aquí.
    // Por ahora no hace falta, mantenemos tu clasificación estable.

    const numericRanks = board.map((c) => this.RANK_VALUES[c.rank]);
    const sortedRanks = [...numericRanks].sort((a, b) => a - b);

    const aceLowRanks = numericRanks.map((v) => (v === 14 ? 1 : v));
    const sortedAceLow = [...aceLowRanks].sort((a, b) => a - b);

    const suitCounts: Record<string, number> = {};
    for (const c of board) suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1;
    const maxSuitCount = Math.max(...Object.values(suitCounts));

    const hasFourToFlush = maxSuitCount >= 4;
    const hasThreeToFlush = maxSuitCount >= 3;
    const hasTwoToFlush = maxSuitCount >= 2;

    const hasFourToStraight = (
      arr: number[],
    ): { high: boolean; low: boolean } => {
      const uniq = Array.from(new Set(arr)).sort((a, b) => a - b);
      let high = false,
        low = false;
      for (let i = 0; i <= uniq.length - 4; i++) {
        const slice = uniq.slice(i, i + 4);
        if (slice[3] - slice[0] <= 4) {
          if (slice[0] <= 5) low = true;
          else high = true;
        }
      }
      return { high, low };
    };

    const a = hasFourToStraight(sortedRanks);
    const b = hasFourToStraight(sortedAceLow);

    const hasFourToStraightHigh = a.high || b.high;
    const hasFourToStraightLow = a.low || b.low;

    if (hasFourToFlush || hasFourToStraightHigh) return 'super_coordinated';

    const uniqRanks = Array.from(new Set(sortedRanks)).sort((x, y) => x - y);
    let hasThreeToStraight = false;
    for (let i = 0; i <= uniqRanks.length - 3; i++) {
      const slice = uniqRanks.slice(i, i + 3);
      if (slice[2] - slice[0] <= 4) {
        hasThreeToStraight = true;
        break;
      }
    }
    if (hasThreeToFlush || hasThreeToStraight || hasFourToStraightLow)
      return 'coordinated';

    const highRanks = uniqRanks.filter((v) => v >= 6);
    if (highRanks.length >= 2) {
      let minGap = Infinity;
      for (let i = 0; i < highRanks.length - 1; i++) {
        minGap = Math.min(minGap, highRanks[i + 1] - highRanks[i] - 1);
      }
      const maxAllowedGap = hasTwoToFlush ? 3 : 2;
      if (minGap <= maxAllowedGap) return 'semi_coordinated';
    }

    return 'dry';
  }
}
