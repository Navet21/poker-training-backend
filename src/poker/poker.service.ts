import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import {
  Card,
  TrainingSessionInitResponse,
  TrainingAnswerResponse,
  TrainingSession,
  TrainingSessionSummaryResponse,
} from './interfaces';
import { Board, Street, Rank, BoardTexture } from './types';

@Injectable()
export class PokerService {
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

  private readonly RANK_VALUES: Record<Rank, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  // Sesiones en memoria (para MVP, sin DB)
  private readonly sessions = new Map<string, TrainingSession>();

  // ---------- Utilidades de cartas ----------

  private generateDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({ rank, suit });
      }
    }
    return deck;
  }

  private shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private dealFiveBoard(): Board {
    const deck = this.shuffle(this.generateDeck());
    return deck.slice(0, 5);
  }

  // ---------- Textura de mesa ----------

  evaluateBoardTexture(board: Board): BoardTexture {
    if (board.length < 3) {
      return 'dry';
    }

    // valores numéricos
    const numericRanks = board.map((c) => this.RANK_VALUES[c.rank]);
    const sortedRanks = [...numericRanks].sort((a, b) => a - b);

    // tratar As como 1 para detectar A-2-3-4-5
    const aceLowRanks = numericRanks.map((v) => (v === 14 ? 1 : v));
    const sortedAceLow = [...aceLowRanks].sort((a, b) => a - b);

    // palos
    const suitCounts: Record<string, number> = {};
    for (const c of board) {
      suitCounts[c.suit] = (suitCounts[c.suit] ?? 0) + 1;
    }
    const suitCountValues = Object.values(suitCounts);
    const maxSuitCount = suitCountValues.length
      ? Math.max(...suitCountValues)
      : 0;

    const hasFourToFlush = maxSuitCount >= 4;
    const hasThreeToFlush = maxSuitCount >= 3;
    const hasTwoToFlush = maxSuitCount >= 2;

    // helper: 4 a escalera (devuelve si es alta o baja)
    const hasFourToStraight = (
      arr: number[],
    ): { high: boolean; low: boolean } => {
      const uniq = Array.from(new Set(arr)).sort((a, b) => a - b);
      let high = false;
      let low = false;

      if (uniq.length >= 4) {
        for (let i = 0; i <= uniq.length - 4; i++) {
          const slice = uniq.slice(i, i + 4);
          const span = slice[3] - slice[0];
          if (span <= 4) {
            if (slice[0] <= 5) {
              // A-2-3-4 o 2-3-4-5 → proyecto bajo
              low = true;
            } else {
              high = true;
            }
          }
        }
      }

      return { high, low };
    };

    const { high: fourStraightHigh, low: fourStraightLow } =
      hasFourToStraight(sortedRanks);
    const { high: fourStraightHighA, low: fourStraightLowA } =
      hasFourToStraight(sortedAceLow);

    const hasFourToStraightHigh = fourStraightHigh || fourStraightHighA;
    const hasFourToStraightLow = fourStraightLow || fourStraightLowA;

    // ---------- 1) EXTREMADAMENTE COORDINADA ----------
    if (hasFourToFlush || hasFourToStraightHigh) {
      return 'super_coordinated';
    }

    // ---------- 2) COORDINADA ----------
    // 3 a color o 3 conectadas o 4 a escalera baja
    let hasThreeToStraight = false;

    const uniqRanks = Array.from(new Set(sortedRanks)).sort((a, b) => a - b);
    if (uniqRanks.length >= 3) {
      for (let i = 0; i <= uniqRanks.length - 3; i++) {
        const slice = uniqRanks.slice(i, i + 3);
        const span = slice[2] - slice[0];
        if (span <= 4) {
          hasThreeToStraight = true;
          break;
        }
      }
    }

    if (hasThreeToFlush || hasThreeToStraight || hasFourToStraightLow) {
      return 'coordinated';
    }

    // ---------- 3) SEMI-COORDINADA ----------
    // Miramos las dos cartas más cercanas en rango >= 6.
    const highRanks = uniqRanks.filter((v) => v >= 6);

    if (highRanks.length >= 2) {
      let minGap = Infinity;

      for (let i = 0; i < highRanks.length - 1; i++) {
        const gap = highRanks[i + 1] - highRanks[i] - 1; // huecos en medio
        if (gap < minGap) {
          minGap = gap;
        }
      }

      if (minGap !== Infinity) {
        const maxAllowedGap = hasTwoToFlush ? 3 : 2;
        if (minGap <= maxAllowedGap) {
          return 'semi_coordinated';
        }
      }
    }

    // ---------- 4) SECA ----------
    return 'dry';
  }

  // ---------- Entrenamiento por calles ----------

  createTrainingSession(): TrainingSessionInitResponse {
    const board = this.dealFiveBoard();
    const sessionId = randomUUID();

    const session: TrainingSession = {
      id: sessionId,
      board,
      currentStreet: 'flop',
    };

    this.sessions.set(sessionId, session);

    return {
      sessionId,
      street: 'flop',
      cards: board.slice(0, 3), // flop
    };
  }

  answerTraining(
    sessionId: string,
    street: Street,
    userTexture: BoardTexture,
  ): TrainingAnswerResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de entrenamiento no encontrada');
    }

    if (street !== session.currentStreet) {
      throw new BadRequestException(
        'Street enviada no coincide con el estado actual de la sesión',
      );
    }

    // Determinar qué cartas se usan para evaluar la textura
    let cardsForStreet: Board;
    if (street === 'flop') {
      cardsForStreet = session.board.slice(0, 3);
    } else if (street === 'turn') {
      cardsForStreet = session.board.slice(0, 4);
    } else {
      cardsForStreet = session.board.slice(0, 5);
    }

    const correctTexture = this.evaluateBoardTexture(cardsForStreet);
    const correct = correctTexture === userTexture;

    let helpText: string | undefined;
    if (!correct) {
      helpText = this.getTextureHelp(correctTexture);
    }

    // Calcular siguiente street
    let nextStreet: Street | undefined;
    let finished = false;
    let nextCards: Board | undefined;

    if (street === 'flop') {
      nextStreet = 'turn';
      session.currentStreet = 'turn';
      nextCards = session.board.slice(0, 4);
    } else if (street === 'turn') {
      nextStreet = 'river';
      session.currentStreet = 'river';
      nextCards = session.board.slice(0, 5);
    } else {
      finished = true;
      //this.sessions.delete(session.id);
    }

    return {
      correct,
      correctTexture,
      street,
      nextStreet,
      nextCards,
      finished,
      helpText,
    };
  }

  // ---------- Explicación de texturas ----------

  private getTextureHelp(texture: BoardTexture): string {
    switch (texture) {
      case 'super_coordinated':
        return (
          'Mesa extremadamente coordinada: el board permite completar escalera o ' +
          'color con UNA sola carta de la mano (por ejemplo 4 cartas del mismo palo ' +
          'o 4 cartas muy conectadas, a menudo con posibilidad de escalera baja como 2-3-4-5).'
        );
      case 'coordinated':
        return (
          'Mesa coordinada: es posible que alguien ya tenga escalera o color con sus ' +
          'DOS cartas de mano. Hay proyectos claros de color (3+ cartas del mismo palo) ' +
          'o de escalera con cartas muy conectadas.'
        );
      case 'semi_coordinated':
        return (
          'Mesa semicoordinada: no llega a coordinada, pero las cartas no están ' +
          'totalmente aisladas. Miramos las dos cartas no emparejadas más próximas ' +
          'en valor (ignorando 2-3-4-5): si entre ellas hay pocos huecos (2 o 3 ' +
          'si además hay proyecto de color), la mesa se considera semicoordinada.'
        );
      case 'dry':
      default:
        return (
          'Mesa seca: no cumple los criterios de coordinada ni de semicoordinada. ' +
          'Las cartas están muy separadas entre sí y apenas hay proyectos fuertes de ' +
          'color o escalera.'
        );
    }
  }

  getTrainingSessionSummary(sessionId: string): TrainingSessionSummaryResponse {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException('Sesión de entrenamiento no encontrada');
    }

    const flopCards = session.board.slice(0, 3);
    const turnCards = session.board.slice(0, 4);
    const riverCards = session.board.slice(0, 5);

    const flopTexture = this.evaluateBoardTexture(flopCards);
    const turnTexture = this.evaluateBoardTexture(turnCards);
    const riverTexture = this.evaluateBoardTexture(riverCards);

    return {
      sessionId: session.id,
      board: session.board,
      currentStreet: session.currentStreet,
      streets: [
        {
          street: 'flop',
          cards: flopCards,
          texture: flopTexture,
        },
        {
          street: 'turn',
          cards: turnCards,
          texture: turnTexture,
        },
        {
          street: 'river',
          cards: riverCards,
          texture: riverTexture,
        },
      ],
    };
  }
}
