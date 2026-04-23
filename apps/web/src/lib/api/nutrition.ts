import { request } from './base';

export interface NutritionGoals {
  dailyKcal: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  source?: string;
}

export interface FoodLogItem {
  id: string;
  date: string;
  mealType: string;
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servings: number;
}

export interface NutritionToday {
  goals: NutritionGoals;
  totals: {
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  remaining: {
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  log: FoodLogItem[];
}

export interface QuickFood {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealPlanMeal {
  type: 'breakfast' | 'snack' | 'lunch' | 'dinner';
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string[];
  prepMinutes: number;
  notes?: string;
}

export interface MealPlanDay {
  date: string;
  dayName: string;
  totals: {
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  meals: MealPlanMeal[];
}

export interface ShoppingListCategory {
  category: string;
  items: { name: string; qty: number; unit: string }[];
}

export interface MealPlanPayload {
  weekStart: string;
  totalKcal: number;
  avgKcalPerDay: number;
  avgProteinG: number;
  days: MealPlanDay[];
  shoppingList: ShoppingListCategory[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  generatedAt: string;
  source: 'claude' | 'rules';
  modelUsed: string;
  payload: MealPlanPayload;
  notes: string | null;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  servings: number;
  kcalPerServing: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  photoS3Key: string | null;
  tags: string[];
  isFavorite: boolean;
}

export interface FoodPhotoAnalysis {
  name: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients?: string;
  confidence?: number;
}

export function getNutritionGoals() {
  return request<NutritionGoals>('/nutrition/goals');
}

export function setNutritionGoals(
  body: Omit<NutritionGoals, 'source'>,
) {
  return request<any>('/nutrition/goals', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function autoCalculateNutritionGoals() {
  return request<any>('/nutrition/goals/auto', {
    method: 'POST',
  });
}

export function getNutritionToday() {
  return request<NutritionToday>('/nutrition/today');
}

export function addFoodLog(body: {
  mealType: string;
  name: string;
  kcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  servings?: number;
}) {
  return request<FoodLogItem>('/nutrition/log', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteFoodLog(id: string) {
  return request<{ ok: boolean }>(`/nutrition/log/${id}`, {
    method: 'DELETE',
  });
}

export function getQuickFoods() {
  return request<QuickFood[]>('/nutrition/quick-foods');
}

export function getCurrentMealPlan() {
  return request<MealPlan | null>(
    '/nutrition/meal-plan/current',
  );
}

export function getMealPlanHistory(limit = 8) {
  return request<MealPlan[]>(
    `/nutrition/meal-plan/history?limit=${limit}`,
  );
}

export function generateMealPlan(
  opts: {
    weekStart?: string;
    preferences?: string;
    allergies?: string[];
    cuisine?: string;
  } = {},
) {
  return request<MealPlan>('/nutrition/meal-plan/generate', {
    method: 'POST',
    body: JSON.stringify(opts),
  });
}

export function deleteMealPlan(id: string) {
  return request<{ deleted: boolean }>(
    `/nutrition/meal-plan/${id}`,
    { method: 'DELETE' },
  );
}

export function getRecipes(): Promise<Recipe[]> {
  return request('/recipes');
}

export function createRecipe(
  data: Partial<Recipe>,
): Promise<Recipe> {
  return request('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRecipe(
  id: string,
  data: Partial<Recipe>,
): Promise<Recipe> {
  return request(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteRecipe(id: string): Promise<void> {
  return request(`/recipes/${id}`, { method: 'DELETE' });
}

export function toggleRecipeFavorite(
  id: string,
): Promise<void> {
  return request(`/recipes/${id}/favorite`, {
    method: 'POST',
  });
}

export function generateRecipeFromPhoto(
  s3Key: string,
): Promise<Partial<Recipe>> {
  return request('/recipes/from-photo', {
    method: 'POST',
    body: JSON.stringify({ s3Key }),
  });
}

export function getFoodPhotoUploadUrl(): Promise<{
  uploadUrl: string;
  s3Key: string;
}> {
  return request('/nutrition/photo-upload-url', {
    method: 'POST',
  });
}

export function analyzeFoodPhoto(
  s3Key: string,
): Promise<FoodPhotoAnalysis> {
  return request('/nutrition/analyze-photo', {
    method: 'POST',
    body: JSON.stringify({ s3Key }),
  });
}
