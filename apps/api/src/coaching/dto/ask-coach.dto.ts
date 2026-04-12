import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Client hint for which audio encoding the coach should return.
 * - 'mp3' (default): 44.1 kHz MP3 — compatible with expo-audio playback.
 * - 'pcm': 16 kHz int16 mono raw PCM — required by VoiceEngine native
 *   module, matches the VoiceProcessingIO hardware format.
 * Older mobile builds that don't send this field get MP3, which is
 * what they already know how to play.
 */
export type AskAudioFormat = 'mp3' | 'pcm';

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

  @IsOptional()
  @IsIn(['mp3', 'pcm'])
  audioFormat?: AskAudioFormat;
}
