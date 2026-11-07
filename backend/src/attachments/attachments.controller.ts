import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser, type RequestUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AttachmentsService } from './attachments.service.js';
import { CreateAttachmentDto } from './dto/create-attachment.dto.js';
import { ListAttachmentDto } from './dto/list-attachment.dto.js';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentType: { type: 'string' },
        parentId: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.upload(
      user.userId,
      dto.parentType,
      dto.parentId,
      file,
    );
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: ListAttachmentDto) {
    return this.attachmentsService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.attachmentsService.findOne(user.userId, id);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { item, body, contentType, contentLength } =
      await this.attachmentsService.openStream(user.userId, id);
    res.setHeader(
      'Content-Type',
      contentType || item.mimeType || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(item.originalName)}"`,
    );
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    body.pipe(res);
  }

  @Get(':id/preview')
  async preview(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { item, body, contentType, contentLength } =
      await this.attachmentsService.openStream(user.userId, id);
    const mime = contentType || item.mimeType;
    const inline =
      mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/');
    res.setHeader('Content-Type', mime || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(item.originalName)}"`,
    );
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    body.pipe(res);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.attachmentsService.remove(user.userId, id);
    return { ok: true };
  }
}
