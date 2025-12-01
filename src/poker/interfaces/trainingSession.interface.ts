import { Board, Street } from '../types';

export interface TrainingSession {
  id: string;
  board: Board; // siempre 5 cartas
  currentStreet: Street;
}
