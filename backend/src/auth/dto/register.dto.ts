import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'engineer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Alex Engineer' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
