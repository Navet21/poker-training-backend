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
import { applyBackdoorFlushRule } from './rules/backdoor-flush.rule';
import { applyBackdoorStraightRule } from './rules/backdoor-straight.rule';

export function calculateAdjustedOuts(
  hole: Card[],
  board: Board,
  flags: BoardFlags,
): OutsResult {
  const components: OutsComponent[] = [];

  // 1) Overcards
  const numOvercards = detectOvercards(hole, board);
  const over = applyOvercardsRule(numOvercards, flags);
  if (over) components.push(over);

  // 2) Flush draw directo
  const fd = detectFlushDraw(hole, board);
  const flush = applyFlushDrawRule(fd, flags);
  if (flush) components.push(flush);

  // 3) Straight draw directo
  const sd = detectStraightDraw2x2(hole, board);
  const straight = applyStraightDrawRule(sd, flags);
  if (straight) components.push(straight);

  // Guards (fuente de verdad = detect, no components)
  const hasFlushDrawDirect = fd.kind === 'FD_2x2';
  const hasStraightDrawDirect = sd.kind !== 'NONE';

  // 4) Backdoor flush (solo flop y solo si NO hay flush draw directo)
  const bdfd = applyBackdoorFlushRule(hole, board, flags, hasFlushDrawDirect);
  if (bdfd) components.push(bdfd);

  // 5) Backdoor straight (solo flop y solo si NO hay straight draw directo)
  const bdsd = applyBackdoorStraightRule(
    hole,
    board,
    flags,
    hasStraightDrawDirect,
  );
  if (bdsd) components.push(bdsd);

  const totalOuts = components.reduce((acc, c) => acc + c.outs, 0);
  return { totalOuts, components, meta: flags };
}
