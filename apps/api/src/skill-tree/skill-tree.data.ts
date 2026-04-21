export interface SkillNode {
  code: string;
  branch: 'strength' | 'endurance' | 'knowledge' | 'nutrition';
  titleCs: string;
  requires: string | null;
  check: string;
}

export const SKILL_TREE: SkillNode[] = [
  // Strength branch
  { code: 'bench_60', branch: 'strength', titleCs: 'Bench Press 60kg', requires: null, check: 'bench_press_max >= 60' },
  { code: 'bench_80', branch: 'strength', titleCs: 'Bench Press 80kg', requires: 'bench_60', check: 'bench_press_max >= 80' },
  { code: 'bench_100', branch: 'strength', titleCs: 'Bench Press 100kg', requires: 'bench_80', check: 'bench_press_max >= 100' },
  { code: 'squat_80', branch: 'strength', titleCs: 'Squat 80kg', requires: null, check: 'squat_max >= 80' },
  { code: 'squat_100', branch: 'strength', titleCs: 'Squat 100kg', requires: 'squat_80', check: 'squat_max >= 100' },
  { code: 'squat_140', branch: 'strength', titleCs: 'Squat 140kg', requires: 'squat_100', check: 'squat_max >= 140' },
  { code: 'deadlift_100', branch: 'strength', titleCs: 'Deadlift 100kg', requires: null, check: 'deadlift_max >= 100' },
  { code: 'deadlift_140', branch: 'strength', titleCs: 'Deadlift 140kg', requires: 'deadlift_100', check: 'deadlift_max >= 140' },
  { code: 'deadlift_180', branch: 'strength', titleCs: 'Deadlift 180kg', requires: 'deadlift_140', check: 'deadlift_max >= 180' },
  // Endurance branch
  { code: 'streak_7', branch: 'endurance', titleCs: '7denni streak', requires: null, check: 'streak >= 7' },
  { code: 'streak_30', branch: 'endurance', titleCs: '30denni streak', requires: 'streak_7', check: 'streak >= 30' },
  { code: 'streak_100', branch: 'endurance', titleCs: '100denni streak', requires: 'streak_30', check: 'streak >= 100' },
  { code: 'sessions_50', branch: 'endurance', titleCs: '50 treninku', requires: null, check: 'sessions >= 50' },
  { code: 'sessions_100', branch: 'endurance', titleCs: '100 treninku', requires: 'sessions_50', check: 'sessions >= 100' },
  { code: 'sessions_500', branch: 'endurance', titleCs: '500 treninku', requires: 'sessions_100', check: 'sessions >= 500' },
  // Knowledge branch
  { code: 'form_70', branch: 'knowledge', titleCs: 'Prumerna forma 70%', requires: null, check: 'avg_form >= 70' },
  { code: 'form_80', branch: 'knowledge', titleCs: 'Prumerna forma 80%', requires: 'form_70', check: 'avg_form >= 80' },
  { code: 'form_90', branch: 'knowledge', titleCs: 'Prumerna forma 90%', requires: 'form_80', check: 'avg_form >= 90' },
  // Nutrition branch
  { code: 'checkins_30', branch: 'nutrition', titleCs: '30 check-inu', requires: null, check: 'checkins >= 30' },
  { code: 'checkins_100', branch: 'nutrition', titleCs: '100 check-inu', requires: 'checkins_30', check: 'checkins >= 100' },
  { code: 'logs_100', branch: 'nutrition', titleCs: '100 food logu', requires: null, check: 'food_logs >= 100' },
];
