import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  TrainingAnswerResponse,
  TrainingSessionInitResponse,
  TrainingSessionSummaryResponse,
  TrainingSession,
} from './interfaces';
import { Board, BoardTexture, Street } from './types';
import { DeckService } from './deck/deck.service';
import { TextureService } from './texture/texture.service';
import { getTextureHelp } from './texture/texture.help';
import { TrainingSessionStore } from './sessions/training-session.store';
import { getBoardBaseFlags } from './domain/get-board-flags';
import type { BoardFlags } from './domain/board-flags.type';
import type { Card } from './interfaces';
import { calculateAdjustedOuts } from './domain/outs/outs-engine';

@Injectable()
export class PokerService {
  constructor(
    private readonly deck: DeckService,
    private readonly texture: TextureService,
    private readonly store: TrainingSessionStore,
  ) {}

  createTrainingSession(): TrainingSessionInitResponse {
    const { board, hole } = this.deck.dealHoleAndBoard();
    const sessionId = randomUUID();

    const session: TrainingSession = {
      id: sessionId,
      hole,
      board,
      currentStreet: 'flop',
    };

    this.store.set(session);

    return {
      sessionId,
      street: 'flop',
      cards: board.slice(0, 3),
    };
  }

  answerTraining(
    sessionId: string,
    street: Street,
    userTexture: BoardTexture,
  ): TrainingAnswerResponse {
    const session = this.store.get(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de entrenamiento no encontrada');
    }

    if (street !== session.currentStreet) {
      throw new BadRequestException(
        'Street enviada no coincide con el estado actual de la sesión',
      );
    }

    const cardsForStreet = this.getCardsForStreet(session.board, street);

    const correctTexture = this.texture.evaluate(cardsForStreet);
    const correct = correctTexture === userTexture;

    const helpText = correct ? undefined : getTextureHelp(correctTexture);

    let nextStreet: Street | undefined;
    let nextCards: Board | undefined;
    let finished = false;

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
  getTrainingSessionSummary(sessionId: string): TrainingSessionSummaryResponse {
    const session = this.store.get(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de entrenamiento no encontrada');
    }

    const flopCards = session.board.slice(0, 3);
    const turnCards = session.board.slice(0, 4);
    const riverCards = session.board.slice(0, 5);

    return {
      sessionId: session.id,
      board: session.board,
      currentStreet: session.currentStreet,
      streets: [
        {
          street: 'flop',
          cards: flopCards,
          texture: this.texture.evaluate(flopCards),
        },
        {
          street: 'turn',
          cards: turnCards,
          texture: this.texture.evaluate(turnCards),
        },
        {
          street: 'river',
          cards: riverCards,
          texture: this.texture.evaluate(riverCards),
        },
      ],
    };
  }
  private getCardsForStreet(board: Board, street: Street): Board {
    if (street === 'flop') return board.slice(0, 3);
    if (street === 'turn') return board.slice(0, 4);
    return board.slice(0, 5);
  }

  calculateOuts(hole: Card[], board: Board) {
    const flop = board.slice(0, 3);
    const base = getBoardBaseFlags(flop);
    const texture = this.texture.evaluate(flop);

    const flags: BoardFlags = { ...base, texture };
    return calculateAdjustedOuts(hole, flop, flags);
  }

  //Outs

  createOutsTrainingSession() {
    const { hole, board } = this.deck.dealHoleAndBoard();
    const sessionId = randomUUID();

    const session: TrainingSession = {
      id: sessionId,
      hole,
      board,
      currentStreet: 'flop',
    };

    this.store.set(session);
    console.log('[OUTS CREATE]', {
      sessionId,
      currentStreet: session.currentStreet,
    });

    return {
      sessionId,
      street: session.currentStreet,
      hole,
      cards: board.slice(0, 3),
    };
  }

  answerOutsTraining(sessionId: string, street: Street, userOuts: number) {
    const session = this.store.get(sessionId);
    if (!session)
      throw new NotFoundException('Sesión de entrenamiento no encontrada');

    console.log('[OUTS ANSWER]', {
      sessionId,
      street,
      currentStreet: session.currentStreet,
    });

    if (street !== session.currentStreet) {
      throw new BadRequestException(
        'Street enviada no coincide con el estado actual de la sesión',
      );
    }

    const cardsForStreet = this.getCardsForStreet(session.board, street);

    console.log('[OUTS INPUT]', { hole: session.hole, board: cardsForStreet });

    // En river no hay carta siguiente: opcionalmente devolvemos 0
    if (street === 'river') {
      this.store.delete(sessionId);
      return {
        correct: userOuts === 0,
        street,
        userOuts,
        correctOuts: 0,
        components: [],
        meta: null,
        finished: true,
      };
    }

    const base = getBoardBaseFlags(cardsForStreet);
    const texture = this.texture.evaluate(cardsForStreet);
    const flags: BoardFlags = { ...base, texture };

    const result = calculateAdjustedOuts(session.hole, cardsForStreet, flags);

    const tolerance = 0.5;
    const correct = Math.abs(userOuts - result.totalOuts) <= tolerance;

    let nextStreet: Street | undefined;
    let nextCards: Board | undefined;
    let finished = false;

    if (street === 'flop') {
      nextStreet = 'turn';
      session.currentStreet = 'turn';
      nextCards = session.board.slice(0, 4);
      this.store.set(session);
    } else {
      nextStreet = 'river';
      session.currentStreet = 'river';
      nextCards = session.board.slice(0, 5);
      this.store.set(session);
    }

    return {
      correct,
      street,
      hole: session.hole,
      cards: cardsForStreet,
      userOuts,
      correctOuts: result.totalOuts,
      components: result.components,
      meta: result.meta,
      nextStreet,
      nextCards,
      finished,
    };
  }
}
