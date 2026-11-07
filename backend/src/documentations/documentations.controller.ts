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
import { CreateDocumentationDto } from './dto/create-documentation.dto.js';
import { ListDocumentationDto } from './dto/list-documentation.dto.js';
import { UpdateDocumentationDto } from './dto/update-documentation.dto.js';
import { DocumentationsService } from './documentations.service.js';

@ApiTags('documentations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documentations')
export class DocumentationsController {
  constructor(private readonly documentationsService: DocumentationsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateDocumentationDto) {
    return this.documentationsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: ListDocumentationDto) {
    return this.documentationsService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.documentationsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentationDto,
  ) {
    return this.documentationsService.update(user.userId, id, dto);
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.documentationsService.archive(user.userId, id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.documentationsService.remove(user.userId, id);
    return { ok: true };
  }
}
