import type { Card } from 'src/poker/interfaces';
import type { BoardFlags } from '../../board-flags.type';
import type { OutsComponent } from '../outs.types';
import { detectBackdoorFlushNutA } from '../../detect/detect-backdoor-flush';

export function applyBackdoorFlushRule(
  hole: Card[],
  flop: Card[],
  flags: BoardFlags,
  hasFlushDrawDirect: boolean,
): OutsComponent | null {
  // Solo FLOP
  if (hole.length !== 2 || flop.length !== 3) return null;

  // No doble conteo
  if (hasFlushDrawDirect) return null;

  // Detect
  const hasBackdoor = detectBackdoorFlushNutA(hole, flop);
  if (!hasBackdoor) return null;

  // Reglas tuyas:
  // - Mesa no emparejada → 2
  // - Resto → 1
  const outs = flags.pairedType === 'none' ? 2 : 1;

  const reason = `BDFD_NUT_A | pairedType=${flags.pairedType} → ${outs} out(s)`;

  return {
    type: 'BACKDOOR_FLUSH',
    outs,
    reason,
  };
}
