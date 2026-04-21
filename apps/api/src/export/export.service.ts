import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportWorkoutsCSV(userId: string): Promise<string> {
    const sessions = await this.loadWorkoutSessions(userId);

    const headers = [
      'Date',
      'Duration (min)',
      'Exercises',
      'Total Reps',
      'Avg Form %',
      'Total Volume (kg)',
    ];

    const rows = sessions.map((s) => {
      const date = new Date(s.startedAt).toLocaleDateString('cs-CZ');
      const mins = Math.round(s.durationSeconds / 60);
      const exercises = uniqueExerciseNames(s.exerciseSets);
      const volume = totalVolume(s.exerciseSets);
      const form = Math.round(s.averageFormScore);

      return [date, mins, exercises, s.totalReps, form, volume];
    });

    return buildCSV(headers, rows);
  }

  async exportWorkoutsHTML(userId: string): Promise<string> {
    const sessions = await this.loadWorkoutSessions(userId);

    const tableRows = sessions
      .map((s) => {
        const date = new Date(s.startedAt).toLocaleDateString('cs-CZ');
        const mins = Math.round(s.durationSeconds / 60);
        const exercises = uniqueExerciseNames(s.exerciseSets);
        const volume = totalVolume(s.exerciseSets);
        const form = Math.round(s.averageFormScore);
        return `<tr>
          <td>${esc(date)}</td>
          <td>${mins}</td>
          <td>${esc(exercises)}</td>
          <td>${s.totalReps}</td>
          <td>${form}%</td>
          <td>${volume}</td>
        </tr>`;
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>FitAI - Historie treninku</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; color: #222; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    p.sub { color: #888; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #222; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    tr:hover { background: #f9f9f9; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>FitAI - Historie treninku</h1>
  <p class="sub">Exportovano ${new Date().toLocaleDateString('cs-CZ')} | ${sessions.length} treninku</p>
  <table>
    <thead>
      <tr>
        <th>Datum</th><th>Min</th><th>Cviky</th><th>Repy</th><th>Forma</th><th>Objem (kg)</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;
  }

  async exportJournalCSV(
    userId: string,
    month: string,
  ): Promise<string> {
    const [year, mon] = month.split('-').map(Number);
    const from = new Date(year, mon - 1, 1);
    const to = new Date(year, mon, 1);

    const entries = await this.prisma.journalEntry.findMany({
      where: { userId, date: { gte: from, lt: to } },
      orderBy: { date: 'asc' },
    });

    const headers = [
      'Date',
      'Rating',
      'Mood',
      'Notes',
      'Tags',
      'AI Insight',
    ];

    const rows = entries.map((e) => {
      const date = new Date(e.date).toLocaleDateString('cs-CZ');
      return [
        date,
        e.rating ?? '',
        e.mood ?? '',
        e.notes ?? '',
        (e.tags ?? []).join('; '),
        e.aiInsight ?? '',
      ];
    });

    return buildCSV(headers, rows);
  }

  async exportNutritionCSV(
    userId: string,
    from: string,
    to: string,
  ): Promise<string> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // Include the full "to" day
    toDate.setDate(toDate.getDate() + 1);

    const logs = await this.prisma.foodLog.findMany({
      where: { userId, date: { gte: fromDate, lt: toDate } },
      orderBy: { date: 'asc' },
    });

    const headers = [
      'Date',
      'Meal',
      'Name',
      'Kcal',
      'Protein (g)',
      'Carbs (g)',
      'Fat (g)',
      'Source',
      'Rating',
    ];

    const rows = logs.map((l) => {
      const date = new Date(l.date).toLocaleDateString('cs-CZ');
      return [
        date,
        l.mealType,
        l.name,
        l.kcal,
        l.proteinG,
        l.carbsG,
        l.fatG,
        l.source ?? '',
        l.rating ?? '',
      ];
    });

    return buildCSV(headers, rows);
  }

  private async loadWorkoutSessions(userId: string) {
    return this.prisma.gymSession.findMany({
      where: { userId },
      include: {
        exerciseSets: { include: { exercise: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }
}

// ── Helpers ──

type CellValue = string | number | null | undefined;

/** Build CSV string with proper escaping. */
function buildCSV(
  headers: string[],
  rows: CellValue[][],
): string {
  const lines = [headers.map(escapeCSV).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(','));
  }
  return lines.join('\n');
}

/** Escape a CSV field — wrap in quotes if it contains comma, newline or quote. */
function escapeCSV(val: CellValue): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** HTML-escape for the print page. */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Get unique exercise names joined by comma. */
function uniqueExerciseNames(
  sets: { exercise: { name: string } }[],
): string {
  const names = [...new Set(sets.map((s) => s.exercise.name))];
  return names.join(', ');
}

/** Calculate total volume (weight * reps) across all sets. */
function totalVolume(
  sets: { actualWeight: number | null; actualReps: number }[],
): number {
  return Math.round(
    sets.reduce(
      (sum, s) => sum + (s.actualWeight ?? 0) * s.actualReps,
      0,
    ),
  );
}
