import { Injectable } from '@nestjs/common';
import { TrainingSession } from '../interfaces';

@Injectable()
export class TrainingSessionStore {
  private readonly sessions = new Map<string, TrainingSession>();

  set(session: TrainingSession) {
    this.sessions.set(session.id, session);
  }

  get(sessionId: string): TrainingSession | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
