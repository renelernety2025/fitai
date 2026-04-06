import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserLevel } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsEnum(UserLevel)
  level?: UserLevel;
}
