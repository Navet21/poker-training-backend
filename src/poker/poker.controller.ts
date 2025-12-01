import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PokerService } from './poker.service';
import {
  TrainingSessionInitResponse,
  TrainingAnswerResponse,
  TrainingSessionSummaryResponse,
} from './interfaces';
import { AnswerDto } from './dtos/answer.dto';

@Controller('training')
export class PokerController {
  constructor(private readonly pokerService: PokerService) {}

  @Post('session')
  createSession(): TrainingSessionInitResponse {
    return this.pokerService.createTrainingSession();
  }

  @Post('session/:id/answer')
  answer(
    @Param('id') sessionId: string,
    @Body() body: AnswerDto,
  ): TrainingAnswerResponse {
    const { street, texture } = body;
    return this.pokerService.answerTraining(sessionId, street, texture);
  }

  @Get('session/:id')
  getSessionSummary(
    @Param('id') sessionId: string,
  ): TrainingSessionSummaryResponse {
    return this.pokerService.getTrainingSessionSummary(sessionId);
  }
}
