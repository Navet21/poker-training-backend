import type { BoardFlags } from '../board-flags.type';

export type OutsComponentType = 'OVER_CARDS' | 'FLUSH_DRAW' | 'STRAIGHT_DRAW';

export interface OutsComponent {
  type: OutsComponentType;
  outs: number;
  reason: string;
}

export interface OutsResult {
  totalOuts: number;
  components: OutsComponent[];
  meta: BoardFlags;
}
