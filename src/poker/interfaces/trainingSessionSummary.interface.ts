import { Board, BoardTexture, Street } from '../types';

export interface StreetTextureInfo {
  street: Street;
  cards: Board;
  texture: BoardTexture;
}

export interface TrainingSessionSummaryResponse {
  sessionId: string;
  board: Board;
  currentStreet: Street;
  streets: StreetTextureInfo[];
}
