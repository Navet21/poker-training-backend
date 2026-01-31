import type { Board, Street } from '../types';
import type { Card } from './card.interface';
import type { BoardFlags } from '../domain/board-flags.type';
import type { OutsComponent } from '../domain/outs/outs.types';

export interface TrainingOutsAnswerResponse {
  correct: boolean;
  street: Street;

  hole: Card[];
  cards: Board;

  userOuts: number;
  correctOuts: number;

  components: OutsComponent[];
  explanation: string;

  meta: BoardFlags;

  nextStreet?: Street;
  nextCards?: Board;
  finished: boolean;
}
