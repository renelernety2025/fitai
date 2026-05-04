export type DayActivity = { workouts: number; recovery: number };

export interface DayCellData {
  day: number;
  muted?: boolean;
  activity?: DayActivity;
  highlighted?: boolean;
}

export const monthDays: DayCellData[] = [
  { day: 30, muted: true, activity: { workouts: 1, recovery: 1 } },
  { day: 1, activity: { workouts: 0, recovery: 1 } },
  { day: 2, activity: { workouts: 0, recovery: 2 } },
  { day: 3, activity: { workouts: 1, recovery: 2 } },
  { day: 4, activity: { workouts: 1, recovery: 2 } },
  { day: 5, activity: { workouts: 1, recovery: 1 } },
  { day: 6, activity: { workouts: 0, recovery: 1 } },
  { day: 7, activity: { workouts: 0, recovery: 1 } },
  { day: 8, activity: { workouts: 0, recovery: 2 } },
  { day: 9, activity: { workouts: 1, recovery: 0 } },
  { day: 10, activity: { workouts: 2, recovery: 1 } },
  { day: 11, activity: { workouts: 1, recovery: 2 } },
  { day: 12, activity: { workouts: 1, recovery: 2 } },
  { day: 13, activity: { workouts: 0, recovery: 1 } },
  { day: 14, activity: { workouts: 1, recovery: 1 } },
  { day: 15, activity: { workouts: 0, recovery: 2 } },
  { day: 16, activity: { workouts: 0, recovery: 1 } },
  { day: 17, highlighted: true },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25 },
  { day: 26 },
  { day: 27 },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 1, muted: true },
  { day: 2, muted: true },
  { day: 3, muted: true },
];

export const weekChart: Array<{ label: string; current: number; previous: number; active?: boolean }> = [
  { label: 'Sun', current: 32, previous: 55 },
  { label: 'Mon', current: 75, previous: 65 },
  { label: 'Tue', current: 60, previous: 70 },
  { label: 'Wed', current: 88, previous: 60 },
  { label: 'Thu', current: 95, previous: 80, active: true },
  { label: 'Fri', current: 0, previous: 50 },
  { label: 'Sat', current: 0, previous: 40 },
];
