import type { Board } from '../../types';
import type { Card } from '../../interfaces';
import type { BoardFlags } from '../board-flags.type';
import type { OutsComponent, OutsResult } from './outs.types';

import { detectOvercards } from '../detect/detect-overcards';
import { detectFlushDraw } from '../detect/detect-flush-draw';
import { detectStraightDraw2x2 } from '../detect/detect-straight-draw';

import { applyOvercardsRule } from './rules/overcards.rule';
import { applyFlushDrawRule } from './rules/flush-draw.rule';
import { applyStraightDrawRule } from './rules/straight-draw.rule';

export function calculateAdjustedOuts(
  hole: Card[],
  board: Board,
  flags: BoardFlags,
): OutsResult {
  const components: OutsComponent[] = []; // ✅ AQUÍ está la clave

  const numOvercards = detectOvercards(hole, board);
  const over = applyOvercardsRule(numOvercards, flags);
  if (over) components.push(over);

  const fd = detectFlushDraw(hole, board);
  const flush = applyFlushDrawRule(fd, flags);
  if (flush) components.push(flush);

  const sd = detectStraightDraw2x2(hole, board);
  const straight = applyStraightDrawRule(sd, flags);
  if (straight) components.push(straight);

  const totalOuts = components.reduce((acc, c) => acc + c.outs, 0);

  return { totalOuts, components, meta: flags };
}
