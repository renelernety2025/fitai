import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSquadDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motto?: string;
}
