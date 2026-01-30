import type { Board } from '../../types';
import type { Card } from '../../interfaces';

export type FlushDrawKind = 'NONE' | 'FD_2x2';

export interface FlushDrawInfo {
  kind: FlushDrawKind;
  suit?: string;
}

export function detectFlushDraw(hole: Card[], board: Board): FlushDrawInfo {
  if (hole.length !== 2 || board.length < 3) return { kind: 'NONE' };

  const all = [...hole, ...board];

  const suitCounts: Record<string, number> = {};
  for (const c of all) suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1;

  // FD clásico en flop: 4 cartas del mismo palo entre hole+board
  const entry = Object.entries(suitCounts).find(([, count]) => count === 4);
  if (!entry) return { kind: 'NONE' };

  const [suit] = entry;
  // Asegura 2 en mano + 2 en mesa
  const holeCount = hole.filter((c) => c.suit === suit).length;
  const boardCount = board.filter((c) => c.suit === suit).length;

  if (holeCount === 2 && boardCount === 2) return { kind: 'FD_2x2', suit };
  return { kind: 'NONE' };
}
