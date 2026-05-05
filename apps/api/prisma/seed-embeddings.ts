import { Prisma, PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
let openai: OpenAI;

const MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50;

interface ExerciseRow {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  descriptionCs: string;
  muscleGroups: string[];
  equipment: string[];
  category: string;
}

interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  ingredients: unknown;
  tags: string[];
}

function buildExerciseText(ex: ExerciseRow): string {
  const muscles = ex.muscleGroups.join(', ');
  const equipment = ex.equipment.length ? ex.equipment.join(', ') : 'bodyweight';
  return [
    `${ex.nameCs} (${ex.name})`,
    ex.descriptionCs,
    `Svaly: ${muscles}`,
    `Vybavení: ${equipment}`,
    `Kategorie: ${ex.category}`,
  ].join('. ');
}

function buildRecipeText(r: RecipeRow): string {
  const ingredientNames = Array.isArray(r.ingredients)
    ? (r.ingredients as Array<{ name?: string }>).map((i) => i.name).filter(Boolean).join(', ')
    : '';
  const tags = r.tags.join(', ');
  return [r.name, r.description || '', `Ingredience: ${ingredientNames}`, `Tagy: ${tags}`]
    .filter(Boolean)
    .join('. ');
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({ model: MODEL, input: texts });
  return res.data.map((d) => d.embedding);
}

function toVectorString(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

async function updateExerciseEmbedding(id: string, embedding: number[]): Promise<void> {
  const vector = toVectorString(embedding);
  await prisma.$executeRaw(Prisma.sql`UPDATE "Exercise" SET embedding = ${vector}::vector WHERE id = ${id}`);
}

async function updateRecipeEmbedding(id: string, embedding: number[]): Promise<void> {
  const vector = toVectorString(embedding);
  await prisma.$executeRaw(Prisma.sql`UPDATE "Recipe" SET embedding = ${vector}::vector WHERE id = ${id}`);
}

async function seedExercises(): Promise<number> {
  const rows = await prisma.$queryRaw<ExerciseRow[]>`
    SELECT id, name, "nameCs", description, "descriptionCs",
           "muscleGroups"::text[] AS "muscleGroups", equipment, category
    FROM "Exercise"
    WHERE embedding IS NULL
  `;
  if (!rows.length) return 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batch.map(buildExerciseText));
    await Promise.all(batch.map((row, j) => updateExerciseEmbedding(row.id, embeddings[j])));
  }
  return rows.length;
}

async function seedRecipes(): Promise<number> {
  const rows = await prisma.$queryRaw<RecipeRow[]>`
    SELECT id, name, description, ingredients, tags
    FROM "Recipe"
    WHERE embedding IS NULL
  `;
  if (!rows.length) return 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batch.map(buildRecipeText));
    await Promise.all(batch.map((row, j) => updateRecipeEmbedding(row.id, embeddings[j])));
  }
  return rows.length;
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set. Run with OPENAI_API_KEY=sk-... npm run seed:embeddings');
    process.exit(1);
  }
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const ex = await seedExercises();
  const re = await seedRecipes();
  console.log(`Embedded ${ex} exercises + ${re} recipes (model=${MODEL}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
