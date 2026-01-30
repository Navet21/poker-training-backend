import { IsIn, IsNumber } from 'class-validator';
import { Street } from '../types';

export class OutsAnswerDto {
  @IsIn(['flop', 'turn', 'river'])
  street!: Street;

  @IsNumber()
  outs!: number;
}
