import { BoardTexture, Street, Board } from '../types';

export interface TrainingAnswerResponse {
  correct: boolean;
  correctTexture: BoardTexture;
  street: Street; // street que acabas de responder
  nextStreet?: Street; // si hay siguiente
  nextCards?: Board; // cartas visibles tras avanzar
  finished: boolean; // true cuando ya has llegado a river
}
