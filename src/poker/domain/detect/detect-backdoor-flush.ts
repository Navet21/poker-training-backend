import type { Card } from 'src/poker/interfaces';

export function detectBackdoorFlushNutA(hole: Card[], flop: Card[]): boolean {
  // Solo flop
  if (hole.length !== 2 || flop.length !== 3) return false;

  // Mano suited
  const suit = hole[0].suit;
  if (hole[1].suit !== suit) return false;

  // Nut: una de las dos cartas es As
  const hasAce = hole[0].rank === 'A' || hole[1].rank === 'A';
  if (!hasAce) return false;

  // En flop debe haber EXACTAMENTE 1 carta de ese palo
  const flopSuitCount = flop.filter((c) => c.suit === suit).length;

  return flopSuitCount === 1;
}
