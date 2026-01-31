import { IsIn } from 'class-validator';
import { Street, BoardTexture } from '../types';

export class AnswerDto {
  @IsIn(['flop', 'turn', 'river'])
  street!: Street;

  @IsIn(['dry', 'semi_coordinated', 'coordinated', 'super_coordinated'])
  texture!: BoardTexture;
}
