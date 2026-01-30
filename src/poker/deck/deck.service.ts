import { Injectable } from '@nestjs/common';
import { Card } from '../interfaces';
import { Board, Rank } from '../types';

@Injectable()
export class DeckService {
  private readonly ranks: Rank[] = [
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
  private readonly suits = ['S', 'H', 'D', 'C'] as const;

  generateDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  }

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  dealFiveBoard(): Board {
    const deck = this.shuffle(this.generateDeck());
    return deck.slice(0, 5);
  }

  dealHoleAndBoard(): { hole: Card[]; board: Board } {
    const deck = this.shuffle(this.generateDeck());
    const hole = deck.slice(0, 2);
    const board = deck.slice(2, 7) as Board;
    return { hole, board };
  }
}
