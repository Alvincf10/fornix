import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { UpdateProgressEntryDto } from './dto/update-progress-entry.dto.js';
import { ProgressEntriesService } from './progress-entries.service.js';

@ApiTags('progress-entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entries')
export class ProgressEntriesController {
  constructor(private readonly progressEntriesService: ProgressEntriesService) {}

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.progressEntriesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateProgressEntryDto,
  ) {
    return this.progressEntriesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.progressEntriesService.remove(user.userId, id);
    return { ok: true };
  }
}
