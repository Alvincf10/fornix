import { PartialType } from '@nestjs/swagger';
import { CreateResearchDto } from './create-research.dto.js';

export class UpdateResearchDto extends PartialType(CreateResearchDto) {}
