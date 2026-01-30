import type { BoardFlags } from '../../board-flags.type';
import type { OutsComponent } from '../outs.types';

export function applyOvercardsRule(
  numOvercards: number,
  flags: BoardFlags,
): OutsComponent | null {
  if (numOvercards <= 0) return null;

  // Base por textura
  let outsPer = 2;
  if (flags.texture === 'coordinated') outsPer = 1;
  if (flags.texture === 'super_coordinated') outsPer = 0;

  // Override por mesa emparejada 88+
  if (flags.pairedType !== 'none' && flags.isPaired88Plus)
    outsPer = Math.min(outsPer, 1);

  const outs = numOvercards * outsPer;

  const reasonParts: string[] = [];
  reasonParts.push(`Overcards: ${numOvercards}`);
  reasonParts.push(`Textura ${flags.texture} → ${outsPer} out(s) por overcard`);
  if (flags.pairedType !== 'none' && flags.isPaired88Plus) {
    reasonParts.push(`Mesa emparejada 88+ → máximo 1 out por overcard`);
  }

  return {
    type: 'OVER_CARDS',
    outs,
    reason: reasonParts.join(' | '),
  };
}
