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
import { CreateResearchDto } from './dto/create-research.dto.js';
import { ListResearchDto } from './dto/list-research.dto.js';
import { UpdateResearchDto } from './dto/update-research.dto.js';
import { ResearchService } from './research.service.js';

@ApiTags('research')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateResearchDto) {
    return this.researchService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: ListResearchDto) {
    return this.researchService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.researchService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateResearchDto,
  ) {
    return this.researchService.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.researchService.archive(user.userId, id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.researchService.remove(user.userId, id);
    return { ok: true };
  }
}
