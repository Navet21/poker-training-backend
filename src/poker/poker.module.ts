import { Module } from '@nestjs/common';
import { PokerService } from './poker.service';
import { PokerController } from './poker.controller';
import { DeckService } from './deck/deck.service';
import { TextureService } from './texture/texture.service';
import { TrainingSessionStore } from './sessions/training-session.store';

@Module({
  controllers: [PokerController],
  providers: [PokerService, DeckService, TextureService, TrainingSessionStore],
})
export class PokerModule {}
