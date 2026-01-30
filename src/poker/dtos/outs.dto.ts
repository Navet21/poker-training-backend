import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { Card } from '../interfaces';
import type { Rank, Suit } from '../types';

const RANKS: Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
  'A',
];
const SUITS: Suit[] = ['S', 'H', 'D', 'C'];

class CardDto implements Card {
  @IsIn(RANKS)
  rank!: Rank;

  @IsIn(SUITS)
  suit!: Suit;
}

export class OutsDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  hole!: Card[];

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  board!: Card[];
}
