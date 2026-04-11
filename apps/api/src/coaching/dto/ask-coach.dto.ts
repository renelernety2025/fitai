import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Voice Q&A input DTO for POST /api/coaching/ask.
 *
 * All user-supplied fields are bounded to prevent oversized payloads
 * from reaching Claude's context window, and to make the attack surface
 * for prompt-injection attempts explicit and reviewable.
 *
 * The `question` field in particular is NOT interpolated into the
 * system prompt in coaching.service.ts — it is passed as the user
 * role in the messages[] array so Claude's system prompt cannot be
 * overridden by user input.
 */
export class AskCoachDto {
  @IsString()
  @MaxLength(500)
  question!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  exerciseName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  formScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  completedReps?: number;
}
