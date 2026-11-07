import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResearchController } from './research.controller.js';
import { ResearchService } from './research.service.js';
import { Research, ResearchSchema } from './schemas/research.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Research.name, schema: ResearchSchema }]),
  ],
  controllers: [ResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
