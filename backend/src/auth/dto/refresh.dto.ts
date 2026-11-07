import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({
    description: 'Refresh token when cookie is unavailable (e.g. non-browser clients)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
