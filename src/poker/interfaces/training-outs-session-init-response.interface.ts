import type { Card } from './card.interface';
import type { Board } from '../types';
import type { Street } from '../types';

export interface TrainingOutsSessionInitResponse {
  sessionId: string;
  street: Street;
  hole: Card[];
  cards: Board;
}
