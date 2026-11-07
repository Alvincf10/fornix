import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentationsController } from './documentations.controller.js';
import { DocumentationsService } from './documentations.service.js';
import {
  Documentation,
  DocumentationSchema,
} from './schemas/documentation.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Documentation.name, schema: DocumentationSchema },
    ]),
  ],
  controllers: [DocumentationsController],
  providers: [DocumentationsService],
  exports: [DocumentationsService],
})
export class DocumentationsModule {}
