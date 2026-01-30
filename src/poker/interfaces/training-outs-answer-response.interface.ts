import type { Board, Street } from '../types';
import type { BoardFlags } from '../domain/board-flags.type';
import type { OutsComponent } from '../domain/outs/outs.types';

export interface TrainingOutsAnswerResponse {
  correct: boolean;
  street: Street;

  userOuts: number;
  correctOuts: number;

  components: OutsComponent[];
  meta: BoardFlags;

  nextStreet?: Street;
  nextCards?: Board;
  finished: boolean;
}
