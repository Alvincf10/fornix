import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CreateProgressEntryDto } from '../progress-entries/dto/create-progress-entry.dto.js';
import { ProgressEntriesService } from '../progress-entries/progress-entries.service.js';
import { CheckpointsService } from './checkpoints.service.js';
import { CreateCheckpointDto } from './dto/create-checkpoint.dto.js';
import { ListCheckpointDto } from './dto/list-checkpoint.dto.js';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto.js';

@ApiTags('checkpoints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkpoints')
export class CheckpointsController {
  constructor(
    private readonly checkpointsService: CheckpointsService,
    private readonly progressEntriesService: ProgressEntriesService,
  ) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCheckpointDto) {
    return this.checkpointsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: ListCheckpointDto) {
    return this.checkpointsService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.checkpointsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateCheckpointDto,
  ) {
    return this.checkpointsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.checkpointsService.remove(user.userId, id);
    return { ok: true };
  }

  @Get(':id/entries')
  listEntries(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.progressEntriesService.listForCheckpoint(user.userId, id);
  }

  @Post(':id/entries')
  createEntry(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateProgressEntryDto,
  ) {
    return this.progressEntriesService.create(user.userId, id, dto);
  }
}
