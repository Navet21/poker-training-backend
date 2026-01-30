import type { BoardFlags } from '../../board-flags.type';
import type { OutsComponent } from '../outs.types';
import type { StraightDrawInfo } from '../../detect/detect-straight-draw';

export function applyStraightDrawRule(
  sd: StraightDrawInfo,
  flags: BoardFlags,
): OutsComponent | null {
  if (sd.kind === 'NONE') return null;

  const hasPaired = flags.pairedType !== 'none';
  const hasFlushDrawOnBoard = flags.flushState === 'two_tone';
  const hasThreeTone = flags.flushState === 'three_tone';

  // Tus apuntes (2 cartas mano + 2 mesa):
  // - NO emparejada y NO color:
  //    OESD 8, Gutshot 4
  // - emparejada O con proyecto de color:
  //    OESD 6, Gutshot 3
  // - emparejada Y con proyecto de color o 3 mismo palo:
  //    OESD 4, Gutshot 2
  // - dobles parejas o trío:
  //    OESD 3, Gutshot 1.5
  const isDoubleOrTrips =
    flags.pairedType === 'double_paired' || flags.pairedType === 'trips';

  let outs: number;

  if (isDoubleOrTrips) {
    outs = sd.kind === 'OESD_2x2' ? 3 : 1.5;
  } else if ((hasPaired && hasFlushDrawOnBoard) || hasThreeTone) {
    outs = sd.kind === 'OESD_2x2' ? 4 : 2;
  } else if (hasPaired || hasFlushDrawOnBoard) {
    outs = sd.kind === 'OESD_2x2' ? 6 : 3;
  } else {
    outs = sd.kind === 'OESD_2x2' ? 8 : 4;
  }

  const reason =
    `${sd.kind}` +
    ` | pairedType=${flags.pairedType}` +
    ` | flushState=${flags.flushState}` +
    ` → ${outs} outs`;

  return { type: 'STRAIGHT_DRAW', outs, reason };
}
