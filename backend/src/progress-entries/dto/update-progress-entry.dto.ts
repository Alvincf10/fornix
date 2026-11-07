import { PartialType } from '@nestjs/swagger';
import { CreateProgressEntryDto } from './create-progress-entry.dto.js';

export class UpdateProgressEntryDto extends PartialType(CreateProgressEntryDto) {}
