import type { BoardFlags } from '../../board-flags.type';
import type { OutsComponent } from '../outs.types';
import type { FlushDrawInfo } from '../../detect/detect-flush-draw';

export function applyFlushDrawRule(
  fd: FlushDrawInfo,
  flags: BoardFlags,
): OutsComponent | null {
  if (fd.kind !== 'FD_2x2') return null;

  // Apuntes:
  // - no emparejada → 9
  // - emparejada → 7
  // - dobles parejas o trío → 4
  let outs = 9;

  if (flags.pairedType === 'paired') outs = 7;
  if (flags.pairedType === 'double_paired' || flags.pairedType === 'trips')
    outs = 4;

  const reason =
    `FD (2 en mano + 2 en mesa)` +
    ` | pairedType=${flags.pairedType} → ${outs} outs`;

  return { type: 'FLUSH_DRAW', outs, reason };
}
