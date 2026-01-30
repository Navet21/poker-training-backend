import type { BoardTexture } from '../types';

export type PairedType = 'none' | 'paired' | 'double_paired' | 'trips';
export type FlushState = 'rainbow' | 'two_tone' | 'three_tone';

export type StraightPressure =
  | 'none'
  | 'two_card_straight_possible'
  | 'one_card_straight_possible';

export interface BoardFlags {
  pairedType: PairedType;
  isPaired88Plus: boolean;
  flushState: FlushState;
  straightPressure: StraightPressure;
  texture: BoardTexture;
}
