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

@Injectable()
export class PokerService {
  constructor(
    private readonly deck: DeckService,
    private readonly texture: TextureService,
    private readonly store: TrainingSessionStore,
  ) {}

  createTrainingSession(): TrainingSessionInitResponse {
    const board = this.deck.dealFiveBoard();
    const sessionId = randomUUID();

    const session: TrainingSession = {
      id: sessionId,
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
}
