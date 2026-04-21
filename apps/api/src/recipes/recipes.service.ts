import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private prisma: PrismaService) {
    this.bucket =
      process.env.S3_BUCKET_ASSETS || 'fitai-assets-production';
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    } as any);
  }

  async getAll(userId: string) {
    return this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  async getOne(userId: string, id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });
    if (!recipe || recipe.userId !== userId) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe;
  }

  async create(userId: string, dto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        ingredients: dto.ingredients as unknown as any[],
        instructions: dto.instructions,
        prepMinutes: dto.prepMinutes,
        cookMinutes: dto.cookMinutes,
        servings: dto.servings ?? 1,
        kcalPerServing: dto.kcalPerServing,
        proteinG: dto.proteinG,
        carbsG: dto.carbsG,
        fatG: dto.fatG,
        tags: dto.tags ?? [],
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    await this.getOne(userId, id); // ownership check
    return this.prisma.recipe.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.ingredients !== undefined && {
          ingredients: dto.ingredients as unknown as any[],
        }),
        ...(dto.instructions !== undefined && {
          instructions: dto.instructions,
        }),
        ...(dto.prepMinutes !== undefined && {
          prepMinutes: dto.prepMinutes,
        }),
        ...(dto.cookMinutes !== undefined && {
          cookMinutes: dto.cookMinutes,
        }),
        ...(dto.servings !== undefined && { servings: dto.servings }),
        ...(dto.kcalPerServing !== undefined && {
          kcalPerServing: dto.kcalPerServing,
        }),
        ...(dto.proteinG !== undefined && { proteinG: dto.proteinG }),
        ...(dto.carbsG !== undefined && { carbsG: dto.carbsG }),
        ...(dto.fatG !== undefined && { fatG: dto.fatG }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isFavorite !== undefined && {
          isFavorite: dto.isFavorite,
        }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.getOne(userId, id); // ownership check
    await this.prisma.recipe.delete({ where: { id } });
    return { ok: true };
  }

  async toggleFavorite(userId: string, id: string) {
    const recipe = await this.getOne(userId, id);
    return this.prisma.recipe.update({
      where: { id },
      data: { isFavorite: !recipe.isFavorite },
    });
  }

  async getPhotoUploadUrl(userId: string, recipeId: string) {
    await this.getOne(userId, recipeId); // ownership check
    const fileId = randomUUID();
    const s3Key = `recipe-photos/${userId}/${fileId}.jpg`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: 'image/jpeg',
    });
    const uploadUrl = await getSignedUrl(
      this.s3 as any,
      command as any,
      { expiresIn: 900 },
    );
    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { photoS3Key: s3Key },
    });
    return { uploadUrl, s3Key };
  }

  async generateFromPhoto(userId: string, s3Key: string) {
    if (
      !s3Key.startsWith(`recipe-photos/${userId}/`) &&
      !s3Key.startsWith(`food-photos/${userId}/`)
    ) {
      throw new ForbiddenException('Invalid photo key');
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        name: 'Neznamy recept',
        ingredients: [],
        kcalPerServing: 300,
        proteinG: 15,
        carbsG: 40,
        fatG: 10,
        servings: 1,
        confidence: 0,
        note: 'AI analyza nedostupna — nastav ANTHROPIC_API_KEY.',
      };
    }

    try {
      const base64 = await this.fetchPhotoBase64(s3Key);
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `Jsi cesky kucharsky expert. Podivej se na fotku jidla a odhadni recept.

UKOL: Rozpoznej jidlo, odhadni ingredience a nutrici na porci.

Vrat POUZE JSON:
{
  "name": "Nazev cesky",
  "description": "Kratky popis",
  "ingredients": [{"name":"ingredience","amount":"100","unit":"g"}],
  "instructions": "Strucny postup pripravy",
  "prepMinutes": 15,
  "cookMinutes": 30,
  "servings": 2,
  "kcalPerServing": 450,
  "proteinG": 25,
  "carbsG": 50,
  "fatG": 15,
  "tags": ["obed","ceska kuchyne"],
  "confidence": 85
}

DULEZITE: Vsechny texty cesky. Ingredience realisticky.`,
              },
            ],
          },
        ],
      });

      const text =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in Claude response');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || 'Neznamy recept',
        description: parsed.description,
        ingredients: Array.isArray(parsed.ingredients)
          ? parsed.ingredients
          : [],
        instructions: parsed.instructions,
        prepMinutes: parsed.prepMinutes,
        cookMinutes: parsed.cookMinutes,
        servings: parsed.servings ?? 1,
        kcalPerServing: parsed.kcalPerServing,
        proteinG: parsed.proteinG,
        carbsG: parsed.carbsG,
        fatG: parsed.fatG,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        confidence: parsed.confidence ?? 50,
      };
    } catch (e: any) {
      this.logger.error(`Recipe from photo failed: ${e.message}`);
      return {
        name: 'Neznamy recept',
        ingredients: [],
        kcalPerServing: 300,
        proteinG: 15,
        carbsG: 40,
        fatG: 10,
        servings: 1,
        confidence: 0,
        note: 'Analyza selhala. Zkus to znovu.',
      };
    }
  }

  private async fetchPhotoBase64(s3Key: string): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });
    const res: any = await this.s3.send(cmd);
    const stream = res.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('base64');
  }
}
