import { db, type MealPlan } from '../db';

// --- ADD OR UPDATE MEAL ---
export async function setMealPlan(meal: Omit<MealPlan, 'id'>): Promise<number> {
  return db.transaction('rw', db.mealPlan, async () => {
    const existing = await db.mealPlan
      .where({ date: meal.date, mealType: meal.mealType })
      .first();

    if (existing && existing.id) {
      await db.mealPlan.update(existing.id, {
        recipeId: meal.recipeId,
        servings: meal.servings,
      });
      return existing.id;
    }

    return await db.mealPlan.add(meal);
  });
}

// --- UPDATE SERVINGS ---
export async function updateMealServings(mealPlanId: number, servings: number): Promise<number> {
  return await db.mealPlan.update(mealPlanId, { servings });
}

// --- DELETE MEAL ---
export async function removeMealFromPlan(mealPlanId: number): Promise<void> {
  await db.mealPlan.delete(mealPlanId);
}

// --- AUTOMATIC PURGE (> 15 DAYS) ---
export async function cleanupOldMealPlans(daysToKeep = 15): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const cutoffIsoString = cutoffDate.toISOString().split('T')[0];

  const deletedCount = await db.mealPlan
    .where('date')
    .below(cutoffIsoString)
    .delete();

  if (deletedCount > 0) {
    console.log(`Maintenance IndexedDB : ${deletedCount} ancien(s) repas supprimé(s).`);
  }

  return deletedCount;
}