import { Street, Board } from '../types';

export interface TrainingSessionInitResponse {
  sessionId: string;
  street: Street;
  cards: Board;
}
