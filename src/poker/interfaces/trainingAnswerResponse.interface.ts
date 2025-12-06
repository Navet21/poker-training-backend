import { BoardTexture, Street, Board } from '../types';

export interface TrainingAnswerResponse {
  correct: boolean;
  correctTexture: BoardTexture;
  street: Street;
  nextStreet?: Street;
  nextCards?: Board;
  finished: boolean;
  helpText?: string;
}
