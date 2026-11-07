import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttachmentsController } from './attachments.controller.js';
import { AttachmentsService } from './attachments.service.js';
import { Attachment, AttachmentSchema } from './schemas/attachment.schema.js';
import { StorageService } from './storage.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attachment.name, schema: AttachmentSchema }]),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, StorageService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
