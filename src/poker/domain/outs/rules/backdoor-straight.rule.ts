import type { Card } from 'src/poker/interfaces';
import type { BoardFlags } from '../../board-flags.type';
import type { OutsComponent } from '../outs.types';
import { detectBackdoorStraightPotential } from '../../detect/detect-backdoor-straight';

export function applyBackdoorStraightRule(
  hole: Card[],
  flop: Card[],
  flags: BoardFlags,
  hasStraightDrawDirect: boolean,
): OutsComponent | null {
  // Solo FLOP
  if (hole.length !== 2 || flop.length !== 3) return null;

  // No doble conteo
  if (hasStraightDrawDirect) return null;

  // Reglas tuyas
  if (flags.flushState !== 'rainbow') return null;
  if (flags.pairedType !== 'none') return null;

  const hasPotential = detectBackdoorStraightPotential(hole, flop);
  if (!hasPotential) return null;

  const outs = 1;
  const reason = `BDSD | rainbow & unpaired → 1 out`;

  return {
    type: 'BACKDOOR_STRAIGHT',
    outs,
    reason,
  };
}
