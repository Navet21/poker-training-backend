import { Board, Street } from '../types';
import type { Card } from './card.interface';

export interface TrainingSession {
  id: string;
  hole: Card[];
  board: Board;
  currentStreet: Street;
}
